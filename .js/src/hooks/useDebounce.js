"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useDebounce;
var react_1 = require("react");
function useDebounce(text, delay) {
    var _a = (0, react_1.useState)(''), value = _a[0], setValue = _a[1];
    (0, react_1.useEffect)(function () {
        var timerId = setTimeout(function () {
            setValue(text);
        }, delay);
        return function () {
            clearTimeout(timerId);
        };
    }, [text, delay]);
    return value;
}
