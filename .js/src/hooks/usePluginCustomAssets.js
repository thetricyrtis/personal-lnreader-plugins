"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePluginCustomAssets = usePluginCustomAssets;
var react_1 = require("react");
/**
 * Custom hook to load and manage plugin custom CSS and JS assets
 * @param plugin - The current plugin instance
 * @param chapterText - The loaded chapter text (triggers asset loading)
 * @returns Object containing loading states for CSS and JS
 */
function usePluginCustomAssets(plugin, chapterText) {
    var _a = (0, react_1.useState)(false), customCSSLoaded = _a[0], setCustomCSSLoaded = _a[1];
    var _b = (0, react_1.useState)(false), customJSLoaded = _b[0], setCustomJSLoaded = _b[1];
    var _c = (0, react_1.useState)(false), customCSSError = _c[0], setCustomCSSError = _c[1];
    var _d = (0, react_1.useState)(false), customJSError = _d[0], setCustomJSError = _d[1];
    var customStyleRef = (0, react_1.useRef)(null);
    var customScriptRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Clean up previous custom styles
        if (customStyleRef.current) {
            customStyleRef.current.remove();
            customStyleRef.current = null;
        }
        setCustomCSSLoaded(false);
        setCustomCSSError(false);
        if ((plugin === null || plugin === void 0 ? void 0 : plugin.customCSS) && chapterText) {
            var styleElement_1 = document.createElement('style');
            styleElement_1.id = 'plugin-custom-css';
            fetch("/public/static/".concat(plugin.customCSS))
                .then(function (response) { return response.text(); })
                .then(function (cssContent) {
                styleElement_1.textContent = cssContent;
                document.head.appendChild(styleElement_1);
                customStyleRef.current = styleElement_1;
                setCustomCSSLoaded(true);
            })
                .catch(function (error) {
                console.error('Error loading custom CSS:', error);
                setCustomCSSError(true);
            });
        }
        return function () {
            if (customStyleRef.current) {
                customStyleRef.current.remove();
                customStyleRef.current = null;
            }
        };
    }, [plugin === null || plugin === void 0 ? void 0 : plugin.customCSS, chapterText]);
    (0, react_1.useEffect)(function () {
        if (customScriptRef.current) {
            customScriptRef.current.remove();
            customScriptRef.current = null;
        }
        setCustomJSLoaded(false);
        setCustomJSError(false);
        if ((plugin === null || plugin === void 0 ? void 0 : plugin.customJS) && chapterText) {
            var scriptElement = document.createElement('script');
            scriptElement.id = 'plugin-custom-js';
            scriptElement.src = "/public/static/".concat(plugin.customJS);
            scriptElement.onload = function () {
                console.log('Custom JS loaded successfully');
                setCustomJSLoaded(true);
            };
            scriptElement.onerror = function (error) {
                console.error('Error loading custom JS:', error);
                setCustomJSError(true);
            };
            document.head.appendChild(scriptElement);
            customScriptRef.current = scriptElement;
        }
        return function () {
            if (customScriptRef.current) {
                customScriptRef.current.remove();
                customScriptRef.current = null;
            }
        };
    }, [plugin === null || plugin === void 0 ? void 0 : plugin.customJS, chapterText]);
    return {
        customCSSLoaded: customCSSLoaded,
        customJSLoaded: customJSLoaded,
        customCSSError: customCSSError,
        customJSError: customJSError,
    };
}
