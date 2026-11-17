"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcludableCheckboxFilter = ExcludableCheckboxFilter;
var react_1 = __importDefault(require("react"));
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
function ExcludableCheckboxFilter(_a) {
    var filter = _a.filter, value = _a.value, set = _a.set;
    var getState = function (optionValue) {
        var _a, _b;
        if ((_a = value.include) === null || _a === void 0 ? void 0 : _a.includes(optionValue))
            return 'included';
        if ((_b = value.exclude) === null || _b === void 0 ? void 0 : _b.includes(optionValue))
            return 'excluded';
        return 'unchecked';
    };
    var toggleOption = function (optionValue) {
        var currentState = getState(optionValue);
        var newInclude = value.include || [];
        var newExclude = value.exclude || [];
        switch (currentState) {
            case 'unchecked':
                // Unchecked -> Included
                newInclude = __spreadArray(__spreadArray([], newInclude, true), [optionValue], false);
                break;
            case 'included':
                // Included -> Excluded
                newInclude = newInclude.filter(function (v) { return v !== optionValue; });
                newExclude = __spreadArray(__spreadArray([], newExclude, true), [optionValue], false);
                break;
            case 'excluded':
                // Excluded -> Unchecked
                newExclude = newExclude.filter(function (v) { return v !== optionValue; });
                break;
        }
        set({ include: newInclude, exclude: newExclude });
    };
    return (react_1.default.createElement("div", { className: "space-y-3" },
        react_1.default.createElement(label_1.Label, { className: "text-sm font-medium" }, filter.filter.label),
        react_1.default.createElement("div", { className: "space-y-2" }, filter.filter.options.map(function (option) {
            var state = getState(option.value);
            return (react_1.default.createElement("button", { key: option.value, type: "button", onClick: function () { return toggleOption(option.value); }, className: "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md border border-border hover:bg-muted/50 transition-colors" },
                react_1.default.createElement("span", { className: "text-foreground" }, option.label),
                state === 'included' && (react_1.default.createElement(badge_1.Badge, { variant: "default", className: "text-xs" }, "Include")),
                state === 'excluded' && (react_1.default.createElement(badge_1.Badge, { variant: "destructive", className: "text-xs" }, "Exclude"))));
        })),
        react_1.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Click once to include, twice to exclude, three times to reset")));
}
