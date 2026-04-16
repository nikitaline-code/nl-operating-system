import { useEffect, useState } from "react";

const STORAGE_KEY = "daily-os-meetings-v1";

function seedData() {
  return {
    activeTab: "Weekly Alignment",
    selectedOwner: "Mark",
    sections: [
      {
        id: 1,
        title: "Top Shared Priorities",
        type: "priority",
        newItemText: "",
        items: [
          { id: 101, text: "Win the week", checked: false },
          { id: 102, text: "Stay disciplined", checked: false },
          { id: 103, text: "Stay focused", checked: false },
        ],
      },
      {
        id: 2,
        title: "Weekly Calendar Review",
        type: "calendar",
        newItemText: "",
        items: [
          {
            id: 201,
            time: "9:00am",
            text: "Weekly review with team",
            meta: "30m",
            checked: false,
          },
          {
            id: 202,
            time: "10:15am",
            text: "New client onboarding call",
            meta: "45m",
            checked: false,
          },
        ],
      },
      {
        id: 3,
        title: "Tasks for the Week",
        type: "task",
        newItemText: "",
        items: [
          {
            id: 301,
            text: "Follow up w/ Client X",
            priority: "High",
            owner: "Dane",
            checked: false,
          },
          {
            id: 302,
            text: "Finish proposal draft",
            priority: "Medium",
            owner: "Mark",
            checked: false,
          },
          {
            id: 303,
            text: "Review funding round options",
            priority: "Low",
            owner: "Mark",
            checked: false,
          },
        ],
      },
    ],
    dailyCalendar: [
      {
        id: 1,
        duration: "30m",
        text: "Weekly review with team",
        time: "9:00am",
        checked: false,
      },
      {
        id: 2,
        duration: "45m",
        text: "New client onboarding call",
        time: "10:15am",
        checked: false,
      },
      {
        id: 3,
        duration: "60m",
        text: "Marketing strategy session",
        time: "1:00pm",
        checked: false,
      },
    ],
    todayTasks: [
      {
        id: 1,
        text: "Follow up w Client X",
        priority: "High",
        owner: "Dane",
        checked: false,
      },
      {
        id: 2,
        text: "Finish proposal draft",
        priority: "Medium",
        owner: "Mark",
        checked: false,
      },
      {
        id: 3,
        text: "Review funding round options",
        priority: "Low",
        owner: "Mark",
        checked: false,
      },
    ],
    comments: [
      {
        id: 1,
        mention: "@Mark",
        text: "needed help setting up the new staging environment.",
        time: "1m ago",
      },
      {
        id: 2,
        mention: "@Dane",
        text: "Client asked about a timetable ready for tomorrow.",
        time: "1m ago",
      },
    ],
    commentInput: "",
  };
}

