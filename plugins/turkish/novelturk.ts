import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

const AJAX = 'https://novelturk.com/wp-admin/admin-ajax.php';

class NovelTurkPlugin implements Plugin.PluginBase {
  id = 'novelturk';
  name = 'Novel Türk';
  icon = 'src/turkish/novelturk/icon.png';
  site = 'https://novelturk.com';
  version = '1.0.4';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: 'https://novelturk.com/' },
  };

  // ---------- yardımcılar ----------
  private absUrl(url?: string) {
    if (!url) return undefined;
    return /^https?:\/\//i.test(url)
      ? url
      : this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  private toPath(href?: string) {
    if (!href) return undefined;
    const p = href.replace(this.site, '').split('#')[0].split('?')[0];
    return p.startsWith('/novel/') || p.startsWith('/bolum/') ? p : undefined;
  }

  private async get(path: string) {
    const res = await fetchApi(this.site + path);
    if (!res.ok) throw new Error(`NovelTürk HTTP ${res.status}`);
    return res.text();
  }

  private async post(body: Record<string, string>) {
    const res = await fetchApi(AJAX, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams(body).toString(),
    });
    return res.ok ? res.text() : '';
  }

  // Hem .bookItem (ana sayfa) hem a.novel-card (arama) için ortak
  private pushNovel($: any, el: any, out: Plugin.NovelItem[], seen: Set<string>) {
    const $el = $(el);
    const path = this.toPath(
      $el.attr('href') || $el.find('a[href*="/novel/"]').first().attr('href'),
    );
    if (!path || seen.has(path)) return;

    const name = (
      $el.find('.novel-card-title, h2 a').first().text() ||
      $el.find('img').first().attr('alt') ||
      ''
    )
      .replace(/\s*Novel Oku.*$/i, '')
      .trim();
    if (!name) return;

    seen.add(path);
    out.push({
      name,
      path,
      cover: this.absUrl($el.find('img').first().attr('src')) || defaultCover,
    });
  }

  private novelsFrom($: any, sel: string) {
    const out: Plugin.NovelItem[] = [];
    const seen = new Set<string>();
    $(sel).each((_: number, el: any) => this.pushNovel($, el, out, seen));
    return out;
  }

  // ---------- bölüm listesi ----------
  private row($: any, el: any): Plugin.ChapterItem | undefined {
    const path = this.toPath($(el).attr('href'));
    if (!path || !path.startsWith('/bolum/')) return undefined;
    const num = $(el).find('.ch-num-pill').first().text().trim();
    const title = $(el).find('.ch-sub-title').first().text().trim();
    return {
      name: [num, title].filter(Boolean).join(' - ') || 'Bölüm',
      path,
      chapterNumber: 0,
    };
  }

  private addRows($: any, sel: string, items: Plugin.ChapterItem[], seen: Set<string>) {
    $(sel).each((_: number, el: any) => {
      const r = this.row($, el);
      if (r && !seen.has(r.path)) {
        seen.add(r.path);
        items.push(r);
      }
    });
  }

  private async chapters($: any, html: string): Promise<Plugin.ChapterItem[]> {
    const items: Plugin.ChapterItem[] = [];
    const seen = new Set<string>();

    // Statik gelen ilk sekme (yeni → eski)
    this.addRows($, '#clwd ul.clwd-list[data-loaded="1"] a.eph-num', items, seen);

    // Boş sekmeler: sitenin kendi AJAX sözleşmesi (novel_id + group + nonce)
    const novelId = html.match(/var NT_NOVEL_ID = (\d+)/)?.[1];
    const nonce = html.match(/var ntAjax = \{[^}]*"nonce":"([a-f0-9]+)"/)?.[1];

    if (novelId && nonce) {
      const groups = $('#clwd ul.clwd-list[data-loaded="0"]')
        .map((_: number, el: any) => $(el).attr('data-group') || '')
        .get()
        .filter(Boolean);

      for (const group of groups) {
        const raw = await this.post({
          action: 'nt_load_chapter_group',
          novel_id: novelId,
          group,
          nonce,
        });
        try {
          const data = JSON.parse(raw);
          if (data?.success && typeof data.data?.html === 'string') {
            this.addRows(parseHTML(data.data.html), 'a.eph-num', items, seen);
          }
        } catch {
          // grup çekilemedi, atla
        }
      }
    }

    // Site yeni→eski verir; ters çevir = 1..N
    items.reverse();
    return items.map((c, i) => ({ ...c, chapterNumber: i + 1 }));
  }

  // ---------- Plugin API ----------
  async popularNovels(pageNo: number): Promise<Plugin.NovelItem[]> {
    const limit = 24;
    let frag = await this.post({
      action: 'nt_tab_novels',
      tab: 'populer',
      offset: String((pageNo - 1) * limit),
      limit: String(limit),
    });
    if (!frag.trim() && pageNo === 1) frag = await this.get('/');
    return this.novelsFrom(parseHTML(frag), '.bookItem');
  }

  async searchNovels(searchTerm: string, pageNo: number): Promise<Plugin.NovelItem[]> {
    const html = await this.get(
      `/?s=${encodeURIComponent(searchTerm)}&post_type=novel&paged=${pageNo}`,
    );
    return this.novelsFrom(parseHTML(html), '.novels-grid a.novel-card');
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const html = await this.get(novelPath);
    const $ = parseHTML(html);
    const status = ($('.nt-badge[data-status]').first().attr('data-status') || '').toLowerCase();

    return {
      path: novelPath,
      name: $('h1').first().text().trim() || 'Başlıksız',
      cover: this.absUrl($('meta[property="og:image"]').attr('content')) || defaultCover,
      author: $('.nt-author-link').first().text().trim() || undefined,
      genres:
        $('.genre-tag')
          .map((_: number, el: any) => $(el).text().trim())
          .get()
          .join(', ') || undefined,
      summary:
        $('.novel-ozet p')
          .map((_: number, el: any) => $(el).text().trim())
          .get()
          .join('\n\n') || undefined,
      status: status.includes('tamamland')
        ? NovelStatus.Completed
        : status.includes('terk')
          ? NovelStatus.Cancelled
          : status.includes('devam') || status.includes('güncel')
            ? NovelStatus.Ongoing
            : NovelStatus.Unknown,
      chapters: await this.chapters($, html),
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.get(chapterPath);
    const $ = parseHTML(html);

    let content = $('.reader-text').first().html() || '';
    if (content.length < 200 || /yükleniyor/i.test(content)) {
      const id = html.match(/wp\/v2\/chapter\/(\d+)/)?.[1];
      if (!id) throw new Error('Bölüm içeriği bulunamadı');
      const res = await fetchApi(
        `${this.site}/wp-json/wp/v2/chapter/${id}?_fields=content`,
      );
      const data = res.ok ? await res.json() : undefined;
      content = data?.content?.rendered || '';
    }
    if (!content || content.length < 100) {
      throw new Error('Bölüm içeriği boş');
    }

    const $c = parseHTML(`<div id="c">${content}</div>`);
    $c('#c').find('script, style, ins, .ad-slot, .adsbygoogle').remove();
    $c('#c img').each((_: number, el: any) => {
      const src = this.absUrl($c(el).attr('src') || $c(el).attr('data-src'));
      if (src) $c(el).attr('src', src);
      $c(el).removeAttr('srcset');
    });
    return $c('#c').html() || '';
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovelTurkPlugin();
