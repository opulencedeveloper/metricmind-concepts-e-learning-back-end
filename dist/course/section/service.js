"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionService = void 0;
const entity_1 = __importDefault(require("./entity"));
class SectionService {
    constructor() {
        this.createSection = async (input) => {
            const section = new entity_1.default(input);
            await section.save();
            return section;
        };
        this.findSectionById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findSectionsByCourse = async (courseId) => {
            return await entity_1.default.find({ courseId }).sort({ order: 1 });
        };
        this.updateSection = async (id, data) => {
            return await entity_1.default.findByIdAndUpdate(id, data, { new: true });
        };
        this.deleteSection = async (id) => {
            return await entity_1.default.findByIdAndDelete(id);
        };
        this.deleteSectionsByCourse = async (courseId) => {
            return await entity_1.default.deleteMany({ courseId });
        };
    }
}
exports.sectionService = new SectionService();
