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
exports.CheckboxFilter = CheckboxFilter;
var react_1 = __importDefault(require("react"));
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
function CheckboxFilter(_a) {
    var filter = _a.filter, value = _a.value, set = _a.set;
    var toggleOption = function (optionValue) {
        if (value.includes(optionValue)) {
            set(value.filter(function (v) { return v !== optionValue; }));
        }
        else {
            set(__spreadArray(__spreadArray([], value, true), [optionValue], false));
        }
    };
    return (react_1.default.createElement("div", { className: "space-y-3" },
        react_1.default.createElement(label_1.Label, { className: "text-sm font-medium" }, filter.filter.label),
        react_1.default.createElement("div", { className: "space-y-2" }, filter.filter.options.map(function (option) { return (react_1.default.createElement("div", { key: option.value, className: "flex items-center space-x-2" },
            react_1.default.createElement(checkbox_1.Checkbox, { id: "".concat(filter.key, "-").concat(option.value), checked: value.includes(option.value), onCheckedChange: function () { return toggleOption(option.value); } }),
            react_1.default.createElement(label_1.Label, { htmlFor: "".concat(filter.key, "-").concat(option.value), className: "text-sm font-normal cursor-pointer" }, option.label))); }))));
}
