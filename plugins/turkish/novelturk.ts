import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

const MONTHS: Record<string, string> = {
  oca: '01', ocak: '01', şub: '02', şubat: '02', mar: '03', mart: '03',
  nis: '04', nisan: '04', may: '05', mayıs: '05', haz: '06', haziran: '06',
  tem: '07', temmuz: '07', ağu: '08', ağustos: '08', eyl: '09', eylül: '09',
  eki: '10', ekim: '10', kas: '11', kasım: '11', ara: '12', aralık: '12',
};

class NovelTurkPlugin implements Plugin.PluginBase {
  id = 'novelturk';
  name = 'Novel Türk';
  icon = 'src/turkish/novelturk/icon.png';
  site = 'https://novelturk.com';
  version = '1.0.2';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: 'https://novelturk.com/' },
  };

  private absUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  private toPath(href?: string): string | undefined {
    if (!href) return undefined;
    const clean = href.replace(this.site, '').split('#')[0].split('?')[0];
    return clean || undefined;
  }

  private async getHtml(path: string): Promise<string> {
    const res = await fetchApi(this.site + path);
    if (!res.ok) throw new Error(`NovelTürk isteği başarısız (HTTP ${res.status})`);
    return res.text();
  }

  private async getJson<T = any>(path: string): Promise<T | undefined> {
    try {
      const res = await fetchApi(this.site + path);
      if (!res.ok) return undefined;
      return (await res.json()) as T;
    } catch {
      return undefined;
    }
  }

  private decodeHtml(text?: string): string {
    if (!text) return '';
    return text
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_m, c: string) => {
        try { return String.fromCodePoint(Number(c)); } catch { return ''; }
      })
      .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => {
        try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ''; }
      })
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseDate(text: string): string | undefined {
    const m = text.trim().toLowerCase().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
    if (!m) return undefined;
    const month = MONTHS[m[2]];
    if (!month) return undefined;
    return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
  }

  private normalizeStatus(text?: string): NovelStatus {
    const t = (text || '').toLowerCase();
    if (t.includes('tamamlandı') || t.includes('bitti')) return NovelStatus.Completed;
    if (t.includes('devam') || t.includes('güncel')) return NovelStatus.Ongoing;
    if (t.includes('beklemede') || t.includes('hiatus')) return NovelStatus.OnHiatus;
    if (t.includes('iptal') || t.includes('terk')) return NovelStatus.Cancelled;
    return NovelStatus.Unknown;
  }

  private slugToTitle(path: string): string {
    const slug = path.split('/').filter(Boolean).pop() || '';
    try {
      return decodeURIComponent(slug)
        .replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
        .replace(/(^|\s)(\S)/g, (_m, sep: string, ch: string) => sep + ch.toLocaleUpperCase('tr'));
    } catch {
      return slug.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
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

  private getImgSrc($el: any): string | undefined {
    const img = $el.find('img').first();
    if (!img.length) return undefined;
    const candidates = [
      img.attr('src'), img.attr('data-src'), img.attr('data-lazy-src'),
      img.attr('data-original'), img.attr('data-cfsrc'),
    ];
    for (const c of candidates) {
      if (!c || c.startsWith('data:')) continue;
      const url = this.absUrl(c);
      if (url) return url;
    }
    const srcset = img.attr('srcset');
    if (srcset) {
      const first = srcset.split(',')[0]?.trim().split(/\s+/)[0];
      if (first && !first.startsWith('data:')) return this.absUrl(first);
    }
    return undefined;
  }

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
      if (!path || !path.includes('/novel/') || seen.has(path)) return;
      seen.add(path);

      let name = $el.find('.novel-card-title, .book-title, h2, h3, .title').first().text().trim();
      if (!name) name = this.cleanTitleFromAlt($el.find('img').first().attr('alt'));
      if (!name) name = this.slugToTitle(path);
      name = this.decodeHtml(name);
      if (!name) return;

      novels.push({ name, path, cover: this.getImgSrc($el) || defaultCover });
    });

    return novels;
  }

  // ---------- bölüm listesi yardımcıları ----------

  private extractNovelId(html: string): string | undefined {
    return html.match(/var\s+NT_NOVEL_ID\s*=\s*(\d+)/i)?.[1];
  }

  private extractNonce(html: string): string | undefined {
    return html.match(/"nonce"\s*:\s*"([^"]+)"/i)?.[1];
  }

  private parseChapterNumber(text?: string): number {
    if (!text) return 0;
    const m = text.replace(',', '.').match(/(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : 0;
  }

  private parseOneChapter($: any, el: any): Plugin.ChapterItem | undefined {
    const $el = $(el);
    const path = this.toPath($el.attr('href'));
    if (!path || !path.includes('/bolum/')) return undefined;

    const num = $el.find('.ch-num-pill').first().text().trim();
    const title = $el.find('.ch-sub-title').first().text().trim();
    const name = this.decodeHtml(
      [num, title].filter(Boolean).join(' - ') || $el.text().replace(/\s+/g, ' ').trim() || 'Bölüm',
    );

    const dateText = $el.find('.chapterdate, time').first().text().trim();

    return {
      name,
      path,
      releaseTime: this.parseDate(dateText),
      chapterNumber: this.parseChapterNumber(num || name || path),
    };
  }

  // Boş bir sekmeyi (data-loaded="0") AJAX ile doldurur.
  private async fetchChapterGroup(
    novelId: string,
    group: string,
    nonce: string,
  ): Promise<Plugin.ChapterItem[]> {
    const chapters: Plugin.ChapterItem[] = [];
    try {
      const res = await fetchApi(`${this.site}/wp-admin/admin-ajax.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: this.site + '/',
        },
        body: `action=nt_load_chapter_group&novel_id=${encodeURIComponent(novelId)}&group=${encodeURIComponent(group)}&nonce=${encodeURIComponent(nonce)}`,
      });

      if (!res?.ok) return chapters;
      const raw = await res.text();
      if (!raw) return chapters;

      // Cevap JSON ({data:{html}} / {data:"..."}) veya düz HTML olabilir.
      let htmlFragment = '';
      try {
        const json = JSON.parse(raw);
        htmlFragment =
          json?.data?.html || json?.data?.content ||
          (typeof json?.data === 'string' ? json.data : '') ||
          json?.html || '';
      } catch {
        htmlFragment = raw;
      }

      if (!htmlFragment || !/<li|<a/i.test(htmlFragment)) return chapters;

      const $ = parseHTML(`<ul id="nt-grp">${htmlFragment}</ul>`);
      const items = $('#nt-grp a.eph-num[href*="/bolum/"]').get();

      // Site AJAX cevabını tersten veriyor (tema reverse() yapıyor); biz de ters çevir.
      for (let i = items.length - 1; i >= 0; i--) {
        const ch = this.parseOneChapter($, items[i]);
        if (ch) chapters.push(ch);
      }
    } catch {
      // sessiz geç
    }
    return chapters;
  }

  async popularNovels(pageNo: number): Promise<Plugin.NovelItem[]> {
    const path = pageNo <= 1 ? '/' : `/page/${pageNo}`;
    try {
      const $ = parseHTML(await this.getHtml(path));
      return this.parseNovelCards($);
    } catch {
      return [];
    }
  }

  async searchNovels(searchTerm: string, pageNo: number): Promise<Plugin.NovelItem[]> {
    const path =
      `/?s=${encodeURIComponent(searchTerm)}&post_type=novel` +
      (pageNo > 1 ? `&paged=${pageNo}` : '');
    try {
      const $ = parseHTML(await this.getHtml(path));
      return this.parseNovelCards($);
    } catch {
      return [];
    }
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const html = await this.getHtml(novelPath);
    const $ = parseHTML(html);

    const name =
      this.decodeHtml($('h1').first().text()) ||
      this.decodeHtml($('title').first().text()) ||
      'Başlıksız';

    const cover =
      $('meta[property="og:image"]').attr('content') ||
      $('.novel-cover img').first().attr('src');

    const author = this.decodeHtml($('.nt-author-link').first().text()) || undefined;

    const genreTags = $('.genre-tag').map((_i: number, el: any) => $(el).text().trim()).get().filter(Boolean);
    const etiketler = $('#novel-etiket a')
      .map((_i: number, el: any) => $(el).text().trim().replace(/^#/, ''))
      .get().filter(Boolean);
    const genres = this.decodeHtml([...new Set([...genreTags, ...etiketler])].join(', ')) || undefined;

    const summaryParagraphs = $('.novel-ozet p')
      .map((_i: number, el: any) => $(el).text().trim()).get().filter(Boolean);
    const summary =
      this.decodeHtml(
        summaryParagraphs.length ? summaryParagraphs.join('\n\n') : $('.novel-ozet').text().trim(),
      ) || undefined;

    const statusText = $('.nt-badge[data-status]').first().attr('data-status') || '';

    // ---- bölüm listesi: statik + AJAX sekmeleri ----
    const collected: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    const push = (ch?: Plugin.ChapterItem) => {
      if (!ch || seen.has(ch.path)) return;
      seen.add(ch.path);
      collected.push(ch);
    };

    // 1) Zaten dolu sekmeler (data-loaded="1")
    $('#bolumler ul.clwd-list[data-loaded="1"], #clwd ul.clwd-list[data-loaded="1"]').each(
      (_i: number, ul: any) => {
        $(ul).find('a.eph-num[href*="/bolum/"]').each((_j: number, el: any) => {
          push(this.parseOneChapter($, el));
        });
      },
    );

    // 2) Boş sekmeler (data-loaded="0") → AJAX ile çek
    const novelId = this.extractNovelId(html);
    const nonce = this.extractNonce(html);

    if (novelId && nonce) {
      const groups: string[] = [];
      $('#bolumler ul.clwd-list[data-loaded="0"], #clwd ul.clwd-list[data-loaded="0"]').each(
        (_i: number, ul: any) => {
          const g = $(ul).attr('data-group');
          if (g && !groups.includes(g)) groups.push(g);
        },
      );

      // Sırayla çek (aynı anda çok istek atıp rate-limit yememek için)
      for (const g of groups) {
        const chs = await this.fetchChapterGroup(novelId, g, nonce);
        chs.forEach(push);
      }
    }

    // 3) Hiçbir şey bulunamazsa son çare: sayfadaki tüm /bolum/ linkleri
    if (!collected.length) {
      $('#bolumler a.eph-num[href*="/bolum/"], #clwd a.eph-num[href*="/bolum/"]').each(
        (_i: number, el: any) => push(this.parseOneChapter($, el)),
      );
    }

    // Gerçek bölüm numarasına göre artan sırala (1 → N), sonra chapterNumber ata
    const sorted = collected
      .map((ch, idx) => ({
        ch,
        idx,
        n: ch.chapterNumber && ch.chapterNumber > 0 ? ch.chapterNumber : this.parseChapterNumber(ch.name) || this.parseChapterNumber(ch.path) || 0,
      }))
      .sort((a, b) => {
        if (a.n && b.n && a.n !== b.n) return a.n - b.n;
        if (a.n && !b.n) return -1;
        if (!a.n && b.n) return 1;
        return a.idx - b.idx;
      })
      .map((x, i) => ({ ...x.ch, chapterNumber: i + 1 }));

    return {
      path: novelPath,
      name,
      cover: this.absUrl(cover) || defaultCover,
      author,
      genres,
      summary,
      status: this.normalizeStatus(statusText),
      chapters: sorted,
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.getHtml(chapterPath);
    const chapterId = html.match(/data-chapter-id=["'](\d+)["']/)?.[1];

    if (chapterId) {
      const json = await this.getJson<any>(`/wp-json/wp/v2/chapter/${chapterId}?_fields=content`);
      const content = json?.content?.rendered;
      if (content && content.trim().length > 50) return this.cleanContent(content);
    }

    const nonce = html.match(/"nonce":"([^"]+)"/)?.[1];
    if (chapterId && nonce) {
      const actions = ['nt_load_chapter_content', 'nt_get_chapter_content', 'nt_chapter_content', 'load_chapter_content'];
      for (const action of actions) {
        try {
          const res = await fetchApi(`${this.site}/wp-admin/admin-ajax.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              Referer: this.site + chapterPath,
            },
            body: `action=${action}&chapter_id=${chapterId}&nonce=${nonce}`,
          });
          if (!res.ok) continue;
          const text = await res.text();
          try {
            const json = JSON.parse(text);
            const content = json?.data?.html || json?.data?.content || json?.data;
            if (typeof content === 'string' && content.trim().length > 50) return this.cleanContent(content);
          } catch {
            if (text.trim().length > 50 && text.includes('<p')) return this.cleanContent(text);
          }
        } catch { /* sıradaki */ }
      }
    }

    throw new Error('Bölüm içeriği alınamadı. Site içeriği dinamik yüklüyor.');
  }

  private cleanContent(html: string): string {
    const $ = parseHTML(`<div id="clean-root">${html}</div>`);
    const root = $('#clean-root');
    root.find('script, style, iframe, ins, .ad-slot, .adsbygoogle').remove();
    root.find('[style*="display:none"], [style*="display: none"]').remove();
    root.find('[style*="-9999px"]').remove();
    root.find('img').each((_i: number, el: any) => {
      const $img = $(el);
      const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      if (src) $img.attr('src', this.absUrl(src) || src);
      $img.removeAttr('srcset'); $img.removeAttr('sizes'); $img.removeAttr('loading');
    });
    return (root.html() || '').replace(/\*\*/g, '').trim();
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovelTurkPlugin();
