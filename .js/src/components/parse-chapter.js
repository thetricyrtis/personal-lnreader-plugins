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
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var skeleton_1 = require("@/components/ui/skeleton");
var switch_1 = require("@/components/ui/switch");
var tooltip_1 = require("@/components/ui/tooltip");
var store_1 = require("@/store");
var usePluginCustomAssets_1 = require("@/hooks/usePluginCustomAssets");
var ParseChapterSection = react_1.default.memo(function ParseChapterSection() {
    var _this = this;
    var plugin = (0, store_1.useAppStore)(function (state) { return state.plugin; });
    var parseChapterPath = (0, store_1.useAppStore)(function (state) { return state.parseChapterPath; });
    var shouldAutoSubmitChapter = (0, store_1.useAppStore)(function (state) { return state.shouldAutoSubmitChapter; });
    var clearParseChapterPath = (0, store_1.useAppStore)(function (state) { return state.clearParseChapterPath; });
    var _a = (0, react_1.useState)(''), chapterPath = _a[0], setChapterPath = _a[1];
    var _b = (0, react_1.useState)(''), chapterText = _b[0], setChapterText = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), fetchError = _d[0], setFetchError = _d[1];
    var _e = (0, react_1.useState)(false), showRawHtml = _e[0], setShowRawHtml = _e[1];
    var lastProcessedPath = (0, react_1.useRef)();
    var _f = (0, react_1.useState)(), prevPluginId = _f[0], setPrevPluginId = _f[1];
    if ((plugin === null || plugin === void 0 ? void 0 : plugin.id) !== prevPluginId) {
        setPrevPluginId(plugin === null || plugin === void 0 ? void 0 : plugin.id);
        setChapterPath('');
        setChapterText('');
        setFetchError('');
        setShowRawHtml(false);
    }
    var _g = (0, usePluginCustomAssets_1.usePluginCustomAssets)(plugin, chapterText), customCSSLoaded = _g.customCSSLoaded, customJSLoaded = _g.customJSLoaded, customCSSError = _g.customCSSError, customJSError = _g.customJSError;
    var fetchChapterByPath = function (path) { return __awaiter(_this, void 0, void 0, function () {
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
                    return [4 /*yield*/, plugin.parseChapter(path)];
                case 2:
                    result = _a.sent();
                    setChapterText(result);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Failed to fetch chapter';
                    setFetchError(errorMessage);
                    console.error('Error parsing chapter:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchChapter = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchChapterByPath(chapterPath)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleKeyDown = function (e) {
        if (e.key === 'Enter' && chapterPath.trim()) {
            fetchChapter();
        }
    };
    var copyToClipboard = function (text, label) {
        if (text) {
            navigator.clipboard.writeText(text);
            sonner_1.toast.success("".concat(label || 'Text', " copied to clipboard!"));
        }
    };
    // Handle pre-filled path from navigation
    (0, react_1.useEffect)(function () {
        if (parseChapterPath === lastProcessedPath.current)
            return;
        lastProcessedPath.current = parseChapterPath;
        if (parseChapterPath) {
            setChapterPath(parseChapterPath);
            if (shouldAutoSubmitChapter && plugin) {
                fetchChapterByPath(parseChapterPath);
            }
            clearParseChapterPath();
        }
    }, [
        parseChapterPath,
        shouldAutoSubmitChapter,
        plugin,
        clearParseChapterPath,
    ]);
    return (react_1.default.createElement("div", { className: "space-y-6" },
        react_1.default.createElement(card_1.Card, { className: "p-6" },
            react_1.default.createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1.default.createElement("div", { className: "flex-1" },
                    react_1.default.createElement("h2", { className: "text-xl font-semibold text-foreground" }, "Parse Chapter"),
                    react_1.default.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, plugin
                        ? 'Enter a chapter path to fetch content'
                        : 'Select a plugin to parse chapters'),
                    plugin && (plugin.customCSS || plugin.customJS) && (react_1.default.createElement("div", { className: "flex items-center gap-2 mt-2" },
                        react_1.default.createElement("span", { className: "text-xs text-muted-foreground" }, "Available:"),
                        plugin.customCSS && (react_1.default.createElement("span", { className: "text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20" }, "Custom CSS")),
                        plugin.customJS && (react_1.default.createElement("span", { className: "text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-500/20" }, "Custom JS")))))),
            react_1.default.createElement("div", { className: "flex gap-3 mb-6" },
                react_1.default.createElement(input_1.Input, { placeholder: "Enter chapter path...", value: chapterPath, onChange: function (e) { return setChapterPath(e.target.value); }, onKeyDown: handleKeyDown, className: "flex-1", disabled: !plugin }),
                react_1.default.createElement(button_1.Button, { onClick: fetchChapter, disabled: !plugin || !chapterPath.trim() || loading }, loading ? 'Fetching...' : 'Fetch')),
            fetchError && (react_1.default.createElement("div", { className: "p-4 mb-6 border border-destructive/50 bg-destructive/10 rounded-lg" },
                react_1.default.createElement("p", { className: "text-sm text-destructive" }, fetchError))),
            loading && !chapterText ? (react_1.default.createElement("div", { className: "space-y-6" },
                react_1.default.createElement("div", { className: "flex items-center justify-between" },
                    react_1.default.createElement("div", { className: "flex-1 space-y-2" },
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-5 w-1/3" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-2/3" })),
                    react_1.default.createElement("div", { className: "flex gap-2" },
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-9 w-28" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-9 w-28" }))),
                react_1.default.createElement("div", { className: "border border-border rounded-lg" },
                    react_1.default.createElement(skeleton_1.Skeleton, { className: "h-10 w-full rounded-t-lg" }),
                    react_1.default.createElement("div", { className: "p-6 space-y-3" },
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-full" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-11/12" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-full" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-10/12" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-full" }),
                        react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-11/12" }))))) : !chapterText ? (react_1.default.createElement("div", { className: "flex flex-col items-center justify-center py-16 px-4 text-center" },
                react_1.default.createElement("div", { className: "rounded-full bg-muted p-4 mb-4" },
                    react_1.default.createElement(lucide_react_1.FileText, { className: "w-8 h-8 text-muted-foreground" })),
                react_1.default.createElement("h3", { className: "text-lg font-semibold text-foreground mb-2" }, plugin ? 'Ready to parse' : 'No plugin selected'),
                react_1.default.createElement("p", { className: "text-sm text-muted-foreground max-w-md" }, plugin
                    ? 'Enter a chapter path in the field above and click "Fetch" to load the chapter content.'
                    : 'Please select a plugin from the sidebar to get started.'))) : chapterText ? (react_1.default.createElement("div", { className: "space-y-6" },
                react_1.default.createElement("div", { className: "flex items-center justify-between" },
                    react_1.default.createElement("div", { className: "flex-1" },
                        react_1.default.createElement("h3", { className: "text-lg font-semibold text-foreground" }, "Chapter Content"),
                        react_1.default.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, chapterPath)),
                    react_1.default.createElement("div", { className: "flex gap-2 items-center" },
                        react_1.default.createElement("div", { className: "flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-muted/50" },
                            react_1.default.createElement(lucide_react_1.Code, { className: "w-4 h-4 text-muted-foreground" }),
                            react_1.default.createElement("span", { className: "text-sm text-muted-foreground" }, "Raw HTML"),
                            react_1.default.createElement(switch_1.Switch, { checked: showRawHtml, onCheckedChange: setShowRawHtml })),
                        react_1.default.createElement(tooltip_1.Tooltip, null,
                            react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", onClick: function () {
                                        return copyToClipboard(chapterPath, 'Chapter path');
                                    } },
                                    react_1.default.createElement(lucide_react_1.Copy, { className: "w-4 h-4" }),
                                    "Copy Path")),
                            react_1.default.createElement(tooltip_1.TooltipContent, null,
                                react_1.default.createElement("p", null, "Copy chapter path to clipboard"))),
                        react_1.default.createElement(tooltip_1.Tooltip, null,
                            react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", onClick: function () {
                                        return copyToClipboard(chapterText, 'Chapter text');
                                    } },
                                    react_1.default.createElement(lucide_react_1.Copy, { className: "w-4 h-4" }),
                                    "Copy Text")),
                            react_1.default.createElement(tooltip_1.TooltipContent, null,
                                react_1.default.createElement("p", null, "Copy chapter text to clipboard"))))),
                react_1.default.createElement("div", { className: "border border-border rounded-lg" },
                    react_1.default.createElement("div", { className: "bg-muted/50 rounded-t-lg px-4 py-2 border-b border-border" },
                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground font-medium" },
                            showRawHtml ? 'RAW HTML' : 'CHAPTER CONTENT',
                            " (",
                            chapterText.length,
                            " characters)")),
                    react_1.default.createElement("div", { className: "bg-background rounded-b-lg p-6 max-h-[600px] overflow-y-auto" }, showRawHtml ? (react_1.default.createElement("pre", { className: "text-xs text-foreground font-mono whitespace-pre-wrap break-words" }, chapterText)) : (react_1.default.createElement("div", { className: "prose prose-sm dark:prose-invert max-w-none text-foreground", dangerouslySetInnerHTML: {
                            __html: chapterText,
                        } })))),
                react_1.default.createElement("div", { className: "flex items-center justify-between pt-4 border-t border-border" },
                    react_1.default.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                        react_1.default.createElement("p", { className: "text-sm text-muted-foreground" }, "Content loaded successfully"),
                        (plugin === null || plugin === void 0 ? void 0 : plugin.customCSS) && (react_1.default.createElement("span", { className: "text-xs px-2 py-1 rounded flex items-center gap-1 ".concat(customCSSLoaded
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                : customCSSError
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20') },
                            "CSS:",
                            ' ',
                            customCSSLoaded
                                ? '✓ Applied'
                                : customCSSError
                                    ? '✗ Failed'
                                    : '⋯ Loading')),
                        (plugin === null || plugin === void 0 ? void 0 : plugin.customJS) && (react_1.default.createElement("span", { className: "text-xs px-2 py-1 rounded flex items-center gap-1 ".concat(customJSLoaded
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                : customJSError
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20') },
                            "JS:",
                            ' ',
                            customJSLoaded
                                ? '✓ Applied'
                                : customJSError
                                    ? '✗ Failed'
                                    : '⋯ Loading'))),
                    react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                            setChapterText('');
                            setChapterPath('');
                            setShowRawHtml(false);
                        } }, "Clear")))) : null)));
});
exports.default = ParseChapterSection;
