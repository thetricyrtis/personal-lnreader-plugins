"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFilter = TextFilter;
var react_1 = __importDefault(require("react"));
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
function TextFilter(_a) {
    var filter = _a.filter, value = _a.value, set = _a.set;
    return (react_1.default.createElement("div", { className: "space-y-2" },
        react_1.default.createElement(label_1.Label, { htmlFor: filter.key, className: "text-sm font-medium" }, filter.filter.label),
        react_1.default.createElement(input_1.Input, { id: filter.key, value: value, onChange: function (e) { return set(e.target.value); }, placeholder: "Enter ".concat(filter.filter.label.toLowerCase(), "...") })));
}
