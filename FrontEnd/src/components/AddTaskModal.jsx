import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTask } from "../slices/taskSlice";
import "./AddTaskModal.css";

const CATEGORIES = ["Coding", "Fitness", "Study", "Health", "Other"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AddTaskModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Coding");
  const [reminderTime, setReminderTime] = useState("");
  const [plannedDays, setPlannedDays] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: false }), {})
  );
  const [error, setError] = useState("");

  const togglePlanned = (day) => {
    setPlannedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    const weeklySchedule = DAYS.map((day) => ({
      day,
      planned: plannedDays[day],
      completed: false,
    }));

    try {
      await dispatch(
        addTask({
          title: title.trim(),
          category,
          weeklySchedule,
          reminderTime: reminderTime || null,
        })
      ).unwrap();

      // Reset & close
      setTitle("");
      setCategory("Coding");
      setReminderTime("");
      setPlannedDays(DAYS.reduce((acc, d) => ({ ...acc, [d]: false }), {}));
      onClose();
    } catch (err) {
      setError(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add New Task</h2>
          <button className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal__form">
          {error && <div className="modal__error">{error}</div>}

          <div className="modal__field">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Practice DSA"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="modal__field">
            <label htmlFor="task-category">Category</label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="modal__field">
            <label>Planned Days</label>
            <div className="modal__days">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`modal__day-btn ${
                    plannedDays[day] ? "modal__day-btn--active" : ""
                  }`}
                  onClick={() => togglePlanned(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="modal__field">
            <label htmlFor="task-reminder">Reminder Time (optional)</label>
            <input
              id="task-reminder"
              type="text"
              placeholder="e.g. 08:30 AM"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>

          <button type="submit" className="modal__submit">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
