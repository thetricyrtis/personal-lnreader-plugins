"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMode = void 0;
var FetchMode;
(function (FetchMode) {
    FetchMode[FetchMode["PROXY"] = 0] = "PROXY";
    FetchMode[FetchMode["NODE_FETCH"] = 1] = "NODE_FETCH";
    FetchMode[FetchMode["CURL"] = 2] = "CURL";
})(FetchMode || (exports.FetchMode = FetchMode = {}));
