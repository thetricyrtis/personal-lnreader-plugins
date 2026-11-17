"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrlAbsolute = void 0;
exports.cn = cn;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
/**
 * Merges Tailwind CSS classes with clsx
 */
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
/**
 * Checks if a URL is absolute
 */
var isUrlAbsolute = function (url) {
    if (url) {
        if (url.indexOf('//') === 0) {
            return true;
        } // URL is protocol-relative (= absolute)
        if (url.indexOf('://') === -1) {
            return false;
        } // URL has no protocol (= relative)
        if (url.indexOf('.') === -1) {
            return false;
        } // URL does not contain a dot, i.e. no TLD (= relative, possibly REST)
        if (url.indexOf('/') === -1) {
            return false;
        } // URL does not contain a single slash (= relative)
        if (url.indexOf(':') > url.indexOf('/')) {
            return false;
        } // The first colon comes after the first slash (= relative)
        if (url.indexOf('://') < url.indexOf('.')) {
            return true;
        } // Protocol is defined before first dot (= absolute)
    }
    return false; // Anything else must be relative
};
exports.isUrlAbsolute = isUrlAbsolute;
