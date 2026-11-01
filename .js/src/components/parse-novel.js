"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var react_1 = __importStar(require("react"));
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var skeleton_1 = require("@/components/ui/skeleton");
var tooltip_1 = require("@/components/ui/tooltip");
var store_1 = require("@/store");
var useEpubExport_1 = require("@/hooks/useEpubExport");
var ParseNovelSection = react_1.default.memo(function ParseNovelSection(_a) {
    var _this = this;
    var onNavigateToParseChapter = _a.onNavigateToParseChapter;
    var plugin = (0, store_1.useAppStore)(function (state) { return state.plugin; });
    var parseNovelPath = (0, store_1.useAppStore)(function (state) { return state.parseNovelPath; });
    var shouldAutoSubmitNovel = (0, store_1.useAppStore)(function (state) { return state.shouldAutoSubmitNovel; });
    var clearParseNovelPath = (0, store_1.useAppStore)(function (state) { return state.clearParseNovelPath; });
    var setParseChapterPath = (0, store_1.useAppStore)(function (state) { return state.setParseChapterPath; });
    var _b = (0, react_1.useState)(''), novelPath = _b[0], setNovelPath = _b[1];
    var _c = (0, react_1.useState)(), sourceNovel = _c[0], setSourceNovel = _c[1];
    var _d = (0, react_1.useState)([]), chapters = _d[0], setChapters = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(1), currentPage = _f[0], setCurrentPage = _f[1];
    var _g = (0, react_1.useState)(''), fetchError = _g[0], setFetchError = _g[1];
    var lastProcessedPath = (0, react_1.useRef)();
    var _h = (0, react_1.useState)(), prevPluginId = _h[0], setPrevPluginId = _h[1];
    if ((plugin === null || plugin === void 0 ? void 0 : plugin.id) !== prevPluginId) {
        setPrevPluginId(plugin === null || plugin === void 0 ? void 0 : plugin.id);
        setNovelPath('');
        setSourceNovel(undefined);
        setChapters([]);
        setCurrentPage(1);
        setFetchError('');
    }
    var _j = (0, useEpubExport_1.useEpubExport)({
        plugin: plugin || null,
        sourceNovel: sourceNovel,
        chapters: chapters,
        novelPath: novelPath,
    }), exportEpub = _j.exportEpub, isExporting = _j.isExporting;
    var fetchNovelByPath = function (path) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(plugin && path.trim())) return [3 /*break*/, 5];
                    setLoading(true);
                    setFetchError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, plugin.parseNovel(path)];
                case 2:
                    result = _a.sent();
                    setSourceNovel(result);
                    setChapters(result.chapters || []);
                    setCurrentPage(1);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Failed to fetch novel';
                    setFetchError(errorMessage);
                    console.error('Error parsing novel:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchNovel = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchNovelByPath(novelPath)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var fetchPage = function (page) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(plugin && novelPath && (sourceNovel === null || sourceNovel === void 0 ? void 0 : sourceNovel.totalPages))) return [3 /*break*/, 5];
                    setLoading(true);
                    setFetchError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, plugin.parsePage(novelPath, page.toString())];
                case 2:
                    result = _a.sent();
                    setChapters(result.chapters);
                    setCurrentPage(page);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Failed to fetch page';
                    setFetchError(errorMessage);
                    console.error('Error fetching page:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyDown = function (e) {
        if (e.key === 'Enter' && novelPath.trim()) {
            fetchNovel();
        }
    };
    var copyToClipboard = function (text, label) {
        if (text) {
            navigator.clipboard.writeText(text);
            sonner_1.toast.success("".concat(label || 'Text', " copied to clipboard!"));
        }
    };
    var handleParseChapter = function (path) {
        setParseChapterPath(path, true);
        onNavigateToParseChapter === null || onNavigateToParseChapter === void 0 ? void 0 : onNavigateToParseChapter();
    };
    (0, react_1.useEffect)(function () {
        if (parseNovelPath === lastProcessedPath.current)
            return;
        lastProcessedPath.current = parseNovelPath;
        if (parseNovelPath) {
            setNovelPath(parseNovelPath);
            if (shouldAutoSubmitNovel && plugin) {
                fetchNovelByPath(parseNovelPath);
            }
            clearParseNovelPath();
        }
    }, [parseNovelPath, shouldAutoSubmitNovel, plugin, clearParseNovelPath]);
    var formatDate = function (dateString) {
        if (!dateString)
            return 'N/A';
        try {
            var date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
        catch (_a) {
            return dateString;
        }
    };
    return (react_1.default.createElement("div", { className: "space-y-6" },
        react_1.default.createElement(card_1.Card, { className: "p-6" },
            react_1.default.createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h2", { className: "text-xl font-semibold text-foreground" }, "Parse Novel"),
                    react_1.default.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, plugin
                        ? 'Enter a novel path to fetch details'
                        : 'Select a plugin to parse novels'))),
            react_1.default.createElement("div", { className: "flex gap-3 mb-6" },
                react_1.default.createElement(input_1.Input, { placeholder: "Enter novel path...", value: novelPath, onChange: function (e) { return setNovelPath(e.target.value); }, onKeyDown: handleKeyDown, className: "flex-1", disabled: !plugin }),
                react_1.default.createElement(button_1.Button, { onClick: fetchNovel, disabled: !plugin || !novelPath.trim() || loading }, loading ? 'Fetching...' : 'Fetch')),
            fetchError && (react_1.default.createElement("div", { className: "p-4 mb-6 border border-destructive/50 bg-destructive/10 rounded-lg" },
                react_1.default.createElement("p", { className: "text-sm text-destructive" }, fetchError))),
            loading && !sourceNovel ? (react_1.default.createElement("div", { className: "space-y-6" },
                react_1.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                    react_1.default.createElement("div", { className: "md:col-span-2 space-y-4" },
                        react_1.default.createElement("div", { className: "flex gap-4" },
                            react_1.default.createElement(skeleton_1.Skeleton, { className: "w-32 h-48 rounded-lg" }),
                            react_1.default.createElement("div", { className: "flex-1 space-y-3" },
                                react_1.default.createElement(skeleton_1.Skeleton, { className: "h-8 w-3/4" }),
                                react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-1/4" }),
                                react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-1/3" }),
                                react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2" }))),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-32 w-full" })),
                    react_1.default.createElement(skeleton_1.Skeleton, { className: "h-64" })))) : !sourceNovel ? (react_1.default.createElement("div", { className: "flex flex-col items-center justify-center py-16 px-4 text-center" },
                react_1.default.createElement("div", { className: "rounded-full bg-muted p-4 mb-4" },
                    react_1.default.createElement(lucide_react_1.BookOpen, { className: "w-8 h-8 text-muted-foreground" })),
                react_1.default.createElement("h3", { className: "text-lg font-semibold text-foreground mb-2" }, plugin ? 'Ready to parse' : 'No plugin selected'),
                react_1.default.createElement("p", { className: "text-sm text-muted-foreground max-w-md" }, plugin
                    ? 'Enter a novel path in the field above and click "Fetch" to load detailed information, including chapters, metadata, and more.'
                    : 'Please select a plugin from the sidebar to get started.'))) : sourceNovel ? (react_1.default.createElement("div", { className: "space-y-6" },
                react_1.default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                    react_1.default.createElement("div", { className: "md:col-span-2 space-y-4" },
                        react_1.default.createElement("div", { className: "flex gap-4" },
                            react_1.default.createElement("div", { className: "cursor-pointer", onClick: function () {
                                    return copyToClipboard(sourceNovel.cover, 'Cover URL');
                                } },
                                react_1.default.createElement("img", { src: (sourceNovel.cover ? '/' : '') + sourceNovel.cover ||
                                        '/static/coverNotAvailable.webp', alt: sourceNovel.name, className: "w-32 h-48 rounded-lg object-cover hover:opacity-80 transition-opacity", title: "Click to copy cover URL" })),
                            react_1.default.createElement("div", { className: "flex-1" },
                                react_1.default.createElement("h3", { className: "text-2xl font-bold text-foreground mb-3 line-clamp-3" }, sourceNovel.name),
                                react_1.default.createElement("div", { className: "grid grid-cols-2 gap-3 mb-4" },
                                    sourceNovel.status && (react_1.default.createElement("div", null,
                                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Status"),
                                        react_1.default.createElement(badge_1.Badge, { className: "text-xs" }, sourceNovel.status))),
                                    sourceNovel.author && (react_1.default.createElement("div", null,
                                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Author"),
                                        react_1.default.createElement("p", { className: "text-sm text-foreground line-clamp-1" }, sourceNovel.author))),
                                    sourceNovel.artist && (react_1.default.createElement("div", null,
                                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Artist"),
                                        react_1.default.createElement("p", { className: "text-sm text-foreground line-clamp-1" }, sourceNovel.artist))),
                                    sourceNovel.rating && (react_1.default.createElement("div", null,
                                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Rating"),
                                        react_1.default.createElement("p", { className: "text-sm text-foreground" },
                                            sourceNovel.rating.toFixed(1),
                                            " / 5.0")))),
                                react_1.default.createElement("div", { className: "flex gap-2" },
                                    react_1.default.createElement(tooltip_1.Tooltip, null,
                                        react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                            react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", onClick: function () {
                                                    return copyToClipboard(sourceNovel.path, 'Novel path');
                                                } },
                                                react_1.default.createElement(lucide_react_1.Copy, { className: "w-4 h-4" }),
                                                "Copy Path")),
                                        react_1.default.createElement(tooltip_1.TooltipContent, null,
                                            react_1.default.createElement("p", null, "Copy novel path to clipboard"))),
                                    react_1.default.createElement(tooltip_1.Tooltip, null,
                                        react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                            react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", onClick: exportEpub, disabled: isExporting || chapters.length === 0 },
                                                react_1.default.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                                                isExporting ? 'Exporting...' : 'Export EPUB')),
                                        react_1.default.createElement(tooltip_1.TooltipContent, null,
                                            react_1.default.createElement("p", null, isExporting
                                                ? 'Exporting chapters to EPUB...'
                                                : 'Export all chapters as EPUB file')))))),
                        sourceNovel.genres && (react_1.default.createElement("div", null,
                            react_1.default.createElement("h4", { className: "font-semibold text-foreground mb-2" }, "Genres"),
                            react_1.default.createElement("div", { className: "flex flex-wrap gap-2" }, sourceNovel.genres.split(/,\s*/).map(function (genre, index) { return (react_1.default.createElement(badge_1.Badge, { key: "genre-".concat(index), variant: "secondary" }, genre)); })))),
                        sourceNovel.summary && (react_1.default.createElement("div", null,
                            react_1.default.createElement("h4", { className: "font-semibold text-foreground mb-2" }, "Summary"),
                            react_1.default.createElement("p", { className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" }, sourceNovel.summary)))),
                    react_1.default.createElement("div", { className: "bg-muted/50 rounded-lg p-4 h-fit" },
                        react_1.default.createElement("h4", { className: "font-semibold text-foreground mb-4" }, "Metadata"),
                        react_1.default.createElement("div", { className: "space-y-3 text-sm" },
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Total Chapters"),
                                react_1.default.createElement("p", { className: "font-semibold text-foreground" }, chapters.length)),
                            sourceNovel.totalPages && (react_1.default.createElement("div", null,
                                react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Total Pages"),
                                react_1.default.createElement("p", { className: "font-semibold text-foreground" }, sourceNovel.totalPages))),
                            chapters.length > 0 && chapters[0].releaseTime && (react_1.default.createElement("div", null,
                                react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "First Chapter"),
                                react_1.default.createElement("p", { className: "font-semibold text-foreground" }, formatDate(chapters[0].releaseTime)))),
                            chapters.length > 0 &&
                                chapters[chapters.length - 1].releaseTime && (react_1.default.createElement("div", null,
                                react_1.default.createElement("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1" }, "Last Updated"),
                                react_1.default.createElement("p", { className: "font-semibold text-foreground" }, formatDate(chapters[chapters.length - 1].releaseTime))))))),
                (chapters.length > 0 || sourceNovel.totalPages) && (react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { className: "flex items-center justify-between mb-4" },
                        react_1.default.createElement("h4", { className: "font-semibold text-foreground" },
                            "Chapters (",
                            chapters.length,
                            ")"),
                        sourceNovel.totalPages && (react_1.default.createElement("div", { className: "flex items-center gap-2" },
                            sourceNovel.totalPages > 1 && (react_1.default.createElement(react_1.default.Fragment, null,
                                react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return fetchPage(currentPage - 1); }, disabled: currentPage === 1 || loading },
                                    react_1.default.createElement(lucide_react_1.ChevronLeft, { className: "w-4 h-4" }),
                                    "Previous"),
                                react_1.default.createElement("span", { className: "text-sm text-muted-foreground" },
                                    "Page ",
                                    currentPage,
                                    " of ",
                                    sourceNovel.totalPages),
                                react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return fetchPage(currentPage + 1); }, disabled: currentPage === sourceNovel.totalPages || loading },
                                    "Next",
                                    react_1.default.createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4" })))),
                            react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return fetchPage(currentPage || 1); }, disabled: loading }, loading ? 'Fetching...' : 'Fetch Page')))),
                    react_1.default.createElement("div", { className: "overflow-x-auto border border-border rounded-lg" },
                        react_1.default.createElement("table", { className: "w-full text-sm" },
                            react_1.default.createElement("thead", { className: "bg-muted/50" },
                                react_1.default.createElement("tr", { className: "border-b border-border" },
                                    react_1.default.createElement("th", { className: "text-left py-3 px-4 font-semibold text-foreground w-16" }, "#"),
                                    react_1.default.createElement("th", { className: "text-left py-3 px-4 font-semibold text-foreground" }, "Name"),
                                    react_1.default.createElement("th", { className: "text-left py-3 px-4 font-semibold text-foreground w-28" }, "Actions"),
                                    react_1.default.createElement("th", { className: "text-left py-3 px-4 font-semibold text-foreground w-32" }, "Release Time"),
                                    chapters.some(function (ch) { return ch.chapterNumber; }) && (react_1.default.createElement("th", { className: "text-left py-3 px-4 font-semibold text-foreground w-24" }, "Chapter #")))),
                            react_1.default.createElement("tbody", null, chapters.map(function (chapter, index) { return (react_1.default.createElement("tr", { key: "".concat(chapter.path, "-").concat(index), className: "border-b border-border hover:bg-muted/70 transition-colors ".concat(index % 2 === 0 ? 'bg-background' : 'bg-muted/20') },
                                react_1.default.createElement("td", { className: "py-2.5 px-4 text-muted-foreground text-xs" }, index),
                                react_1.default.createElement("td", { className: "py-2.5 px-4 text-foreground" }, chapter.name),
                                react_1.default.createElement("td", { className: "py-2.5 px-4" },
                                    react_1.default.createElement("div", { className: "flex gap-1" },
                                        react_1.default.createElement(tooltip_1.Tooltip, null,
                                            react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                                react_1.default.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: function () {
                                                        return copyToClipboard(chapter.path, 'Chapter path');
                                                    } },
                                                    react_1.default.createElement(lucide_react_1.Copy, { className: "w-3.5 h-3.5" }))),
                                            react_1.default.createElement(tooltip_1.TooltipContent, null,
                                                react_1.default.createElement("p", null, "Copy chapter path"))),
                                        react_1.default.createElement(tooltip_1.Tooltip, null,
                                            react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                                react_1.default.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: function () {
                                                        return handleParseChapter(chapter.path);
                                                    } },
                                                    react_1.default.createElement(lucide_react_1.ArrowRight, { className: "w-3.5 h-3.5" }))),
                                            react_1.default.createElement(tooltip_1.TooltipContent, null,
                                                react_1.default.createElement("p", null, "Open in Parse Chapter tab"))))),
                                react_1.default.createElement("td", { className: "py-2.5 px-4 text-muted-foreground text-xs" }, formatDate(chapter.releaseTime)),
                                chapters.some(function (ch) { return ch.chapterNumber; }) && (react_1.default.createElement("td", { className: "py-2.5 px-4 text-muted-foreground text-xs" }, chapter.chapterNumber || '-')))); })))))))) : null)));
});
exports.default = ParseNovelSection;
