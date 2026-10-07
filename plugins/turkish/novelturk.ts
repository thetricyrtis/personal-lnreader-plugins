import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

const MONTHS: Record<string, string> = {
  oca: '01',
  ocak: '01',
  şub: '02',
  şubat: '02',
  mar: '03',
  mart: '03',
  nis: '04',
  nisan: '04',
  may: '05',
  mayıs: '05',
  haz: '06',
  haziran: '06',
  tem: '07',
  temmuz: '07',
  ağu: '08',
  ağustos: '08',
  eyl: '09',
  eylül: '09',
  eki: '10',
  ekim: '10',
  kas: '11',
  kasım: '11',
  ara: '12',
  aralık: '12',

  jan: '01',
  feb: '02',
  apr: '04',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

class NovelTurkPlugin implements Plugin.PluginBase {
  id = 'novelturk';
  name = 'Novel Türk';
  icon = 'src/turkish/novelturk/icon.png';
  site = 'https://novelturk.com';
  version = '0.1.0-test';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: {
      Referer: 'https://novelturk.com/',
    },
  };

  // -----------------------------
  // HTTP helpers
  // -----------------------------

  private async getHtml(path: string): Promise<string> {
    const res = await fetchApi(this.site + path);

    if (!res.ok) {
      throw new Error(`NovelTurk isteği başarısız oldu (HTTP ${res.status})`);
    }

    return res.text();
  }

  private async getJson<T = any>(path: string): Promise<T> {
    const res = await fetchApi(this.site + path);

    if (!res.ok) {
      throw new Error(`NovelTurk JSON isteği başarısız oldu (HTTP ${res.status})`);
    }

    return (await res.json()) as T;
  }

  // -----------------------------
  // URL helpers
  // -----------------------------

  private absUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;

    return this.site + (url.startsWith('/') ? url : '/' + url);
  }

  private toPath(href?: string): string | undefined {
    if (!href) return undefined;

    let path = href.split('#')[0].split('?')[0];

    if (path.startsWith(this.site)) {
      path = path.replace(this.site, '');
    }

    if (!path.startsWith('/')) {
      try {
        const u = new URL(href, this.site);
        if (u.origin !== new URL(this.site).origin) return undefined;
        path = u.pathname;
      } catch {
        return undefined;
      }
    }

    return path || undefined;
  }

  resolveUrl = (path: string): string => {
    if (/^https?:\/\//i.test(path)) return path;
    return this.site + (path.startsWith('/') ? path : '/' + path);
  };

  // -----------------------------
  // Text/date helpers
  // -----------------------------

  private decodeHtml(text?: string): string {
    if (!text) return '';

    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_match, code: string) => {
        try {
          return String.fromCodePoint(Number(code));
        } catch {
          return '';
        }
      })
      .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => {
        try {
          return String.fromCodePoint(parseInt(hex, 16));
        } catch {
          return '';
        }
      })
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseDate(text?: string): string | undefined {
    if (!text) return undefined;

    const value = text.trim();
    if (!value) return undefined;

    // ISO date
    const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];

    // 18.08.2026
    const dotted = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dotted) {
      return `${dotted[3]}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`;
    }

    // 18 Ağu 2026 / 18 Ağustos 2026
    const tr = value
      .toLocaleLowerCase('tr')
      .match(/^(\d{1,2})\s+([a-zçğıöşü]+)\.?\s+(\d{4})$/);

    if (tr) {
      const month = MONTHS[tr[2].replace('.', '')];
      if (!month) return undefined;

      return `${tr[3]}-${month}-${tr[1].padStart(2, '0')}`;
    }

    return undefined;
  }

  private normalizeDate(value?: string | number): string | undefined {
    if (value === undefined || value === null) return undefined;

    const s = String(value).trim();
    if (!s) return undefined;

    // Unix timestamp seconds
    if (/^\d{10}$/.test(s)) {
      try {
        return new Date(Number(s) * 1000).toISOString().slice(0, 10);
      } catch {
        return undefined;
      }
    }

    // Unix timestamp milliseconds
    if (/^\d{13}$/.test(s)) {
      try {
        return new Date(Number(s)).toISOString().slice(0, 10);
      } catch {
        return undefined;
      }
    }

    const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];

    return this.parseDate(s);
  }

  private parseChapterNumber(text?: string): number {
    if (!text) return 0;

    const normalized = text.toLocaleLowerCase('tr');

    const patterns = [
      /(?:bolum|bölüm|chapter)\s*(\d+(?:[.,]\d+)?)/i,
      /bolum[-_]?(\d+(?:[.,]\d+)?)/i,
      /(\d+(?:[.,]\d+)?)/,
    ];

    for (const pattern of patterns) {
      const m = normalized.match(pattern);
      if (m?.[1]) {
        const n = Number(String(m[1]).replace(',', '.'));
        if (!Number.isNaN(n)) return n;
      }
    }

    return 0;
  }

  private slugToTitle(path: string): string {
    const slug = path.split('/').filter(Boolean).pop() || '';

    try {
      return decodeURIComponent(slug)
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/(^|\s)(\S)/g, (_match, sep: string, ch: string) => {
          return sep + ch.toLocaleUpperCase('tr');
        });
    } catch {
      return slug
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  private cleanTitleFromAlt(alt?: string): string {
    if (!alt) return '';

    return this.decodeHtml(alt)
      .replace(/\s*Novel Oku.*$/i, '')
      .replace(/\s*-\s*Novel Türk.*$/i, '')
      .replace(/\s*;\s*Türkçe Novel Oku.*$/i, '')
      .trim();
  }

  private normalizeStatus(text?: string): NovelStatus {
    const value = (text || '').trim().toLocaleLowerCase('tr');

    if (
      value.includes('tamamlandı') ||
      value.includes('tamamlandi') ||
      value.includes('completed')
    ) {
      return NovelStatus.Completed;
    }

    return NovelStatus.Unknown;
  }

  // -----------------------------
  // Cheerio/image helpers
  // -----------------------------

  private getImgSrc($el: any): string | undefined {
    const img = $el.find('img').first();
    if (!img.length) return undefined;

    const candidates = [
      img.attr('src'),
      img.attr('data-src'),
      img.attr('data-lazy-src'),
      img.attr('data-original'),
      img.attr('data-cfsrc'),
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      if (candidate.startsWith('data:')) continue;

      const url = this.absUrl(candidate);
      if (url) return url;
    }

    return undefined;
  }

  private getJsonLd($: any): any | undefined {
    let result: any;

    $('script[type="application/ld+json"]').each((_i: number, el: any) => {
      try {
        const data = JSON.parse($(el).text());
        const nodes: any[] = Array.isArray(data)
          ? data
          : data?.['@graph']
            ? data['@graph']
            : [data];

        for (const node of nodes) {
          const type = node?.['@type'];
          const types = Array.isArray(type) ? type : [type];

          if (
            types.some((t: any) =>
              ['Book', 'Novel', 'CreativeWork'].includes(String(t)),
            )
          ) {
            result = node;
            return false;
          }
        }
      } catch {
        // ignore invalid JSON-LD
      }
    });

    return result;
  }

  private getLdImage(ld: any): string | undefined {
    const image = ld?.image;

    if (!image) return undefined;

    if (typeof image === 'string') return image;

    if (Array.isArray(image)) {
      return this.getLdImage({ image: image[0] });
    }

    if (typeof image === 'object') {
      return image.url || image.contentUrl || image['@id'] || undefined;
    }

    return undefined;
  }

  private getLdAuthor(ld: any): string | undefined {
    const author = ld?.author;

    if (!author) return undefined;

    if (typeof author === 'string') return author;

    if (Array.isArray(author)) {
      return author
        .map((a: any) => (typeof a === 'string' ? a : a?.name))
        .filter(Boolean)
        .join(', ');
    }

    if (typeof author === 'object') {
      return author.name || undefined;
    }

    return undefined;
  }

  private extractNovelId(html: string): string | undefined {
    const ntId = html.match(/var\s+NT_NOVEL_ID\s*=\s*(\d+)/i)?.[1];
    if (ntId) return ntId;

    const cardId = html.match(/id="novel-card-(\d+)"/i)?.[1];
    if (cardId) return cardId;

    return undefined;
  }

  // -----------------------------
  // Novel card parsing
  // -----------------------------

  private parseNovelCards($: any): Plugin.NovelItem[] {
    const novels: Plugin.NovelItem[] = [];
    const seen = new Set<string>();

    const selector = [
      'a.novel-card[href*="/novel/"]',
      '.novels-grid a[href*="/novel/"]',
      '.bookItem a[href*="/novel/"]',
      'a.bookItem[href*="/novel/"]',
    ].join(', ');

    $(selector).each((_i: number, el: any) => {
      const $el = $(el);

      const path = this.toPath($el.attr('href'));
      if (!path || !path.includes('/novel/')) return;
      if (seen.has(path)) return;

      let name = $el
        .find('.novel-card-title, .book-title, h2, h3, .title')
        .first()
        .text()
        .trim();

      if (!name) {
        name = this.cleanTitleFromAlt($el.find('img').first().attr('alt'));
      }

      if (!name) {
        name = this.slugToTitle(path);
      }

      if (!name) return;

      seen.add(path);

      novels.push({
        name: this.decodeHtml(name),
        path,
        cover: this.getImgSrc($el) || defaultCover,
      });
    });

    return novels;
  }

  // -----------------------------
  // Chapter parsing
  // -----------------------------

  private parseChapterLinks($: any, root?: any): Plugin.ChapterItem[] {
    const chapters: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    const scope = root && root.length ? root : $;
    const links = scope.find('a[href*="/bolum/"]');

    links.each((_i: number, el: any) => {
      const $el = $(el);

      const path = this.toPath($el.attr('href'));
      if (!path || !path.includes('/bolum/')) return;
      if (seen.has(path)) return;

      let name = $el.text().replace(/\s+/g, ' ').trim();

      if (!name) {
        name = $el.find('.chapter-title, .bolum-baslik, h3, span').first().text().trim();
      }

      if (!name) {
        name = $el.attr('title') || '';
      }

      if (!name) {
        name = this.slugToTitle(path);
      }

      name = this.decodeHtml(name);

      const timeEl = $el.find('time, .chapter-date, .bolum-tarih').first();
      const releaseRaw =
        timeEl.attr('datetime') ||
        timeEl.attr('data-nt-ts') ||
        timeEl.text();

      const releaseTime = this.normalizeDate(releaseRaw);
      const chapterNumber = this.parseChapterNumber(name) || this.parseChapterNumber(path);

      seen.add(path);

      chapters.push({
        name: name || 'Bölüm',
        path,
        releaseTime,
        chapterNumber,
      });
    });

    return chapters;
  }

  private sortChapters(chapters: Plugin.ChapterItem[]): Plugin.ChapterItem[] {
    const indexed = chapters.map((chapter, index) => ({
      chapter,
      index,
      number:
        chapter.chapterNumber && chapter.chapterNumber > 0
          ? chapter.chapterNumber
          : this.parseChapterNumber(chapter.name) ||
            this.parseChapterNumber(chapter.path) ||
            0,
    }));

    indexed.sort((a, b) => {
      if (a.number && b.number && a.number !== b.number) {
        return a.number - b.number;
      }

      if (a.number && !b.number) return -1;
      if (!a.number && b.number) return 1;

      return a.index - b.index;
    });

    return indexed.map((item, index) => ({
      ...item.chapter,
      chapterNumber: index + 1,
    }));
  }

  private async fetchChaptersFromRest(novelId: string): Promise<Plugin.ChapterItem[]> {
    const bases = [
      `/wp-json/wp/v2/bolum?parent=${novelId}`,
      `/wp-json/wp/v2/bolumlar?parent=${novelId}`,
      `/wp-json/wp/v2/chapter?parent=${novelId}`,
      `/wp-json/wp/v2/chapters?parent=${novelId}`,
      `/wp-json/wp/v2/bolum?novel=${novelId}`,
    ];

    for (const base of bases) {
      const chapters: Plugin.ChapterItem[] = [];
      const seen = new Set<string>();

      for (let page = 1; page <= 30; page++) {
        let items: any[];

        try {
          items = await this.getJson<any[]>(
            `${base}&per_page=100&page=${page}&orderby=date&order=asc&_fields=id,link,title,date_gmt,menu_order`,
          );
        } catch {
          break;
        }

        if (!Array.isArray(items) || items.length === 0) break;

        for (const item of items) {
          const path = this.toPath(item?.link);
          if (!path || !path.includes('/bolum/')) continue;
          if (seen.has(path)) continue;

          const title = this.decodeHtml(item?.title?.rendered);
          const name = title || this.slugToTitle(path) || 'Bölüm';

          const number =
            Number(item?.menu_order) ||
            this.parseChapterNumber(name) ||
            this.parseChapterNumber(path) ||
            0;

          const releaseTime = this.normalizeDate(item?.date_gmt || item?.date);

          seen.add(path);

          chapters.push({
            name,
            path,
            releaseTime,
            chapterNumber: number,
          });
        }

        if (items.length < 100) break;
      }

      if (chapters.length > 0) {
        return chapters;
      }
    }

    return [];
  }

  // -----------------------------
  // Plugin API
  // -----------------------------

  async popularNovels(pageNo: number): Promise<Plugin.NovelItem[]> {
    const path = pageNo <= 1 ? '/' : `/page/${pageNo}`;

    let html: string;
    try {
      html = await this.getHtml(path);
    } catch {
      return [];
    }

    const $ = parseHTML(html);
    return this.parseNovelCards($);
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const query = encodeURIComponent(searchTerm);
    const path =
      `/?s=${query}&post_type=novel` +
      (pageNo > 1 ? `&paged=${pageNo}` : '');

    let html: string;
    try {
      html = await this.getHtml(path);
    } catch {
      return [];
    }

    const $ = parseHTML(html);
    return this.parseNovelCards($);
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const html = await this.getHtml(novelPath);
    const $ = parseHTML(html);
    const ld = this.getJsonLd($);

    const name =
      this.decodeHtml($('h1').first().text()) ||
      this.decodeHtml($('meta[property="og:title"]').attr('content')) ||
      this.decodeHtml(ld?.name) ||
      this.slugToTitle(novelPath) ||
      'Başlıksız';

    const cover =
      this.absUrl($('meta[property="og:image"]').attr('content')) ||
      this.absUrl(this.getLdImage(ld)) ||
      this.getImgSrc($('.novel-hero, .novel-cover, #synopsis, article').first()) ||
      defaultCover;

    const author =
      this.decodeHtml($('a[href*="/yazar/"]').first().text()) ||
      this.decodeHtml($('.author, .yazar, .novel-author').first().text()) ||
      this.decodeHtml(this.getLdAuthor(ld)) ||
      undefined;

    const tagNodes = $('#novel-etiket a')
      .map((_i: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const badgeNodes = $('.nt-card-badge-type, .nt-card-badge-origin')
      .map((_i: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const genres =
      this.decodeHtml(tagNodes.join(', ')) ||
      this.decodeHtml(badgeNodes.join(', ')) ||
      undefined;

    const summaryParagraphs = $('#synopsis .novel-ozet p, .novel-ozet p')
      .map((_i: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const summary =
      this.decodeHtml(summaryParagraphs.join('\n\n')) ||
      this.decodeHtml($('.novel-ozet').first().text()) ||
      this.decodeHtml($('meta[name="description"]').attr('content')) ||
      this.decodeHtml(ld?.description) ||
      undefined;

    const statusText =
      $('[data-status]').first().text() ||
      ld?.bookStatus ||
      '';

    let chapters = this.parseChapterLinks($, $('#bolumler'));

    if (!chapters.length) {
      chapters = this.parseChapterLinks($, $('.clwd-list'));
    }

    if (!chapters.length) {
      chapters = this.parseChapterLinks($);
    }

    if (!chapters.length) {
      const novelId = this.extractNovelId(html);

      if (novelId) {
        chapters = await this.fetchChaptersFromRest(novelId);
      }
    }

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name,
      cover,
      author,
      genres,
      summary,
      status: this.normalizeStatus(statusText),
      chapters: this.sortChapters(chapters),
    };

    return novel;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.getHtml(chapterPath);
    const $ = parseHTML(html);

    let root = $('.reader-text').first();

    const isLikelyLoading = (text: string) =>
      /yükleniyor|loading/i.test(text) && text.trim().length < 120;

    if (!root.length || isLikelyLoading(root.text())) {
      const alternatives = [
        '#chapter-content',
        '.chapter-content',
        '.entry-content',
        'article .content',
        '#content',
      ];

      for (const selector of alternatives) {
        const candidate = $(selector).first();

        if (!candidate.length) continue;

        const candidateText = candidate.text();

        if (
          candidateText.trim().length > root.text().trim().length &&
          !isLikelyLoading(candidateText)
        ) {
          root = candidate;
          break;
        }
      }
    }

    if (!root.length) {
      throw new Error(
        'Bölüm içeriği bulunamadı. Site yapısı değişmiş veya içerik AJAX/Turnstile ile yükleniyor olabilir.',
      );
    }

    // Gereksiz/riskli öğeleri temizle
    root.find(
      [
        'script',
        'style',
        'noscript',
        'iframe',
        'ins',
        '.adsbygoogle',
        '.ad-slot',
        '#chapter-drawer',
        '.chapter-drawer',
        '.navi',
        '.navi-btn',
        '.chapter-nav',
        '.nt-share-row',
        '.nt-share-btn',
        '.csr-btn',
        '.comment-list',
        '#comments',
        '.nt-cr-stars',
        '.nt-cr-feedback',
      ].join(', '),
    ).remove();

    // Görselleri normalleştir
    root.find('img').each((_i: number, el: any) => {
      const $img = $(el);

      const src =
        $img.attr('src') ||
        $img.attr('data-src') ||
        $img.attr('data-lazy-src') ||
        $img.attr('data-original') ||
        $img.attr('data-cfsrc');

      if (!src || src.startsWith('data:')) {
        $img.remove();
        return;
      }

      const absolute = this.absUrl(src);
      if (absolute) {
        $img.attr('src', absolute);
      } else {
        $img.remove();
        return;
      }

      $img.removeAttr('srcset');
      $img.removeAttr('sizes');
      $img.removeAttr('loading');
      $img.removeAttr('decoding');
      $img.removeAttr('fetchpriority');
    });

    return (root.html() || '')
      .replace(/\*\*/g, '')
      .trim();
  }
}

export default new NovelTurkPlugin();
