import { useEffect, useState } from "react";

const defaultTasks = [
  { id: 1, title: "Review daily priorities", assignedFrom: "Mark", urgency: "High", dueDate: "", complete: false },
  { id: 2, title: "Follow up on open dealer items", assignedFrom: "Dane", urgency: "Medium", dueDate: "", complete: false },
];

const defaultPriorities = [
  "Keep executive asks routed through EA intake",
  "Prepare weekly priority list",
  "Follow up on outstanding communication items",
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(defaultTasks);
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [newTask, setNewTask] = useState("");
  const [assignedFrom, setAssignedFrom] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    const savedPriorities = localStorage.getItem("weeklyPriorities");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedPriorities) setPriorities(JSON.parse(savedPriorities));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("weeklyPriorities", JSON.stringify(priorities));
  }, [priorities]);

  function addTask() {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask,
      assignedFrom,
      urgency,
      dueDate,
      complete: false,
    };

    setTasks([task, ...tasks]);
    setNewTask("");
    setDueDate("");
    setUrgency("Medium");
    setAssignedFrom("Mark");
  }

  function toggleTask(id) {
    setTasks(tasks.map((task) => task.id === id ? { ...task, complete: !task.complete } : task));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }

  function updatePriority(index, value) {
    const updated = [...priorities];
    updated[index] = value;
    setPriorities(updated);
  }

  function addPriority() {
    setPriorities([...priorities, ""]);
  }

  function deletePriority(index) {
    setPriorities(priorities.filter((_, i) => i !== index));
  }

  const visibleTasks = hideCompleted ? tasks.filter((task) => !task.complete) : tasks;

  return (
    <div className="tasksPage">
      <div className="tasksHeader">
        <div>
          <h1>Tasks</h1>
          <p>One clean place for priorities, delegated items, and follow-ups.</p>
        </div>

        <label className="hideToggle">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={() => setHideCompleted(!hideCompleted)}
          />
          Hide completed
        </label>
      </div>

      <div className="tasksLayout">
        <aside className="prioritySide">
          <div className="sideCard">
            <div className="sectionHeader">
              <div>
                <h2>Weekly Priorities</h2>
                <p>Top focus items</p>
              </div>
              <button onClick={addPriority}>+</button>
            </div>

            <div className="priorityList">
              {priorities.map((priority, index) => (
                <div className="priorityItem" key={index}>
                  <span>{index + 1}</span>
                  <textarea
                    value={priority}
                    onChange={(e) => updatePriority(index, e.target.value)}
                    placeholder="Add priority..."
                  />
                  <button onClick={() => deletePriority(index)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="taskMain">
          <section className="taskCard">
            <h2>Add Task</h2>

            <div className="addTaskGrid">
              <input
                className="taskInput"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTask();
                }}
              />

              <select value={assignedFrom} onChange={(e) => setAssignedFrom(e.target.value)}>
                <option>Mark</option>
                <option>Dane</option>
                <option>Nikita</option>
              </select>

              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

              <button className="addTaskBtn" onClick={addTask}>Add</button>
            </div>
          </section>

          <section className="taskCard">
            <div className="sectionHeader">
              <h2>Task List</h2>
              <span>{visibleTasks.length} items</span>
            </div>

            <div className="taskList">
              {visibleTasks.map((task) => (
                <div className={`taskItem ${task.complete ? "completed" : ""}`} key={task.id}>
                  <div className="taskLeft">
                    <input type="checkbox" checked={task.complete} onChange={() => toggleTask(task.id)} />

                    <div>
                      <div className="taskTitle">{task.title}</div>
                      <div className="taskMeta">
                        <span>From: {task.assignedFrom}</span>
                        {task.dueDate && <span>Due: {task.dueDate}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="taskRight">
                    <span className={`urgencyBadge ${task.urgency.toLowerCase()}`}>
                      {task.urgency}
                    </span>
                    <button onClick={() => deleteTask(task.id)}>×</button>
                  </div>
                </div>
              ))}

              {visibleTasks.length === 0 && (
                <div className="emptyState">No tasks showing.</div>
              )}
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .tasksPage {
          padding: 32px;
          max-width: 1280px;
          margin: 0 auto;
          color: #111;
        }

        .tasksHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.04em;
        }

        h2 {
          margin: 0;
          font-size: 16px;
          letter-spacing: -0.02em;
        }

        p {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .tasksLayout {
          display: grid;
          grid-template-columns: 310px 1fr;
          gap: 20px;
          align-items: start;
        }

        .prioritySide {
          position: sticky;
          top: 24px;
        }

        .sideCard,
        .taskCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
        }

        .taskCard {
          margin-bottom: 18px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }

        .priorityList,
        .taskList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .priorityItem {
          display: grid;
          grid-template-columns: 24px 1fr 30px;
          gap: 8px;
          align-items: start;
          background: #f9fafb;
          border: 1px solid #eeeeee;
          border-radius: 14px;
          padding: 10px;
        }

        .priorityItem span {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        textarea {
          width: 100%;
          resize: vertical;
          min-height: 54px;
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          color: #111;
          font-family: inherit;
          line-height: 1.35;
        }

        .hideToggle {
          font-size: 13px;
          color: #555;
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }

        .addTaskGrid {
          display: grid;
          grid-template-columns: 1fr 130px 130px 150px 80px;
          gap: 10px;
          margin-top: 14px;
        }

        input,
        select {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px;
          padding: 11px 12px;
          font-size: 14px;
          outline: none;
          color: #111;
        }

        button {
          border: none;
          background: #111;
          color: #fff;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        button:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        .priorityItem button,
        .taskRight button {
          background: #f3f4f6;
          color: #111;
          width: 30px;
          height: 30px;
          padding: 0;
        }

        .taskItem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: #f9fafb;
          border: 1px solid #eeeeee;
          border-radius: 14px;
          padding: 14px;
        }

        .taskItem.completed {
          opacity: 0.55;
        }

        .taskItem.completed .taskTitle {
          text-decoration: line-through;
        }

        .taskLeft {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .taskTitle {
          font-size: 14px;
          font-weight: 600;
        }

        .taskMeta {
          display: flex;
          gap: 12px;
          margin-top: 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .taskRight {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .urgencyBadge {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 600;
        }

        .urgencyBadge.high {
          background: #fee2e2;
          color: #991b1b;
        }

        .urgencyBadge.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .urgencyBadge.low {
          background: #dcfce7;
          color: #166534;
        }

        .emptyState {
          padding: 24px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }

        @media (max-width: 1000px) {
          .tasksLayout {
            grid-template-columns: 1fr;
          }

          .prioritySide {
            position: static;
          }

          .addTaskGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
