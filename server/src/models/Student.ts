import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  avatar: string;
  joinedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-generate avatar from initials
StudentSchema.pre("save", function (next) {
  if (!this.avatar && this.name) {
    this.avatar = this.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  next();
});

export default mongoose.model<IStudent>("Student", StudentSchema);
