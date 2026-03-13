import mongoose, { Schema, Document } from "mongoose";

export type Topic = "HTML" | "CSS" | "JavaScript";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface IProblem extends Document {
  title: string;
  description: string;
  topic: Topic;
  difficulty: Difficulty;
  expectedOutput: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  referenceHtml: string;
  referenceCss: string;
  referenceJs: string;
  referenceImageUrl: string;
  createdAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    topic: { type: String, enum: ["HTML", "CSS", "JavaScript"], required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    expectedOutput: { type: String, default: "" },
    starterHtml: { type: String, default: "" },
    starterCss: { type: String, default: "" },
    starterJs: { type: String, default: "" },
    referenceHtml: { type: String, default: "" },
    referenceCss: { type: String, default: "" },
    referenceJs: { type: String, default: "" },
    referenceImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IProblem>("Problem", ProblemSchema);
