import mongoose, { Schema, Document } from "mongoose";

export interface ILessonContent extends Document {
  lessonId: string;
  task: string;
  referenceImageUrl: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  referenceHtml: string;
  referenceCss: string;
  referenceJs: string;
  updatedAt: Date;
}

const LessonContentSchema = new Schema<ILessonContent>(
  {
    lessonId: { type: String, required: true, unique: true },
    task: { type: String, default: "" },
    referenceImageUrl: { type: String, default: "" },
    starterHtml: { type: String, default: "" },
    starterCss: { type: String, default: "" },
    starterJs: { type: String, default: "" },
    referenceHtml: { type: String, default: "" },
    referenceCss: { type: String, default: "" },
    referenceJs: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<ILessonContent>("LessonContent", LessonContentSchema);
