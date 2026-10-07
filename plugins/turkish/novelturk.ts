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
  version = '1.0.3';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: 'https://novelturk.com/' },
  };

  // ─── helpers ───

  private absUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    return this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  private toPath(href?: string): string | undefined {
    if (!href) return undefined;
    return href.replace(this.site, '').split('#')[0].split('?')[0] || undefined;
  }

  private async getHtml(path: string): Promise<string> {
    const res = await fetchApi(this.site + path);
    if (!res.ok) throw new Error(`NovelTürk isteği başarısız (HTTP ${res.status})`);
    return res.text();
  }

  private async tryJson<T = any>(path: string): Promise<T | undefined> {
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
      .replace(/\s+/g, ' ').trim();
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

  private parseChapterNumber(text?: string): number {
    if (!text) return 0;
    const m = text.replace(',', '.').match(/(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : 0;
  }

  private slugToTitle(path: string): string {
    const slug = path.split('/').filter(Boolean).pop() || '';
    try {
      return decodeURIComponent(slug)
        .replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
        .replace(/(^|\s)(\S)/g, (_m, sep: string, ch: string) => sep + ch.toLocaleUpperCase('tr'));
    } catch {
      return slug.replace(/[-_]+/g, ' ').trim();
    }
  }

  private getImgSrc($el: any): string | undefined {
    const img = $el.find('img').first();
    if (!img.length) return undefined;
    for (const attr of ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-cfsrc']) {
      const v = img.attr(attr);
      if (v && !v.startsWith('data:')) return this.absUrl(v);
    }
    const ss = img.attr('srcset');
    if (ss) {
      const first = ss.split(',')[0]?.trim().split(/\s+/)[0];
      if (first && !first.startsWith('data:')) return this.absUrl(first);
    }
    return undefined;
  }

  // ─── novel kartları ───

  private parseNovelCards($: any): Plugin.NovelItem[] {
    const novels: Plugin.NovelItem[] = [];
    const seen = new Set<string>();
    const sel = [
      'a.novel-card[href*="/novel/"]',
      '.novels-grid a[href*="/novel/"]',
      '.bookItem a[href*="/novel/"]',
      'a.bookItem[href*="/novel/"]',
    ].join(', ');

    $(sel).each((_i: number, el: any) => {
      const $el = $(el);
      const path = this.toPath($el.attr('href'));
      if (!path || !path.includes('/novel/') || seen.has(path)) return;
      seen.add(path);

      let name = $el.find('.novel-card-title, .book-title, h2, h3, .title').first().text().trim();
      if (!name) name = this.decodeHtml($el.find('img').first().attr('alt') || '')
        .replace(/\s*Novel Oku.*$/i, '').replace(/\s*-\s*Novel Türk.*$/i, '').trim();
      if (!name) name = this.slugToTitle(path);
      if (!name) return;

      novels.push({ name: this.decodeHtml(name), path, cover: this.getImgSrc($el) || defaultCover });
    });

    return novels;
  }

  // ─── bölüm listesi: tek bir <a> → ChapterItem ───

  private oneChapter($: any, el: any): Plugin.ChapterItem | undefined {
    const $el = $(el);
    const path = this.toPath($el.attr('href'));
    if (!path || !path.includes('/bolum/')) return undefined;

    const num = $el.find('.ch-num-pill, .chpName').first().text().trim();
    const title = $el.find('.ch-sub-title').first().text().trim();
    const raw = $el.text().replace(/\s+/g, ' ').trim();
    const name = this.decodeHtml([num, title].filter(Boolean).join(' - ') || raw || 'Bölüm');

    const timeEl = $el.find('time, .chapterdate, .nt-chapter-time').first();
    const dateStr = timeEl.attr('datetime') || timeEl.attr('data-ts') || timeEl.text().trim();

    let releaseTime: string | undefined;
    if (/^\d{10}$/.test(dateStr)) {
      try { releaseTime = new Date(Number(dateStr) * 1000).toISOString().slice(0, 10); } catch {}
    } else {
      releaseTime = this.parseDate(dateStr);
    }

    return { name, path, releaseTime, chapterNumber: this.parseChapterNumber(num || name || path) };
  }

  // ─── HTML'den statik bölümler (data-loaded="1") ───

  private staticChapters($: any): Plugin.ChapterItem[] {
    const out: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();
    const push = (c?: Plugin.ChapterItem) => {
      if (!c || seen.has(c.path)) return;
      seen.add(c.path);
      out.push(c);
    };

    // data-loaded="1" olan ul'ler
    $('#clwd .clwd-list[data-loaded="1"], #bolumler .clwd-list[data-loaded="1"]').each(
      (_i: number, ul: any) => {
        $(ul).find('a.eph-num[href*="/bolum/"], a[href*="/bolum/"]').each((_j: number, el: any) => {
          push(this.oneChapter($, el));
        });
      },
    );

    // fallback: hiç data-loaded yoksa tüm /bolum/ linkleri
    if (!out.length) {
      $('#clwd a[href*="/bolum/"], #bolumler a[href*="/bolum/"]').each((_i: number, el: any) => {
        push(this.oneChapter($, el));
      });
    }

    return out;
  }

  // ─── JS kodundan action adını çıkar ───

  private extractAjaxAction(html: string): string | undefined {
    // nt_fetchChapterGroup fonksiyonu içindeki action string'i
    const fnBody = html.match(/function\s+nt_fetchChapterGroup[\s\S]*?\n\s*\}/)?.[0];
    if (fnBody) {
      const a = fnBody.match(/action["'\s:=]+['"]?([a-z_]+)['"]?/i);
      if (a?.[1]) return a[1];
    }
    // genel: nt_load_chapter_group, nt_chapter_group vs.
    const generic = html.match(/action["'\s:=]+['"]?(nt_[a-z_]+chapter[a-z_]*)['"]?/i);
    if (generic?.[1]) return generic[1];
    return undefined;
  }

  private extractNovelId(html: string): string | undefined {
    return (
      html.match(/var\s+NT_NOVEL_ID\s*=\s*(\d+)/i)?.[1] ||
      html.match(/"novel_id"\s*:\s*"?(\d+)"?/i)?.[1] ||
      html.match(/data-novel-id=["'](\d+)["']/i)?.[1]
    );
  }

  private extractNonce(html: string): string | undefined {
    return (
      html.match(/"nonce"\s*:\s*"([^"]+)"/i)?.[1] ||
      html.match(/ntAjax[\s\S]*?"nonce"\s*:\s*"([^"]+)"/i)?.[1]
    );
  }

  private extractTotalChapters(html: string): number {
    const m = html.match(/var\s+totalChapters\s*=\s*(\d+)/i);
    return m ? Number(m[1]) : 0;
  }

  // ─── Strategy A: WP REST API ───

  private async restChapters(novelId: string): Promise<Plugin.ChapterItem[]> {
    const out: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    const endpoints = [
      `/wp-json/wp/v2/bolum?parent=${novelId}`,
      `/wp-json/wp/v2/bolum?novel=${novelId}`,
      `/wp-json/wp/v2/bolum?meta_key=_novel_id&meta_value=${novelId}`,
      `/wp-json/wp/v2/chapter?parent=${novelId}`,
      `/wp-json/wp/v2/bolumlar?parent=${novelId}`,
    ];

    for (const base of endpoints) {
      for (let page = 1; page <= 50; page++) {
        const data = await this.tryJson<any[]>(
          `${base}&per_page=100&page=${page}&orderby=date&order=asc&_fields=id,link,title,date_gmt,menu_order`,
        );
        if (!Array.isArray(data) || data.length === 0) break;

        for (const item of data) {
          const path = this.toPath(item?.link);
          if (!path || !path.includes('/bolum/') || seen.has(path)) continue;
          seen.add(path);

          const title = this.decodeHtml(item?.title?.rendered);
          const name = title || this.slugToTitle(path) || 'Bölüm';
          const num = Number(item?.menu_order) || this.parseChapterNumber(name) || this.parseChapterNumber(path) || 0;
          const rt = this.parseDate(String(item?.date_gmt || ''));

          out.push({ name, path, releaseTime: rt, chapterNumber: num });
        }

        if (data.length < 100) break;
      }
      if (out.length > 0) return out; // ilk çalışan endpoint yeterli
    }

    return out;
  }

  // ─── Strategy B: admin-ajax (çoklu action + payload) ───

  private async ajaxChapters(
    html: string,
    novelId: string,
  ): Promise<Plugin.ChapterItem[]> {
    const nonce = this.extractNonce(html);
    const jsAction = this.extractAjaxAction(html);

    const actions = [
      jsAction,
      'nt_load_chapter_group',
      'nt_chapter_group',
      'load_chapter_group',
      'nt_get_chapters',
      'nt_chapter_list',
      'webnovel_load_chapter_group',
      'webnovel_chapter_group',
    ].filter(Boolean) as string[];

    // data-loaded="0" olan ul'lerin group/range değerlerini topla
    const $ = parseHTML(html);
    const groups: string[] = [];
    $('#clwd .clwd-list[data-loaded="0"], #bolumler .clwd-list[data-loaded="0"]').each(
      (_i: number, ul: any) => {
        const g =
          $(ul).attr('data-group') ||
          $(ul).attr('data-range') ||
          $(ul).attr('data-tab') ||
          String(_i);
        if (!groups.includes(g)) groups.push(g);
      },
    );

    // group yoksa tek istek at (tüm bölümleri döndürsün diye)
    if (groups.length === 0) groups.push('all');

    const out: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    for (const action of actions) {
      for (const group of groups) {
        // birden fazla payload formatı dene
        const payloads = [
          `action=${action}&novel_id=${novelId}&group=${group}&nonce=${nonce || ''}`,
          `action=${action}&post_id=${novelId}&group=${group}&nonce=${nonce || ''}`,
          `action=${action}&id=${novelId}&tab=${group}&nonce=${nonce || ''}`,
          `action=${action}&novel=${novelId}&range=${group}&nonce=${nonce || ''}`,
        ];

        for (const body of payloads) {
          try {
            const res = await fetchApi(`${this.site}/wp-admin/admin-ajax.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                Referer: this.site + '/',
              },
              body,
            });
            if (!res?.ok) continue;

            const raw = await res.text();
            if (!raw || raw.length < 10) continue;

            let fragment = '';
            try {
              const json = JSON.parse(raw);
              fragment = json?.data?.html || json?.data?.content ||
                (typeof json?.data === 'string' ? json.data : '') ||
                json?.html || '';
            } catch {
              fragment = raw;
            }

            if (!fragment || !/<a|<li/i.test(fragment)) continue;

            const $$ = parseHTML(`<div id="nt-ax">${fragment}</div>`);
            const links = $$('#nt-ax a[href*="/bolum/"]').get();

            for (let i = links.length - 1; i >= 0; i--) {
              const ch = this.oneChapter($$, links[i]);
              if (!ch || seen.has(ch.path)) continue;
              seen.add(ch.path);
              out.push(ch);
            }

            if (out.length > 0) break; // bu action+payload çalıştı
          } catch { /* sıradaki */ }
        }
        if (out.length > 0) break;
      }
      if (out.length > 0) break;
    }

    return out;
  }

  // ─── Strategy C: okuma sayfası drawer API ───

  private async drawerChapters(novelId: string): Promise<Plugin.ChapterItem[]> {
    const out: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    // İlk bölüm sayfasını aç, drawer'dan tüm bölümleri çek
    // drawer API'si: admin-ajax.php?action=nt_drawer_chapters&novel_id=X&direction=older&vol=&num=&limit=300
    const actions = ['nt_drawer_chapters', 'nt_chapter_drawer', 'webnovel_drawer_chapters'];

    for (const action of actions) {
      let vol = '';
      let num = '';
      let hasMore = true;
      let guard = 0;

      while (hasMore && guard < 20) {
        guard++;
        try {
          const url = `${this.site}/wp-admin/admin-ajax.php?action=${action}&novel_id=${novelId}&direction=older&vol=${encodeURIComponent(vol)}&num=${encodeURIComponent(num)}&limit=300`;
          const res = await fetchApi(url, {
            headers: { 'X-Requested-With': 'XMLHttpRequest', Referer: this.site + '/' },
          });
          if (!res?.ok) break;

          const json = await res.json();
          const htmlFragment = json?.data?.html;
          if (!htmlFragment) break;

          hasMore = !!json?.data?.has_more_older;
          if (json?.data?.edge_older) {
            vol = json.data.edge_older.vol ?? vol;
            num = json.data.edge_older.num ?? num;
          }

          const $ = parseHTML(`<div id="nt-dr">${htmlFragment}</div>`);
          const links = $('#nt-dr a[href*="/bolum/"]').get();

          for (let i = links.length - 1; i >= 0; i--) {
            const ch = this.oneChapter($, links[i]);
            if (!ch || seen.has(ch.path)) continue;
            seen.add(ch.path);
            out.push(ch);
          }
        } catch {
          break;
        }
      }

      if (out.length > 0) return out;
    }

    return out;
  }

  // ─── sırala ───

  private sortChapters(chs: Plugin.ChapterItem[]): Plugin.ChapterItem[] {
    const indexed = chs.map((c, i) => ({
      c, i,
      n: c.chapterNumber > 0 ? c.chapterNumber : this.parseChapterNumber(c.name) || this.parseChapterNumber(c.path) || 0,
    }));

    indexed.sort((a, b) => {
      if (a.n && b.n && a.n !== b.n) return a.n - b.n;
      if (a.n && !b.n) return -1;
      if (!a.n && b.n) return 1;
      return a.i - b.i;
    });

    return indexed.map((x, i) => ({ ...x.c, chapterNumber: i + 1 }));
  }

  // ─── Plugin API ───

  async popularNovels(pageNo: number): Promise<Plugin.NovelItem[]> {
    const path = pageNo <= 1 ? '/' : `/page/${pageNo}`;
    try { return this.parseNovelCards(parseHTML(await this.getHtml(path))); }
    catch { return []; }
  }

  async searchNovels(searchTerm: string, pageNo: number): Promise<Plugin.NovelItem[]> {
    const path = `/?s=${encodeURIComponent(searchTerm)}&post_type=novel` +
      (pageNo > 1 ? `&paged=${pageNo}` : '');
    try { return this.parseNovelCards(parseHTML(await this.getHtml(path))); }
    catch { return []; }
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const html = await this.getHtml(novelPath);
    const $ = parseHTML(html);

    const name = this.decodeHtml($('h1').first().text()) ||
      this.decodeHtml($('title').first().text()) || 'Başlıksız';

    const cover = this.absUrl(
      $('meta[property="og:image"]').attr('content') ||
      $('.novel-cover img').first().attr('src')
    ) || defaultCover;

    const author = this.decodeHtml($('.nt-author-link, a[href*="/yazar/"]').first().text()) || undefined;

    const tags = $('#novel-etiket a, .genre-tag, .nt-tag-pill')
      .map((_i: number, el: any) => $(el).text().trim().replace(/^#/, ''))
      .get().filter(Boolean);
    const genres = this.decodeHtml([...new Set(tags)].join(', ')) || undefined;

    const paras = $('.novel-ozet p, #synopsis p')
      .map((_i: number, el: any) => $(el).text().trim()).get().filter(Boolean);
    const summary = this.decodeHtml(
      paras.length ? paras.join('\n\n') : $('.novel-ozet, #synopsis').first().text().trim()
    ) || undefined;

    const statusText = $('[data-status]').first().attr('data-status') || '';

    // ── bölüm listesi: 3 strateji ──
    const novelId = this.extractNovelId(html);
    const total = this.extractTotalChapters(html);

    // Strategy 0: statik HTML
    let chapters = this.staticChapters($);

    // eksik mi?
    if (novelId && total > 0 && chapters.length < total) {
      // Strategy A: REST
      const rest = await this.restChapters(novelId);
      if (rest.length > chapters.length) chapters = rest;
    }

    if (novelId && total > 0 && chapters.length < total) {
      // Strategy B: admin-ajax
      const ajax = await this.ajaxChapters(html, novelId);
      if (ajax.length > chapters.length) chapters = ajax;
    }

    if (novelId && total > 0 && chapters.length < total) {
      // Strategy C: drawer
      const drawer = await this.drawerChapters(novelId);
      if (drawer.length > chapters.length) chapters = drawer;
    }

    return {
      path: novelPath, name, cover, author, genres, summary,
      status: this.normalizeStatus(statusText),
      chapters: this.sortChapters(chapters),
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.getHtml(chapterPath);
    const $ = parseHTML(html);

    // 1) statik HTML
    for (const sel of ['.reader-text', '#chapter-content', '.chapter-content', '.entry-content']) {
      const root = $(sel).first();
      if (!root.length) continue;
      const inner = root.html() || '';
      const txt = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (txt.length > 80 && !/yükleniyor|loading/i.test(txt)) {
        return this.cleanContent(inner);
      }
    }

    // 2) JSON-LD articleBody
    let ldBody: string | undefined;
    $('script[type="application/ld+json"]').each((_i: number, el: any) => {
      try {
        const d = JSON.parse($(el).text());
        const stack = [d];
        while (stack.length) {
          const n = stack.pop();
          if (!n || typeof n !== 'object') continue;
          if (Array.isArray(n)) { n.forEach(c => stack.push(c)); continue; }
          if (n['@graph']) stack.push(n['@graph']);
          if (typeof n.articleBody === 'string' && n.articleBody.trim().length > 80) {
            ldBody = n.articleBody; return false;
          }
        }
      } catch {}
    });
    if (ldBody) {
      const h = ldBody.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`).join('');
      return this.cleanContent(h);
    }

    // 3) REST
    const chId = html.match(/data-chapter-id=["'](\d+)["']/)?.[1] ||
      html.match(/"chapterId"\s*:\s*"?(\d+)"?/i)?.[1];

    if (chId) {
      for (const ep of [`/wp-json/wp/v2/bolum/${chId}`, `/wp-json/wp/v2/chapter/${chId}`, `/wp-json/wp/v2/posts/${chId}`]) {
        const j = await this.tryJson<any>(`${ep}?_fields=content`);
        const c = j?.content?.rendered;
        if (typeof c === 'string' && c.trim().length > 80) return this.cleanContent(c);
      }
    }

    // 4) admin-ajax
    const nonce = html.match(/"nonce":"([^"]+)"/)?.[1];
    if (chId && nonce) {
      for (const action of ['nt_load_chapter_content', 'nt_get_chapter_content', 'load_chapter_content', 'nt_chapter_content']) {
        try {
          const res = await fetchApi(`${this.site}/wp-admin/admin-ajax.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Referer: this.site + chapterPath },
            body: `action=${action}&chapter_id=${chId}&post_id=${chId}&nonce=${nonce}`,
          });
          if (!res?.ok) continue;
          const t = await res.text();
          try {
            const j = JSON.parse(t);
            const c = j?.data?.html || j?.data?.content || j?.data;
            if (typeof c === 'string' && c.trim().length > 80) return this.cleanContent(c);
          } catch {
            if (t.trim().length > 80 && /<p|<div|<br/i.test(t)) return this.cleanContent(t);
          }
        } catch {}
      }
    }

    throw new Error('Bölüm içeriği alınamadı (statik/REST/AJAX/JSON-LD denendi).');
  }

  private cleanContent(html: string): string {
    const $ = parseHTML(`<div id="cr">${html}</div>`);
    const root = $('#cr');
    root.find('script, style, iframe, ins, .ad-slot, .adsbygoogle, noscript').remove();
    root.find('[style*="display:none"], [style*="display: none"], [style*="-9999px"]').remove();
    root.find('img').each((_i: number, el: any) => {
      const $img = $(el);
      const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      if (src && !src.startsWith('data:')) $img.attr('src', this.absUrl(src) || src);
      else $img.remove();
      $img.removeAttr('srcset sizes loading decoding fetchpriority');
    });
    return (root.html() || '').replace(/\*\*/g, '').trim();
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovelTurkPlugin();
