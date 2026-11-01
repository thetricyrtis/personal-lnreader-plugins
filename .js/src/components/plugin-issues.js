"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginIssues = PluginIssues;
var react_1 = __importDefault(require("react"));
var issue_index_1 = require("@/lib/issue-index");
var store_1 = require("@/store");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var skeleton_1 = require("@/components/ui/skeleton");
function PluginIssues(_a) {
    var pluginId = _a.pluginId;
    var state = (0, store_1.useAppStore)(function (store) { return store.issueIndexState; });
    var loadIssueIndex = (0, store_1.useAppStore)(function (store) { return store.loadIssueIndex; });
    var groups = state.status === 'ready' && pluginId
        ? (0, issue_index_1.getIssueGroups)(state.index, pluginId)
        : [];
    var reportCount = groups.reduce(function (total, group) { return total + group.length - 1; }, 0);
    return (react_1.default.createElement(card_1.Card, { className: "mb-8" },
        react_1.default.createElement(card_1.CardHeader, { className: "flex flex-row items-start justify-between gap-4" },
            react_1.default.createElement("div", { className: "space-y-1.5" },
                react_1.default.createElement(card_1.CardTitle, null, "Open issue reports"),
                react_1.default.createElement(card_1.CardDescription, null, "Indexed GitHub reports for this plugin. The snapshot may lag recent changes.")),
            state.status === 'ready' && (react_1.default.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () { return void loadIssueIndex(); } }, "Refresh")),
            state.status === 'error' && (react_1.default.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () { return void loadIssueIndex(); } }, "Retry"))),
        react_1.default.createElement(card_1.CardContent, null, !pluginId ? (react_1.default.createElement("p", { className: "text-sm text-muted-foreground" }, "Select a plugin to see its issue reports.")) : state.status === 'idle' || state.status === 'loading' ? (react_1.default.createElement("div", { role: "status", "aria-live": "polite", className: "space-y-2" },
            react_1.default.createElement("p", { className: "text-sm text-muted-foreground" }, "Loading issue reports..."),
            react_1.default.createElement(skeleton_1.Skeleton, { className: "h-8 w-full max-w-md" }))) : state.status === 'error' ? (react_1.default.createElement("div", { role: "alert", className: "space-y-1" },
            react_1.default.createElement("p", { className: "text-sm" }, "Issue reports are unavailable."),
            react_1.default.createElement("p", { className: "text-sm text-muted-foreground" }, state.message))) : groups.length === 0 ? (react_1.default.createElement("p", { className: "text-sm text-muted-foreground" }, "No indexed open reports for this plugin.")) : (react_1.default.createElement("div", { className: "space-y-3" },
            react_1.default.createElement("p", { className: "text-sm text-muted-foreground" },
                reportCount,
                " indexed open",
                ' ',
                reportCount === 1 ? 'report' : 'reports'),
            groups.map(function (group) { return (react_1.default.createElement(IssueCategory, { key: group[0], group: group })); }))))));
}
function IssueCategory(_a) {
    var group = _a.group;
    var code = group[0], issueNumbers = group.slice(1);
    return (react_1.default.createElement("div", { className: "flex flex-wrap items-start gap-2" },
        react_1.default.createElement(badge_1.Badge, { variant: "outline", className: "border-current bg-transparent text-current" }, issue_index_1.CATEGORY_LABELS[code]),
        react_1.default.createElement("div", { className: "flex min-w-0 flex-1 flex-wrap gap-x-3 gap-y-1" }, issueNumbers.map(function (number) { return (react_1.default.createElement("a", { key: number, href: "https://github.com/LNReader/lnreader-plugins/issues/".concat(number), target: "_blank", rel: "noopener noreferrer", "aria-label": "Open GitHub issue #".concat(number), className: "text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" },
            "#",
            number)); }))));
}
