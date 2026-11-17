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
exports.useAppStore = void 0;
var zustand_1 = require("zustand");
var pluginStore_1 = require("./pluginStore");
var navigationStore_1 = require("./navigationStore");
var issueStore_1 = require("./issueStore");
var getInitialTheme = function () {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return 'light';
};
exports.useAppStore = (0, zustand_1.create)(function (set, get) { return (__assign(__assign(__assign(__assign({}, (0, pluginStore_1.PluginStore)(set, get)), (0, navigationStore_1.NavigationStore)(set, get)), (0, issueStore_1.IssueStore)(set, get)), { theme: getInitialTheme(), setTheme: function (theme) {
        set(function (state) { return (__assign(__assign({}, state), { theme: theme })); });
        localStorage.setItem('theme', theme);
    } })); });
