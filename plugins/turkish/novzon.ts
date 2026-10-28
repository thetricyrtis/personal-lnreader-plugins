import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

const SITE = 'https://novzon.net';

// User-Agent bilerek gönderilmiyor: LNReader kendi varsayılanını ekler. Böylece WebView'da
// çözülen Cloudflare doğrulaması (cf_clearance çerezi) eklenti istekleriyle de eşleşir.
const HEADERS: Record<string, string> = {
  'Accept-Language': 'tr-TR,tr;q=0.9',
  Referer: SITE + '/',
};

const CF_HINT =
  'Cloudflare doğrulaması gerekiyor. WebView simgesine dokunup siteyi açın, doğrulamayı geçin ve tekrar deneyin.';

// Sitedeki tarihler "18 Ağu 2026" biçiminde (Türkçe kısa ay adı)
const MONTHS: Record<string, string> = {
  oca: '01',
  şub: '02',
  mar: '03',
  nis: '04',
  may: '05',
  haz: '06',
  tem: '07',
  ağu: '08',
  eyl: '09',
  eki: '10',
  kas: '11',
  ara: '12',
};
const DATE_RE = /^(\d{1,2})\s+(\S+?)\.?\s+(\d{4})$/;

// Botlar için konmuş gizli tuzak bağlantılar (/c/...) ve yardımcı öğeler
const JUNK_SELECTOR = [
  'a[data-sentinel-guard]',
  'a[href^="/c/"]',
  '#chapter-content-end-sentinel',
  'script',
  'style',
  'noscript',
  '[style*="-9999px"]',
].join(', ');

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const isChallenge = (res: Response, body: string) =>
  res.headers?.get?.('cf-mitigated') === 'challenge' ||
  ((res.status === 403 || res.status === 503) &&
    /just a moment|challenge-platform|cf-chl|cf-turnstile|attention required/i.test(
      body.slice(0, 6000),
    ));

