"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const enum_1 = require("../enum");
const curriculumItemSchema = new mongoose_1.Schema({
    sectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(enum_1.CurriculumItemType),
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    videoDuration: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    resources: {
        type: [
            {
                name: String,
                url: String,
            },
        ],
        required: true,
    },
}, { timestamps: true });
const CurriculumItem = mongoose_1.default.model("CurriculumItem", curriculumItemSchema);
exports.default = CurriculumItem;
