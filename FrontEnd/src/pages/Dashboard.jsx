import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, toggleTaskDay, removeTask } from "../slices/taskSlice";
import AddTaskModal from "../components/AddTaskModal";
import "./Dashboard.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleToggleDay = (taskId, day) => {
    dispatch(toggleTaskDay({ id: taskId, day }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(removeTask(id));
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Weekly Goals</h1>
          <p className="dashboard__subtitle">Track your consistency across the week</p>
        </div>
        <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>
          <span className="plus">+</span> Add New Task
        </button>
      </header>

      {loading && items.length === 0 ? (
        <div className="loader">Loading tasks...</div>
      ) : (
        <div className="task-grid-container">
          <table className="task-table">
            <thead>
              <tr>
                <th className="task-table__col-title">Task Name</th>
                <th className="task-table__col-cat">Category</th>
                {DAYS.map((day) => (
                  <th key={day} className="task-table__col-day">{day}</th>
                ))}
                <th className="task-table__col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((task) => (
                <tr key={task._id}>
                  <td className="task-name">
                    <div className="task-name__content">
                      <span className="task-name__text">{task.title}</span>
                      {task.reminderTime && (
                        <span className="task-name__reminder">🔔 {task.reminderTime}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge category-badge--${task.category.toLowerCase()}`}>
                      {task.category}
                    </span>
                  </td>
                  {DAYS.map((day) => {
                    const dayData = task.weeklySchedule.find((d) => d.day === day);
                    const isPlanned = dayData?.planned;
                    const isCompleted = dayData?.completed;

                    return (
                      <td key={day} className="task-check-cell">
                        {isPlanned ? (
                          <div 
                            className={`checkbox ${isCompleted ? "checkbox--checked" : ""}`}
                            onClick={() => handleToggleDay(task._id, day)}
                          >
                            {isCompleted && "✓"}
                          </div>
                        ) : (
                          <div className="checkbox--disabled"></div>
                        )}
                      </td>
                    );
                  })}
                  <td className="task-actions">
                    <button className="delete-btn" onClick={() => handleDelete(task._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {items.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📝</div>
              <h3>No tasks yet</h3>
              <p>Click "Add New Task" to start building your habits.</p>
            </div>
          )}
        </div>
      )}

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
