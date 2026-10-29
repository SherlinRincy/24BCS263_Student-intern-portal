import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email"
      ]
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
      maxlength: 30
    },
    internship: {
      type: String,
      required: [true, "Please select an internship"],
      enum: [
        "Web Development Intern",
        "Data Science Intern",
        "Cloud Computing Intern",
        "Java Developer Intern"
      ]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);