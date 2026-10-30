import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';
import { FilterTypes, Filters } from '@libs/filterInputs';

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

// /seriler sayfasındaki filtre değerleri (sitedeki <select> ve checkbox değerleriyle birebir aynı)
// DOĞRULANMADI: Tür ve izlenme filtrelerinin URL parametre adları. Doğrulananlar: sort, status, page.
// Sitede bir tür seçip "Uygula"ya basınca adres çubuğundaki adı görüp gerekirse buradan değiştirin.
const GENRE_PARAM = 'category';
const VIEWS_PARAM = 'views';

const GENRES = [
  'Aksiyon',
  'Bilim Kurgu',
  'Doğaüstü',
  'Dövüş Sanatları',
  'Dram',
  'Ecchi',
  'Fantastik',
  'Gerilim',
  'Gizem',
  'Harem',
  'Isekai',
  'Josei',
  'Komedi',
  'Korku',
  'Macera',
  'Mecha',
  'Mizah',
  'Müzik',
  'Okul hayatı',
  'Orijinal Çeviri',
  'Polisiye',
  'Psikolojik',
  'Romantizim',
  'Seinen',
  'Shoujo',
  'Shounen',
  'Smut',
  'Spor',
  'Tarihi',
  'Yaşamdan Kesitler',
  'Yetişkin',
  'Yuri',
  'Xianxia',
  'Xuanhuan',
  'Wuxia',
];

// Arama için: küçük harfe çevir, Türkçe harfleri sadeleştir ("Işık" ve "isik" eşleşsin)
const fold = (s: string) =>
  s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const INDEX_TTL = 15 * 60 * 1000; // arama dizini 15 dakika önbellekte kalır
