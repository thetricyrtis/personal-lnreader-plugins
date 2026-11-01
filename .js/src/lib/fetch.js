"use strict";
/* global Buffer, RequestInit */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProto = exports.fetchText = exports.fetchFile = void 0;
exports.fetchApi = fetchApi;
var protobufjs_1 = require("protobufjs");
var makeInit = function (init) { return __awaiter(void 0, void 0, void 0, function () {
    var defaultHeaders, _i, _a, _b, name_1, value;
    return __generator(this, function (_c) {
        defaultHeaders = {
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'Accept-Language': '*',
            'Sec-Fetch-Mode': 'cors',
            'Accept-Encoding': 'gzip, deflate',
        };
        if (init === null || init === void 0 ? void 0 : init.headers) {
            if (init.headers instanceof Headers) {
                for (_i = 0, _a = Object.entries(defaultHeaders); _i < _a.length; _i++) {
                    _b = _a[_i], name_1 = _b[0], value = _b[1];
                    if (!init.headers.get(name_1))
                        init.headers.set(name_1, value);
                }
            }
            else {
                init.headers = __assign(__assign({}, defaultHeaders), init.headers);
            }
        }
        else {
            init = __assign(__assign({}, init), { headers: defaultHeaders });
        }
        return [2 /*return*/, init];
    });
}); };
/**
 * Fetch with (Android) User Agent
 * @param url
 * @param init
 * @returns response as normal fetch
 */
function fetchApi(url, init) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeInit(init)];
                case 1:
                    init = _a.sent();
                    console.log(url, init);
                    return [4 /*yield*/, fetch(url, init)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 *
 * @param url
 * @param init
 * @returns base64 string of file
 * @example fetchFile('https://avatars.githubusercontent.com/u/81222734?s=48&v=4');
 */
var fetchFile = function (url, init) {
    return __awaiter(this, void 0, void 0, function () {
        var res, arrayBuffer, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeInit(init)];
                case 1:
                    init = _a.sent();
                    console.log(url, init);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url, init)];
                case 3:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, ''];
                    return [4 /*yield*/, res.arrayBuffer()];
                case 4:
                    arrayBuffer = _a.sent();
                    return [2 /*return*/, Buffer.from(arrayBuffer).toString('base64')];
                case 5:
                    e_1 = _a.sent();
                    return [2 /*return*/, ''];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.fetchFile = fetchFile;
/**
 *
 * @param url
 * @param init
 * @param encoding default: `utf-8`. link: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/encoding
 * @returns plain text
 * @example fetchText('https://github.com/LNReader/lnreader', {}, 'gbk');
 */
var fetchText = function (url, init, encoding) {
    return __awaiter(this, void 0, void 0, function () {
        var res, arrayBuffer, decoder, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, makeInit(init)];
                case 1:
                    init = _a.sent();
                    console.log(url, init);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url, init)];
                case 3:
                    res = _a.sent();
                    if (!res.ok)
                        return [2 /*return*/, ''];
                    return [4 /*yield*/, res.arrayBuffer()];
                case 4:
                    arrayBuffer = _a.sent();
                    decoder = new TextDecoder(encoding);
                    return [2 /*return*/, decoder.decode(arrayBuffer)];
                case 5:
                    e_2 = _a.sent();
                    return [2 /*return*/, ''];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.fetchText = fetchText;
var BYTE_MARK = BigInt((1 << 8) - 1);
var fetchProto = function (protoInit, url, init) {
    return __awaiter(this, void 0, void 0, function () {
        var protoRoot, RequestMessge, encodedrequest, requestLength, headers, bodyArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    protoRoot = (0, protobufjs_1.parse)(protoInit.proto).root;
                    RequestMessge = protoRoot.lookupType(protoInit.requestType);
                    if (RequestMessge.verify(protoInit.requestData || {})) {
                        throw new Error('Invalid Proto');
                    }
                    encodedrequest = RequestMessge.encode(protoInit.requestData || {}).finish();
                    requestLength = BigInt(encodedrequest.length);
                    headers = new Uint8Array(Array(5)
                        .fill(0)
                        .map(function (v, idx) {
                        if (idx === 0)
                            return 0;
                        return Number((requestLength >> BigInt(8 * (5 - idx - 1))) & BYTE_MARK);
                    }));
                    return [4 /*yield*/, makeInit(init)];
                case 1:
                    init = _a.sent();
                    bodyArray = new Uint8Array(headers.length + encodedrequest.length);
                    bodyArray.set(headers, 0);
                    bodyArray.set(encodedrequest, headers.length);
                    return [2 /*return*/, fetch(url, __assign(__assign({ method: 'POST' }, init), { body: bodyArray }))
                            .then(function (r) { return r.arrayBuffer(); })
                            .then(function (arr) {
                            // decode response data
                            var payload = new Uint8Array(arr);
                            var length = Number(BigInt(payload[1] << 24) |
                                BigInt(payload[2] << 16) |
                                BigInt(payload[3] << 8) |
                                BigInt(payload[4]));
                            var ResponseMessage = protoRoot.lookupType(protoInit.responseType);
                            return ResponseMessage.decode(payload.slice(5, 5 + length));
                        })];
            }
        });
    });
};
exports.fetchProto = fetchProto;
