import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleDay,
  deleteTask,
  getMonthlyReport,
  createTaskValidation,
  updateTaskValidation,
  toggleDayValidation,
} from "../controllers/taskController.js";

const router = Router();

// All task routes are protected — user must be logged in
router.use(protect);

// Report route MUST be defined before /:id to avoid "report" being treated as an ID
router.get("/report/monthly", getMonthlyReport);

// Standard CRUD
router.route("/").get(getTasks).post(createTaskValidation, createTask);

router
  .route("/:id")
  .get(getTaskById)
  .put(updateTaskValidation, updateTask)
  .delete(deleteTask);

// Toggle a specific day's completion
router.patch("/:id/toggle/:day", toggleDayValidation, toggleDay);

export default router;
