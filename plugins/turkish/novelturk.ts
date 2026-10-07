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
};

class NovelTurkPlugin implements Plugin.PluginBase {
  id = 'novelturk';
  name = 'Novel Türk';
  icon = 'src/turkish/novelturk/icon.png';
  site = 'https://novelturk.com';
  version = '1.0.1';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: {
      Referer: 'https://novelturk.com/',
    },
  };

  private absUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  private toPath(href?: string): string | undefined {
    if (!href) return undefined;

    const clean = href
      .replace(this.site, '')
      .split('#')[0]
      .split('?')[0];

    return clean || undefined;
  }

  private async getHtml(path: string): Promise<string> {
    const res = await fetchApi(this.site + path);

    if (!res.ok) {
      throw new Error(`NovelTürk isteği başarısız (HTTP ${res.status})`);
    }

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

  private parseDate(text: string): string | undefined {
    const m = text
      .trim()
      .toLowerCase()
      .match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);

    if (!m) return undefined;

    const month = MONTHS[m[2]];
    if (!month) return undefined;

    return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
  }

  private normalizeStatus(text?: string): NovelStatus {
    const t = (text || '').toLowerCase();

    if (t.includes('tamamlandı') || t.includes('bitti')) {
      return NovelStatus.Completed;
    }

    if (t.includes('devam') || t.includes('güncel')) {
      return NovelStatus.Ongoing;
    }

    if (t.includes('beklemede') || t.includes('hiatus')) {
      return NovelStatus.OnHiatus;
    }

    if (t.includes('iptal') || t.includes('terk')) {
      return NovelStatus.Cancelled;
    }

    return NovelStatus.Unknown;
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

    const srcset = img.attr('srcset');
    if (srcset) {
      const first = srcset
        .split(',')[0]
        ?.trim()
        .split(/\s+/)[0];

      if (first && !first.startsWith('data:')) {
        return this.absUrl(first);
      }
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

      name = this.decodeHtml(name);
      if (!name) return;

      seen.add(path);

      novels.push({
        name,
        path,
        cover: this.getImgSrc($el) || defaultCover,
      });
    });

    return novels;
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

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
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
    const $ = parseHTML(await this.getHtml(novelPath));

    const name =
      this.decodeHtml($('h1').first().text()) ||
      this.decodeHtml($('title').first().text()) ||
      'Başlıksız';

    const cover =
      $('meta[property="og:image"]').attr('content') ||
      $('.novel-cover img').first().attr('src');

    const author =
      this.decodeHtml($('.nt-author-link').first().text()) || undefined;

    const genreTags = $('.genre-tag')
      .map((_i: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const etiketler = $('#novel-etiket a')
      .map((_i: number, el: any) =>
        $(el)
          .text()
          .trim()
          .replace(/^#/, ''),
      )
      .get()
      .filter(Boolean);

    const genres =
      this.decodeHtml([...new Set([...genreTags, ...etiketler])].join(', ')) ||
      undefined;

    const summaryParagraphs = $('.novel-ozet p')
      .map((_i: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const summary =
      this.decodeHtml(
        summaryParagraphs.length
          ? summaryParagraphs.join('\n\n')
          : $('.novel-ozet').text().trim(),
      ) || undefined;

    const statusText =
      $('.nt-badge[data-status]').first().attr('data-status') || '';

    const chapters: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    $('#bolumler .clwd-list a.eph-num[href*="/bolum/"]').each(
      (_i: number, el: any) => {
        const $el = $(el);

        const path = this.toPath($el.attr('href'));
        if (!path || seen.has(path)) return;
        seen.add(path);

        const num = $el.find('.ch-num-pill').first().text().trim();
        const title = $el.find('.ch-sub-title').first().text().trim();

        const chapterName = this.decodeHtml(
          [num, title].filter(Boolean).join(' - ') || `Bölüm ${_i + 1}`,
        );

        const dateText = $el.find('.chapterdate').first().text().trim();

        chapters.push({
          name: chapterName,
          path,
          releaseTime: this.parseDate(dateText),
          chapterNumber: _i + 1,
        });
      },
    );

    return {
      path: novelPath,
      name,
      cover: this.absUrl(cover) || defaultCover,
      author,
      genres,
      summary,
      status: this.normalizeStatus(statusText),
      chapters,
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.getHtml(chapterPath);

    const chapterId = html.match(/data-chapter-id=["'](\d+)["']/)?.[1];

    // 1) WP REST API
    if (chapterId) {
      const json = await this.getJson<any>(
        `/wp-json/wp/v2/chapter/${chapterId}?_fields=content`,
      );

      const content = json?.content?.rendered;

      if (content && content.trim().length > 50) {
        return this.cleanContent(content);
      }
    }

    // 2) admin-ajax fallback
    const nonce = html.match(/"nonce":"([^"]+)"/)?.[1];

    if (chapterId && nonce) {
      const actions = [
        'nt_load_chapter_content',
        'nt_get_chapter_content',
        'nt_chapter_content',
        'load_chapter_content',
      ];

      for (const action of actions) {
        try {
          const res = await fetchApi(`${this.site}/wp-admin/admin-ajax.php`, {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded; charset=UTF-8',
              Referer: this.site + chapterPath,
            },
            body: `action=${action}&chapter_id=${chapterId}&nonce=${nonce}`,
          });

          if (!res.ok) continue;

          const text = await res.text();

          try {
            const json = JSON.parse(text);
            const content =
              json?.data?.html || json?.data?.content || json?.data;

            if (typeof content === 'string' && content.trim().length > 50) {
              return this.cleanContent(content);
            }
          } catch {
            if (text.trim().length > 50 && text.includes('<p')) {
              return this.cleanContent(text);
            }
          }
        } catch {
          // sıradaki action
        }
      }
    }

    throw new Error(
      'Bölüm içeriği alınamadı. Site içeriği dinamik yüklüyor. ' +
        'Tarayıcıda bölüm sayfasını açıp Network > Fetch/XHR sekmesinden içerik isteğini yakalayın.',
    );
  }

  private cleanContent(html: string): string {
    const $ = parseHTML(`<div id="clean-root">${html}</div>`);
    const root = $('#clean-root');

    root
      .find('script, style, iframe, ins, .ad-slot, .adsbygoogle')
      .remove();

    root
      .find('[style*="display:none"], [style*="display: none"]')
      .remove();

    root.find('[style*="-9999px"]').remove();

    root.find('img').each((_i: number, el: any) => {
      const $img = $(el);

      const src =
        $img.attr('src') ||
        $img.attr('data-src') ||
        $img.attr('data-lazy-src');

      if (src) {
        $img.attr('src', this.absUrl(src) || src);
      }

      $img.removeAttr('srcset');
      $img.removeAttr('sizes');
      $img.removeAttr('loading');
    });

    return (root.html() || '').replace(/\*\*/g, '').trim();
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovelTurkPlugin();
