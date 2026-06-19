import mongoose, { Schema } from "mongoose";
import { ICurriculumItem } from "../interface";
import { CurriculumItemType } from "../enum";

const curriculumItemSchema: Schema = new Schema(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
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
      enum: Object.values(CurriculumItemType),
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
  },
  { timestamps: true }
);

const CurriculumItem = mongoose.model<ICurriculumItem>("CurriculumItem", curriculumItemSchema);

export default CurriculumItem;
