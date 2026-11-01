"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelCard = NovelCard;
var react_1 = __importDefault(require("react"));
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var tooltip_1 = require("@/components/ui/tooltip");
function NovelCard(_a) {
    var novel = _a.novel, onParse = _a.onParse;
    var handleCopyPath = function () {
        navigator.clipboard.writeText(novel.path);
        sonner_1.toast.success('Novel path copied!');
    };
    return (react_1.default.createElement("div", { className: "group cursor-pointer flex flex-col h-full" },
        react_1.default.createElement("div", { className: "relative mb-2 overflow-hidden rounded-lg bg-muted aspect-[3/4]" },
            react_1.default.createElement("img", { src: novel.cover || '/static/coverNotAvailable.webp', alt: novel.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" })),
        react_1.default.createElement("div", { className: "flex flex-col flex-1 min-h-0" },
            react_1.default.createElement("h3", { className: "text-sm font-medium text-foreground line-clamp-2 mb-2 leading-tight h-10" }, novel.name),
            react_1.default.createElement("div", { className: "flex gap-1.5 mt-auto" },
                react_1.default.createElement(tooltip_1.Tooltip, null,
                    react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                        react_1.default.createElement(button_1.Button, { variant: "outline", size: "sm", className: "flex-1 h-8 px-2 bg-transparent", onClick: handleCopyPath },
                            react_1.default.createElement(lucide_react_1.Copy, { className: "w-3.5 h-3.5" }))),
                    react_1.default.createElement(tooltip_1.TooltipContent, null,
                        react_1.default.createElement("p", null, "Copy path"))),
                react_1.default.createElement(tooltip_1.Tooltip, null,
                    react_1.default.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                        react_1.default.createElement(button_1.Button, { size: "sm", className: "flex-1 h-8 px-2", onClick: function () { return onParse(novel.path); } },
                            react_1.default.createElement(lucide_react_1.ArrowRight, { className: "w-3.5 h-3.5" }))),
                    react_1.default.createElement(tooltip_1.TooltipContent, null,
                        react_1.default.createElement("p", null, "Parse novel")))))));
}
