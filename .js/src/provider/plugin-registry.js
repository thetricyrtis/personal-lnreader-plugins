"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pluginModules = import.meta.glob(['/plugins/*/*.ts', '!/plugins/**/*.broken.ts', '!/plugins/multisrc/**'], {
    eager: true,
    import: 'default',
});
var plugins = Object.entries(pluginModules)
    .sort(function (_a, _b) {
    var firstPath = _a[0];
    var secondPath = _b[0];
    return firstPath < secondPath ? -1 : firstPath > secondPath ? 1 : 0;
})
    .map(function (_a) {
    var plugin = _a[1];
    return plugin;
});
exports.default = plugins;
