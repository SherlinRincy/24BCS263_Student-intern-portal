
import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Remote",
    },
    stipend: {
      type: String,
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Internship", internshipSchema);
