import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

const SITE = 'https://www.novelgecesi.com';

// ÖNEMLİ: User-Agent bilerek gönderilmiyor. LNReader kendi varsayılanını ekler.
// Böylece WebView'da çözülen Cloudflare doğrulaması (cf_clearance çerezi) eklentiyle eşleşir.
const HEADERS: Record<string, string> = {
  'Accept-Language': 'tr-TR,tr;q=0.9',
  Referer: SITE + '/',
};

const CF_HINT =
  'Cloudflare doğrulaması gerekiyor. WebView simgesine dokunup siteyi açın, doğrulamayı geçin ve tekrar deneyin.';

// Cloudflare koruma sayfası mı kontrolü
const isChallenge = (res: Response, body: string) =>
  res.headers?.get?.('cf-mitigated') === 'challenge' ||
  ((res.status === 403 || res.status === 503) &&
    /just a moment|challenge-platform|cf-chl|cf-turnstile|attention required/i.test(
      body.slice(0, 6000),
    ));

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Metin temizleme (fazla boşlukları sil)
const clean = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim();

// Siteden gelen gömülü JSON verisinin tipi
type ChapterJson = {
  chapter?: string | number;
  chapterNum?: number;
  title?: string;
  createdAt?: string;
  firstHumanPublicationAt?: string;
  is_active?: boolean;
};

