import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

/** Represents one day in the weekly planner grid */
const dayEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      required: true,
    },
    planned: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/** A single historical completion record (used for reports) */
const completionEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Task Schema
// ---------------------------------------------------------------------------

const CATEGORIES = ["Coding", "Fitness", "Study", "Health", "Other"];

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
      default: "Other",
    },
    weeklySchedule: {
      type: [dayEntrySchema],
      default: () => [
        { day: "Sun", planned: false, completed: false },
        { day: "Mon", planned: false, completed: false },
        { day: "Tue", planned: false, completed: false },
        { day: "Wed", planned: false, completed: false },
        { day: "Thu", planned: false, completed: false },
        { day: "Fri", planned: false, completed: false },
        { day: "Sat", planned: false, completed: false },
      ],
      validate: {
        validator: (arr) => arr.length === 7,
        message: "weeklySchedule must have exactly 7 entries",
      },
    },
    completionLog: {
      type: [completionEntrySchema],
      default: [],
    },
    reminderTime: {
      type: String,
      default: null,
      match: [
        /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i,
        'reminderTime must be in "HH:MM AM/PM" format',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user-specific queries
taskSchema.index({ userId: 1, isActive: 1 });

const Task = mongoose.model("Task", taskSchema);

export { CATEGORIES };
export default Task;
