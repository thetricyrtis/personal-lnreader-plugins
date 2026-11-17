"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickerFilter = PickerFilter;
var react_1 = __importDefault(require("react"));
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var EMPTY_VALUE_PLACEHOLDER = '__lnreader_empty__';
function PickerFilter(_a) {
    var filter = _a.filter, value = _a.value, set = _a.set;
    // Map empty string to placeholder for Radix UI Select
    var displayValue = value === '' ? EMPTY_VALUE_PLACEHOLDER : value;
    // Handle change and map placeholder back to empty string
    var handleChange = function (newValue) {
        set(newValue === EMPTY_VALUE_PLACEHOLDER ? '' : newValue);
    };
    return (react_1.default.createElement("div", { className: "space-y-2" },
        react_1.default.createElement(label_1.Label, { className: "text-sm font-medium" }, filter.filter.label),
        react_1.default.createElement(select_1.Select, { value: displayValue, onValueChange: handleChange },
            react_1.default.createElement(select_1.SelectTrigger, null,
                react_1.default.createElement(select_1.SelectValue, null)),
            react_1.default.createElement(select_1.SelectContent, null, filter.filter.options.map(function (option) {
                // Map empty string values to placeholder
                var optionValue = option.value === '' ? EMPTY_VALUE_PLACEHOLDER : option.value;
                return (react_1.default.createElement(select_1.SelectItem, { key: option.value || 'empty', value: optionValue }, option.label || option.value || 'All'));
            })))));
}
