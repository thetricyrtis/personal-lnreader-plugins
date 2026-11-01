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
exports.PluginStore = void 0;
var plugins_1 = require("@/provider/plugins");
var plugin_registry_1 = __importDefault(require("@/provider/plugin-registry"));
var loadPluginFromURL = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var pluginId = urlParams.get('plugin');
    if (pluginId) {
        var pluginItem = plugin_registry_1.default.find(function (p) { return p.id === pluginId; });
        if (pluginItem) {
            return {
                pluginItem: pluginItem,
                plugin: (0, plugins_1.getPlugin)(pluginItem.id),
            };
        }
    }
    return {};
};
/**
 * @param set State setter for use inside actions
 * @param get State getter for use inside actions, outside of State setter
 */
var PluginStore = function (set) { return (__assign(__assign({}, loadPluginFromURL()), { selectPlugin: function (pluginItem, updateURL) {
        if (updateURL === void 0) { updateURL = true; }
        set(function (state) { return (__assign(__assign({}, state), { pluginItem: pluginItem, plugin: (0, plugins_1.getPlugin)(pluginItem.id) })); });
        if (updateURL) {
            var url = new URL(window.location.href);
            url.searchParams.set('plugin', pluginItem.id);
            window.history.pushState({}, '', url);
        }
    } })); };
exports.PluginStore = PluginStore;
