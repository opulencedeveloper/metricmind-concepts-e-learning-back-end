"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.curriculumItemService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("./entity"));
class CurriculumItemService {
    constructor() {
        this.createCurriculumItem = async (input) => {
            const item = new entity_1.default(input);
            await item.save();
            return item;
        };
        this.findCurriculumItemById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findCurriculumItemsBySection = async (sectionId) => {
            return await entity_1.default.find({ sectionId }).sort({ order: 1 });
        };
        this.updateCurriculumItem = async (id, input) => {
            return await entity_1.default.findByIdAndUpdate(id, input, { new: true });
        };
        this.deleteCurriculumItem = async (id) => {
            return await entity_1.default.findByIdAndDelete(id);
        };
        this.deleteCurriculumItemsBySection = async (sectionId) => {
            return await entity_1.default.deleteMany({ sectionId });
        };
        this.getTotalDurationBySection = async (sectionId) => {
            const result = await entity_1.default.aggregate([
                {
                    $match: {
                        sectionId: new mongoose_1.default.Types.ObjectId(sectionId),
                        videoDuration: { $exists: true, $ne: null },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalDuration: { $sum: "$videoDuration" },
                    },
                },
            ]);
            return result.length > 0 ? result[0].totalDuration : 0;
        };
    }
}
exports.curriculumItemService = new CurriculumItemService();
