"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFile = exports.fetchProto = exports.fetchText = exports.fetchApi = void 0;
/**
 * Backward compatibility for 3.0.0 - Re-exports from new location
 * TODO: Remove in 4.0.0
 */
var fetch_1 = require("../lib/fetch");
Object.defineProperty(exports, "fetchApi", { enumerable: true, get: function () { return fetch_1.fetchApi; } });
Object.defineProperty(exports, "fetchText", { enumerable: true, get: function () { return fetch_1.fetchText; } });
Object.defineProperty(exports, "fetchProto", { enumerable: true, get: function () { return fetch_1.fetchProto; } });
Object.defineProperty(exports, "fetchFile", { enumerable: true, get: function () { return fetch_1.fetchFile; } });
