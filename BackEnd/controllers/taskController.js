import { validationResult, body, param } from "express-validator";
import Task, { CATEGORIES } from "../models/Task.js";

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

export const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("category")
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("reminderTime")
    .optional({ nullable: true })
    .matches(/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i)
    .withMessage('reminderTime must be in "HH:MM AM/PM" format'),
  body("weeklySchedule")
    .optional()
    .isArray({ min: 7, max: 7 })
    .withMessage("weeklySchedule must have exactly 7 entries"),
];

export const updateTaskValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("category")
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("reminderTime")
    .optional({ nullable: true })
    .matches(/^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i)
    .withMessage('reminderTime must be in "HH:MM AM/PM" format'),
];

export const toggleDayValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  param("day")
    .isIn(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
    .withMessage("Day must be one of: Sun, Mon, Tue, Wed, Thu, Fri, Sat"),
];

// ---------------------------------------------------------------------------
// Helper: check validation and return early if errors
// ---------------------------------------------------------------------------
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(", ")));
  }
  return null;
};

// ---------------------------------------------------------------------------
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
// ---------------------------------------------------------------------------
export const createTask = async (req, res, next) => {
  try {
    if (checkValidation(req, res, next)) return;

    const { title, category, weeklySchedule, reminderTime } = req.body;

    const task = await Task.create({
      userId: req.user._id,
      title,
      category,
      weeklySchedule,
      reminderTime,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Get all tasks for the authenticated user
// @route   GET /api/tasks
// @access  Private
// ---------------------------------------------------------------------------
export const getTasks = async (req, res, next) => {
  try {
    const { category, active } = req.query;

    // Build dynamic filter
    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === "true";

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
// ---------------------------------------------------------------------------
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      res.status(404);
      return next(new Error("Task not found"));
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Update a task (title, category, schedule, reminder, isActive)
// @route   PUT /api/tasks/:id
// @access  Private
// ---------------------------------------------------------------------------
export const updateTask = async (req, res, next) => {
  try {
    if (checkValidation(req, res, next)) return;

    const allowedFields = [
      "title",
      "category",
      "weeklySchedule",
      "reminderTime",
      "isActive",
    ];

    // Build update object from allowed fields only
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404);
      return next(new Error("Task not found"));
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Toggle a specific day's completion status & log it
// @route   PATCH /api/tasks/:id/toggle/:day
// @access  Private
// ---------------------------------------------------------------------------
export const toggleDay = async (req, res, next) => {
  try {
    if (checkValidation(req, res, next)) return;

    const { id, day } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      res.status(404);
      return next(new Error("Task not found"));
    }

    // Find the matching day entry in weeklySchedule
    const dayEntry = task.weeklySchedule.find((d) => d.day === day);
    if (!dayEntry) {
      res.status(400);
      return next(new Error(`Day "${day}" not found in schedule`));
    }

    // Toggle completion
    dayEntry.completed = !dayEntry.completed;

    // Append to completionLog for historical tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a log entry for today + this day
    const existingLogIndex = task.completionLog.findIndex((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (existingLogIndex > -1) {
      // Update existing entry
      task.completionLog[existingLogIndex].completed = dayEntry.completed;
    } else {
      // Add new entry
      task.completionLog.push({
        date: today,
        completed: dayEntry.completed,
      });
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
// ---------------------------------------------------------------------------
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      res.status(404);
      return next(new Error("Task not found"));
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// @desc    Get monthly report — aggregated data for Recharts (Pie + Bar)
// @route   GET /api/tasks/report/monthly
// @access  Private
// ---------------------------------------------------------------------------
export const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all active tasks for the user
    const tasks = await Task.find({ userId, isActive: true });

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          pieChart: [],
          barChart: [],
          summary: {
            totalTasks: 0,
            overallCompletionRate: 0,
            bestCategory: null,
          },
        },
      });
    }

    // -----------------------------------------------------------------------
    // 1. PIE CHART — Category distribution (% of tasks per category)
    // -----------------------------------------------------------------------
    const categoryCounts = {};
    tasks.forEach((task) => {
      const cat = task.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const pieChart = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      value: Math.round((count / tasks.length) * 100),
      count,
    }));

    // -----------------------------------------------------------------------
    // 2. BAR CHART — Weekly completion rates over the last 4 weeks
    // -----------------------------------------------------------------------
    // Collect all completion log entries from the last 30 days across all tasks
    const recentLogs = [];
    tasks.forEach((task) => {
      task.completionLog.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate >= thirtyDaysAgo) {
          recentLogs.push({
            date: entryDate,
            completed: entry.completed,
          });
        }
      });
    });

    // Bucket into 4 weeks (Week 1 = most recent)
    const weeks = [
      { label: "Week 4", completed: 0, total: 0 },
      { label: "Week 3", completed: 0, total: 0 },
      { label: "Week 2", completed: 0, total: 0 },
      { label: "Week 1", completed: 0, total: 0 },
    ];

    const now = new Date();
    recentLogs.forEach((log) => {
      const daysAgo = Math.floor(
        (now.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      const weekIndex = Math.min(Math.floor(daysAgo / 7), 3); // 0-3
      weeks[3 - weekIndex].total += 1;
      if (log.completed) {
        weeks[3 - weekIndex].completed += 1;
      }
    });

    const barChart = weeks.map((week) => ({
      week: week.label,
      completionRate:
        week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0,
      completed: week.completed,
      total: week.total,
    }));

    // -----------------------------------------------------------------------
    // 3. SUMMARY
    // -----------------------------------------------------------------------
    const totalCompleted = recentLogs.filter((l) => l.completed).length;
    const totalEntries = recentLogs.length;
    const overallCompletionRate =
      totalEntries > 0 ? Math.round((totalCompleted / totalEntries) * 100) : 0;

    // Find best performing category (highest completion rate)
    const categoryPerformance = {};
    tasks.forEach((task) => {
      const cat = task.category || "Other";
      if (!categoryPerformance[cat]) {
        categoryPerformance[cat] = { completed: 0, total: 0 };
      }
      task.completionLog.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate >= thirtyDaysAgo) {
          categoryPerformance[cat].total += 1;
          if (entry.completed) {
            categoryPerformance[cat].completed += 1;
          }
        }
      });
    });

    let bestCategory = null;
    let bestRate = -1;
    for (const [cat, perf] of Object.entries(categoryPerformance)) {
      const rate =
        perf.total > 0 ? Math.round((perf.completed / perf.total) * 100) : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestCategory = cat;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        pieChart,
        barChart,
        summary: {
          totalTasks: tasks.length,
          overallCompletionRate,
          bestCategory,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
