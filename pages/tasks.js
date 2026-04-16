import { useEffect, useMemo, useState } from "react";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPrettyDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shiftDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function makeDefaultHabits() {
  return [
    { name: "Pray", done: false },
    { name: "Read", done: false },
    { name: "Run", done: false },
  ];
}

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const [tasksByDate, setTasksByDate] = useState({});
  const [habitsByDate, setHabitsByDate] = useState({});

  const [taskText, setTaskText] = useState("");
  const [person, setPerson] = useState("Mark");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const weeklyPriorities = useMemo(
    () => ["Win the week", "Stay disciplined", "Stay focused"],
    []
  );

  useEffect(() => {
    const savedTasks = localStorage.getItem("daily-os-tasks-by-date");
    const savedHabits = localStorage.getItem("daily-os-habits-by-date");

    if (savedTasks) {
      try {
        setTasksByDate(JSON.parse(savedTasks));
      } catch {}
    }

    if (savedHabits) {
      try {
        setHabitsByDate(JSON.parse(savedHabits));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("daily-os-tasks-by-date", JSON.stringify(tasksByDate));
  }, [tasksByDate]);

  useEffect(() => {
    localStorage.setItem("daily-os-habits-by-date", JSON.stringify(habitsByDate));
  }, [habitsByDate]);

  useEffect(() => {
    if (!habitsByDate[dateKey]) {
      setHabitsByDate((prev) => ({
        ...prev,
        [dateKey]: makeDefaultHabits(),
      }));
    }
  }, [dateKey, habitsByDate]);

  const tasks = tasksByDate[dateKey] || [];
  const habits = habitsByDate[dateKey] || makeDefaultHabits();

  const openCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;
  const completedHabits = habits.filter((h) => h.done).length;
  const habitProgress = habits.length
    ? Math.round((completedHabits / habits.length) * 100)
    : 0;

  const recentDays = Object.keys(tasksByDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 7);

  const visibleTasks = tasks.filter((t) => (hideCompleted ? !t.done : true));

  function addTask() {
    if (!taskText.trim()) return;

    const nextTasks = [
      ...tasks,
      {
        id: Date.now(),
        text: taskText.trim(),
        person,
        priority,
        dueDate: dueDate || "",
        done: false,
      },
    ];

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: nextTasks,
    }));

    setTaskText("");
    setPriority("Medium");
    setPerson("Mark");
    setDueDate("");
  }

  function toggleTask(index) {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));
  }

  function toggleHabit(index) {
    const updated = [...habits];
    updated[index].done = !updated[index].done;

    setHabitsByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDrop(dropIndex) {
    if (dragIndex === null) return;

    const updated = [...tasks];
    const draggedItem = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setTasksByDate((prev) => ({
      ...prev,
      [dateKey]: updated,
    }));

    setDragIndex(null);
  }

  function handleDatePick(dayKey) {
    setSelectedDate(new Date(`${dayKey}T12:00:00`));
  }

  function getPriorityStyle(value) {
    if (value === "High") {
      return {
        background: "#FEE2E2",
        color: "#B91C1C",
      };
    }
    if (value === "Low") {
      return {
        background: "#E0F2FE",
        color: "#0369A1",
      };
    }
    return {
      background: "#FEF3C7",
      color: "#B45309",
    };
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Daily page</div>
          <h1 style={styles.title}>Focused execution for today</h1>
        </div>
      </div>

      <div style={styles.topRow}>
        <div style={styles.selectedDayCard}>
          <div style={styles.cardLabel}>SELECTED DAY</div>
          <div style={styles.dateRow}>
            <button
              style={styles.dateNavButton}
              onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
            >
              ←
            </button>

            <div style={styles.dateText}>{formatPrettyDate(selectedDate)}</div>

            <button
              style={styles.dateNavButton}
              onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
            >
              →
            </button>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.cardLabel}>OPEN TASKS</div>
          <div style={styles.statNumber}>{openCount}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.cardLabel}>COMPLETED</div>
          <div style={styles.statNumber}>{completedCount}</div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.leftPanel}>
          <div style={styles.panelSection}>
            <div style={styles.sectionLabel}>DAILY HABITS</div>

            <div style={styles.progressWrap}>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${habitProgress}%`,
                  }}
                />
              </div>
              <div style={styles.progressText}>
                {completedHabits}/{habits.length} completed
              </div>
            </div>

            {habits.map((habit, i) => (
              <div
                key={habit.name}
                style={{
                  ...styles.habitItem,
                  opacity: habit.done ? 0.55 : 1,
                  textDecoration: habit.done ? "line-through" : "none",
                }}
                onClick={() => toggleHabit(i)}
              >
                <span>{habit.name}</span>
                <span style={styles.checkMark}>{habit.done ? "✓" : ""}</span>
              </div>
            ))}
          </div>

          <div style={styles.panelSection}>
            <div style={styles.sectionLabel}>WEEKLY PRIORITIES</div>
            {weeklyPriorities.map((item) => (
              <div key={item} style={styles.priorityBlock}>
                {item}
              </div>
            ))}
          </div>

          <div style={styles.panelSection}>
            <div style={styles.sectionLabel}>RECENT DAYS</div>
            {recentDays.length === 0 ? (
              <div style={styles.recentDayMuted}>No saved days yet</div>
            ) : (
              recentDays.map((day) => (
                <div
                  key={day}
                  style={{
                    ...styles.recentDay,
                    background: day === dateKey ? "#E9EEF9" : "#F2F4F7",
                    border: day === dateKey ? "1px solid #D7E1F5" : "1px solid transparent",
                  }}
                  onClick={() => handleDatePick(day)}
                >
                  {day}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.toolbar}>
            <div style={styles.sectionLabel}>DAILY TASKS</div>

            <button
              onClick={() => setHideCompleted((v) => !v)}
              style={styles.hideCompletedButton}
            >
              {hideCompleted ? "Show Completed" : "Hide Completed"}
            </button>
          </div>

          <div style={styles.inputShell}>
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="Add task..."
              style={styles.taskInput}
            />

            <select
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              style={styles.select}
            >
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={styles.dateInput}
            />

            <button onClick={addTask} style={styles.addButton}>
              Add task
            </button>
          </div>

          <div style={styles.taskList}>
            {visibleTasks.length === 0 ? (
              <div style={styles.emptyState}>No tasks for this day yet.</div>
            ) : (
              visibleTasks.map((task, i) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  style={{
                    ...styles.taskRow,
                    opacity: task.done ? 0.45 : 1,
                  }}
                >
                  <div
                    style={{
                      ...styles.taskName,
                      textDecoration: task.done ? "line-through" : "none",
                    }}
                    onClick={() => {
                      const originalIndex = tasks.findIndex((t) => t.id === task.id);
                      if (originalIndex !== -1) toggleTask(originalIndex);
                    }}
                  >
                    {task.text}
                  </div>

                  <div style={styles.taskMeta}>
                    <span
                      style={{
                        ...styles.priorityPill,
                        ...getPriorityStyle(task.priority),
                      }}
                    >
                      {task.priority}
                    </span>

                    {task.dueDate ? (
                      <span style={styles.dueDatePill}>{task.dueDate}</span>
                    ) : null}

                    <span style={styles.personPill}>{task.person}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#F4F5F7",
    minHeight: "100vh",
    padding: "36px 48px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#111827",
  },

  header: {
    marginBottom: 18,
  },

  kicker: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  title: {
    fontSize: 28,
    lineHeight: 1.2,
    margin: 0,
    fontWeight: 600,
  },

  topRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 18,
    marginBottom: 20,
  },

  selectedDayCard: {
    background: "#E8EAEE",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  statCard: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  cardLabel: {
    fontSize: 11,
    color: "#6B7280",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
  },

  dateRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  dateText: {
    fontSize: 24,
    fontWeight: 600,
  },

  dateNavButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "1px solid #D6DAE1",
    background: "#FFFFFF",
    cursor: "pointer",
    fontSize: 16,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: 600,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "290px 1fr",
    gap: 20,
  },

  leftPanel: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  rightPanel: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  panelSection: {
    marginBottom: 24,
  },

  sectionLabel: {
    fontSize: 11,
    color: "#6B7280",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
  },

  progressWrap: {
    marginBottom: 12,
  },

  progressTrack: {
    height: 6,
    borderRadius: 999,
    background: "#E5E7EB",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#111827",
    borderRadius: 999,
  },

  progressText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
  },

  habitItem: {
    background: "#F1F2F4",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 8,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  checkMark: {
    fontSize: 12,
    color: "#6B7280",
  },

  priorityBlock: {
    background: "#F1F2F4",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 8,
    fontSize: 13,
  },

  recentDay: {
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 8,
    cursor: "pointer",
    fontSize: 13,
  },

  recentDayMuted: {
    fontSize: 13,
    color: "#6B7280",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  hideCompletedButton: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    padding: "8px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 12,
    color: "#374151",
  },

  inputShell: {
    display: "flex",
    gap: 10,
    marginBottom: 18,
    background: "#F8FAFC",
    border: "1px solid #EEF2F7",
    padding: 10,
    borderRadius: 14,
  },

  taskInput: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    fontSize: 13,
    outline: "none",
  },

  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    fontSize: 13,
    outline: "none",
  },

  dateInput: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    fontSize: 13,
    outline: "none",
  },

  addButton: {
    background: "#111827",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 13,
  },

  taskList: {
    marginTop: 8,
  },

  emptyState: {
    color: "#6B7280",
    fontSize: 13,
    padding: "8px 0",
  },

  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #F0F1F3",
    cursor: "grab",
  },

  taskName: {
    fontSize: 13,
    cursor: "pointer",
  },

  taskMeta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  priorityPill: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  dueDatePill: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    background: "#F3F4F6",
    color: "#6B7280",
  },

  personPill: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    background: "#EEF2FF",
    color: "#4F46E5",
  },
};
