import { useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [hideCompleted, setHideCompleted] = useState(false);

  const [habits, setHabits] = useState([
    { name: "Wake up", done: false, streak: 3 },
    { name: "Workout", done: false, streak: 5 },
    { name: "Read", done: false, streak: 2 },
  ]);

  function addTask() {
    if (!taskInput) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: taskInput,
        priority,
        done: false,
      },
    ]);

    setTaskInput("");
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function toggleHabit(index) {
    const updated = [...habits];
    updated[index].done = !updated[index].done;

    if (updated[index].done) {
      updated[index].streak += 1;
    } else {
      updated[index].streak = Math.max(0, updated[index].streak - 1);
    }

    setHabits(updated);
  }

  const openTasks = tasks.filter((t) => !t.done).length;
  const completedTasks = tasks.filter((t) => t.done).length;

  const filteredTasks = hideCompleted
    ? tasks.filter((t) => !t.done)
    : tasks;

  const progress =
    habits.filter((h) => h.done).length / habits.length * 100;

  return (
    <div className="container">
      <h1>Daily OS</h1>
      <p className="sub">Focused execution for today</p>

      <div className="top-bar">
        <div className="stats">
          <div className="card">
            <span>Open Tasks</span>
            <h2>{openTasks}</h2>
          </div>
          <div className="card">
            <span>Completed</span>
            <h2>{completedTasks}</h2>
          </div>
        </div>

        <button
          className="toggle-btn"
          onClick={() => setHideCompleted(!hideCompleted)}
        >
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      <div className="layout">
        {/* HABITS */}
        <div className="habits">
          <h3>Daily Habits</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {habits.map((h, i) => (
            <div key={i} className="habit">
              <label>
                <input
                  type="checkbox"
                  checked={h.done}
                  onChange={() => toggleHabit(i)}
                />
                {h.name}
              </label>
              <span className="streak">🔥 {h.streak}</span>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div className="tasks">
          <div className="task-input">
            <input
              placeholder="Add task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />

            <select onChange={(e) => setPriority(e.target.value)}>
              <option>High</option>
              <option selected>Medium</option>
              <option>Low</option>
            </select>

            <button onClick={addTask}>Add</button>
          </div>

          {filteredTasks.map((t) => (
            <div key={t.id} className="task">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTask(t.id)}
              />

              <span className={t.done ? "done" : ""}>
                {t.text}
              </span>

              <span className={`badge ${t.priority.toLowerCase()}`}>
                {t.priority}
              </span>

              <button onClick={() => deleteTask(t.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 40px;
          font-family: Inter, sans-serif;
          background: #f7f8fa;
          min-height: 100vh;
        }

        h1 {
          font-size: 28px;
          margin-bottom: 5px;
        }

        .sub {
          color: #777;
          margin-bottom: 25px;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats {
          display: flex;
          gap: 20px;
        }

        .card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .toggle-btn {
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
        }

        .layout {
          display: flex;
          gap: 20px;
          margin-top: 25px;
        }

        .habits {
          width: 250px;
          background: white;
          padding: 20px;
          border-radius: 12px;
        }

        .habit {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 14px;
        }

        .streak {
          color: orange;
        }

        .progress-bar {
          height: 6px;
          background: #eee;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .progress-fill {
          height: 100%;
          background: black;
          border-radius: 4px;
        }

        .tasks {
          flex: 1;
          background: white;
          padding: 20px;
          border-radius: 12px;
        }

        .task-input {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .task {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .done {
          text-decoration: line-through;
          color: #aaa;
        }

        .badge {
          margin-left: auto;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
        }

        .high {
          background: #ffe5e5;
          color: red;
        }

        .medium {
          background: #fff4e5;
          color: orange;
        }

        .low {
          background: #e5f6ff;
          color: blue;
        }

        button {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
