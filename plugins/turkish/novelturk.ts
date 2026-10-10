import { fetchApi } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { FilterTypes, Filters } from '@libs/filterInputs';
import { load as parseHTML } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

const SITE = 'https://novelturk.com';
const AJAX = SITE + '/wp-admin/admin-ajax.php';

// Gizlilik: cihaz modeli/build bilgisi içermeyen, Chrome'un "azaltılmış" UA biçimi
const UA =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36';
const BASE_HEADERS: Record<string, string> = {
  'User-Agent': UA,
  'Accept-Language': 'tr-TR,tr;q=0.9',
};

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Sitedeki göreli zamanlar: "3 Gün", "5 Saat", "2 Hafta" ...
const UNIT_MS: Array<[RegExp, number]> = [
  [/^(sn|saniye)/, 1000],
  [/^(dk|dakika)/, 60_000],
  [/^(sa|saat)/, 3_600_000],
  [/^(gün|gun|g)$/, 86_400_000],
  [/^(hf|hafta)/, 7 * 86_400_000],
  [/^(ay)/, 30 * 86_400_000],
  [/^(yıl|yil|y)$/, 365 * 86_400_000],
];

type Row = Plugin.ChapterItem;
type GroupRows = { key: number; rows: Row[] };

class NovelTurkPlugin implements Plugin.PluginBase {
  id = 'novelturk';
  name = 'Novel Türk';
  icon = 'src/turkish/novelturk/icon.png';
  site = SITE;
  version = '1.0.5';

  imageRequestInit: Plugin.ImageRequestInit = {
    headers: { Referer: SITE + '/', 'User-Agent': UA },
  };

  filters = {
    tab: {
      label: 'Liste',
      value: 'populer',
      options: [
        { label: 'En Popüler', value: 'populer' },
        { label: 'En Son Güncellenen', value: 'en-son' },
        { label: 'En Yüksek Puan', value: 'puan' },
        { label: 'Yeni Eklenen', value: 'yeni' },
        { label: 'Son Tamamlanan', value: 'tamamlanan' },
      ],
      type: FilterTypes.Picker,
    },
  } satisfies Filters;

  // ---------- yardımcılar ----------
  private absUrl(url?: string) {
    if (!url) return undefined;
    return /^https?:\/\//i.test(url)
      ? url
      : this.site + (url.startsWith('/') ? '' : '/') + url;
  }

  // Yalnızca gerçek roman (/novel/slug/) ve bölüm (/bolum/slug/) yollarını kabul eder
  private toPath(href?: string) {
    if (!href) return undefined;
    const p = href.replace(this.site, '').split('#')[0].split('?')[0];
    return /^\/(novel|bolum)\/[^/]+\/?$/.test(p) ? p : undefined;
  }

  private async get(path: string, allow404 = false): Promise<string> {
    const res = await fetchApi(this.site + path, { headers: BASE_HEADERS });
    if (allow404 && res.status === 404) return '';
    if (!res.ok) throw new Error(`NovelTürk HTTP ${res.status}`);
    return res.text();
  }

  private async post(body: Record<string, string>): Promise<string> {
    const res = await fetchApi(AJAX, {
      method: 'POST',
      headers: {
        ...BASE_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: SITE + '/',
      },
      body: new URLSearchParams(body).toString(),
    });
    if (!res.ok) throw new Error(`NovelTürk AJAX HTTP ${res.status}`);
    return res.text();
  }

  // "3 Gün" → ISO tarih. Çözülemezse undefined.
  private relativeDate(text: string): string | undefined {
    const m = text
      .trim()
      .toLowerCase()
      .match(/^(\d+)\s*([a-zçğıöşü]+)$/);
    if (!m) return undefined;
    const n = parseInt(m[1], 10);
    for (const [re, ms] of UNIT_MS) {
      if (re.test(m[2])) return new Date(Date.now() - n * ms).toISOString();
    }
    return undefined;
  }

  // ---------- liste kartları ----------
  // .bookItem (ana sayfa / AJAX) ve a.novel-card (arama) için ortak
  private novelsFrom(html: string, sel: string): Plugin.NovelItem[] {
    const $ = parseHTML(html);
    const out: Plugin.NovelItem[] = [];
    const seen = new Set<string>();

    $(sel).each((_, el) => {
      const $el = $(el);
      const path = this.toPath(
        $el.attr('href') || $el.find('a[href*="/novel/"]').first().attr('href'),
      );
      if (!path || !path.startsWith('/novel/') || seen.has(path)) return;

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
    });
    return out;
  }

