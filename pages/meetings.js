import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daily-os-meetings-v4";
const WEEKLY_PRIORITIES_KEY = "daily-os-weekly-priorities";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function createDailyTemplate() {
  return {
    Mark: {
      calendar: [],
      tasks: [],
      decisions: [],
      comments: [],
    },
    Dane: {
      calendar: [],
      tasks: [],
      decisions: [],
      comments: [],
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
  const [selectedDate] = useState(new Date());

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
  const [newComment, setNewComment] = useState("");

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

  function addComment() {
    if (!newComment.trim()) return;
    updateDailyPerson({
      ...personData,
      comments: [
        ...personData.comments,
        {
          id: Date.now(),
          author: dailyPerson,
          text: newComment.trim(),
          time: "now",
        },
      ],
    });
    setNewComment("");
  }

  function priorityStyle(priority) {
    if (priority === "High") {
      return { background: "#D88470", color: "#FFFFFF" };
    }
    if (priority === "Low") {
      return { background: "#8FAA8A", color: "#FFFFFF" };
    }
    return { background: "#E9D4A7", color: "#6B4E16" };
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
          opacity: item.done ? 0.55 : 1,
        }}
      >
        <div style={styles.rowLeft} onClick={onToggle}>
          <span style={styles.checkbox}>{item.done ? "✓" : ""}</span>
          <span style={styles.rowText}>{item.text}</span>
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
        <div style={styles.icon}>🗂</div>
        <div>
          <h1 style={styles.title}>Meetings</h1>
          <div style={styles.subtitle}>Organize weekly and daily meetings</div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.centerToggleWrap}>
        <div style={styles.centerToggle}>
          <button
            style={{
              ...styles.centerToggleBtn,
              ...(view === "weekly" ? styles.centerToggleBtnActive : {}),
            }}
            onClick={() => setView("weekly")}
          >
            Weekly Alignment
          </button>
          <button
            style={{
              ...styles.centerToggleBtn,
              ...(view === "daily" ? styles.centerToggleBtnActive : {}),
            }}
            onClick={() => setView("daily")}
          >
            Daily Huddle
          </button>
        </div>
      </div>

      {view === "weekly" ? (
        <div style={styles.twoCol}>
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Top Shared Priorities</div>

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
                <span style={styles.plus}>＋</span>
                <input
                  style={styles.inlineInput}
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  placeholder="Add new priority..."
                />
              </div>
              <button style={styles.hiddenActionBtn} onClick={addPriority}>
                Add
              </button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Weekly Calendar Review</div>

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
                <span style={styles.plus}>＋</span>
                <input
                  style={styles.inlineInput}
                  value={newWeeklyCalendar}
                  onChange={(e) => setNewWeeklyCalendar(e.target.value)}
                  placeholder="Add new item..."
                />
              </div>
              <button style={styles.hiddenActionBtn} onClick={addWeeklyCalendar}>
                Add
              </button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Tasks for the Week</div>

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
                      <span style={styles.ownerPill}>{item.owner}</span>
                    </>
                  }
                />
              ))}

              <div style={styles.taskEntryRow}>
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
                <button style={styles.addBtn} onClick={addWeeklyTask}>
                  Add
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Decisions Needed</div>

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
                <span style={styles.plus}>＋</span>
                <input
                  style={styles.inlineInput}
                  value={newWeeklyDecision}
                  onChange={(e) => setNewWeeklyDecision(e.target.value)}
                  placeholder="Add new decision..."
                />
              </div>
              <button style={styles.hiddenActionBtn} onClick={addWeeklyDecision}>
                Add
              </button>
            </div>
          </div>

          <div style={styles.rightCol}>
            <div style={styles.sideTopCard}>
              <div style={styles.personToggle}>
                <button
                  style={{
                    ...styles.personBtn,
                    ...(dailyPerson === "Mark" ? styles.personBtnActive : {}),
                  }}
                  onClick={() => setDailyPerson("Mark")}
                >
                  Mark
                </button>
                <button
                  style={{
                    ...styles.personBtn,
                    ...(dailyPerson === "Dane" ? styles.personBtnActive : {}),
                  }}
                  onClick={() => setDailyPerson("Dane")}
                >
                  Dane
                </button>
              </div>

              <div style={styles.timerBox}>{formatPrettyDate(selectedDate)}</div>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.cardTitle}>Daily Calendar</div>

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
                <span style={styles.plus}>＋</span>
                <input
                  style={styles.inlineInput}
                  value={newDailyCalendar}
                  onChange={(e) => setNewDailyCalendar(e.target.value)}
                  placeholder="Add new item..."
                />
              </div>
              <button style={styles.hiddenActionBtn} onClick={addDailyCalendar}>
                Add
              </button>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.cardTitle}>Today's Tasks</div>

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
                      <span style={styles.ownerPill}>{item.owner}</span>
                    </>
                  }
                />
              ))}

              <div style={styles.taskEntryRow}>
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
                <button style={styles.addBtn} onClick={addDailyTask}>
                  Add
                </button>
              </div>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.cardTitle}>Decisions Needed</div>

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
                <span style={styles.plus}>＋</span>
                <input
                  style={styles.inlineInput}
                  value={newDailyDecision}
                  onChange={(e) => setNewDailyDecision(e.target.value)}
                  placeholder="Add new decision..."
                />
              </div>
              <button style={styles.hiddenActionBtn} onClick={addDailyDecision}>
                Add
              </button>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.commentList}>
                {personData.comments.map((comment) => (
                  <div key={comment.id} style={styles.commentRow}>
                    <div style={styles.commentAvatar}>
                      {comment.author.charAt(0)}
                    </div>
                    <div style={styles.commentBubble}>
                      <span style={styles.commentAuthor}>@{comment.author}</span>{" "}
                      {comment.text}
                    </div>
                    <div style={styles.commentTime}>{comment.time}</div>
                  </div>
                ))}
              </div>

              <div style={styles.commentInputRow}>
                <input
                  style={styles.commentInput}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button style={styles.sendBtn} onClick={addComment}>
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.rightOnlyWrap}>
          <div style={styles.sideTopCard}>
            <div style={styles.personToggle}>
              <button
                style={{
                  ...styles.personBtn,
                  ...(dailyPerson === "Mark" ? styles.personBtnActive : {}),
                }}
                onClick={() => setDailyPerson("Mark")}
              >
                Mark
              </button>
              <button
                style={{
                  ...styles.personBtn,
                  ...(dailyPerson === "Dane" ? styles.personBtnActive : {}),
                }}
                onClick={() => setDailyPerson("Dane")}
              >
                Dane
              </button>
            </div>

            <div style={styles.timerBox}>{formatPrettyDate(selectedDate)}</div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.cardTitle}>Daily Calendar</div>

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
              <span style={styles.plus}>＋</span>
              <input
                style={styles.inlineInput}
                value={newDailyCalendar}
                onChange={(e) => setNewDailyCalendar(e.target.value)}
                placeholder="Add new item..."
              />
            </div>
            <button style={styles.hiddenActionBtn} onClick={addDailyCalendar}>
              Add
            </button>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.cardTitle}>Today's Tasks</div>

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
                    <span style={styles.ownerPill}>{item.owner}</span>
                  </>
                }
              />
            ))}

            <div style={styles.taskEntryRow}>
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
              <button style={styles.addBtn} onClick={addDailyTask}>
                Add
              </button>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.cardTitle}>Decisions Needed</div>

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
              <span style={styles.plus}>＋</span>
              <input
                style={styles.inlineInput}
                value={newDailyDecision}
                onChange={(e) => setNewDailyDecision(e.target.value)}
                placeholder="Add new decision..."
              />
            </div>
            <button style={styles.hiddenActionBtn} onClick={addDailyDecision}>
              Add
            </button>
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
    padding: "32px 44px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#1F2937",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: "#7FA3D6",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
    marginTop: 4,
  },

  title: {
    fontSize: 28,
    lineHeight: 1.2,
    margin: 0,
    fontWeight: 600,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  divider: {
    height: 1,
    background: "#E6E8EE",
    marginBottom: 16,
  },

  centerToggleWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 18,
  },

  centerToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },

  centerToggleBtn: {
    border: "none",
    background: "transparent",
    padding: "10px 22px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    color: "#4B5563",
  },

  centerToggleBtnActive: {
    background: "#7FA3D6",
    color: "#FFFFFF",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.55fr 1fr",
    gap: 18,
    alignItems: "start",
  },

  leftCol: {
    display: "grid",
    gap: 12,
  },

  rightCol: {
    display: "grid",
    gap: 12,
  },

  rightOnlyWrap: {
    maxWidth: 620,
    margin: "0 auto",
    display: "grid",
    gap: 12,
  },

  card: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
    border: "1px solid #ECEFF4",
  },

  sideCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
    border: "1px solid #ECEFF4",
  },

  sideTopCard: {
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
    border: "1px solid #ECEFF4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  personToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },

  personBtn: {
    border: "none",
    background: "transparent",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    color: "#4B5563",
  },

  personBtnActive: {
    background: "#7FA3D6",
    color: "#FFFFFF",
  },

  timerBox: {
    background: "#78AAA6",
    color: "#FFFFFF",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 10,
    color: "#2D3748",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #ECEFF4",
  },

  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    cursor: "pointer",
  },

  rowRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    border: "1px solid #D7DCE5",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7B8794",
    fontSize: 12,
    background: "#FFFFFF",
    flexShrink: 0,
  },

  rowText: {
    fontSize: 13,
    color: "#2D3748",
    lineHeight: 1.45,
  },

  priorityPill: {
    padding: "5px 12px",
    borderRadius: 8,
    fontSize: 12,
    minWidth: 56,
    textAlign: "center",
  },

  ownerPill: {
    padding: "5px 12px",
    borderRadius: 8,
    fontSize: 12,
    background: "#F2F4F7",
    color: "#4B5563",
    border: "1px solid #E2E8F0",
  },

  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "#B0B7C3",
    fontSize: 24,
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
  },

  inputLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    border: "1px solid #E4E8EF",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#FAFBFC",
  },

  plus: {
    color: "#8B95A5",
    fontSize: 18,
    lineHeight: 1,
  },

  inlineInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    color: "#374151",
  },

  hiddenActionBtn: {
    display: "none",
  },

  taskEntryRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },

  select: {
    border: "1px solid #E4E8EF",
    background: "#FAFBFC",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    color: "#374151",
    outline: "none",
  },

  addBtn: {
    border: "none",
    background: "#7FA3D6",
    color: "#FFFFFF",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    cursor: "pointer",
  },

  commentList: {
    display: "grid",
    gap: 10,
    marginBottom: 12,
  },

  commentRow: {
    display: "grid",
    gridTemplateColumns: "30px 1fr auto",
    gap: 10,
    alignItems: "start",
  },

  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    background: "#D8DEE9",
    color: "#4B5563",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    marginTop: 2,
  },

  commentBubble: {
    background: "#F7F8FA",
    border: "1px solid #ECEFF4",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 13,
    lineHeight: 1.45,
    color: "#374151",
  },

  commentAuthor: {
    color: "#5B7DB3",
    fontWeight: 500,
  },

  commentTime: {
    fontSize: 12,
    color: "#9AA3AF",
    paddingTop: 10,
  },

  commentInputRow: {
    display: "flex",
    gap: 8,
    border: "1px solid #E4E8EF",
    borderRadius: 8,
    padding: "8px 10px",
    background: "#FAFBFC",
  },

  commentInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
  },

  sendBtn: {
    border: "none",
    background: "transparent",
    color: "#7F8AA1",
    fontSize: 18,
    cursor: "pointer",
  },
};
