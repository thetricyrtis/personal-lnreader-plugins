"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PluginHeader;
var react_1 = __importDefault(require("react"));
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var useTheme_1 = require("@/hooks/useTheme");
function PluginHeader(_a) {
    var selectedPlugin = _a.selectedPlugin;
    var _b = (0, useTheme_1.useTheme)(), theme = _b.theme, setTheme = _b.setTheme;
    var toggleTheme = function () {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    var isDark = theme === 'dark';
    return (react_1.default.createElement("header", { className: "border-b border-border" },
        react_1.default.createElement("div", { className: "px-8 py-4 flex items-center justify-between" },
            react_1.default.createElement("div", { className: "flex items-center gap-3" },
                react_1.default.createElement("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[var(--color-accent-soft)] text-xl font-semibold text-[var(--color-accent-strong)] transition-colors" }, "\u8AAD"),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h1", { className: "text-sm font-semibold text-foreground" }, "Plugin Playground"),
                    react_1.default.createElement("p", { className: "text-xs text-muted-foreground" }, selectedPlugin === null || selectedPlugin === void 0 ? void 0 : selectedPlugin.name))),
            react_1.default.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleTheme, className: "h-9 w-9", "aria-label": "Toggle theme", title: "Theme: ".concat(theme) }, isDark ? react_1.default.createElement(lucide_react_1.Moon, { className: "h-4 w-4" }) : react_1.default.createElement(lucide_react_1.Sun, { className: "h-4 w-4" })))));
}
