"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlugin = exports.searchPlugins = void 0;
var plugin_registry_1 = __importDefault(require("@/provider/plugin-registry"));
var searchPlugins = function (keyword) {
    return plugin_registry_1.default.filter(function (f) {
        return f.name.toLowerCase().includes(keyword.toLowerCase()) ||
            f.id.toLowerCase().includes(keyword.toLowerCase());
    });
};
exports.searchPlugins = searchPlugins;
var getPlugin = function (id) { return plugin_registry_1.default.find(function (f) { return f.id === id; }); };
exports.getPlugin = getPlugin;
