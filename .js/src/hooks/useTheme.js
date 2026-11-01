"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
var react_1 = require("react");
var store_1 = require("@/store");
function useTheme() {
    var theme = (0, store_1.useAppStore)(function (state) { return state.theme; });
    var setTheme = (0, store_1.useAppStore)(function (state) { return state.setTheme; });
    (0, react_1.useEffect)(function () {
        var root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
    }, [theme]);
    return { theme: theme, setTheme: setTheme };
}
