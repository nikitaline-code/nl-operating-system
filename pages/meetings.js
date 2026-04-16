import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daily-os-meetings-v3";
const WEEKLY_PRIORITIES_KEY = "daily-os-weekly-priorities";

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

function createDailyTemplate() {
  return {
    Mark: {
      calendar: [],
      tasks: [],
      decisions: [],
    },
    Dane: {
      calendar: [],
      tasks: [],
      decisions: [],
    },
  };
}

function createWeeklyTemplate() {
  return {
    priorities: ["Win the week", "Stay disciplined", "Stay focused"],
    calendarReview: [],
    tasks: [],
    decisions: [],
  };
}

function reorderList(list, fromIndex, toIndex) {
  const updated = [...list];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}

export default function MeetingsPage() {
  const [view, setView] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [data, setData] = useState({
    weekly: createWeeklyTemplate(),
    dailyByDate: {
      [formatDateKey(new Date())]: createDailyTemplate(),
    },
  });

  const [dragState, setDragState] = useState(null);

  const [newPriority, setNewPriority] = useState("");
  const [newWeeklyCalendar, setNewWeeklyCalendar] = useState("");
  const [newWeeklyTask, setNewWeeklyTask] = useState("");
  const [newWeeklyTaskOwner, setNewWeeklyTaskOwner] = useState("Mark");
  const [newWeeklyTaskPriority, setNewWeeklyTaskPriority] = useState("Medium");
  const [newWeeklyDecision, setNewWeeklyDecision] = useState("");

  const [newDailyCalendar, setNewDailyCalendar] = useState("");
  const [newDailyTask, setNewDailyTask] = useState("");
  const [newDailyTaskPriority, setNewDailyTaskPriority] = useState("Medium");
  const [newDailyDecision, setNewDailyDecision] = useState("");

  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(
      WEEKLY_PRIORITIES_KEY,
      JSON.stringify(data.weekly.priorities)
    );
  }, [data]);

  useEffect(() => {
    if (!data.dailyByDate[dateKey]) {
      setData((prev) => ({
        ...prev,
        dailyByDate: {
          ...prev.dailyByDate,
          [dateKey]: createDailyTemplate(),
        },
      }));
    }
  }, [dateKey, data.dailyByDate]);

  const activeDaily = useMemo(() => {
    return data.dailyByDate[dateKey] || createDailyTemplate();
  }, [data.dailyByDate, dateKey]);

  const personData = activeDaily[dailyPerson];

  const recentDays = Object.keys(data.dailyByDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .slice(0, 7);

  function updateWeekly(nextWeekly) {
    setData((prev) => ({ ...prev, weekly: nextWeekly }));
  }

  function updateDailyPerson(nextPersonData) {
    setData((prev) => ({
      ...prev,
      dailyByDate: {
        ...prev.dailyByDate,
        [dateKey]: {
          ...(prev.dailyByDate[dateKey] || createDailyTemplate()),
          [dailyPerson]: nextPersonData,
        },
      },
    }));
  }

  function handleDragStart(sectionKey, index) {
    setDragState({ sectionKey, index });
  }

  function handleDrop(sectionKey, dropIndex) {
    if (!dragState) return;
    if (dragState.sectionKey !== sectionKey) return;

    if (view === "weekly") {
      const current = data.weekly[sectionKey];
      const updated = reorderList(current, dragState.index, dropIndex);
      updateWeekly({
        ...data.weekly,
        [sectionKey]: updated,
      });
    } else {
      const current = personData[sectionKey];
      const updated = reorderList(current, dragState.index, dropIndex);
      updateDailyPerson({
        ...personData,
        [sectionKey]: updated,
      });
    }

    setDragState(null);
  }

  function addPriority() {
    if (!newPriority.trim()) return;
    updateWeekly({
      ...data.weekly,
      priorities: [...data.weekly.priorities, newPriority.trim()],
    });
    setNewPriority("");
  }

  function removePriority(index) {
    updateWeekly({
      ...data.weekly,
      priorities: data.weekly.priorities.filter((_, i) => i !== index),
    });
  }

  function addWeeklyCalendar() {
    if (!newWeeklyCalendar.trim()) return;
    updateWeekly({
      ...data.weekly,
      calendarReview: [
        ...data.weekly.calendarReview,
        { id: Date.now(), text: newWeeklyCalendar.trim(), done: false },
      ],
    });
    setNewWeeklyCalendar("");
  }

  function toggleWeeklyCalendar(index) {
    const updated = [...data.weekly.calendarReview];
    updated[index].done = !updated[index].done;
    updateWeekly({ ...data.weekly, calendarReview: updated });
  }

  function removeWeeklyCalendar(index) {
    updateWeekly({
      ...data.weekly,
      calendarReview: data.weekly.calendarReview.filter((_, i) => i !== index),
    });
  }

  function addWeeklyTask() {
    if (!newWeeklyTask.trim()) return;
    updateWeekly({
      ...data.weekly,
      tasks: [
        ...data.weekly.tasks,
        {
          id: Date.now(),
          text: newWeeklyTask.trim(),
          owner: newWeeklyTaskOwner,
          priority: newWeeklyTaskPriority,
          done: false,
        },
      ],
    });
    setNewWeeklyTask("");
    setNewWeeklyTaskOwner("Mark");
    setNewWeeklyTaskPriority("Medium");
  }

  function toggleWeeklyTask(index) {
    const updated = [...data.weekly.tasks];
    updated[index].done = !updated[index].done;
    updateWeekly({ ...data.weekly, tasks: updated });
  }

  function removeWeeklyTask(index) {
    updateWeekly({
      ...data.weekly,
      tasks: data.weekly.tasks.filter((_, i) => i !== index),
    });
  }

  function addWeeklyDecision() {
    if (!newWeeklyDecision.trim()) return;
    updateWeekly({
      ...data.weekly,
      decisions: [
        ...data.weekly.decisions,
        { id: Date.now(), text: newWeeklyDecision.trim(), done: false },
      ],
    });
    setNewWeeklyDecision("");
  }

  function toggleWeeklyDecision(index) {
    const updated = [...data.weekly.decisions];
    updated[index].done = !updated[index].done;
    updateWeekly({ ...data.weekly, decisions: updated });
  }

  function removeWeeklyDecision(index) {
    updateWeekly({
      ...data.weekly,
      decisions: data.weekly.decisions.filter((_, i) => i !== index),
    });
  }

  function addDailyCalendar() {
    if (!newDailyCalendar.trim()) return;
    updateDailyPerson({
      ...personData,
      calendar: [
        ...personData.calendar,
        { id: Date.now(), text: newDailyCalendar.trim(), done: false },
      ],
    });
    setNewDailyCalendar("");
  }

  function toggleDailyCalendar(index) {
    const updated = [...personData.calendar];
    updated[index].done = !updated[index].done;
    updateDailyPerson({ ...personData, calendar: updated });
  }

  function removeDailyCalendar(index) {
    updateDailyPerson({
      ...personData,
      calendar: personData.calendar.filter((_, i) => i !== index),
    });
  }

  function addDailyTask() {
    if (!newDailyTask.trim()) return;
    updateDailyPerson({
      ...personData,
      tasks: [
        ...personData.tasks,
        {
          id: Date.now(),
          text: newDailyTask.trim(),
          owner: dailyPerson,
          priority: newDailyTaskPriority,
          done: false,
        },
      ],
    });
    setNewDailyTask("");
    setNewDailyTaskPriority("Medium");
  }

  function toggleDailyTask(index) {
    const updated = [...personData.tasks];
    updated[index].done = !updated[index].done;
    updateDailyPerson({ ...personData, tasks: updated });
  }

  function removeDailyTask(index) {
    updateDailyPerson({
      ...personData,
      tasks: personData.tasks.filter((_, i) => i !== index),
    });
  }

  function addDailyDecision() {
    if (!newDailyDecision.trim()) return;
    updateDailyPerson({
      ...personData,
      decisions: [
        ...personData.decisions,
        { id: Date.now(), text: newDailyDecision.trim(), done: false },
      ],
    });
    setNewDailyDecision("");
  }

  function toggleDailyDecision(index) {
    const updated = [...personData.decisions];
    updated[index].done = !updated[index].done;
    updateDailyPerson({ ...personData, decisions: updated });
  }

  function removeDailyDecision(index) {
    updateDailyPerson({
      ...personData,
      decisions: personData.decisions.filter((_, i) => i !== index),
    });
  }

  function priorityStyle(priority) {
    if (priority === "High") {
      return {
        background: "#FEE2E2",
        color: "#B91C1C",
      };
    }
    if (priority === "Low") {
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

  function DragRow({ item, index, sectionKey, onToggle, onRemove, right }) {
    return (
      <div
        draggable
        onDragStart={() => handleDragStart(sectionKey, index)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(sectionKey, index)}
        style={{
          ...styles.row,
          opacity: item.done ? 0.5 : 1,
        }}
      >
        <div style={styles.rowLeft} onClick={onToggle}>
          <span style={styles.dragHandle}>⋮⋮</span>
          <span style={styles.checkbox}>{item.done ? "✓" : ""}</span>
          <span
            style={{
              ...styles.rowText,
              textDecoration: item.done ? "line-through" : "none",
            }}
          >
            {item.text}
          </span>
        </div>

        <div style={styles.rowRight}>
          {right}
          <button style={styles.deleteBtn} onClick={onRemove}>
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Meetings</div>
          <h1 style={styles.title}>Organize weekly and daily meetings</h1>
        </div>
      </div>

      <div style={styles.topBar}>
        <div style={styles.topToggle}>
          <button
            style={{
              ...styles.topToggleBtn,
              ...(view === "weekly" ? styles.topToggleBtnActive : {}),
            }}
            onClick={() => setView("weekly")}
          >
            Weekly Alignment
          </button>
          <button
            style={{
              ...styles.topToggleBtn,
              ...(view === "daily" ? styles.topToggleBtnActive : {}),
            }}
            onClick={() => setView("daily")}
          >
            Daily Huddle
          </button>
        </div>
      </div>

      {view === "weekly" ? (
        <div style={styles.stack}>
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Top Shared Priorities</div>

            {data.weekly.priorities.map((item, index) => (
              <div
                key={`${item}-${index}`}
                draggable
                onDragStart={() => handleDragStart("priorities", index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop("priorities", index)}
                style={styles.row}
              >
                <div style={styles.rowLeft}>
                  <span style={styles.dragHandle}>⋮⋮</span>
                  <span style={styles.checkbox}>✓</span>
                  <span style={styles.rowText}>{item}</span>
                </div>

                <div style={styles.rowRight}>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => removePriority(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                placeholder="Add new priority..."
              />
              <button style={styles.addGhostBtn} onClick={addPriority}>
                +
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Weekly Calendar Review</div>

            {data.weekly.calendarReview.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="calendarReview"
                onToggle={() => toggleWeeklyCalendar(index)}
                onRemove={() => removeWeeklyCalendar(index)}
              />
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newWeeklyCalendar}
                onChange={(e) => setNewWeeklyCalendar(e.target.value)}
                placeholder="Add new item..."
              />
              <button style={styles.addGhostBtn} onClick={addWeeklyCalendar}>
                +
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Tasks for the Week</div>

            {data.weekly.tasks.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="tasks"
                onToggle={() => toggleWeeklyTask(index)}
                onRemove={() => removeWeeklyTask(index)}
                right={
                  <>
                    <span
                      style={{
                        ...styles.priorityPill,
                        ...priorityStyle(item.priority),
                      }}
                    >
                      {item.priority}
                    </span>
                    <span style={styles.personPill}>{item.owner}</span>
                  </>
                }
              />
            ))}

            <div style={styles.taskInputRow}>
              <input
                style={{ ...styles.inlineInput, flex: 1 }}
                value={newWeeklyTask}
                onChange={(e) => setNewWeeklyTask(e.target.value)}
                placeholder="Add new task..."
              />
              <select
                style={styles.select}
                value={newWeeklyTaskPriority}
                onChange={(e) => setNewWeeklyTaskPriority(e.target.value)}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select
                style={styles.select}
                value={newWeeklyTaskOwner}
                onChange={(e) => setNewWeeklyTaskOwner(e.target.value)}
              >
                <option>Mark</option>
                <option>Dane</option>
              </select>
              <button style={styles.smallAddBtn} onClick={addWeeklyTask}>
                Add
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Decisions Needed</div>

            {data.weekly.decisions.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="decisions"
                onToggle={() => toggleWeeklyDecision(index)}
                onRemove={() => removeWeeklyDecision(index)}
              />
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newWeeklyDecision}
                onChange={(e) => setNewWeeklyDecision(e.target.value)}
                placeholder="Add new decision..."
              />
              <button style={styles.addGhostBtn} onClick={addWeeklyDecision}>
                +
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.stack}>
          <div style={styles.dailyTopCard}>
            <div style={styles.personToggle}>
              <button
                style={{
                  ...styles.personToggleBtn,
                  ...(dailyPerson === "Mark" ? styles.personToggleBtnActive : {}),
                }}
                onClick={() => setDailyPerson("Mark")}
              >
                Mark
              </button>
              <button
                style={{
                  ...styles.personToggleBtn,
                  ...(dailyPerson === "Dane" ? styles.personToggleBtnActive : {}),
                }}
                onClick={() => setDailyPerson("Dane")}
              >
                Dane
              </button>
            </div>

            <div style={styles.datePill}>
              <button
                onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
                style={styles.dateArrow}
              >
                ←
              </button>
              <span>{formatPrettyDate(selectedDate)}</span>
              <button
                onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
                style={styles.dateArrow}
              >
                →
              </button>
            </div>
          </div>

          <div style={styles.recentDaysRow}>
            {recentDays.map((day) => (
              <button
                key={day}
                style={{
                  ...styles.recentDayBtn,
                  ...(day === dateKey ? styles.recentDayBtnActive : {}),
                }}
                onClick={() => setSelectedDate(new Date(`${day}T12:00:00`))}
              >
                {day}
              </button>
            ))}
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Daily Calendar</div>

            {personData.calendar.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="calendar"
                onToggle={() => toggleDailyCalendar(index)}
                onRemove={() => removeDailyCalendar(index)}
              />
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newDailyCalendar}
                onChange={(e) => setNewDailyCalendar(e.target.value)}
                placeholder="Add new item..."
              />
              <button style={styles.addGhostBtn} onClick={addDailyCalendar}>
                +
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Today's Tasks</div>

            {personData.tasks.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="tasks"
                onToggle={() => toggleDailyTask(index)}
                onRemove={() => removeDailyTask(index)}
                right={
                  <>
                    <span
                      style={{
                        ...styles.priorityPill,
                        ...priorityStyle(item.priority),
                      }}
                    >
                      {item.priority}
                    </span>
                    <span style={styles.personPill}>{item.owner}</span>
                  </>
                }
              />
            ))}

            <div style={styles.taskInputRow}>
              <input
                style={{ ...styles.inlineInput, flex: 1 }}
                value={newDailyTask}
                onChange={(e) => setNewDailyTask(e.target.value)}
                placeholder="Add new task..."
              />
              <select
                style={styles.select}
                value={newDailyTaskPriority}
                onChange={(e) => setNewDailyTaskPriority(e.target.value)}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <button style={styles.smallAddBtn} onClick={addDailyTask}>
                Add
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionTitle}>Decisions Needed</div>

            {personData.decisions.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="decisions"
                onToggle={() => toggleDailyDecision(index)}
                onRemove={() => removeDailyDecision(index)}
              />
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newDailyDecision}
                onChange={(e) => setNewDailyDecision(e.target.value)}
                placeholder="Add new decision..."
              />
              <button style={styles.addGhostBtn} onClick={addDailyDecision}>
                +
              </button>
            </div>
          </div>
        </div>
      )}
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
    letterSpacing: "0.08em",
  },

  title: {
    fontSize: 28,
    lineHeight: 1.2,
    margin: 0,
    fontWeight: 600,
  },

  topBar: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },

  topToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },

  topToggleBtn: {
    border: "none",
    background: "transparent",
    padding: "10px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 14,
    color: "#6B7280",
  },

  topToggleBtnActive: {
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  stack: {
    display: "grid",
    gap: 16,
    maxWidth: 980,
    margin: "0 auto",
  },

  dailyTopCard: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  personToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  personToggleBtn: {
    border: "none",
    background: "transparent",
    padding: "8px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    color: "#6B7280",
  },

  personToggleBtnActive: {
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  datePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "#F3F4F6",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    color: "#374151",
  },

  dateArrow: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#6B7280",
  },

  recentDaysRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    maxWidth: 980,
    margin: "0 auto",
  },

  recentDayBtn: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 12,
    color: "#6B7280",
  },

  recentDayBtnActive: {
    background: "#E9EEF9",
    color: "#111827",
    border: "1px solid #D7E1F5",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  sectionTitle: {
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #F0F1F3",
  },

  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    minWidth: 0,
  },

  rowText: {
    fontSize: 13,
    lineHeight: 1.4,
  },

  rowRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  dragHandle: {
    color: "#9CA3AF",
    fontSize: 14,
    cursor: "grab",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    border: "1px solid #D8DEE7",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "#6B7280",
    background: "#FFFFFF",
  },

  priorityPill: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
  },

  personPill: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    background: "#EEF2FF",
    color: "#4F46E5",
  },

  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "#9CA3AF",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },

  inputLine: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },

  inlineInput: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 13,
    outline: "none",
  },

  addGhostBtn: {
    width: 42,
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    cursor: "pointer",
    fontSize: 22,
    color: "#6B7280",
  },

  taskInputRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },

  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    fontSize: 13,
    outline: "none",
  },

  smallAddBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: 13,
  },
};
