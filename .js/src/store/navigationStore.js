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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationStore = void 0;
/**
 * @param set State setter for use inside actions
 * @param get State getter for use inside actions, outside of State setter
 */
var NavigationStore = function (set) { return ({
    parseNovelPath: undefined,
    parseChapterPath: undefined,
    shouldAutoSubmitNovel: false,
    shouldAutoSubmitChapter: false,
    setParseNovelPath: function (path, autoSubmit) {
        if (autoSubmit === void 0) { autoSubmit = true; }
        set(function (state) { return (__assign(__assign({}, state), { parseNovelPath: path, shouldAutoSubmitNovel: autoSubmit })); });
    },
    clearParseNovelPath: function () {
        set(function (state) { return (__assign(__assign({}, state), { parseNovelPath: undefined, shouldAutoSubmitNovel: false })); });
    },
    setParseChapterPath: function (path, autoSubmit) {
        if (autoSubmit === void 0) { autoSubmit = true; }
        set(function (state) { return (__assign(__assign({}, state), { parseChapterPath: path, shouldAutoSubmitChapter: autoSubmit })); });
    },
    clearParseChapterPath: function () {
        set(function (state) { return (__assign(__assign({}, state), { parseChapterPath: undefined, shouldAutoSubmitChapter: false })); });
    },
}); };
exports.NavigationStore = NavigationStore;
