"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStorage = exports.localStorage = exports.storage = void 0;
var Storage = /** @class */ (function () {
    /**
     * Initializes a new instance of the Storage class.
     */
    function Storage() {
        this.db = {};
    }
    /**
     * Sets a key-value pair in storage.
     *
     * @param {string} key - The key to set.
     * @param {T} value - The value to set.
     * @param {Date | number} [expires] - Optional expiry date or time in milliseconds.
     */
    Storage.prototype.set = function (key, value, expires) {
        this.db[key] = {
            created: new Date(),
            value: value,
            expires: expires instanceof Date ? expires.getTime() : expires,
        };
    };
    Storage.prototype.get = function (key, raw) {
        var item = this.db[key];
        if ((item === null || item === void 0 ? void 0 : item.expires) && Date.now() > item.expires) {
            this.delete(key);
            return undefined;
        }
        return raw ? item : item === null || item === void 0 ? void 0 : item.value;
    };
    /**
     * Retrieves all keys set by the `set` method.
     *
     * @returns {string[]} An array of keys.
     */
    Storage.prototype.getAllKeys = function () {
        return Object.keys(this.db);
    };
    /**
     * Deletes a key from the storage.
     *
     * @param key - The key to delete.
     */
    Storage.prototype.delete = function (key) {
        delete this.db[key];
    };
    /**
     * Clears all stored items from storage.
     */
    Storage.prototype.clearAll = function () {
        this.db = {};
    };
    return Storage;
}());
// Export a singleton instance of the Storage class
exports.storage = new Storage();
/**
 * Represents a simplified version of the browser's localStorage.
 */
var LocalStorage = /** @class */ (function () {
    function LocalStorage() {
        this.db = {};
    }
    LocalStorage.prototype.get = function () {
        return this.db;
    };
    return LocalStorage;
}());
// Export singleton instances of LocalStorage and sessionStorage
exports.localStorage = new LocalStorage();
exports.sessionStorage = new LocalStorage();
