"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStorage = exports.localStorage = exports.storage = void 0;
/**
 * Backward compatibility for 3.0.0 - Re-exports from new location
 * TODO: Remove in 4.0.0
 */
var storage_1 = require("../lib/storage");
Object.defineProperty(exports, "storage", { enumerable: true, get: function () { return storage_1.storage; } });
Object.defineProperty(exports, "localStorage", { enumerable: true, get: function () { return storage_1.localStorage; } });
Object.defineProperty(exports, "sessionStorage", { enumerable: true, get: function () { return storage_1.sessionStorage; } });
