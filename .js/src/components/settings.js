"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var useDebounce_1 = __importDefault(require("@/hooks/useDebounce"));
var types_1 = require("@/types/types");
var FETCH_MODES = (_a = {},
    _a[types_1.FetchMode.PROXY] = 'Proxy',
    _a[types_1.FetchMode.NODE_FETCH] = 'Node Fetch',
    _a[types_1.FetchMode.CURL] = 'Curl',
    _a);
var SettingsSection = react_1.default.memo(function SettingsSection() {
    var _a = (0, react_1.useState)({
        cookies: '',
        fetchMode: types_1.FetchMode.PROXY,
        useUserAgent: true,
    }), settings = _a[0], setSettings = _a[1];
    var _b = (0, react_1.useState)('idle'), status = _b[0], setStatus = _b[1];
    var init = (0, react_1.useRef)(false);
    var lastSaved = (0, react_1.useRef)(null);
    var debouncedCookies = (0, useDebounce_1.default)(settings.cookies, 500);
    (0, react_1.useEffect)(function () {
        fetch('settings')
            .then(function (res) { return res.json(); })
            .then(function (data) {
            var _a, _b;
            var loaded = {
                cookies: data.cookies || '',
                fetchMode: (_a = data.fetchMode) !== null && _a !== void 0 ? _a : types_1.FetchMode.PROXY,
                useUserAgent: (_b = data.useUserAgent) !== null && _b !== void 0 ? _b : true,
            };
            setSettings(loaded);
            lastSaved.current = loaded;
            init.current = true;
        })
            .catch(console.error);
    }, []);
    (0, react_1.useEffect)(function () {
        if (!init.current || debouncedCookies !== settings.cookies)
            return;
        var current = __assign(__assign({}, settings), { cookies: debouncedCookies });
        if (JSON.stringify(lastSaved.current) === JSON.stringify(current))
            return;
        setStatus('loading');
        fetch('settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(current),
        })
            .then(function () {
            lastSaved.current = current;
            setStatus('saved');
            setTimeout(function () { return setStatus('idle'); }, 2000);
        })
            .catch(console.error);
    }, [
        debouncedCookies,
        settings.fetchMode,
        settings.useUserAgent,
        settings.cookies,
    ]);
    var update = function (k, v) { return setSettings(function (settings) {
        var _a;
        return (__assign(__assign({}, settings), (_a = {}, _a[k] = v, _a)));
    }); };
    return (react_1.default.createElement("div", { className: "space-y-6" },
        react_1.default.createElement(card_1.Card, { className: "p-6 relative" },
            status === 'saved' && (react_1.default.createElement("div", { className: "absolute top-4 right-4 z-10 bg-green-500/90 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2" },
                react_1.default.createElement(lucide_react_1.Check, { className: "w-4 h-4" }),
                " Settings updated")),
            react_1.default.createElement("div", { className: "flex items-center justify-between mb-6" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h2", { className: "text-lg font-semibold text-foreground" }, "Settings"),
                    react_1.default.createElement("p", { className: "text-sm text-muted-foreground mt-1" }, "Settings are automatically saved")),
                status === 'loading' && (react_1.default.createElement("div", { className: "text-sm text-muted-foreground" }, "Saving..."))),
            react_1.default.createElement("div", { className: "space-y-6" },
                react_1.default.createElement(Section, { title: "Request Configuration" },
                    react_1.default.createElement("div", { className: "space-y-2" },
                        react_1.default.createElement(label_1.Label, { className: "font-semibold text-foreground" }, "Browser User Agent"),
                        react_1.default.createElement("div", { className: "flex items-center gap-3" },
                            react_1.default.createElement(input_1.Input, { value: navigator.userAgent, disabled: true, className: "font-mono text-xs flex-1 opacity-60", title: navigator.userAgent }),
                            react_1.default.createElement("div", { className: "flex items-center gap-2 whitespace-nowrap" },
                                react_1.default.createElement(checkbox_1.Checkbox, { id: "use-ua", checked: settings.useUserAgent, onCheckedChange: function (v) { return update('useUserAgent', v); } }),
                                react_1.default.createElement(label_1.Label, { htmlFor: "use-ua", className: "text-sm text-foreground cursor-pointer" }, "Use")))),
                    react_1.default.createElement("div", { className: "space-y-2" },
                        react_1.default.createElement(label_1.Label, { htmlFor: "cookies", className: "font-semibold text-foreground" }, "Cookies"),
                        react_1.default.createElement(input_1.Input, { id: "cookies", value: settings.cookies, onChange: function (e) { return update('cookies', e.target.value.trim()); }, placeholder: "Enter cookies (optional)...", className: "font-mono text-xs" }),
                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Additional cookies to send with requests (optional)"))),
                react_1.default.createElement(Section, { title: "Fetch Settings" },
                    react_1.default.createElement("div", { className: "space-y-2" },
                        react_1.default.createElement(label_1.Label, { htmlFor: "fetch-mode", className: "font-semibold text-foreground" }, "Fetch Mode"),
                        react_1.default.createElement(select_1.Select, { value: settings.fetchMode.toString(), onValueChange: function (v) { return update('fetchMode', parseInt(v)); } },
                            react_1.default.createElement(select_1.SelectTrigger, { id: "fetch-mode" },
                                react_1.default.createElement(select_1.SelectValue, null, FETCH_MODES[settings.fetchMode])),
                            react_1.default.createElement(select_1.SelectContent, null, Object.entries(FETCH_MODES).map(function (_a) {
                                var v = _a[0], l = _a[1];
                                return (react_1.default.createElement(select_1.SelectItem, { key: v, value: v }, l));
                            }))),
                        react_1.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Select the method used to fetch data from sources")))))));
});
function Section(_a) {
    var title = _a.title, children = _a.children;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { className: "flex items-center gap-2 mb-4" },
            react_1.default.createElement("div", { className: "h-px flex-1 bg-border" }),
            react_1.default.createElement("h3", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wide" }, title),
            react_1.default.createElement("div", { className: "h-px flex-1 bg-border" })),
        react_1.default.createElement("div", { className: "space-y-6" }, children)));
}
exports.default = SettingsSection;
