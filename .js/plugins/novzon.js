"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch_1 = require("@libs/fetch");
var cheerio_1 = require("cheerio");
var defaultCover_1 = require("@libs/defaultCover");
var novelStatus_1 = require("@libs/novelStatus");
// Sitedeki tarihler "18 Ağu 2026" biçiminde (Türkçe kısa ay adı)
var MONTHS = {
    'oca': '01',
    'şub': '02',
    'mar': '03',
    'nis': '04',
    'may': '05',
    'haz': '06',
    'tem': '07',
    'ağu': '08',
    'eyl': '09',
    'eki': '10',
    'kas': '11',
    'ara': '12',
};
var NovZonPlugin = /** @class */ (function () {
    function NovZonPlugin() {
        var _this = this;
        this.id = 'novzon';
        this.name = 'NovZon';
        this.icon = 'src/tr/novzon/icon.png';
        this.site = 'https://novzon.net';
        this.version = '1.0.0';
        this.imageRequestInit = {
            headers: { Referer: 'https://novzon.net/' },
        };
        this.resolveUrl = function (path) { return _this.site + path; };
    }
    // ---------- yardımcılar ----------
    NovZonPlugin.prototype.absUrl = function (url) {
        if (!url)
            return undefined;
        if (/^https?:\/\//i.test(url))
            return url;
        return this.site + (url.startsWith('/') ? '' : '/') + url;
    };
    NovZonPlugin.prototype.toPath = function (href) {
        if (!href)
            return undefined;
        return href.replace(this.site, '').split('#')[0];
    };
    NovZonPlugin.prototype.getHtml = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(this.site + path)];
                    case 1:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("NovZon iste\u011Fi ba\u015Far\u0131s\u0131z oldu (HTTP ".concat(res.status, ")"));
                        }
                        return [2 /*return*/, res.text()];
                }
            });
        });
    };
    NovZonPlugin.prototype.parseDate = function (text) {
        var m = text
            .trim()
            .toLowerCase()
            .match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
        if (!m)
            return undefined;
        var month = MONTHS[m[2]];
        if (!month)
            return undefined;
        return "".concat(m[3], "-").concat(month, "-").concat(m[1].padStart(2, '0'));
    };
    // ---------- popüler / liste ----------
    // Ana sayfadaki koleksiyon raflarından cilt listesi çıkarır (sayfalama yok).
    NovZonPlugin.prototype.popularNovels = function (pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var $, _a, novels, seen;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (pageNo > 1)
                            return [2 /*return*/, []];
                        _a = cheerio_1.load;
                        return [4 /*yield*/, this.getHtml('/')];
                    case 1:
                        $ = _a.apply(void 0, [_b.sent()]);
                        novels = [];
                        seen = new Set();
                        $('a.nhx-collection-book[href^="/novel/"]').each(function (i, el) {
                            var path = _this.toPath($(el).attr('href'));
                            if (!path || seen.has(path))
                                return;
                            // Bölüm sayısı 0 olanlar erişime kapatılmış (resmi yayın başlamış) seriler
                            if ($(el).attr('data-preview-chapters') === '0')
                                return;
                            var name = ($(el).find('strong').first().text() ||
                                $(el).attr('data-preview-title') ||
                                $(el).attr('title') ||
                                '').trim();
                            if (!name)
                                return;
                            seen.add(path);
                            novels.push({
                                name: name,
                                path: path,
                                cover: _this.absUrl($(el).find('img').first().attr('src')) || defaultCover_1.defaultCover,
                            });
                        });
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    // ---------- arama ----------
    NovZonPlugin.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var $, _a, novels, seen;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (pageNo > 1)
                            return [2 /*return*/, []];
                        _a = cheerio_1.load;
                        return [4 /*yield*/, this.getHtml('/search/?q=' + encodeURIComponent(searchTerm))];
                    case 1:
                        $ = _a.apply(void 0, [_b.sent()]);
                        novels = [];
                        seen = new Set();
                        // Sadece cilt kartları (/novel/...), seri kartları (/series/...) atlanır
                        $('a.novel-card[href^="/novel/"]').each(function (i, el) {
                            var path = _this.toPath($(el).attr('href'));
                            if (!path || seen.has(path))
                                return;
                            var name = ($(el).find('h3').first().text() ||
                                $(el).attr('data-preview-title') ||
                                '').trim();
                            if (!name)
                                return;
                            seen.add(path);
                            novels.push({
                                name: name,
                                path: path,
                                cover: _this.absUrl($(el).find('img').first().attr('src')) || defaultCover_1.defaultCover,
                            });
                        });
                        return [2 /*return*/, novels];
                }
            });
        });
    };
    // ---------- roman detayı + bölüm listesi ----------
    NovZonPlugin.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var $, _a, novel, paragraphs, statusText, seen;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = cheerio_1.load;
                        return [4 /*yield*/, this.getHtml(novelPath)];
                    case 1:
                        $ = _a.apply(void 0, [_b.sent()]);
                        novel = {
                            path: novelPath,
                            name: $('h1.novel-title').first().text().trim() ||
                                $('title').first().text().trim() ||
                                'Başlıksız',
                            cover: this.absUrl($('meta[property="og:image"]').attr('content')) ||
                                this.absUrl($('img.novel-cover').first().attr('src')) ||
                                defaultCover_1.defaultCover,
                            chapters: [],
                        };
                        novel.author = $('a.author-tag').first().text().trim() || undefined;
                        novel.genres =
                            $('.meta-tags a[href^="/category/"]')
                                .map(function (i, el) { return $(el).text().trim(); })
                                .get()
                                .filter(Boolean)
                                .join(', ') || undefined;
                        paragraphs = $('#novelDesc p')
                            .map(function (i, el) { return $(el).text().trim(); })
                            .get()
                            .filter(Boolean);
                        novel.summary = paragraphs.length
                            ? paragraphs.join('\n\n')
                            : $('#novelDesc').text().trim() || undefined;
                        statusText = $('.status-tag').first().text().trim().toLowerCase();
                        novel.status = statusText.includes('published')
                            ? novelStatus_1.NovelStatus.Completed
                            : novelStatus_1.NovelStatus.Unknown;
                        seen = new Set();
                        $('a.chapter-item').each(function (i, el) {
                            var path = _this.toPath($(el).attr('href'));
                            if (!path || seen.has(path))
                                return;
                            seen.add(path);
                            var number = $(el).find('.chapter-number').text().trim();
                            var title = $(el).find('.chapter-title').text().trim();
                            var index = novel.chapters.length + 1;
                            novel.chapters.push({
                                name: [number, title].filter(Boolean).join(' - ') || "B\u00F6l\u00FCm ".concat(index),
                                path: path,
                                releaseTime: _this.parseDate($(el).find('.chapter-date').text()),
                                // Aynı numara birden fazla bölümde tekrar edebiliyor; sıra numarası kullanılır
                                chapterNumber: index,
                            });
                        });
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    // ---------- bölüm içeriği ----------
    NovZonPlugin.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var $, _a, root;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = cheerio_1.load;
                        return [4 /*yield*/, this.getHtml(chapterPath)];
                    case 1:
                        $ = _a.apply(void 0, [_b.sent()]);
                        root = $('#chapter-content').first();
                        if (!root.length) {
                            throw new Error('Bölüm içeriği bulunamadı (site yapısı değişmiş olabilir).');
                        }
                        // Botlar için konmuş gizli tuzak bağlantılar (/c/...) ve yardımcı öğeler
                        root.find('a[data-sentinel-guard]').remove();
                        root.find('a[href^="/c/"]').remove();
                        root.find('#chapter-content-end-sentinel').remove();
                        root.find('script, style').remove();
                        root.find('[style*="-9999px"]').remove();
                        // Metin içi resimlerin yolları göreli
                        root.find('img').each(function (i, el) {
                            var src = _this.absUrl($(el).attr('src'));
                            if (src)
                                $(el).attr('src', src);
                            $(el).removeAttr('srcset');
                        });
                        // Sitenin kendi okuyucusu da yapay zekadan kalan ** işaretlerini temizliyor
                        return [2 /*return*/, (root.html() || '').replace(/\*\*/g, '')];
                }
            });
        });
    };
    return NovZonPlugin;
}());
exports.default = new NovZonPlugin();
