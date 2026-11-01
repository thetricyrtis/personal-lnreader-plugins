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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEpub = createEpub;
exports.downloadBlob = downloadBlob;
var jszip_1 = __importDefault(require("jszip"));
function sanitizeHtml(html) {
    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove style tags but keep inline styles
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Ensure images have proper attributes
    html = html.replace(/<img([^>]*)>/gi, function (match, attrs) {
        if (!attrs.includes('alt=')) {
            return "<img".concat(attrs, " alt=\"\">");
        }
        return match;
    });
    return html;
}
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function fetchCoverImage(coverUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, arrayBuffer, contentType, extension, urlLower, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!coverUrl) {
                        return [2 /*return*/, { data: null, mimeType: '', extension: '' }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    url = coverUrl;
                    if (!coverUrl.startsWith('http://') && !coverUrl.startsWith('https://')) {
                        url = coverUrl.startsWith('/') ? coverUrl : '/' + coverUrl;
                    }
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        return [2 /*return*/, { data: null, mimeType: '', extension: '' }];
                    }
                    return [4 /*yield*/, response.arrayBuffer()];
                case 3:
                    arrayBuffer = _a.sent();
                    contentType = response.headers.get('content-type') || 'image/jpeg';
                    extension = 'jpg';
                    if (contentType.includes('png'))
                        extension = 'png';
                    else if (contentType.includes('gif'))
                        extension = 'gif';
                    else if (contentType.includes('webp'))
                        extension = 'webp';
                    if (extension === 'jpg') {
                        urlLower = coverUrl.toLowerCase();
                        if (urlLower.includes('.png'))
                            extension = 'png';
                        else if (urlLower.includes('.gif'))
                            extension = 'gif';
                        else if (urlLower.includes('.webp'))
                            extension = 'webp';
                    }
                    return [2 /*return*/, {
                            data: arrayBuffer,
                            mimeType: contentType,
                            extension: extension,
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching cover image:', error_1);
                    return [2 /*return*/, { data: null, mimeType: '', extension: '' }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createEpub(chapters, options) {
    return __awaiter(this, void 0, void 0, function () {
        var zip, uuid, now, coverImage, hasCover, manifestItems, spineItems, contentOpf, tocNcx, navXhtml, coverXhtml, blob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zip = new jszip_1.default();
                    uuid = generateUUID();
                    now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    return [4 /*yield*/, fetchCoverImage(options.cover)];
                case 1:
                    coverImage = _a.sent();
                    hasCover = coverImage.data !== null;
                    zip.file('mimetype', 'application/epub+zip');
                    zip.file('META-INF/container.xml', "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n  <rootfiles>\n    <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>\n  </rootfiles>\n</container>");
                    if (hasCover && coverImage.data) {
                        zip.file("OEBPS/cover.".concat(coverImage.extension), coverImage.data);
                    }
                    manifestItems = [
                        '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
                        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml"/>',
                    ];
                    if (hasCover) {
                        manifestItems.push("<item id=\"cover-image\" href=\"cover.".concat(coverImage.extension, "\" media-type=\"").concat(coverImage.mimeType, "\"/>"), '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>');
                    }
                    manifestItems.push.apply(manifestItems, chapters.map(function (_, i) {
                        return "<item id=\"chapter".concat(i + 1, "\" href=\"chapter").concat(i + 1, ".xhtml\" media-type=\"application/xhtml+xml\"/>");
                    }));
                    spineItems = hasCover
                        ? ['<itemref idref="cover"/>', '<itemref idref="nav"/>']
                        : ['<itemref idref="nav"/>'];
                    spineItems.push.apply(spineItems, chapters.map(function (_, i) { return "<itemref idref=\"chapter".concat(i + 1, "\"/>"); }));
                    contentOpf = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<package xmlns=\"http://www.idpf.org/2007/opf\" unique-identifier=\"bookid\" version=\"3.0\">\n  <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:opf=\"http://www.idpf.org/2007/opf\">\n    <dc:identifier id=\"bookid\">urn:uuid:".concat(uuid, "</dc:identifier>\n    <dc:title>").concat(escapeXml(options.title), "</dc:title>\n    ").concat(options.author ? "<dc:creator>".concat(escapeXml(options.author), "</dc:creator>") : '', "\n    ").concat(options.description ? "<dc:description>".concat(escapeXml(options.description), "</dc:description>") : '', "\n    <dc:language>").concat(options.language || 'en', "</dc:language>\n    <dc:date>").concat(now, "</dc:date>\n    <meta property=\"dcterms:modified\">").concat(now, "</meta>\n    ").concat(hasCover ? '<meta name="cover" content="cover-image"/>' : '', "\n  </metadata>\n  <manifest>\n    ").concat(manifestItems.join('\n    '), "\n  </manifest>\n  <spine toc=\"ncx\">\n    ").concat(spineItems.join('\n    '), "\n  </spine>\n</package>");
                    zip.file('OEBPS/content.opf', contentOpf);
                    tocNcx = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">\n  <head>\n    <meta name=\"dtb:uid\" content=\"urn:uuid:".concat(uuid, "\"/>\n    <meta name=\"dtb:depth\" content=\"1\"/>\n    <meta name=\"dtb:totalPageCount\" content=\"0\"/>\n    <meta name=\"dtb:maxPageNumber\" content=\"0\"/>\n  </head>\n  <docTitle>\n    <text>").concat(escapeXml(options.title), "</text>\n  </docTitle>\n  <navMap>\n    ").concat(chapters
                        .map(function (chapter, i) { return "\n    <navPoint id=\"navpoint-".concat(i + 1, "\" playOrder=\"").concat(i + 1, "\">\n      <navLabel>\n        <text>").concat(escapeXml(chapter.title), "</text>\n      </navLabel>\n      <content src=\"chapter").concat(i + 1, ".xhtml\"/>\n    </navPoint>"); })
                        .join(''), "\n  </navMap>\n</ncx>");
                    zip.file('OEBPS/toc.ncx', tocNcx);
                    navXhtml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\">\n<head>\n  <title>Navigation</title>\n  <meta charset=\"UTF-8\"/>\n</head>\n<body>\n  <nav epub:type=\"toc\">\n    <h1>Table of Contents</h1>\n    <ol>\n      ".concat(chapters.map(function (chapter, i) { return "<li><a href=\"chapter".concat(i + 1, ".xhtml\">").concat(escapeXml(chapter.title), "</a></li>"); }).join('\n      '), "\n    </ol>\n  </nav>\n</body>\n</html>");
                    zip.file('OEBPS/nav.xhtml', navXhtml);
                    if (hasCover) {
                        coverXhtml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\">\n<head>\n  <title>Cover</title>\n  <meta charset=\"UTF-8\"/>\n  <style type=\"text/css\">\n    body { margin: 0; padding: 0; text-align: center; }\n    img { max-width: 100%; height: auto; display: block; margin: 0 auto; }\n  </style>\n</head>\n<body>\n  <img src=\"cover.".concat(coverImage.extension, "\" alt=\"Cover\"/>\n</body>\n</html>");
                        zip.file('OEBPS/cover.xhtml', coverXhtml);
                    }
                    chapters.forEach(function (chapter, i) {
                        var sanitizedContent = sanitizeHtml(chapter.content);
                        var chapterXhtml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\">\n<head>\n  <title>".concat(escapeXml(chapter.title), "</title>\n  <meta charset=\"UTF-8\"/>\n  <style type=\"text/css\">\n    body { font-family: serif; line-height: 1.6; margin: 1em; }\n    h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }\n    p { margin: 0.5em 0; text-align: justify; }\n    img { max-width: 100%; height: auto; }\n  </style>\n</head>\n<body>\n  <h1>").concat(escapeXml(chapter.title), "</h1>\n  ").concat(sanitizedContent, "\n</body>\n</html>");
                        zip.file("OEBPS/chapter".concat(i + 1, ".xhtml"), chapterXhtml);
                    });
                    return [4 /*yield*/, zip.generateAsync({
                            type: 'blob',
                            mimeType: 'application/epub+zip',
                        })];
                case 2:
                    blob = _a.sent();
                    return [2 /*return*/, blob];
            }
        });
    });
}
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