export default function MeetingsPage() {
  const [data, setData] = useState(seedData);

  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [draggedSectionRow, setDraggedSectionRow] = useState({
    sectionId: null,
    rowIndex: null,
  });
  const [draggedDailyRowIndex, setDraggedDailyRowIndex] = useState(null);
  const [draggedTodayTaskIndex, setDraggedTodayTaskIndex] = useState(null);

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
  }, [data]);

  const tabs = ["Weekly Alignment", "Daily Huddle"];
  const owners = ["Mark", "Dane", "Nikita"];

  function moveItem(list, fromIndex, toIndex) {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return list;
    const updated = [...list];
    const dragged = updated[fromIndex];
    updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, dragged);
    return updated;
  }

  function setActiveTab(tab) {
    setData((prev) => ({ ...prev, activeTab: tab }));
  }

  function setSelectedOwner(owner) {
    setData((prev) => ({ ...prev, selectedOwner: owner }));
  }

  function handleSectionDragStart(index) {
    setDraggedSectionIndex(index);
  }

  function handleSectionDrop(dropIndex) {
    if (draggedSectionIndex === null || draggedSectionIndex === dropIndex) return;
    setData((prev) => ({
      ...prev,
      sections: moveItem(prev.sections, draggedSectionIndex, dropIndex),
    }));
    setDraggedSectionIndex(null);
  }

  function handleSectionRowDragStart(sectionId, rowIndex) {
    setDraggedSectionRow({ sectionId, rowIndex });
  }

  function handleSectionRowDrop(sectionId, dropIndex) {
    if (
      draggedSectionRow.sectionId === null ||
      draggedSectionRow.rowIndex === null ||
      draggedSectionRow.sectionId !== sectionId
    ) {
      return;
    }

    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: moveItem(section.items, draggedSectionRow.rowIndex, dropIndex),
            }
          : section
      ),
    }));

    setDraggedSectionRow({ sectionId: null, rowIndex: null });
  }

  function handleDailyRowDragStart(index) {
    setDraggedDailyRowIndex(index);
  }

  function handleDailyRowDrop(dropIndex) {
    if (draggedDailyRowIndex === null || draggedDailyRowIndex === dropIndex) return;
    setData((prev) => ({
      ...prev,
      dailyCalendar: moveItem(prev.dailyCalendar, draggedDailyRowIndex, dropIndex),
    }));
    setDraggedDailyRowIndex(null);
  }

  function handleTodayTaskDragStart(index) {
    setDraggedTodayTaskIndex(index);
  }

  function handleTodayTaskDrop(dropIndex) {
    if (draggedTodayTaskIndex === null || draggedTodayTaskIndex === dropIndex) return;
    setData((prev) => ({
      ...prev,
      todayTasks: moveItem(prev.todayTasks, draggedTodayTaskIndex, dropIndex),
    }));
    setDraggedTodayTaskIndex(null);
  }

  function updateSectionNewItemText(sectionId, value) {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, newItemText: value } : section
      ),
    }));
  }

  function addItemToSection(sectionId) {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (!section.newItemText.trim()) return section;

        const text = section.newItemText.trim();
        let newItem;

        if (section.type === "priority") {
          newItem = { id: Date.now(), text, checked: false };
        } else if (section.type === "calendar") {
          newItem = {
            id: Date.now(),
            time: "9:00am",
            text,
            meta: "30m",
            checked: false,
          };
        } else {
          newItem = {
            id: Date.now(),
            text,
            priority: "Medium",
            owner: prev.selectedOwner,
            checked: false,
          };
        }

        return {
          ...section,
          items: [...section.items, newItem],
          newItemText: "",
        };
      }),
    }));
  }

  function deleteSectionItem(sectionId, itemId) {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section
      ),
    }));
  }

  function toggleSectionItemChecked(sectionId, itemId) {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : section
      ),
    }));
  }

  function updateSectionItemField(sectionId, itemId, field, value) {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : section
      ),
    }));
  }

  function addDailyCalendarItem() {
    setData((prev) => ({
      ...prev,
      dailyCalendar: [
        ...prev.dailyCalendar,
        {
          id: Date.now(),
          duration: "30m",
          text: "New meeting",
          time: "9:00am",
          checked: false,
        },
      ],
    }));
  }

  function deleteDailyCalendarItem(id) {
    setData((prev) => ({
      ...prev,
      dailyCalendar: prev.dailyCalendar.filter((item) => item.id !== id),
    }));
  }

  function toggleDailyCalendarItem(id) {
    setData((prev) => ({
      ...prev,
      dailyCalendar: prev.dailyCalendar.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  }

  function updateDailyCalendarField(id, field, value) {
    setData((prev) => ({
      ...prev,
      dailyCalendar: prev.dailyCalendar.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addTodayTask() {
    setData((prev) => ({
      ...prev,
      todayTasks: [
        ...prev.todayTasks,
        {
          id: Date.now(),
          text: "New task",
          priority: "Medium",
          owner: prev.selectedOwner,
          checked: false,
        },
      ],
    }));
  }

  function deleteTodayTask(id) {
    setData((prev) => ({
      ...prev,
      todayTasks: prev.todayTasks.filter((item) => item.id !== id),
    }));
  }

  function toggleTodayTask(id) {
    setData((prev) => ({
      ...prev,
      todayTasks: prev.todayTasks.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  }

  function updateTodayTaskField(id, field, value) {
    setData((prev) => ({
      ...prev,
      todayTasks: prev.todayTasks.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addComment() {
    if (!data.commentInput.trim()) return;

    setData((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: Date.now(),
          mention: prev.selectedOwner === "Mark" ? "@Mark" : prev.selectedOwner === "Dane" ? "@Dane" : "@Nikita",
          text: prev.commentInput.trim(),
          time: "now",
        },
      ],
      commentInput: "",
    }));
  }

  function getPriorityStyle(priority) {
    if (priority === "High") {
      return { background: "#FEE2E2", color: "#B91C1C" };
    }
    if (priority === "Medium") {
      return { background: "#FEF3C7", color: "#92400E" };
    }
    return { background: "#DCFCE7", color: "#166534" };
  }

  function renderCheck(checked, onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...styles.checkButton,
          ...(checked ? styles.checkButtonDone : {}),
        }}
      >
        {checked ? "✓" : ""}
      </button>
    );
  }

  function renderDragHandle() {
    return <span style={styles.dragHandle}>⋮⋮</span>;
  }

  function renderSectionRows(section) {
    if (section.type === "priority") {
      return section.items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleSectionRowDragStart(section.id, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleSectionRowDrop(section.id, index)}
          onDragEnd={() => setDraggedSectionRow({ sectionId: null, rowIndex: null })}
          style={{
            ...styles.itemRow,
            ...(draggedSectionRow.sectionId === section.id &&
            draggedSectionRow.rowIndex === index
              ? styles.draggingRow
              : {}),
          }}
        >
          <div style={styles.itemMain}>
            <div style={styles.meetingRowLeft}>
              {renderDragHandle()}
              {renderCheck(item.checked, () => toggleSectionItemChecked(section.id, item.id))}
              <input
                value={item.text}
                onChange={(e) =>
                  updateSectionItemField(section.id, item.id, "text", e.target.value)
                }
                style={{
                  ...styles.inlineEdit,
                  ...(item.checked ? styles.doneText : {}),
                }}
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.deleteBtn}
              onClick={() => deleteSectionItem(section.id, item.id)}
            >
              ×
            </button>
          </div>
        </div>
      ));
    }

    if (section.type === "calendar") {
      return section.items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleSectionRowDragStart(section.id, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleSectionRowDrop(section.id, index)}
          onDragEnd={() => setDraggedSectionRow({ sectionId: null, rowIndex: null })}
          style={{
            ...styles.itemRow,
            ...(draggedSectionRow.sectionId === section.id &&
            draggedSectionRow.rowIndex === index
              ? styles.draggingRow
              : {}),
          }}
        >
          <div style={styles.itemMain}>
            <div style={styles.meetingRowLeft}>
              {renderDragHandle()}
              {renderCheck(item.checked, () => toggleSectionItemChecked(section.id, item.id))}

              <input
                value={item.time}
                onChange={(e) =>
                  updateSectionItemField(section.id, item.id, "time", e.target.value)
                }
                style={styles.timeInline}
              />

              <input
                value={item.text}
                onChange={(e) =>
                  updateSectionItemField(section.id, item.id, "text", e.target.value)
                }
                style={{
                  ...styles.inlineEdit,
                  ...(item.checked ? styles.doneText : {}),
                }}
              />
            </div>
          </div>

          <div style={styles.actionsRow}>
            <input
              value={item.meta}
              onChange={(e) =>
                updateSectionItemField(section.id, item.id, "meta", e.target.value)
              }
              style={styles.miniInput}
            />
            <button
              style={styles.deleteBtn}
              onClick={() => deleteSectionItem(section.id, item.id)}
            >
              ×
            </button>
          </div>
        </div>
      ));
    }

    return section.items.map((item, index) => (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleSectionRowDragStart(section.id, index)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleSectionRowDrop(section.id, index)}
        onDragEnd={() => setDraggedSectionRow({ sectionId: null, rowIndex: null })}
        style={{
          ...styles.itemRow,
          ...(draggedSectionRow.sectionId === section.id &&
          draggedSectionRow.rowIndex === index
            ? styles.draggingRow
            : {}),
        }}
      >
        <div style={styles.itemMain}>
          <div style={styles.meetingRowLeft}>
            {renderDragHandle()}
            {renderCheck(item.checked, () => toggleSectionItemChecked(section.id, item.id))}
            <input
              value={item.text}
              onChange={(e) =>
                updateSectionItemField(section.id, item.id, "text", e.target.value)
              }
              style={{
                ...styles.inlineEdit,
                ...(item.checked ? styles.doneText : {}),
              }}
            />
          </div>
        </div>

        <div style={styles.actionsRow}>
          <select
            value={item.priority}
            onChange={(e) =>
              updateSectionItemField(section.id, item.id, "priority", e.target.value)
            }
            style={{
              ...styles.smallSelect,
              ...getPriorityStyle(item.priority),
            }}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={item.owner}
            onChange={(e) =>
              updateSectionItemField(section.id, item.id, "owner", e.target.value)
            }
            style={styles.smallSelectNeutral}
          >
            {owners.map((owner) => (
              <option key={owner}>{owner}</option>
            ))}
          </select>

          <button
            style={styles.deleteBtn}
            onClick={() => deleteSectionItem(section.id, item.id)}
          >
            ×
          </button>
        </div>
      </div>
    ));
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Meetings</div>
          <h1 style={styles.title}>Weekly alignment, calendars, and task flow</h1>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.panel}>
          <div style={styles.panelTop}>
            <div style={styles.rightToggle}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...styles.tabBtn,
                    ...(data.activeTab === tab ? styles.tabBtnActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {data.sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleSectionDragStart(sectionIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleSectionDrop(sectionIndex)}
              onDragEnd={() => setDraggedSectionIndex(null)}
              style={{
                ...styles.sectionCard,
                ...(draggedSectionIndex === sectionIndex ? styles.draggingSection : {}),
              }}
            >
              <div style={styles.sectionHeader}>
                <div style={styles.panelTitle}>{section.title}</div>
                <div style={styles.sectionHeaderRight}>
                  <span style={styles.dragHandle}>⋮⋮</span>
                </div>
              </div>

              <div style={styles.list}>{renderSectionRows(section)}</div>

              <div style={styles.quickAddRow}>
                <input
                  value={section.newItemText}
                  onChange={(e) => updateSectionNewItemText(section.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addItemToSection(section.id);
                  }}
                  placeholder={
                    section.type === "priority"
                      ? "Add priority..."
                      : section.type === "calendar"
                      ? "Add meeting..."
                      : "Add task..."
                  }
                  style={styles.inlineInput}
                />
                <button style={styles.addBtn} onClick={() => addItemToSection(section.id)}>
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTop}>
            <div style={styles.ownerToggle}>
              {owners.map((owner) => (
                <button
                  key={owner}
                  style={{
                    ...styles.ownerToggleBtn,
                    ...(data.selectedOwner === owner ? styles.ownerToggleBtnActive : {}),
                  }}
                  onClick={() => setSelectedOwner(owner)}
                >
                  {owner}
                </button>
              ))}
            </div>

            <div style={styles.timeStub}>
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div style={styles.panelTitle}>Daily Calendar</div>

          <div style={styles.list}>
            {data.dailyCalendar.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDailyRowDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDailyRowDrop(index)}
                onDragEnd={() => setDraggedDailyRowIndex(null)}
                style={{
                  ...styles.itemRow,
                  ...(draggedDailyRowIndex === index ? styles.draggingRow : {}),
                }}
              >
                <div style={styles.itemMain}>
                  <div style={styles.meetingRowLeft}>
                    {renderDragHandle()}
                    {renderCheck(item.checked, () => toggleDailyCalendarItem(item.id))}
                    <input
                      value={item.duration}
                      onChange={(e) =>
                        updateDailyCalendarField(item.id, "duration", e.target.value)
                      }
                      style={styles.durationInline}
                    />
                    <input
                      value={item.text}
                      onChange={(e) =>
                        updateDailyCalendarField(item.id, "text", e.target.value)
                      }
                      style={{
                        ...styles.inlineEdit,
                        ...(item.checked ? styles.doneText : {}),
                      }}
                    />
                  </div>
                </div>

                <div style={styles.actionsRow}>
                  <input
                    value={item.time}
                    onChange={(e) =>
                      updateDailyCalendarField(item.id, "time", e.target.value)
                    }
                    style={styles.timeInline}
                  />
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteDailyCalendarItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div style={styles.quickAddRow}>
              <button style={styles.addBtn} onClick={addDailyCalendarItem}>
                Add item
              </button>
            </div>
          </div>

          <div style={{ ...styles.panelTitle, marginTop: 20 }}>Today’s Tasks</div>

          <div style={styles.list}>
            {data.todayTasks.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleTodayTaskDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleTodayTaskDrop(index)}
                onDragEnd={() => setDraggedTodayTaskIndex(null)}
                style={{
                  ...styles.itemRow,
                  ...(draggedTodayTaskIndex === index ? styles.draggingRow : {}),
                }}
              >
                <div style={styles.itemMain}>
                  <div style={styles.meetingRowLeft}>
                    {renderDragHandle()}
                    {renderCheck(item.checked, () => toggleTodayTask(item.id))}
                    <input
                      value={item.text}
                      onChange={(e) =>
                        updateTodayTaskField(item.id, "text", e.target.value)
                      }
                      style={{
                        ...styles.inlineEdit,
                        ...(item.checked ? styles.doneText : {}),
                      }}
                    />
                  </div>
                </div>

                <div style={styles.actionsRow}>
                  <select
                    value={item.priority}
                    onChange={(e) =>
                      updateTodayTaskField(item.id, "priority", e.target.value)
                    }
                    style={{
                      ...styles.smallSelect,
                      ...getPriorityStyle(item.priority),
                    }}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>

                  <select
                    value={item.owner}
                    onChange={(e) =>
                      updateTodayTaskField(item.id, "owner", e.target.value)
                    }
                    style={styles.smallSelectNeutral}
                  >
                    {owners.map((owner) => (
                      <option key={owner}>{owner}</option>
                    ))}
                  </select>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteTodayTask(item.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <div style={styles.quickAddRow}>
              <button style={styles.addBtn} onClick={addTodayTask}>
                Add task
              </button>
            </div>
          </div>

          <div style={{ ...styles.panelTitle, marginTop: 20 }}>Comments</div>

          <div style={styles.list}>
            {data.comments.map((item) => (
              <div key={item.id} style={styles.commentRow}>
                <div style={styles.avatar}>
                  {item.mention.replace("@", "").charAt(0)}
                </div>

                <div style={styles.itemMain}>
                  <div style={styles.itemPreview}>
                    <span style={styles.commentMention}>{item.mention}</span> {item.text}
                  </div>
                  <div style={styles.itemTime}>{item.time}</div>
                </div>
              </div>
            ))}

            <div style={styles.quickAddRow}>
              <input
                value={data.commentInput}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, commentInput: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") addComment();
                }}
                placeholder="Write a comment..."
                style={styles.inlineInput}
              />
              <button style={styles.addBtn} onClick={addComment}>
                Add
              </button>
            </div>
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
    marginBottom: 20,
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

  layout: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 20,
  },

  panel: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  panelTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
    alignItems: "center",
  },

  panelTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 14,
  },

  ownerToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  ownerToggleBtn: {
    border: "none",
    background: "transparent",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    color: "#6B7280",
  },

  ownerToggleBtnActive: {
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  rightToggle: {
    display: "inline-flex",
    background: "#ECEEF2",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  tabBtn: {
    border: "1px solid #E5E7EB",
    background: "#F8FAFC",
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 13,
    color: "#6B7280",
  },

  tabBtnActive: {
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },

  sectionCard: {
    border: "1px solid #F0F1F3",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    background: "#FFFFFF",
  },

  draggingSection: {
    opacity: 0.55,
    background: "#F9FAFB",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    cursor: "grab",
  },

  sectionHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  quickAddRow: {
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

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #F0F1F3",
  },

  draggingRow: {
    opacity: 0.45,
    background: "#F9FAFB",
  },

  itemMain: {
    flex: 1,
    minWidth: 0,
  },

  meetingRowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
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

  checkButton: {
    width: 18,
    height: 18,
    borderRadius: 6,
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    color: "#111827",
    fontSize: 11,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
  },

  checkButtonDone: {
    background: "#111827",
    color: "#FFFFFF",
    border: "1px solid #111827",
  },

  inlineEdit: {
    flex: 1,
    minWidth: 0,
    border: "1px solid transparent",
    background: "transparent",
    fontSize: 14,
    color: "#111827",
    outline: "none",
    padding: "6px 8px",
    borderRadius: 8,
  },

  timeInline: {
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

  durationInline: {
    width: 64,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 12,
    outline: "none",
    color: "#374151",
    flexShrink: 0,
  },

  miniInput: {
    width: 64,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 12,
    outline: "none",
    color: "#374151",
    textAlign: "center",
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-end",
  },

  actionsRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexShrink: 0,
  },

  smallSelect: {
    border: "none",
    padding: "7px 10px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    outline: "none",
  },

  smallSelectNeutral: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    padding: "7px 10px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 11,
    color: "#374151",
    outline: "none",
  },

  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "#9CA3AF",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },

  commentRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid #F0F1F3",
  },

  avatar: {
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

  commentMention: {
    fontWeight: 600,
    color: "#111827",
  },

  itemPreview: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 1.4,
  },

  itemTime: {
    fontSize: 12,
    color: "#9CA3AF",
    whiteSpace: "nowrap",
    marginTop: 4,
  },

  timeStub: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 13,
    color: "#111827",
    minWidth: 92,
    textAlign: "center",
    fontWeight: 600,
  },

  doneText: {
    textDecoration: "line-through",
    color: "#9CA3AF",
  },
};
