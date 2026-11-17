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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltersSheet = FiltersSheet;
var react_1 = __importDefault(require("react"));
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var filterInputs_1 = require("@libs/filterInputs");
var picker_filter_1 = require("./picker-filter");
var switch_filter_1 = require("./switch-filter");
var text_filter_1 = require("./text-filter");
var checkbox_filter_1 = require("./checkbox-filter");
var excludable_checkbox_filter_1 = require("./excludable-checkbox-filter");
var lucide_react_1 = require("lucide-react");
var renderFilters = function (filters, values, set) {
    var isValueCorrectType = function (o, f) {
        var checkIfIsCorrectObjectType = function (o, f) {
            var areArrays = Array.isArray(o) && Array.isArray(f);
            var areObjects = typeof o === 'object' && typeof f === 'object';
            return areArrays || areObjects;
        };
        return typeof o === typeof f || checkIfIsCorrectObjectType(o, f);
    };
    if (!filters || !values)
        return null;
    return (react_1.default.createElement(react_1.default.Fragment, null, Object.entries(filters).map(function (_a) {
        var key = _a[0], filter = _a[1];
        if (!(key in values)) {
            console.error("No filter value for ".concat(key, " in filter values!"));
            return null;
        }
        switch (filter.type) {
            case filterInputs_1.FilterTypes.Picker: {
                var value = values[key].value;
                if (!isValueCorrectType(value, filter.value)) {
                    console.error("FilterValue for filter [".concat(key, "] has a wrong type!"));
                    return null;
                }
                return (react_1.default.createElement(picker_filter_1.PickerFilter, { key: "picker_filter_".concat(key), filter: { key: key, filter: filter }, value: value, set: function (newValue) { return set(key, newValue); } }));
            }
            case filterInputs_1.FilterTypes.Switch: {
                var value = values[key].value;
                if (!isValueCorrectType(value, filter.value)) {
                    console.error("FilterValue for filter [".concat(key, "] has a wrong type!"));
                    return null;
                }
                return (react_1.default.createElement(switch_filter_1.SwitchFilter, { filter: { key: key, filter: filter }, key: "switch_filter_".concat(key), value: value, set: function (newValue) { return set(key, newValue); } }));
            }
            case filterInputs_1.FilterTypes.TextInput: {
                var value = values[key].value;
                if (!isValueCorrectType(value, filter.value)) {
                    console.error("FilterValue for filter [".concat(key, "] has a wrong type!"));
                    return null;
                }
                return (react_1.default.createElement(text_filter_1.TextFilter, { filter: { key: key, filter: filter }, set: function (newValue) { return set(key, newValue); }, value: value, key: "text_filter_".concat(key) }));
            }
            case filterInputs_1.FilterTypes.CheckboxGroup: {
                var value = values[key].value;
                if (!isValueCorrectType(value, filter.value)) {
                    console.error("FilterValue for filter [".concat(key, "] has a wrong type!"));
                    return null;
                }
                return (react_1.default.createElement(checkbox_filter_1.CheckboxFilter, { filter: { key: key, filter: filter }, set: function (newValue) { return set(key, newValue); }, value: value, key: "checkbox_filter_".concat(key) }));
            }
            case filterInputs_1.FilterTypes.ExcludableCheckboxGroup: {
                var value = values[key].value;
                if (!isValueCorrectType(value, filter.value)) {
                    console.error("FilterValue for filter [".concat(key, "] has a wrong type!"));
                    return null;
                }
                return (react_1.default.createElement(excludable_checkbox_filter_1.ExcludableCheckboxFilter, { filter: { key: key, filter: filter }, set: function (newValue) { return set(key, newValue); }, value: value, key: "xche\u0441kbox_filter_".concat(key) }));
            }
        }
    })));
};
function FiltersSheet(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, values = _a.values, setValues = _a.setValues, filters = _a.filters, refetch = _a.refetch;
    var setFilterWithKey = function (key, newValue) {
        return setValues(function (fValues) {
            var _a;
            return !fValues
                ? fValues
                : __assign(__assign({}, fValues), (_a = {}, _a[key] = __assign(__assign({}, fValues[key]), { value: newValue }), _a));
        });
    };
    var resetFilters = function () {
        if (filters) {
            var resetValues = {};
            for (var fKey in filters) {
                resetValues[fKey] = {
                    type: filters[fKey].type,
                    value: filters[fKey].value,
                };
            }
            setValues(resetValues);
        }
    };
    var handleApply = function () {
        refetch();
        onOpenChange(false);
    };
    var filterElements = renderFilters(filters, values, setFilterWithKey);
    return (react_1.default.createElement(sheet_1.Sheet, { open: open, onOpenChange: onOpenChange },
        react_1.default.createElement(sheet_1.SheetContent, { side: "right", className: "w-full sm:max-w-md overflow-y-auto" },
            react_1.default.createElement(sheet_1.SheetHeader, null,
                react_1.default.createElement(sheet_1.SheetTitle, null, "Filters"),
                react_1.default.createElement(sheet_1.SheetDescription, null, "Customize your search with these filter options")),
            react_1.default.createElement("div", { className: "py-6 space-y-4" }, filterElements || (react_1.default.createElement("p", { className: "text-sm text-muted-foreground text-center py-8" }, "No filters available"))),
            react_1.default.createElement(sheet_1.SheetFooter, { className: "flex-col sm:flex-col gap-2" },
                react_1.default.createElement(button_1.Button, { onClick: handleApply, className: "w-full" }, "Apply Filters"),
                react_1.default.createElement(button_1.Button, { variant: "outline", onClick: resetFilters, className: "w-full gap-2" },
                    react_1.default.createElement(lucide_react_1.RotateCcw, { className: "w-4 h-4" }),
                    "Reset to Default")))));
}
