import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daily-os-meetings-v5";
const WEEKLY_PRIORITIES_KEY = "daily-os-weekly-priorities";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatPrettyDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
    priorities: [
      { id: 1, text: "Win the week", done: false },
      { id: 2, text: "Stay disciplined", done: false },
      { id: 3, text: "Stay focused", done: false },
    ],
    calendarReview: [],
    tasks: [],
    decisions: [],
  };
}

function reorderList(list, fromIndex, toIndex) {
  if (
    fromIndex === null ||
    toIndex === null ||
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0
  ) {
    return list;
  }

  const updated = [...list];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}

export default function MeetingsPage() {
  const [view, setView] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const recentDates = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });
  }, []);

  const selectedDate = recentDates[selectedDateIndex];
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const [data, setData] = useState({
    weekly: createWeeklyTemplate(),
    dailyByDate: {
      [formatDateKey(new Date())]: createDailyTemplate(),
    },
  });

  const [dragItem, setDragItem] = useState(null);

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

  function reorderSection(sectionKey, dropIndex) {
    if (!dragItem || dragItem.sectionKey !== sectionKey) return;

    if (view === "weekly") {
      const current = data.weekly[sectionKey];
      const updated = reorderList(current, dragItem.index, dropIndex);
      updateWeekly({
        ...data.weekly,
        [sectionKey]: updated,
      });
    } else {
      const current = personData[sectionKey];
      const updated = reorderList(current, dragItem.index, dropIndex);
      updateDailyPerson({
        ...personData,
        [sectionKey]: updated,
      });
    }

    setDragItem(null);
  }

  function addPriority() {
    if (!newPriority.trim()) return;
    updateWeekly({
      ...data.weekly,
      priorities: [
        ...data.weekly.priorities,
        { id: Date.now(), text: newPriority.trim(), done: false },
      ],
    });
    setNewPriority("");
  }

  function togglePriority(index) {
    const updated = [...data.weekly.priorities];
    updated[index].done = !updated[index].done;
    updateWeekly({
      ...data.weekly,
      priorities: updated,
    });
  }

  function editPriority(index, value) {
    const updated = [...data.weekly.priorities];
    updated[index].text = value;
    updateWeekly({
      ...data.weekly,
      priorities: updated,
    });
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
        {
          id: Date.now(),
          text: newWeeklyCalendar.trim(),
          time: "",
          done: false,
        },
      ],
    });
    setNewWeeklyCalendar("");
  }

  function toggleWeeklyCalendar(index) {
    const updated = [...data.weekly.calendarReview];
    updated[index].done = !updated[index].done;
    updateWeekly({ ...data.weekly, calendarReview: updated });
  }

  function editWeeklyCalendar(index, field, value) {
    const updated = [...data.weekly.calendarReview];
    updated[index][field] = value;
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

  function editWeeklyTask(index, field, value) {
    const updated = [...data.weekly.tasks];
    updated[index][field] = value;
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

  function editWeeklyDecision(index, value) {
    const updated = [...data.weekly.decisions];
    updated[index].text = value;
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
        {
          id: Date.now(),
          text: newDailyCalendar.trim(),
          time: "",
          done: false,
        },
      ],
    });
    setNewDailyCalendar("");
  }

  function toggleDailyCalendar(index) {
    const updated = [...personData.calendar];
    updated[index].done = !updated[index].done;
    updateDailyPerson({ ...personData, calendar: updated });
  }

  function editDailyCalendar(index, field, value) {
    const updated = [...personData.calendar];
    updated[index][field] = value;
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

  function editDailyTask(index, field, value) {
    const updated = [...personData.tasks];
    updated[index][field] = value;
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

  function editDailyDecision(index, value) {
    const updated = [...personData.decisions];
    updated[index].text = value;
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
      return { background: "#FBE4DE", color: "#A64C32" };
    }
    if (priority === "Low") {
      return { background: "#E3F0E2", color: "#4F7A4B" };
    }
    return { background: "#F5EBCF", color: "#7A5A18" };
  }

  function DatePill({ date, index }) {
    const active = index === selectedDateIndex;
    return (
      <button
        onClick={() => setSelectedDateIndex(index)}
        style={{
          ...styles.datePill,
          ...(active ? styles.datePillActive : {}),
        }}
      >
        {formatPrettyDate(date)}
      </button>
    );
  }

  function EditableText({ value, onChange, done }) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...styles.rowInput,
          ...(done ? styles.doneText : {}),
        }}
      />
    );
  }

  function DragHandle() {
    return <span style={styles.dragHandle}>⋮⋮</span>;
  }

  function PriorityRow({ item, index }) {
    return (
      <div
        draggable
        onDragStart={() => setDragItem({ sectionKey: "priorities", index })}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => reorderSection("priorities", index)}
        onDragEnd={() => setDragItem(null)}
        style={{
          ...styles.row,
          opacity: item.done ? 0.6 : 1,
        }}
      >
        <div style={styles.rowLeft}>
          <DragHandle />
          <button style={styles.checkbox} onClick={() => togglePriority(index)}>
            {item.done ? "✓" : ""}
          </button>
          <EditableText
            value={item.text}
            onChange={(value) => editPriority(index, value)}
            done={item.done}
          />
        </div>

        <div style={styles.rowRight}>
          <button style={styles.deleteBtn} onClick={() => removePriority(index)}>
            ×
          </button>
        </div>
      </div>
    );
  }

  function DragRow({
    item,
    index,
    sectionKey,
    onToggle,
    onRemove,
    onEditText,
    onEditTime,
    right,
    showTime = false,
  }) {
    return (
      <div
        draggable
        onDragStart={() => setDragItem({ sectionKey, index })}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => reorderSection(sectionKey, index)}
        onDragEnd={() => setDragItem(null)}
        style={{
          ...styles.row,
          opacity: item.done ? 0.6 : 1,
          cursor: "grab",
        }}
      >
        <div style={styles.rowLeft}>
          <DragHandle />
          <button style={styles.checkbox} onClick={onToggle}>
            {item.done ? "✓" : ""}
          </button>

          {showTime && (
            <input
              value={item.time || ""}
              onChange={(e) => onEditTime(e.target.value)}
              placeholder="9:00am"
              style={styles.timeInput}
            />
          )}

          <EditableText value={item.text} onChange={onEditText} done={item.done} />
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
        <div style={styles.kicker}>MEETINGS</div>
        <h1 style={styles.title}>Organize weekly and daily meetings</h1>
      </div>

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
            Daily
          </button>
        </div>
      </div>

      {view === "weekly" ? (
        <div style={styles.twoCol}>
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Top Shared Priorities</div>
                <DragHandle />
              </div>

              {data.weekly.priorities.map((item, index) => (
                <PriorityRow key={item.id} item={item} index={index} />
              ))}

              <div style={styles.inputLine}>
                <input
                  style={styles.inlineInput}
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPriority()}
                  placeholder="Add new priority..."
                />
                <button style={styles.addBtn} onClick={addPriority}>
                  Add
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Weekly Calendar Review</div>
                <DragHandle />
              </div>

              {data.weekly.calendarReview.map((item, index) => (
                <DragRow
                  key={item.id}
                  item={item}
                  index={index}
                  sectionKey="calendarReview"
                  onToggle={() => toggleWeeklyCalendar(index)}
                  onRemove={() => removeWeeklyCalendar(index)}
                  onEditText={(value) => editWeeklyCalendar(index, "text", value)}
                  onEditTime={(value) => editWeeklyCalendar(index, "time", value)}
                  showTime
                />
              ))}

              <div style={styles.inputLine}>
                <input
                  style={styles.inlineInput}
                  value={newWeeklyCalendar}
                  onChange={(e) => setNewWeeklyCalendar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWeeklyCalendar()}
                  placeholder="Add new item..."
                />
                <button style={styles.addBtn} onClick={addWeeklyCalendar}>
                  Add
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Tasks for the Week</div>
                <div style={styles.filterRow}>
                  <select
                    style={styles.selectPill}
                    value={newWeeklyTaskPriority}
                    onChange={(e) => setNewWeeklyTaskPriority(e.target.value)}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <select
                    style={styles.selectPill}
                    value={newWeeklyTaskOwner}
                    onChange={(e) => setNewWeeklyTaskOwner(e.target.value)}
                  >
                    <option>Mark</option>
                    <option>Dane</option>
                  </select>
                  <DragHandle />
                </div>
              </div>

              {data.weekly.tasks.map((item, index) => (
                <DragRow
                  key={item.id}
                  item={item}
                  index={index}
                  sectionKey="tasks"
                  onToggle={() => toggleWeeklyTask(index)}
                  onRemove={() => removeWeeklyTask(index)}
                  onEditText={(value) => editWeeklyTask(index, "text", value)}
                  right={
                    <>
                      <select
                        style={{
                          ...styles.priorityPillSelect,
                          ...priorityStyle(item.priority),
                        }}
                        value={item.priority}
                        onChange={(e) =>
                          editWeeklyTask(index, "priority", e.target.value)
                        }
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <select
                        style={styles.ownerPillSelect}
                        value={item.owner}
                        onChange={(e) =>
                          editWeeklyTask(index, "owner", e.target.value)
                        }
                      >
                        <option>Mark</option>
                        <option>Dane</option>
                      </select>
                    </>
                  }
                />
              ))}

              <div style={styles.taskEntryRow}>
                <input
                  style={{ ...styles.inlineInput, flex: 1 }}
                  value={newWeeklyTask}
                  onChange={(e) => setNewWeeklyTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWeeklyTask()}
                  placeholder="Add new task..."
                />
                <button style={styles.addBtn} onClick={addWeeklyTask}>
                  Add
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Decisions Needed</div>
                <DragHandle />
              </div>

              {data.weekly.decisions.map((item, index) => (
                <DragRow
                  key={item.id}
                  item={item}
                  index={index}
                  sectionKey="decisions"
                  onToggle={() => toggleWeeklyDecision(index)}
                  onRemove={() => removeWeeklyDecision(index)}
                  onEditText={(value) => editWeeklyDecision(index, value)}
                />
              ))}

              <div style={styles.inputLine}>
                <input
                  style={styles.inlineInput}
                  value={newWeeklyDecision}
                  onChange={(e) => setNewWeeklyDecision(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWeeklyDecision()}
                  placeholder="Add new decision..."
                />
                <button style={styles.addBtn} onClick={addWeeklyDecision}>
                  Add
                </button>
              </div>
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

              <div style={styles.dateSwitcher}>
                {recentDates.slice(0, 3).map((date, index) => (
                  <DatePill key={formatDateKey(date)} date={date} index={index} />
                ))}
              </div>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Daily Calendar</div>
                <DragHandle />
              </div>

              {personData.calendar.map((item, index) => (
                <DragRow
                  key={item.id}
                  item={item}
                  index={index}
                  sectionKey="calendar"
                  onToggle={() => toggleDailyCalendar(index)}
                  onRemove={() => removeDailyCalendar(index)}
                  onEditText={(value) => editDailyCalendar(index, "text", value)}
                  onEditTime={(value) => editDailyCalendar(index, "time", value)}
                  showTime
                />
              ))}

              <div style={styles.inputLine}>
                <input
                  style={styles.inlineInput}
                  value={newDailyCalendar}
                  onChange={(e) => setNewDailyCalendar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDailyCalendar()}
                  placeholder="Add new item..."
                />
                <button style={styles.addBtn} onClick={addDailyCalendar}>
                  Add
                </button>
              </div>
            </div>

            <div style={styles.sideCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Today's Tasks</div>
                <DragHandle />
              </div>

              {personData.tasks.map((item, index) => (
                <DragRow
                  key={item.id}
                  item={item}
                  index={index}
                  sectionKey="tasks"
                  onToggle={() => toggleDailyTask(index)}
                  onRemove={() => removeDailyTask(index)}
                  onEditText={(value) => editDailyTask(index, "text", value)}
                  right={
                    <>
                      <select
                        style={{
                          ...styles.priorityPillSelect,
                          ...priorityStyle(item.priority),
                        }}
                        value={item.priority}
                        onChange={(e) =>
                          editDailyTask(index, "priority", e.target.value)
                        }
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <select
                        style={styles.ownerPillSelect}
                        value={item.owner}
                        onChange={(e) =>
                          editDailyTask(index, "owner", e.target.value)
                        }
                      >
                        <option>Mark</option>
                        <option>Dane</option>
                      </select>
                    </>
                  }
                />
              ))}

              <div style={styles.taskEntryRow}>
                <input
                  style={{ ...styles.inlineInput, flex: 1 }}
                  value={newDailyTask}
                  onChange={(e) => setNewDailyTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDailyTask()}
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
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>Decisions Needed</div>
                <DragHandle />
              </div>

              {personData.decisions.map((item, index) => (
                <DragRow
                  key={item.id}
                  item={item}
                  index={index}
                  sectionKey="decisions"
                  onToggle={() => toggleDailyDecision(index)}
                  onRemove={() => removeDailyDecision(index)}
                  onEditText={(value) => editDailyDecision(index, value)}
                />
              ))}

              <div style={styles.inputLine}>
                <input
                  style={styles.inlineInput}
                  value={newDailyDecision}
                  onChange={(e) => setNewDailyDecision(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDailyDecision()}
                  placeholder="Add new decision..."
                />
                <button style={styles.addBtn} onClick={addDailyDecision}>
                  Add
                </button>
              </div>
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
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  placeholder="Write a comment..."
                />
                <button style={styles.sendBtn} onClick={addComment}>
                  Add
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

            <div style={styles.dateSwitcher}>
              {recentDates.slice(0, 3).map((date, index) => (
                <DatePill key={formatDateKey(date)} date={date} index={index} />
              ))}
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Daily Calendar</div>
              <DragHandle />
            </div>

            {personData.calendar.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="calendar"
                onToggle={() => toggleDailyCalendar(index)}
                onRemove={() => removeDailyCalendar(index)}
                onEditText={(value) => editDailyCalendar(index, "text", value)}
                onEditTime={(value) => editDailyCalendar(index, "time", value)}
                showTime
              />
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newDailyCalendar}
                onChange={(e) => setNewDailyCalendar(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDailyCalendar()}
                placeholder="Add new item..."
              />
              <button style={styles.addBtn} onClick={addDailyCalendar}>
                Add
              </button>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Today's Tasks</div>
              <DragHandle />
            </div>

            {personData.tasks.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="tasks"
                onToggle={() => toggleDailyTask(index)}
                onRemove={() => removeDailyTask(index)}
                onEditText={(value) => editDailyTask(index, "text", value)}
                right={
                  <>
                    <select
                      style={{
                        ...styles.priorityPillSelect,
                        ...priorityStyle(item.priority),
                      }}
                      value={item.priority}
                      onChange={(e) =>
                        editDailyTask(index, "priority", e.target.value)
                      }
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <select
                      style={styles.ownerPillSelect}
                      value={item.owner}
                      onChange={(e) => editDailyTask(index, "owner", e.target.value)}
                    >
                      <option>Mark</option>
                      <option>Dane</option>
                    </select>
                  </>
                }
              />
            ))}

            <div style={styles.taskEntryRow}>
              <input
                style={{ ...styles.inlineInput, flex: 1 }}
                value={newDailyTask}
                onChange={(e) => setNewDailyTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDailyTask()}
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
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>Decisions Needed</div>
              <DragHandle />
            </div>

            {personData.decisions.map((item, index) => (
              <DragRow
                key={item.id}
                item={item}
                index={index}
                sectionKey="decisions"
                onToggle={() => toggleDailyDecision(index)}
                onRemove={() => removeDailyDecision(index)}
                onEditText={(value) => editDailyDecision(index, value)}
              />
            ))}

            <div style={styles.inputLine}>
              <input
                style={styles.inlineInput}
                value={newDailyDecision}
                onChange={(e) => setNewDailyDecision(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDailyDecision()}
                placeholder="Add new decision..."
              />
              <button style={styles.addBtn} onClick={addDailyDecision}>
                Add
              </button>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.commentList}>
              {personData.comments.map((comment) => (
                <div key={comment.id} style={styles.commentRow}>
                  <div style={styles.commentAvatar}>{comment.author.charAt(0)}</div>
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
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Write a comment..."
              />
              <button style={styles.sendBtn} onClick={addComment}>
                Add
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
    marginBottom: 22,
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

  centerToggleWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 20,
  },

  centerToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  centerToggleBtn: {
    border: "none",
    background: "transparent",
    padding: "8px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    color: "#6B7280",
  },

  centerToggleBtnActive: {
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  leftCol: {
    display: "grid",
    gap: 16,
    alignContent: "start",
  },

  rightCol: {
    display: "grid",
    gap: 16,
    alignContent: "start",
  },

  rightOnlyWrap: {
    maxWidth: 840,
    margin: "0 auto",
    display: "grid",
    gap: 16,
  },

  card: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    minHeight: 120,
  },

  sideCard: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  sideTopCard: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
  },

  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #F0F1F3",
  },

  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    flex: 1,
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
    lineHeight: 1,
    letterSpacing: "0.06em",
    cursor: "grab",
    userSelect: "none",
    flexShrink: 0,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 999,
    border: "1px solid #D1D5DB",
    background: "#F9FAFB",
    color: "#6B7280",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
  },

  rowInput: {
    flex: 1,
    minWidth: 0,
    border: "1px solid transparent",
    background: "transparent",
    fontSize: 15,
    color: "#111827",
    outline: "none",
    padding: "6px 8px",
    borderRadius: 8,
  },

  timeInput: {
    width: 84,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 12,
    outline: "none",
    color: "#374151",
    flexShrink: 0,
  },

  inputLine: {
    display: "flex",
    gap: 8,
    marginTop: 14,
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

  taskEntryRow: {
    display: "flex",
    gap: 8,
    marginTop: 14,
  },

  select: {
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    color: "#374151",
    outline: "none",
  },

  selectPill: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    color: "#374151",
    outline: "none",
  },

  addBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "#9CA3AF",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },

  priorityPillSelect: {
    border: "none",
    padding: "7px 10px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    outline: "none",
  },

  ownerPillSelect: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    padding: "7px 10px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 12,
    color: "#374151",
    outline: "none",
  },

  personToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  personBtn: {
    border: "none",
    background: "transparent",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    color: "#6B7280",
  },

  personBtnActive: {
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  dateSwitcher: {
    display: "inline-flex",
    background: "#F8FAFC",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    border: "1px solid #E5E7EB",
  },

  datePill: {
    border: "none",
    background: "transparent",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    color: "#6B7280",
  },

  datePillActive: {
    background: "#63B8A8",
    color: "#FFFFFF",
  },

  commentList: {
    display: "grid",
    gap: 12,
    marginBottom: 12,
  },

  commentRow: {
    display: "grid",
    gridTemplateColumns: "34px 1fr auto",
    gap: 12,
    alignItems: "start",
  },

  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    color: "#374151",
    flexShrink: 0,
  },

  commentBubble: {
    fontSize: 13,
    lineHeight: 1.45,
    color: "#374151",
  },

  commentAuthor: {
    color: "#111827",
    fontWeight: 600,
  },

  commentTime: {
    fontSize: 12,
    color: "#9CA3AF",
    whiteSpace: "nowrap",
  },

  commentInputRow: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },

  commentInput: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 13,
    outline: "none",
  },

  sendBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: 13,
  },

  doneText: {
    textDecoration: "line-through",
    color: "#9CA3AF",
  },
};
