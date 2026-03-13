import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
}

export interface ISubmission extends Document {
  studentId: Types.ObjectId;
  problemId: Types.ObjectId;
  lessonId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  score: number;
  isCorrect: boolean;
  testResults: ITestResult[];
  feedback: string[];
  screenshotUrl: string;
  submittedAt: Date;
  timeSpent: number;
}

const TestResultSchema = new Schema<ITestResult>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    passed: { type: Boolean, required: true },
    message: { type: String, default: "" },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem" },
    lessonId: { type: String, default: "" },
    htmlCode: { type: String, default: "" },
    cssCode: { type: String, default: "" },
    jsCode: { type: String, default: "" },
    score: { type: Number, default: 0, min: 0, max: 100 },
    isCorrect: { type: Boolean, default: false },
    testResults: { type: [TestResultSchema], default: [] },
    feedback: { type: [String], default: [] },
    screenshotUrl: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