const MAX_INDEX_PAGES = 40; // güvenlik sınırı

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
  version = '1.0.1';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: SITE + '/' },
  };

  filters = {
    sort: {
      label: 'Sırala',
      type: FilterTypes.Picker,
      value: 'popular',
      options: [
        { label: 'En Popüler', value: 'popular' },
        { label: 'En Yeni', value: 'newest' },
        { label: 'En Eski', value: 'oldest' },
        { label: 'En Yüksek Puan', value: 'rating' },
      ],
    },
    genres: {
      label: 'Tür',
      type: FilterTypes.CheckboxGroup,
      value: [],
      options: GENRES.map(g => ({ label: g, value: g })),
    },
    status: {
      label: 'Durum',
      type: FilterTypes.Picker,
      value: 'all',
      options: [
        { label: 'Tümü', value: 'all' },
        { label: 'Devam Ediyor', value: 'Devam Ediyor' },
        { label: 'Tamamlandı', value: 'Tamamlandı' },
        { label: 'Askıda', value: 'Askıda' },
        { label: 'Bırakıldı', value: 'Bırakıldı' },
      ],
    },
    views: {
      label: 'İzlenme',
      type: FilterTypes.Picker,
      value: 'all',
      options: [
        { label: 'Tümü', value: 'all' },
        { label: 'En Çok İzlenen', value: 'most' },
        { label: 'En Az İzlenen', value: 'least' },
      ],
    },
  } satisfies Filters;

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

    $('.series-card').each((_, el) => {
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

  // Sayfalı listelerde (liste ve arama) istenen sayfa gerçekten açıldı mı?
  // Site sayfa dışına çıkılırsa son/ilk sayfayı tekrar döndürebilir; bu sonsuz döngüyü engeller.
  private isRequestedPage(html: string, pageNo: number): boolean {
    const $ = parseHTML(html);
    return clean($('.pagination-btn.active').first().text()) === String(pageNo);
  }

  async popularNovels(
    pageNo: number,
    { filters, showLatestNovels }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    let path: string;

    if (showLatestNovels) {
      // "Son güncellenenler": ana sayfadaki Yeni Bölümler listesi
      path = pageNo > 1 ? `/?page=${pageNo}` : '/';
    } else {
      // Filtreli liste: /seriler?sort=...&status=...&page=...
      const params: string[] = [];
      const sort = filters?.sort?.value;
      const genres = filters?.genres?.value;
      const status = filters?.status?.value;
      const views = filters?.views?.value;

      if (sort && sort !== 'popular') params.push('sort=' + encodeURIComponent(sort));
      if (genres?.length) params.push(GENRE_PARAM + '=' + encodeURIComponent(genres.join(',')));
      if (status && status !== 'all') params.push('status=' + encodeURIComponent(status));
      if (views && views !== 'all') params.push(VIEWS_PARAM + '=' + encodeURIComponent(views));
      if (pageNo > 1) params.push('page=' + pageNo);

      path = '/seriler' + (params.length ? '?' + params.join('&') : '');
    }

    const html = await this.getHtml(path);
    if (pageNo > 1 && !this.isRequestedPage(html, pageNo)) return [];

    return this.novelsFrom(html);
  }

  // ------------------------------------------------------------ arama
  // Sitenin arama çubuğu JavaScript ile canlı çalışıyor, ayrı bir sonuç sayfası yok.
  // Bu yüzden "Tüm Seriler" (/seriler) sayfalarındaki kartlardan bir dizin çıkarılır,
  // arama bu dizinde yapılır. Dizin bellekte önbelleğe alınır, her aramada yeniden çekilmez.
  private seriesIndex: { at: number; items: Plugin.NovelItem[] } | null = null;
  private indexPromise: Promise<Plugin.NovelItem[]> | null = null;

  private async buildIndex(): Promise<Plugin.NovelItem[]> {
    const first = await this.getHtml('/seriler');
    const $ = parseHTML(first);
    const last = $('.pagination-btn')
      .map((_, el) => parseInt(clean($(el).text()), 10))
      .get()
      .filter(n => Number.isFinite(n));
    const totalPages = Math.min(Math.max(1, ...last), MAX_INDEX_PAGES);

    const items = this.novelsFrom(first);
    const seen = new Set(items.map(n => n.path));

    // Kalan sayfalar 4'erli gruplar halinde çekilir
    for (let start = 2; start <= totalPages; start += 4) {
      const batch: Promise<Plugin.NovelItem[]>[] = [];
      for (let p = start; p < start + 4 && p <= totalPages; p++) {
        batch.push(
          this.getHtml(`/seriler?page=${p}`)
            .then(html => this.novelsFrom(html))
            .catch(e => {
              if (e instanceof Error && e.message === CF_HINT) throw e;
              return [];
            }),
        );
      }
      for (const list of await Promise.all(batch)) {
        for (const n of list) {
          if (!seen.has(n.path)) {
            seen.add(n.path);
            items.push(n);
          }
        }
      }
    }
    return items;
  }

  private async getIndex(): Promise<Plugin.NovelItem[]> {
    const cached = this.seriesIndex;
    if (cached && Date.now() - cached.at < INDEX_TTL) return cached.items;

    // Aynı anda birden fazla arama gelirse tek bir çekim paylaşılır
    if (!this.indexPromise) {
      this.indexPromise = this.buildIndex()
        .then(items => {
          if (items.length) this.seriesIndex = { at: Date.now(), items };
          return items;
        })
        .finally(() => {
          this.indexPromise = null;
        });
    }
    return this.indexPromise;
  }

  async searchNovels(searchTerm: string, pageNo: number): Promise<Plugin.NovelItem[]> {
    // Tüm sonuçlar tek seferde döner, sonraki sayfa yok
    if (pageNo > 1) return [];

    const words = fold(searchTerm).split(' ').filter(Boolean);
    if (!words.length) return [];

    const index = await this.getIndex();
    const results = index.filter(n => {
      const name = fold(n.name);
      return words.every(w => name.includes(w));
    });

    // Başlığı arama ifadesiyle başlayanlar öne çıksın
    const phrase = words.join(' ');
    return results.sort(
      (a, b) =>
        Number(fold(b.name).startsWith(phrase)) - Number(fold(a.name).startsWith(phrase)),
    );
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

