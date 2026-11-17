"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gcm = void 0;
/**
 * Backward compatibility for 3.0.0 - Re-exports from new location
 * TODO: Remove in 4.0.0
 */
var aes_1 = require("../lib/aes");
Object.defineProperty(exports, "gcm", { enumerable: true, get: function () { return aes_1.gcm; } });
