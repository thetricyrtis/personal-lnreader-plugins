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
var filters_sheet_1 = require("@/components/filters/filters-sheet");
var novel_card_1 = require("@/components/novel-card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var skeleton_1 = require("@/components/ui/skeleton");
var store_1 = require("@/store");
var PopularNovelsSection = react_1.default.memo(function PopularNovelsSection(_a) {
    var _this = this;
    var onNavigateToParseNovel = _a.onNavigateToParseNovel;
    var plugin = (0, store_1.useAppStore)(function (state) { return state.plugin; });
    var setParseNovelPath = (0, store_1.useAppStore)(function (state) { return state.setParseNovelPath; });
    var _b = (0, react_1.useState)([]), novels = _b[0], setNovels = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(0), currentIndex = _d[0], setCurrentIndex = _d[1];
    var _e = (0, react_1.useState)(0), maxIndex = _e[0], setMaxIndex = _e[1];
    var _f = (0, react_1.useState)(true), isLatest = _f[0], setIsLatest = _f[1];
    var _g = (0, react_1.useState)(false), filtersOpen = _g[0], setFiltersOpen = _g[1];
    var _h = (0, react_1.useState)(), filterValues = _h[0], setFilterValues = _h[1];
    var _j = (0, react_1.useState)(), prevPluginId = _j[0], setPrevPluginId = _j[1];
    if ((plugin === null || plugin === void 0 ? void 0 : plugin.id) !== prevPluginId) {
        setPrevPluginId(plugin === null || plugin === void 0 ? void 0 : plugin.id);
        setCurrentIndex(0);
        setMaxIndex(0);
        setNovels([]);
        if (plugin === null || plugin === void 0 ? void 0 : plugin.filters) {
            var filters = {};
            for (var fKey in plugin.filters) {
                filters[fKey] = {
                    type: plugin.filters[fKey].type,
                    value: plugin.filters[fKey].value,
                };
            }
            setFilterValues(filters);
        }
        else {
            setFilterValues(undefined);
        }
    }
    var fetchNovelsByIndex = function (index, latestOverride) { return __awaiter(_this, void 0, void 0, function () {
        var fetchedNovels, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(plugin && index)) return [3 /*break*/, 5];
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, plugin.popularNovels(index, {
                            filters: filterValues || {},
                            showLatestNovels: latestOverride !== null && latestOverride !== void 0 ? latestOverride : isLatest,
                        })];
                case 2:
                    fetchedNovels = _a.sent();
                    if (fetchedNovels.length !== 0) {
                        setCurrentIndex(index);
                        if (index > maxIndex) {
                            setMaxIndex(index);
                        }
                        setNovels(fetchedNovels);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching novels:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleIsLatestChange = function (latest) {
        if (isLatest === latest)
            return;
        setIsLatest(latest);
        setCurrentIndex(0);
        setMaxIndex(0);
        setNovels([]);
    };
    var handleParseNovel = function (path) {
        setParseNovelPath(path, true);
        onNavigateToParseNovel === null || onNavigateToParseNovel === void 0 ? void 0 : onNavigateToParseNovel();
    };
    return (react_1.default.createElement("div", { className: "space-y-6" },
        react_1.default.createElement(card_1.Card, { className: "p-6" },
            react_1.default.createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h2", { className: "text-lg font-semibold text-foreground" }, "Popular Novels"),
                    react_1.default.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, plugin
                        ? "Browse ".concat(isLatest ? 'latest' : 'popular', " novels")
                        : 'Select a plugin to browse novels')),
                react_1.default.createElement("div", { className: "flex gap-2" },
                    react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", className: "gap-2 bg-transparent", disabled: !plugin || isLatest || !plugin.filters, onClick: function () { return setFiltersOpen(true); } },
                        react_1.default.createElement(lucide_react_1.Filter, { className: "w-4 h-4" }),
                        "Filters"),
                    react_1.default.createElement(button_1.Button, { size: "sm", disabled: !plugin || loading, onClick: function () { return fetchNovelsByIndex(1); } }, loading ? 'Loading...' : 'Fetch'),
                    react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: currentIndex === 0 || loading, onClick: function () { return fetchNovelsByIndex(currentIndex + 1); } }, "Next Page"))),
            react_1.default.createElement("div", { className: "flex items-center gap-2 mb-6" },
                ['Latest', 'Popular'].map(function (option) { return (react_1.default.createElement(badge_1.Badge, { key: option, variant: isLatest === (option === 'Latest') ? 'default' : 'outline', className: "cursor-pointer", onClick: function () { return handleIsLatestChange(option === 'Latest'); } }, option)); }),
                currentIndex > 0 && (react_1.default.createElement("div", { className: "ml-auto flex items-center gap-2" },
                    react_1.default.createElement("span", { className: "text-xs text-muted-foreground" }, "Page"),
                    react_1.default.createElement(input_1.Input, { type: "number", min: "1", max: maxIndex, value: currentIndex, onChange: function (e) {
                            var page = parseInt(e.target.value);
                            if (page > 0 && page <= maxIndex) {
                                fetchNovelsByIndex(page);
                            }
                        }, className: "w-16 h-7 text-center text-xs", disabled: loading }),
                    react_1.default.createElement("span", { className: "text-xs text-muted-foreground" },
                        "of ",
                        maxIndex,
                        "+")))),
            loading ? (react_1.default.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6" }, Array.from({ length: 12 }).map(function (_, index) { return (react_1.default.createElement("div", { key: index, className: "space-y-3" },
                react_1.default.createElement(skeleton_1.Skeleton, { className: "w-full aspect-[3/4] rounded-lg" }),
                react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-3/4" }),
                react_1.default.createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2" }),
                react_1.default.createElement("div", { className: "flex gap-2" },
                    react_1.default.createElement(skeleton_1.Skeleton, { className: "h-8 flex-1" }),
                    react_1.default.createElement(skeleton_1.Skeleton, { className: "h-8 flex-1" })))); }))) : novels.length === 0 ? (react_1.default.createElement("div", { className: "flex flex-col items-center justify-center py-16 px-4 text-center" },
                react_1.default.createElement("div", { className: "rounded-full bg-muted p-4 mb-4" },
                    react_1.default.createElement(lucide_react_1.BookOpen, { className: "w-8 h-8 text-muted-foreground" })),
                react_1.default.createElement("h3", { className: "text-lg font-semibold text-foreground mb-2" }, plugin ? 'No novels to display' : 'No plugin selected'),
                react_1.default.createElement("p", { className: "text-sm text-muted-foreground max-w-md" }, plugin
                    ? 'Click the "Fetch" button above to load the latest or popular novels from this source.'
                    : 'Please select a plugin from the sidebar to get started.'))) : (react_1.default.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4" }, novels.map(function (novel, index) { return (react_1.default.createElement(novel_card_1.NovelCard, { key: "".concat(novel.path, "-").concat(index), novel: novel, onParse: handleParseNovel })); })))),
        react_1.default.createElement(filters_sheet_1.FiltersSheet, { open: filtersOpen, onOpenChange: setFiltersOpen, values: filterValues, filters: plugin === null || plugin === void 0 ? void 0 : plugin.filters, setValues: setFilterValues, refetch: function () { return fetchNovelsByIndex(1); } })));
});
exports.default = PopularNovelsSection;
