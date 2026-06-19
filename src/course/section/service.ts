import mongoose from "mongoose";
import Section from "./entity";
import { ICreateSectionInput } from "../interface";

class SectionService {
  public createSection = async (input: ICreateSectionInput) => {
    const section = new Section(input);
    await section.save();
    return section;
  };

  public findSectionById = async (id: string | mongoose.Types.ObjectId) => {
    return await Section.findById(id);
  };

  public findSectionsByCourse = async (courseId: string | mongoose.Types.ObjectId) => {
    return await Section.find({ courseId }).sort({ order: 1 });
  };

  public updateSection = async (id: string | mongoose.Types.ObjectId, data: Partial<any>) => {
    return await Section.findByIdAndUpdate(id, data, { new: true });
  };

  public deleteSection = async (id: string | mongoose.Types.ObjectId) => {
    return await Section.findByIdAndDelete(id);
  };

  public deleteSectionsByCourse = async (courseId: string | mongoose.Types.ObjectId) => {
    return await Section.deleteMany({ courseId });
  };
}

export const sectionService = new SectionService();
