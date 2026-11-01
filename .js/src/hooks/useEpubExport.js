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
exports.useEpubExport = useEpubExport;
var react_1 = require("react");
var sonner_1 = require("sonner");
var epub_1 = require("@/lib/epub");
function useEpubExport(_a) {
    var _this = this;
    var plugin = _a.plugin, sourceNovel = _a.sourceNovel, chapters = _a.chapters, novelPath = _a.novelPath;
    var _b = (0, react_1.useState)(false), isExporting = _b[0], setIsExporting = _b[1];
    var exportEpub = function () { return __awaiter(_this, void 0, void 0, function () {
        var toastId, allChapters, page, pageResult, error_1, chapterContents, i, chapter, content, progress, error_2, coverUrl, epubBlob, filename, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!plugin || !sourceNovel || chapters.length === 0) {
                        sonner_1.toast.error('No novel or chapters available to export');
                        return [2 /*return*/];
                    }
                    setIsExporting(true);
                    toastId = sonner_1.toast.loading('Starting EPUB export...', {
                        description: "Preparing to export ".concat(chapters.length, " chapters"),
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 17, 18, 19]);
                    allChapters = [];
                    if (!(sourceNovel.totalPages && sourceNovel.totalPages > 1)) return [3 /*break*/, 8];
                    sonner_1.toast.loading('Fetching all chapters...', {
                        id: toastId,
                        description: "Found ".concat(sourceNovel.totalPages, " pages"),
                    });
                    page = 1;
                    _a.label = 2;
                case 2:
                    if (!(page <= sourceNovel.totalPages)) return [3 /*break*/, 7];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, plugin.parsePage(novelPath, page.toString())];
                case 4:
                    pageResult = _a.sent();
                    allChapters.push.apply(allChapters, pageResult.chapters);
                    sonner_1.toast.loading('Fetching chapters...', {
                        id: toastId,
                        description: "Page ".concat(page, "/").concat(sourceNovel.totalPages, " - ").concat(allChapters.length, " chapters collected"),
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error fetching page ".concat(page, ":"), error_1);
                    return [3 /*break*/, 6];
                case 6:
                    page++;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 9];
                case 8:
                    allChapters.push.apply(allChapters, chapters);
                    _a.label = 9;
                case 9:
                    if (allChapters.length === 0) {
                        sonner_1.toast.error('No chapters found to export', { id: toastId });
                        setIsExporting(false);
                        return [2 /*return*/];
                    }
                    sonner_1.toast.loading('Fetching chapter content...', {
                        id: toastId,
                        description: "0/".concat(allChapters.length, " chapters processed"),
                    });
                    chapterContents = [];
                    i = 0;
                    _a.label = 10;
                case 10:
                    if (!(i < allChapters.length)) return [3 /*break*/, 15];
                    chapter = allChapters[i];
                    _a.label = 11;
                case 11:
                    _a.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, plugin.parseChapter(chapter.path)];
                case 12:
                    content = _a.sent();
                    chapterContents.push({
                        title: chapter.name,
                        content: content || '<p>No content available</p>',
                        path: chapter.path,
                    });
                    progress = Math.round(((i + 1) / allChapters.length) * 100);
                    sonner_1.toast.loading('Fetching chapter content...', {
                        id: toastId,
                        description: "".concat(i + 1, "/").concat(allChapters.length, " chapters processed (").concat(progress, "%)"),
                    });
                    return [3 /*break*/, 14];
                case 13:
                    error_2 = _a.sent();
                    console.error("Error fetching chapter ".concat(i + 1, ":"), error_2);
                    chapterContents.push({
                        title: chapter.name,
                        content: "<p>Error: Failed to fetch chapter content</p>",
                        path: chapter.path,
                    });
                    return [3 /*break*/, 14];
                case 14:
                    i++;
                    return [3 /*break*/, 10];
                case 15:
                    sonner_1.toast.loading('Generating EPUB file...', {
                        id: toastId,
                        description: 'Creating EPUB structure',
                    });
                    coverUrl = sourceNovel.cover;
                    if (coverUrl && plugin.resolveUrl) {
                        coverUrl = plugin.resolveUrl(coverUrl, true);
                    }
                    else if (coverUrl &&
                        !coverUrl.startsWith('http://') &&
                        !coverUrl.startsWith('https://')) {
                        coverUrl = coverUrl.startsWith('/') ? coverUrl : '/' + coverUrl;
                    }
                    return [4 /*yield*/, (0, epub_1.createEpub)(chapterContents, {
                            title: sourceNovel.name,
                            author: sourceNovel.author,
                            description: sourceNovel.summary,
                            cover: coverUrl,
                            language: 'en',
                        })];
                case 16:
                    epubBlob = _a.sent();
                    filename = "".concat(sourceNovel.name.replace(/[^a-z0-9]/gi, '_'), ".epub");
                    (0, epub_1.downloadBlob)(epubBlob, filename);
                    sonner_1.toast.success('EPUB exported successfully!', {
                        id: toastId,
                        description: "Downloaded ".concat(allChapters.length, " chapters as ").concat(filename),
                    });
                    return [3 /*break*/, 19];
                case 17:
                    error_3 = _a.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : 'Failed to export EPUB';
                    sonner_1.toast.error('Export failed', {
                        id: toastId,
                        description: errorMessage,
                    });
                    console.error('Error exporting EPUB:', error_3);
                    return [3 /*break*/, 19];
                case 18:
                    setIsExporting(false);
                    return [7 /*endfinally*/];
                case 19: return [2 /*return*/];
            }
        });
    }); };
    return {
        exportEpub: exportEpub,
        isExporting: isExporting,
    };
}