class NovelGecesiPlugin implements Plugin.PluginBase {
  id = 'novelgecesi';
  name = 'Novel Gecesi';
  icon = 'src/turkish/novelgecesi/icon.png';
  site = SITE;
  version = '1.0.0';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: SITE + '/' },
  };

  // ---------------------------------------------------------------- yardımcılar

  // Göreli URL'leri mutlak (tam) URL'ye çevirir
  private absUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return 'https:' + url;
    return this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  // Site linklerini temiz bir yola (path) çevirir (ör: "/shadow-slave")
  private toPath(href?: string): string | undefined {
    if (!href) return undefined;
    let p = href.trim().split('#')[0].split('?')[0];
    p = p.replace(/^https?:\/\/(www\.)?novelgecesi\.com/i, '');
    if (!p || p === '/') return undefined;
    p = p.startsWith('/') ? p : '/' + p;
    return p.replace(/\/+$/, '');
  }

  // Ağ isteklerini yönetir (3 kez dener, Cloudflare'ı algılar)
  private async getHtml(path: string): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetchApi(this.site + path, { headers: HEADERS });
        const text = await res.text();
        if (res.ok) return text;
        if (isChallenge(res, text)) throw new Error(CF_HINT);
        
        lastError = new Error(`Novel Gecesi isteği başarısız (HTTP ${res.status})`);
        if (res.status < 500 && res.status !== 429) break;
      } catch (e) {
        lastError = e;
        if (e instanceof Error && e.message === CF_HINT) break;
      }
      await sleep(400 * (attempt + 1));
    }
    throw lastError instanceof Error ? lastError : new Error('İstek başarısız');
  }

  // <script> etiketlerinin içeriğini çeker (JSON-LD vb. için)
  private scriptBody($: ReturnType<typeof parseHTML>, selector: string) {
    const el = $(selector).first();
    return (el.html() || el.text() || '').trim();
  }

  // JSON-LD (Yapısal Veri) içindeki tüm düğümleri düzleştirip bir diziye alır
  private jsonLdNodes($: ReturnType<typeof parseHTML>): any[] {
    const nodes: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse(($(el).html() || $(el).text() || '').trim());
        const list = Array.isArray(data) ? data : [data];
        for (const item of list) {
          if (Array.isArray(item?.['@graph'])) nodes.push(...item['@graph']);
          else nodes.push(item);
        }
      } catch (_) {
        // Bozuk JSON bloklarını yoksay
      }
    });
    return nodes;
  }

  // Listeleme ve arama sonuçlarındaki kartları ayrıştırır
  private novelsFrom(html: string): Plugin.NovelItem[] {
    const $ = parseHTML(html);
    const novels: Plugin.NovelItem[] = [];
    const seen = new Set<string>();

    $('article.series-card').each((_, el) => {
      const $el = $(el);
      const href =
        $el.find('.series-title a').first().attr('href') ||
        $el.find('a[href]').first().attr('href');
      const path = this.toPath(href);
      if (!path || seen.has(path)) return;

      const name = clean(
        $el.find('.series-title').first().text() ||
          $el.find('img').first().attr('alt'),
      );
      if (!name) return;

      const img = $el.find('img').first();
      seen.add(path);
      novels.push({
        name,
        path,
        cover: this.absUrl(img.attr('src') || img.attr('data-src')) || defaultCover,
      });
    });

    return novels;
  }

  // ------------------------------------------------------------ listeleme

  async popularNovels(pageNo: number): Promise<Plugin.NovelItem[]> {
    const path = pageNo > 1 ? `/?page=${pageNo}` : '/';
    const html = await this.getHtml(path);

    // Site son sayfayı tekrar döndürürse sonsuz döngüyü engelle
    if (pageNo > 1) {
      const $ = parseHTML(html);
      const active = clean($('.pagination-btn.active').first().text());
      if (active && active !== String(pageNo)) return [];
    }

    return this.novelsFrom(html);
  }

  async searchNovels(searchTerm: string, pageNo: number): Promise<Plugin.NovelItem[]> {
    const term = searchTerm.trim();
    if (!term || pageNo > 1) return [];
    return this.novelsFrom(await this.getHtml('/?q=' + encodeURIComponent(term)));
  }

  // ----------------------------------------------------------------- roman

  // Yedek Plan: Sadece seri sayfasında görünen birkaç bölümü çeker
  private chaptersFromSeriesPage($: ReturnType<typeof parseHTML>): Plugin.ChapterItem[] {
    const chapters: Plugin.ChapterItem[] = [];
    $('.episode-item').each((i, el) => {
      const $el = $(el);
      const path = this.toPath($el.find('a.episode-link').attr('href'));
      if (!path) return;
      const num = parseFloat($el.attr('data-chapter-no') || '');
      chapters.push({
        name: clean($el.find('.episode-title').text()) || `Bölüm ${i + 1}`,
        path,
        releaseTime: $el.find('time').attr('datetime') || undefined,
        chapterNumber: Number.isFinite(num) ? num : i + 1,
      });
    });
    return chapters;
  }

  // Ana Plan: Tüm bölüm listesi okuma sayfasındaki <script id="chapters-data"> içinde gelir.
  // İlk bölümü açıp buradan tüm listeyi çekeriz.
  private async chaptersFromReader(
    novelPath: string,
    firstChapterPath: string,
  ): Promise<Plugin.ChapterItem[]> {
    const $ = parseHTML(await this.getHtml(firstChapterPath));
    const raw = this.scriptBody($, '#chapters-data');
    if (!raw) return [];

    const list = JSON.parse(raw) as ChapterJson[];
    return list
      .filter(c => c && c.chapter !== undefined && c.is_active !== false)
      .map((c, i) => {
        const num = Number(c.chapterNum);
        const title = clean(c.title);
        return {
          name: `Bölüm ${c.chapter}${title ? ': ' + title : ''}`,
          // updatedAt düzenlemelerde değişir, o yüzden yayınlanma tarihini tercih et
          releaseTime: c.firstHumanPublicationAt || c.createdAt || undefined,
          path: `${novelPath}/${c.chapter}`,
          chapterNumber: Number.isFinite(num) ? num : i + 1,
        };
      })
      .sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const path = this.toPath(novelPath) || novelPath;
    const $ = parseHTML(await this.getHtml(path));

    // ---- Meta veriler (JSON-LD "Book" düğümü, HTML yedeğiyle)
    const book =
      this.jsonLdNodes($).find(n => {
        const t = n?.['@type'];
        return t === 'Book' || (Array.isArray(t) && t.includes('Book'));
      }) || {};

    const name = clean(book.name) || clean($('h1.series-title').first().text()) || 'Başlıksız';

    // JSON-LD image bazen obje bazen string gelebilir
    const rawImage = typeof book.image === 'string' ? book.image : book.image?.url;
    const cover =
      this.absUrl(rawImage) ||
      this.absUrl($('.series-image img, .series-cover img').first().attr('src')) ||
      defaultCover;

    // Yazar bilgisi bazen dizi bazen obje gelir
    const authorRaw = book.author;
    const author =
      clean(Array.isArray(authorRaw) ? authorRaw[0]?.name : authorRaw?.name) ||
      clean($('.series-author-uploader').first().text()) ||
      undefined;

    let genres: string | undefined;
    if (Array.isArray(book.genre) && book.genre.length) {
      genres = book.genre.join(', ');
    } else {
      const tags = $('.genre-tag').map((_, el) => clean($(el).text())).get().filter(Boolean);
      genres = tags.length ? tags.join(', ') : undefined;
    }

    // JSON-LD açıklaması kesik olabileceği için sayfadaki metni tercih et
    const summary =
      $('#series-description').first().text().replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim() ||
      clean(book.description) ||
      undefined;

    // ---- Durum
    const statusEl = $('.series-status').first();
    let status: string = NovelStatus.Unknown;
    if (statusEl.length) {
      status = statusEl.hasClass('completed') ? NovelStatus.Completed : NovelStatus.Ongoing;
    }

    // ---- Bölümler
    let chapters: Plugin.ChapterItem[] = [];
    const firstChapterPath = this.toPath(
      $('#series-read-button').attr('href') || $('a.episode-link').first().attr('href'),
    );

    if (firstChapterPath) {
      try {
        // Tüm listeyi almak için ilk bölüme gidiyoruz
        chapters = await this.chaptersFromReader(path, firstChapterPath);
      } catch (e) {
        if (e instanceof Error && e.message === CF_HINT) throw e;
        chapters = [];
      }
    }
    
    // Eğer okuma sayfasından liste çekilemezse, seri sayfasındaki (kısmi) listeyi kullan
    if (!chapters.length) chapters = this.chaptersFromSeriesPage($);

    return {
      path,
      name,
      cover,
      author,
      genres,
      summary,
      status,
      chapters,
    };
  }

  // --------------------------------------------------------------- bölüm

  async parseChapter(chapterPath: string): Promise<string> {
    const $ = parseHTML(await this.getHtml(chapterPath));
    const root = $('#reader-content').first();
    
    if (!root.length) throw new Error('Bölüm içeriği bulunamadı.');

    // Reklam ve gereksiz etiketleri temizle
    root.find('script, style, ins, iframe, noscript').remove();
    
    // Göreli resim yollarını mutlak yola çevir
    root.find('img').each((_, el) => {
      const src = this.absUrl($(el).attr('src') || $(el).attr('data-src'));
      if (src) $(el).attr('src', src);
      $(el).removeAttr('srcset');
    });

    return root.html()?.trim() || '';
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovelGecesiPlugin();