  // ---------- bölüm listesi ----------
  private rowsFrom(html: string): Row[] {
    const $ = parseHTML(html);
    const rows: Row[] = [];
    const seen = new Set<string>();
    $('a.eph-num').each((_, el) => {
      const path = this.toPath($(el).attr('href'));
      if (!path || !path.startsWith('/bolum/') || seen.has(path)) return;
      seen.add(path);
      const num = $(el).find('.ch-num-pill').first().text().trim();
      const title = $(el).find('.ch-sub-title').first().text().trim();
      rows.push({
        name: [num, title].filter(Boolean).join(' - ') || 'Bölüm',
        path,
        releaseTime: this.relativeDate($(el).find('.chapterdate').text()),
        chapterNumber: 0,
      });
    });
    return rows;
  }

  // "7-1" veya "1-50" → sıralama anahtarı (en büyük sayı)
  private groupKey(group: string, fallback: number): number {
    const nums = (group.match(/\d+/g) || []).map(Number);
    return nums.length ? Math.max(...nums) : fallback;
  }

  private nonceFrom(html: string): string | undefined {
    return html.match(/ntAjax\s*=\s*\{[^}]*?"nonce"\s*:\s*"([A-Za-z0-9]+)"/)?.[1];
  }

  // Tek bir bölüm grubunu çeker; başarısızsa hata fırlatır
  private async fetchGroup(
    novelId: string,
    group: string,
    nonce: string,
  ): Promise<Row[]> {
    const raw = await this.post({
      action: 'nt_load_chapter_group',
      novel_id: novelId,
      group,
      nonce,
    });
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('geçersiz yanıt');
    }
    if (!data?.success || typeof data.data?.html !== 'string') {
      throw new Error('grup reddedildi');
    }
    const rows = this.rowsFrom(data.data.html);
    if (!rows.length) throw new Error('boş grup');
    return rows;
  }

  private async chapters(
    html: string,
    novelPath: string,
  ): Promise<Plugin.ChapterItem[]> {
    const $ = parseHTML(html);
    const expected =
      parseInt($('.clwd-count').first().text().replace(/\D/g, ''), 10) || 0;

    const loaded: GroupRows[] = [];
    const pending: string[] = [];
    const known = new Set<string>();

    // Sayfada hazır gelen gruplar (data-loaded="1") ve boş gruplar (data-loaded="0")
    $('#clwd ul.clwd-list').each((i, el) => {
      const group = $(el).attr('data-group') || '';
      known.add(group);
      if ($(el).attr('data-loaded') === '1') {
        loaded.push({
          key: this.groupKey(group, 1e9 - i),
          rows: this.rowsFrom($.html(el)),
        });
      } else if (group) {
        pending.push(group);
      }
    });
    // Liste öğesi basılmamış ama sekme düğmesinde grup adı varsa onu da dene
    $('#chapter-tabs [data-group], #clwd [data-group]').each((_, el) => {
      const group = $(el).attr('data-group') || '';
      if (group && !known.has(group)) {
        known.add(group);
        pending.push(group);
      }
    });

    // Sayfada hiç liste yoksa (yapı değişmiş) ilk bakışta pes etme
    if (!loaded.length && !pending.length) {
      const rows = this.rowsFrom(html);
      if (rows.length) loaded.push({ key: 1e9, rows });
    }

    const novelId = html.match(/NT_NOVEL_ID\s*=\s*(\d+)/)?.[1];
    let nonce = this.nonceFrom(html);
    const failed: string[] = [];

    if (pending.length) {
      if (!novelId) throw new Error('Roman kimliği bulunamadı (site yapısı değişmiş olabilir).');

      let nonceRefreshed = false;
      for (let g = 0; g < pending.length; g++) {
        const group = pending[g];
        let rows: Row[] | undefined;

        for (let attempt = 0; attempt < 3 && !rows; attempt++) {
          try {
            if (!nonce) throw new Error('nonce yok');
            rows = await this.fetchGroup(novelId, group, nonce);
          } catch {
            // Önbellekteki sayfanın nonce'ı bayatlamış olabilir: taze sayfadan al
            if (!nonceRefreshed || attempt === 1) {
              try {
                const fresh = await this.get(
                  `${novelPath.replace(/\/$/, '')}/?_=${Date.now()}`,
                );
                nonce = this.nonceFrom(fresh) || nonce;
                nonceRefreshed = true;
              } catch {
                // taze sayfa alınamadı, aynı nonce ile devam
              }
            }
            await sleep(600 * (attempt + 1));
          }
        }

        if (rows) {
          loaded.push({ key: this.groupKey(group, 1e9 - 1 - g), rows });
        } else {
          failed.push(group);
        }
        await sleep(250); // siteyi yormamak için gruplar arası bekleme
      }
    }

    // Eksik grup varsa sessizce kısa liste göstermek yerine hata ver
    if (failed.length) {
      const got = loaded.reduce((n, g) => n + g.rows.length, 0);
      throw new Error(
        `Bölümlerin bir kısmı yüklenemedi (${got}/${expected || '?'}; eksik aralık: ${failed.join(', ')}). Lütfen tekrar deneyin.`,
      );
    }

    // Grupları yeni→eski sırala, tekrarları ele, sonra ters çevir (1..N)
    loaded.sort((a, b) => b.key - a.key);
    const seen = new Set<string>();
    const all: Row[] = [];
    for (const g of loaded) {
      for (const r of g.rows) {
        if (seen.has(r.path)) continue;
        seen.add(r.path);
        all.push(r);
      }
    }
    all.reverse();
    return all.map((c, i) => ({ ...c, chapterNumber: i + 1 }));
  }

  // ---------- Plugin API ----------
  async popularNovels(
    pageNo: number,
    { filters, showLatestNovels }: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const tab = showLatestNovels
      ? 'en-son'
      : filters?.tab?.value || 'populer';
    const limit = 24;

    let frag = '';
    try {
      frag = await this.post({
        action: 'nt_tab_novels',
        tab,
        offset: String((pageNo - 1) * limit),
        limit: String(limit),
      });
    } catch {
      frag = '';
    }
    // AJAX çalışmazsa yalnızca ilk sayfa için ana sayfaya düş
    if (!frag.trim() && pageNo === 1) frag = await this.get('/');
    return this.novelsFrom(frag, '.bookItem');
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    // Son sayfadan sonrası 404 döner; bu hata değil, "sonuç yok" demek
    const html = await this.get(
      `/?s=${encodeURIComponent(searchTerm)}&post_type=novel&paged=${pageNo}`,
      pageNo > 1,
    );
    if (!html) return [];
    return this.novelsFrom(html, '.novels-grid a.novel-card');
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const html = await this.get(novelPath);
    const $ = parseHTML(html);
    const status = (
      $('.nt-badge[data-status]').first().attr('data-status') || ''
    ).toLowerCase();

    const summary = $('.novel-ozet p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .join('\n\n');

    return {
      path: novelPath,
      name: $('h1').first().text().trim() || 'Başlıksız',
      cover:
        this.absUrl($('meta[property="og:image"]').attr('content')) ||
        defaultCover,
      author: $('.nt-author-link').first().text().trim() || undefined,
      genres:
        $('.genre-tag')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(Boolean)
          .join(', ') || undefined,
      summary: summary || undefined,
      status: status.includes('tamamland')
        ? NovelStatus.Completed
        : status.includes('terk')
          ? NovelStatus.Cancelled
          : status.includes('devam') || status.includes('güncel')
            ? NovelStatus.Ongoing
            : NovelStatus.Unknown,
      chapters: await this.chapters(html, novelPath),
    };
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const html = await this.get(chapterPath);
    const $ = parseHTML(html);

    let content = $('#reader-text').first().html() || '';
    if (content.length < 200 || /yükleniyor/i.test(content)) {
      const id =
        $('#reader-text').attr('data-chapter-id') ||
        html.match(/wp\/v2\/chapter\/(\d+)/)?.[1];
      if (!id) throw new Error('Bölüm içeriği bulunamadı');
      const res = await fetchApi(
        `${this.site}/wp-json/wp/v2/chapter/${id}?_fields=content`,
        { headers: { ...BASE_HEADERS, Accept: 'application/json' } },
      );
      if (!res.ok) throw new Error(`Bölüm alınamadı (HTTP ${res.status})`);
      const data = await res.json();
      content = data?.content?.rendered || '';
    }
    if (!content || content.length < 100) {
      throw new Error('Bölüm içeriği boş');
    }

    const $c = parseHTML(`<div id="c">${content}</div>`);
    $c('#c').find('script, style, ins, iframe, .ad-slot, .adsbygoogle').remove();
    $c('#c img').each((_, el) => {
      const src = this.absUrl($c(el).attr('src') || $c(el).attr('data-src'));
      if (src) $c(el).attr('src', src);
      $c(el).removeAttr('srcset');
    });
    return $c('#c').html() || '';
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new NovelTurkPlugin();

