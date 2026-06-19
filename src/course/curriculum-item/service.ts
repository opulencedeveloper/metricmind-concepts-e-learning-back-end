import mongoose from "mongoose";
import CurriculumItem from "./entity";
import { ICreateCurriculumItemInput, IUpdateCurriculumItemInput } from "../interface";

class CurriculumItemService {
  public createCurriculumItem = async (input: ICreateCurriculumItemInput) => {
    const item = new CurriculumItem(input);
    await item.save();
    return item;
  };

  public findCurriculumItemById = async (id: string | mongoose.Types.ObjectId) => {
    return await CurriculumItem.findById(id);
  };

  public findCurriculumItemsBySection = async (sectionId: string | mongoose.Types.ObjectId) => {
    return await CurriculumItem.find({ sectionId }).sort({ order: 1 });
  };

  public updateCurriculumItem = async (
    id: string | mongoose.Types.ObjectId,
    input: IUpdateCurriculumItemInput
  ) => {
    return await CurriculumItem.findByIdAndUpdate(id, input, { new: true });
  };

  public deleteCurriculumItem = async (id: string | mongoose.Types.ObjectId) => {
    return await CurriculumItem.findByIdAndDelete(id);
  };

  public deleteCurriculumItemsBySection = async (sectionId: string | mongoose.Types.ObjectId) => {
    return await CurriculumItem.deleteMany({ sectionId });
  };

  public getTotalDurationBySection = async (sectionId: string | mongoose.Types.ObjectId) => {
    const result = await CurriculumItem.aggregate([
      {
        $match: {
          sectionId: new mongoose.Types.ObjectId(sectionId as string),
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

export const curriculumItemService = new CurriculumItemService();
