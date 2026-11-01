"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchFilter = SwitchFilter;
var react_1 = __importDefault(require("react"));
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
function SwitchFilter(_a) {
    var filter = _a.filter, value = _a.value, set = _a.set;
    return (react_1.default.createElement("div", { className: "flex items-center justify-between space-x-2 py-2" },
        react_1.default.createElement(label_1.Label, { htmlFor: filter.key, className: "text-sm font-medium cursor-pointer" }, filter.filter.label),
        react_1.default.createElement(switch_1.Switch, { id: filter.key, checked: value, onCheckedChange: set })));
}
