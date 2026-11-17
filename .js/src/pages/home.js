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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var lucide_react_1 = require("lucide-react");
var plugin_header_1 = __importDefault(require("../components/plugin-header"));
var tabs_1 = require("@/components/ui/tabs");
var input_1 = require("@/components/ui/input");
var plugin_registry_1 = __importDefault(require("@/provider/plugin-registry"));
var store_1 = require("@/store");
var popular_novels_1 = __importDefault(require("@/components/popular-novels"));
var search_novels_1 = __importDefault(require("@/components/search-novels"));
var parse_novel_1 = __importDefault(require("@/components/parse-novel"));
var settings_1 = __importDefault(require("@/components/settings"));
var parse_chapter_1 = __importDefault(require("@/components/parse-chapter"));
var badge_1 = require("@/components/ui/badge");
var issue_index_1 = require("@/lib/issue-index");
var plugin_issues_1 = require("@/components/plugin-issues");
function PluginSidebar() {
    var plugin = (0, store_1.useAppStore)(function (state) { return state.plugin; });
    var selectPlugin = (0, store_1.useAppStore)(function (state) { return state.selectPlugin; });
    var issueIndexState = (0, store_1.useAppStore)(function (state) { return state.issueIndexState; });
    var _a = (0, react_1.useState)(''), searchQuery = _a[0], setSearchQuery = _a[1];
    var filteredPlugins = (0, react_1.useMemo)(function () {
        return plugin_registry_1.default.filter(function (p) {
            return p.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [searchQuery]);
    return (react_1.default.createElement("aside", { className: "w-64 border-r border-border bg-background flex flex-col" },
        react_1.default.createElement("div", { className: "p-6 flex-shrink-0 space-y-4" },
            react_1.default.createElement("div", { className: "flex items-center justify-between" },
                react_1.default.createElement("h2", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground" }, "Plugins"),
                react_1.default.createElement("span", { className: "text-xs text-muted-foreground" },
                    filteredPlugins.length,
                    " / ",
                    plugin_registry_1.default.length)),
            react_1.default.createElement("div", { className: "relative" },
                react_1.default.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                react_1.default.createElement(input_1.Input, { placeholder: "Search plugin...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 h-9" }))),
        react_1.default.createElement("div", { className: "flex-1 overflow-y-auto px-6 pb-6" },
            react_1.default.createElement("div", { className: "space-y-2" }, plugin_registry_1.default.map(function (p) {
                if (!p.icon) {
                    throw new Error("Plugin ".concat(p.name, " is missing icon path"));
                }
                var isVisible = p.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                var reportCount = issueIndexState.status === 'ready'
                    ? (0, issue_index_1.getIssueGroups)(issueIndexState.index, p.id).reduce(function (total, group) { return total + group.length - 1; }, 0)
                    : 0;
                return (react_1.default.createElement("button", { key: p.id, onClick: function () { return selectPlugin(p); }, className: "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 ".concat(p.id === (plugin === null || plugin === void 0 ? void 0 : plugin.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted', " ").concat(isVisible ? '' : 'hidden') },
                    react_1.default.createElement("img", { src: "/static/".concat(p.icon), alt: p.name, className: "w-6 h-6 rounded-sm shrink-0 object-contain", onError: function () {
                            throw new Error("Icon not found for plugin: ".concat(p.name, " at /static/").concat(p.icon));
                        } }),
                    react_1.default.createElement("span", { className: "min-w-0 flex-1 truncate" }, p.name),
                    reportCount > 0 && (react_1.default.createElement(badge_1.Badge, { variant: "outline", "aria-label": "".concat(reportCount, " indexed open ").concat(reportCount === 1 ? 'report' : 'reports'), className: "border-current bg-transparent text-current" }, reportCount))));
            })))));
}
function Home() {
    var plugin = (0, store_1.useAppStore)(function (state) { return state.plugin; });
    var loadIssueIndex = (0, store_1.useAppStore)(function (state) { return state.loadIssueIndex; });
    var _a = (0, react_1.useState)('popular'), activeTab = _a[0], setActiveTab = _a[1];
    (0, react_1.useEffect)(function () {
        void loadIssueIndex();
    }, [loadIssueIndex]);
    var handleNavigateToParseNovel = (0, react_1.useCallback)(function () {
        setActiveTab('parse-novel');
    }, []);
    var handleNavigateToParseChapter = (0, react_1.useCallback)(function () {
        setActiveTab('parse-chapter');
    }, []);
    return (react_1.default.createElement("div", { className: "min-h-screen bg-background" },
        react_1.default.createElement(plugin_header_1.default, { selectedPlugin: plugin }),
        react_1.default.createElement("div", { className: "flex h-[calc(100vh-64px)]" },
            react_1.default.createElement(PluginSidebar, null),
            react_1.default.createElement("main", { className: "flex-1 overflow-auto" },
                react_1.default.createElement("div", { className: "p-8" },
                    react_1.default.createElement("div", { className: "mb-8" },
                        react_1.default.createElement("h1", { className: "text-3xl font-bold text-foreground mb-2" }, "Plugin Playground"),
                        react_1.default.createElement("p", { className: "text-muted-foreground" },
                            "Explore and test ",
                            (plugin === null || plugin === void 0 ? void 0 : plugin.name) || 'plugin',
                            " features")),
                    react_1.default.createElement(plugin_issues_1.PluginIssues, { pluginId: plugin === null || plugin === void 0 ? void 0 : plugin.id }),
                    react_1.default.createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" },
                        react_1.default.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-5 mb-8" },
                            react_1.default.createElement(tabs_1.TabsTrigger, { value: "popular", className: "flex items-center gap-2" },
                                react_1.default.createElement(lucide_react_1.BookOpen, { className: "w-4 h-4" }),
                                react_1.default.createElement("span", { className: "hidden sm:inline" }, "Popular")),
                            react_1.default.createElement(tabs_1.TabsTrigger, { value: "search", className: "flex items-center gap-2" },
                                react_1.default.createElement(lucide_react_1.Search, { className: "w-4 h-4" }),
                                react_1.default.createElement("span", { className: "hidden sm:inline" }, "Search")),
                            react_1.default.createElement(tabs_1.TabsTrigger, { value: "parse-novel", className: "flex items-center gap-2" },
                                react_1.default.createElement(lucide_react_1.Zap, { className: "w-4 h-4" }),
                                react_1.default.createElement("span", { className: "hidden sm:inline" }, "Parse Novel")),
                            react_1.default.createElement(tabs_1.TabsTrigger, { value: "parse-chapter", className: "flex items-center gap-2" },
                                react_1.default.createElement(lucide_react_1.Zap, { className: "w-4 h-4" }),
                                react_1.default.createElement("span", { className: "hidden sm:inline" }, "Parse Chapter")),
                            react_1.default.createElement(tabs_1.TabsTrigger, { value: "settings", className: "flex items-center gap-2" },
                                react_1.default.createElement(lucide_react_1.Settings, { className: "w-4 h-4" }),
                                react_1.default.createElement("span", { className: "hidden sm:inline" }, "Settings"))),
                        react_1.default.createElement(tabs_1.TabsContent, { value: "popular", className: "space-y-6" },
                            react_1.default.createElement(popular_novels_1.default, { onNavigateToParseNovel: handleNavigateToParseNovel })),
                        react_1.default.createElement(tabs_1.TabsContent, { value: "search", className: "space-y-6" },
                            react_1.default.createElement(search_novels_1.default, { onNavigateToParseNovel: handleNavigateToParseNovel })),
                        react_1.default.createElement(tabs_1.TabsContent, { value: "parse-novel", className: "space-y-6" },
                            react_1.default.createElement(parse_novel_1.default, { onNavigateToParseChapter: handleNavigateToParseChapter })),
                        react_1.default.createElement(tabs_1.TabsContent, { value: "parse-chapter", className: "space-y-6" },
                            react_1.default.createElement(parse_chapter_1.default, null)),
                        react_1.default.createElement(tabs_1.TabsContent, { value: "settings", className: "space-y-6" },
                            react_1.default.createElement(settings_1.default, null))))))));
}
exports.default = Home;