class NovZonPlugin implements Plugin.PluginBase {
  id = 'novzon';
  name = 'NovZon';
  icon = 'src/turkish/novzon/icon.png';
  site = SITE;
  version = '1.0.2';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: SITE + '/' },
  };

  // ---------- yardımcılar ----------

  private absUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  private toPath(href?: string): string | undefined {
    if (!href) return undefined;
    return href.replace(this.site, '').split('#')[0];
  }

  // Geçici hatalarda (ağ kopması, 429, 5xx) en fazla 3 kez dener; diğer 4xx hemen hata verir.
  // Cloudflare doğrulaması algılanırsa tekrar denemeden açıklayıcı hata verir.
  private async getHtml(path: string): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetchApi(this.site + path, { headers: HEADERS });
        const text = await res.text();
        if (res.ok) return text;
        if (isChallenge(res, text)) throw new Error(CF_HINT);
        lastError = new Error(
          `NovZon isteği başarısız oldu (HTTP ${res.status})`,
        );
        if (res.status < 500 && res.status !== 429) break;
      } catch (e) {
        lastError = e;
        if (e instanceof Error && e.message === CF_HINT) break;
      }
      await sleep(400 * (attempt + 1));
    }
    throw lastError instanceof Error
      ? lastError
      : new Error('NovZon isteği başarısız oldu');
  }

  // "18 Ağu 2026" / "18 Ağustos 2026" → "2026-08-18"
  private parseDate(text: string): string | undefined {
    const m = text.trim().toLowerCase().match(DATE_RE);
    if (!m) return undefined;
    const month = MONTHS[m[2].slice(0, 3)];
    if (!month) return undefined;
    return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
  }

  // Ana sayfa rafları ve arama sonuçları için ortak kart ayrıştırıcı.
  // Sadece cilt kartları (/novel/...) alınır; seri kartları (/series/...) atlanır.
  private novelsFrom(
    html: string,
    selector: string,
    nameOf: ($el: any) => string,
    skip?: ($el: any) => boolean,
  ): Plugin.NovelItem[] {
    const $ = parseHTML(html);
    const novels: Plugin.NovelItem[] = [];
    const seen = new Set<string>();

    $(selector).each((_, el) => {
      const $el = $(el);
      const path = this.toPath($el.attr('href'));
      if (!path || seen.has(path) || skip?.($el)) return;

      const name = (
        nameOf($el) ||
        $el.attr('data-preview-title') ||
        $el.attr('title') ||
        ''
      ).trim();
      if (!name) return;

      const img = $el.find('img').first();
      seen.add(path);
      novels.push({
        name,
        path,
        cover:
          this.absUrl(img.attr('src') || img.attr('data-src')) || defaultCover,
      });
    });

    return novels;
  }

  // ---------- popüler / liste ----------
  // Ana sayfadaki koleksiyon raflarından cilt listesi çıkarır (sayfalama yok).
  async popularNovels(pageNo: number): Promise<Plugin.NovelItem[]> {
    if (pageNo > 1) return [];

    return this.novelsFrom(
      await this.getHtml('/'),
      'a.nhx-collection-book[href^="/novel/"]',
      $el => $el.find('strong').first().text(),
      // Bölüm sayısı 0 olanlar erişime kapatılmış (resmi yayın başlamış) seriler
      $el => $el.attr('data-preview-chapters') === '0',
    );
  }

  // ---------- arama ----------
  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const term = searchTerm.trim();
    if (!term || pageNo > 1) return [];

    return this.novelsFrom(
      await this.getHtml('/search/?q=' + encodeURIComponent(term)),
      'a.novel-card[href^="/novel/"]',
      $el => $el.find('h3').first().text(),
    );
  }

  // ---------- roman detayı + bölüm listesi ----------
  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const $ = parseHTML(await this.getHtml(novelPath));

    const paragraphs = $('#novelDesc p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    // Site "Published" yazıyor: cilt yayımlanmış/tamamlanmış demek
    const statusText = $('.status-tag').first().text().trim().toLowerCase();

    // Tüm bölümler (gizli sekmeler dahil) tek sayfada HTML olarak geliyor
    const chapters: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();
    $('a.chapter-item').each((_, el) => {
      const $el = $(el);
      const path = this.toPath($el.attr('href'));
      if (!path || seen.has(path)) return;
      seen.add(path);

      const number = $el.find('.chapter-number').text().trim();
      const title = $el.find('.chapter-title').text().trim();
      const index = chapters.length + 1;

      chapters.push({
        name: [number, title].filter(Boolean).join(' - ') || `Bölüm ${index}`,
        path,
        releaseTime: this.parseDate($el.find('.chapter-date').text()),
        // Aynı numara birden fazla bölümde tekrar edebiliyor; sıra numarası kullanılır
        chapterNumber: index,
      });
    });

    return {
      path: novelPath,
      name:
        $('h1.novel-title').first().text().trim() ||
        $('title').first().text().trim() ||
        'Başlıksız',
      cover:
        this.absUrl($('meta[property="og:image"]').attr('content')) ||
        this.absUrl($('img.novel-cover').first().attr('src')) ||
        defaultCover,
      author: $('a.author-tag').first().text().trim() || undefined,
      genres:
        $('.meta-tags a[href^="/category/"]')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(Boolean)
          .join(', ') || undefined,
      summary: paragraphs.length
        ? paragraphs.join('\n\n')
        : $('#novelDesc').text().trim() || undefined,
      status: statusText.includes('published')
        ? NovelStatus.Completed
        : NovelStatus.Unknown,
      chapters,
    };
  }

  // ---------- bölüm içeriği ----------
  async parseChapter(chapterPath: string): Promise<string> {
    const $ = parseHTML(await this.getHtml(chapterPath));
    const root = $('#chapter-content').first();

    if (!root.length) {
      throw new Error(
        'Bölüm içeriği bulunamadı (site yapısı değişmiş olabilir).',
      );
    }

    root.find(JUNK_SELECTOR).remove();

    // Metin içi resimlerin yolları göreli
    root.find('img').each((_, el) => {
      const src = this.absUrl($(el).attr('src') || $(el).attr('data-src'));
      if (src) $(el).attr('src', src);
      $(el).removeAttr('srcset');
    });

    // Sitenin kendi okuyucusu da yapay zekadan kalan ** işaretlerini temizliyor
    return (root.html() || '').replace(/\*\*/g, '');
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovZonPlugin();

