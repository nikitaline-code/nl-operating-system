import { useEffect, useState } from "react";

export default function MeetingsPage() {
  const defaultWeeklySections = [
    {
      id: 1,
      title: "Top Shared Priorities",
      type: "priority",
      items: [
        { id: 101, text: "Win the week", checked: false },
        { id: 102, text: "Stay disciplined", checked: false },
        { id: 103, text: "Stay focused", checked: false },
      ],
      newItemText: "",
    },
    {
      id: 2,
      title: "Weekly Calendar Review",
      type: "calendar",
      items: [
        { id: 201, time: "9:00am", text: "Weekly review with team", meta: "30mn" },
        { id: 202, time: "10:15am", text: "New client onboarding call", meta: "45mn" },
      ],
      newItemText: "",
    },
    {
      id: 3,
      title: "Tasks for the Week",
      type: "task",
      items: [
        { id: 301, text: "Follow up w/ Client X", priority: "High", owner: "Dane" },
        { id: 302, text: "Finish proposal draft", priority: "Medium", owner: "Mark" },
        { id: 303, text: "Review funding round options", priority: "Low", owner: "Mark" },
      ],
      newItemText: "",
    },
  ];

  const defaultDailyCalendar = [
    { id: 1, duration: "30m", text: "Weekly review with team", time: "9:00am", checked: false },
    { id: 2, duration: "45m", text: "New client onboarding call", time: "10:15am", checked: false },
    { id: 3, duration: "60m", text: "Marketing strategy session", time: "1:00pm", checked: false },
  ];

  const defaultTodayTasks = [
    { id: 1, avatar: "👨🏻", text: "Follow up w Client X", priority: "High", owner: "Dane" },
    { id: 2, avatar: "👨🏼", text: "Finish proposal draft", priority: "Medium", owner: "Mark" },
    { id: 3, avatar: "👨🏽", text: "Review funding round options", priority: "Low", owner: "Mark" },
  ];

  const defaultComments = [
    {
      id: 1,
      avatar: "👨🏽",
      mention: "@Mark",
      text: "needed help setting up the new staging environment.",
      time: "1m ago",
    },
    {
      id: 2,
      avatar: "👨🏼",
      mention: "@Dane",
      text: "Client asked about a timetable ready for tomorrow.",
      time: "1m ago",
    },
  ];

  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedOwner, setSelectedOwner] = useState("Mark");
  const [weeklySections, setWeeklySections] = useState(defaultWeeklySections);
  const [dailyCalendar, setDailyCalendar] = useState(defaultDailyCalendar);
  const [todayTasks, setTodayTasks] = useState(defaultTodayTasks);
  const [comments, setComments] = useState(defaultComments);
  const [commentInput, setCommentInput] = useState("");
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);

  useEffect(() => {
    const savedWeeklySections = localStorage.getItem("meetings_weekly_sections");
    const savedDailyCalendar = localStorage.getItem("meetings_daily_calendar");
    const savedTodayTasks = localStorage.getItem("meetings_today_tasks");
    const savedComments = localStorage.getItem("meetings_comments");
    const savedTab = localStorage.getItem("meetings_active_tab");
    const savedOwner = localStorage.getItem("meetings_selected_owner");

    if (savedWeeklySections) setWeeklySections(JSON.parse(savedWeeklySections));
    if (savedDailyCalendar) setDailyCalendar(JSON.parse(savedDailyCalendar));
    if (savedTodayTasks) setTodayTasks(JSON.parse(savedTodayTasks));
    if (savedComments) setComments(JSON.parse(savedComments));
    if (savedTab) setActiveTab(savedTab);
    if (savedOwner) setSelectedOwner(savedOwner);
  }, []);

  useEffect(() => {
    localStorage.setItem("meetings_weekly_sections", JSON.stringify(weeklySections));
  }, [weeklySections]);

  useEffect(() => {
    localStorage.setItem("meetings_daily_calendar", JSON.stringify(dailyCalendar));
  }, [dailyCalendar]);

  useEffect(() => {
    localStorage.setItem("meetings_today_tasks", JSON.stringify(todayTasks));
  }, [todayTasks]);

  useEffect(() => {
    localStorage.setItem("meetings_comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("meetings_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("meetings_selected_owner", selectedOwner);
  }, [selectedOwner]);

  const handleSectionDragStart = (index) => {
    setDraggedSectionIndex(index);
  };

  const handleSectionDragOver = (e) => {
    e.preventDefault();
  };

  const handleSectionDrop = (dropIndex) => {
    if (draggedSectionIndex === null || draggedSectionIndex === dropIndex) return;

    const updated = [...weeklySections];
    const draggedItem = updated[draggedSectionIndex];
    updated.splice(draggedSectionIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setWeeklySections(updated);
    setDraggedSectionIndex(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionIndex(null);
  };

  const updateSectionNewItemText = (sectionId, value) => {
    setWeeklySections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, newItemText: value } : section
      )
    );
  };

  const addItemToSection = (sectionId) => {
    setWeeklySections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        if (!section.newItemText.trim()) return section;

        const text = section.newItemText.trim();
        let newItem;

        if (section.type === "priority") {
          newItem = { id: Date.now(), text, checked: false };
        } else if (section.type === "calendar") {
          newItem = { id: Date.now(), time: "9:00am", text, meta: "30mn" };
        } else {
          newItem = { id: Date.now(), text, priority: "Medium", owner: "Mark" };
        }

        return {
          ...section,
          items: [...section.items, newItem],
          newItemText: "",
        };
      })
    );
  };

  const deleteSectionItem = (sectionId, itemId) => {
    setWeeklySections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section
      )
    );
  };

  const addDailyCalendarItem = () => {
    setDailyCalendar((prev) => [
      ...prev,
      {
        id: Date.now(),
        duration: "30m",
        text: "New item",
        time: "9:00am",
        checked: false,
      },
    ]);
  };

  const deleteDailyCalendarItem = (id) => {
    setDailyCalendar((prev) => prev.filter((item) => item.id !== id));
  };

  const addTodayTask = () => {
    setTodayTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        avatar: "👤",
        text: "New task",
        priority: "Medium",
        owner: selectedOwner,
      },
    ]);
  };

  const deleteTodayTask = (id) => {
    setTodayTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const addComment = () => {
    if (!commentInput.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        avatar: "👤",
        mention: selectedOwner === "Mark" ? "@Mark" : "@Dane",
        text: commentInput.trim(),
        time: "now",
      },
    ]);

    setCommentInput("");
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return {
        background: "#d98c79",
        color: "#fff",
      };
    }
    if (priority === "Medium") {
      return {
        background: "#ead9b6",
        color: "#7a6849",
      };
    }
    return {
      background: "#8faa90",
      color: "#fff",
    };
  };

  const renderSectionRows = (section) => {
    if (section.type === "priority") {
      return section.items.map((item) => (
        <div key={item.id} style={styles.row}>
          <div style={styles.rowLeft}>
            <div style={styles.checkbox} />
            <span style={styles.rowText}>{item.text}</span>
          </div>
          <button
            onClick={() => deleteSectionItem(section.id, item.id)}
            style={styles.iconButton}
          >
            ×
          </button>
        </div>
      ));
    }

    if (section.type === "calendar") {
      return section.items.map((item) => (
        <div key={item.id} style={styles.row}>
          <div style={styles.rowLeft}>
            <div style={styles.radio} />
            <span style={styles.rowText}>
              {item.time} | {item.text}
            </span>
          </div>
          <div style={styles.rowRightCluster}>
            <div style={styles.metaPill}>{item.meta}</div>
            <button
              onClick={() => deleteSectionItem(section.id, item.id)}
              style={styles.iconButton}
            >
              ˅
            </button>
          </div>
        </div>
      ));
    }

    return section.items.map((item) => (
      <div key={item.id} style={styles.row}>
        <div style={styles.rowLeft}>
          <div style={styles.checkbox} />
          <span style={styles.rowText}>{item.text}</span>
        </div>
        <div style={styles.rowRightCluster}>
          <div style={{ ...styles.priorityPill, ...getPriorityStyle(item.priority) }}>
            {item.priority}
          </div>
          <div style={styles.ownerSelect}>{item.owner} ˅</div>
          <button
            onClick={() => deleteSectionItem(section.id, item.id)}
            style={styles.iconButton}
          >
            ×
          </button>
          <button
            onClick={() => deleteSectionItem(section.id, item.id)}
            style={styles.iconButton}
          >
            ×
          </button>
        </div>
      </div>
    ));
  };

  const renderLeftColumn = () => (
    <div style={styles.leftColumn}>
      {weeklySections.map((section, index) => (
        <div
          key={section.id}
          draggable
          onDragStart={() => handleSectionDragStart(index)}
          onDragOver={handleSectionDragOver}
          onDrop={() => handleSectionDrop(index)}
          onDragEnd={handleSectionDragEnd}
          style={{
            ...styles.panel,
            ...(draggedSectionIndex === index ? styles.draggingPanel : {}),
          }}
        >
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>{section.title}</h3>
            <span style={styles.chevron}>˅</span>
          </div>

          <div style={styles.sectionBody}>{renderSectionRows(section)}</div>

          <div style={styles.addRow}>
            <span style={styles.addPlus}>＋</span>
            <input
              value={section.newItemText}
              onChange={(e) => updateSectionNewItemText(section.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItemToSection(section.id);
              }}
              placeholder={
                section.type === "priority"
                  ? "Add new priority..."
                  : section.type === "calendar"
                  ? "Add new item..."
                  : "Add new decision..."
              }
              style={styles.addInput}
            />
            <button onClick={() => addItemToSection(section.id)} style={styles.hiddenAddButton}>
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRightColumn = () => (
    <div style={styles.rightColumn}>
      <div style={styles.panel}>
        <div style={styles.rightTopBar}>
          <div style={styles.ownerTabs}>
            <button
              onClick={() => setSelectedOwner("Mark")}
              style={{
                ...styles.ownerTab,
                ...(selectedOwner === "Mark" ? styles.ownerTabActive : {}),
              }}
            >
              Mark
            </button>
            <button
              onClick={() => setSelectedOwner("Dane")}
              style={{
                ...styles.ownerTab,
                ...(selectedOwner === "Dane" ? styles.ownerTabActive : {}),
              }}
            >
              Dane
            </button>
          </div>

          <div style={styles.timeCard}>20:19</div>
        </div>

        <div style={styles.subPanel}>
          <h3 style={styles.panelTitle}>Daily Calendar</h3>

          {dailyCalendar.map((item) => (
            <div key={item.id} style={styles.row}>
              <div style={styles.rowLeft}>
                <div style={styles.checkbox} />
                <span style={styles.rowText}>
                  {item.duration} | {item.text}
                </span>
              </div>
              <div style={styles.timeText}>{item.time}</div>
            </div>
          ))}

          <div style={styles.addRow}>
            <span style={styles.addPlus}>＋</span>
            <button onClick={addDailyCalendarItem} style={styles.linkAddButton}>
              Add new item...
            </button>
          </div>
        </div>

        <div style={styles.subPanel}>
          <h3 style={styles.panelTitle}>Today’s Tasks</h3>

          {todayTasks.map((item) => (
            <div key={item.id} style={styles.row}>
              <div style={styles.rowLeft}>
                <div style={styles.checkbox} />
                <span style={styles.avatar}>{item.avatar}</span>
                <span style={styles.rowText}>{item.text}</span>
              </div>

              <div style={styles.rowRightCluster}>
                <div style={{ ...styles.priorityPill, ...getPriorityStyle(item.priority) }}>
                  {item.priority}
                </div>
                <div style={styles.ownerSelect}>{item.owner} ˅</div>
                <button onClick={() => deleteTodayTask(item.id)} style={styles.iconButton}>
                  ×
                </button>
                <button onClick={() => deleteTodayTask(item.id)} style={styles.iconButton}>
                  ×
                </button>
              </div>
            </div>
          ))}

          <div style={styles.addRow}>
            <span style={styles.addPlus}>＋</span>
            <button onClick={addTodayTask} style={styles.linkAddButton}>
              Add new task...
            </button>
          </div>
        </div>

        <div style={styles.commentsWrap}>
          {comments.map((comment) => (
            <div key={comment.id} style={styles.commentRow}>
              <div style={styles.commentAvatar}>{comment.avatar}</div>
              <div style={styles.commentContent}>
                <div style={styles.commentText}>
                  <span style={styles.mentionPill}>{comment.mention}</span>{" "}
                  {comment.text}
                </div>
                <div style={styles.commentTime}>{comment.time}</div>
              </div>
            </div>
          ))}

          <div style={styles.commentInputRow}>
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addComment();
              }}
              placeholder="Write a comment..."
              style={styles.commentInput}
            />
            <button onClick={addComment} style={styles.sendButton}>
              ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>🗂️</div>
        <div>
          <h1 style={styles.pageTitle}>Meetings</h1>
          <p style={styles.pageSubtitle}>Organize weekly and daily meetings</p>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.tabsWrap}>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("weekly")}
            style={{
              ...styles.tab,
              ...(activeTab === "weekly" ? styles.activeTab : {}),
            }}
          >
            Weekly Alignment
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            style={{
              ...styles.tab,
              ...(activeTab === "daily" ? styles.activeTab : {}),
            }}
          >
            Daily Huddle
          </button>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {renderLeftColumn()}
        {renderRightColumn()}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f5f9",
    padding: "24px 22px 36px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#313847",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "10px",
  },
  headerIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#6d93c9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    color: "#fff",
    flexShrink: 0,
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#2e3442",
  },
  pageSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "16px",
    color: "#6f7685",
  },
  divider: {
    height: "1px",
    background: "#e3e6ee",
    margin: "18px 0 14px",
  },
  tabsWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "18px",
  },
  tabs: {
    display: "inline-flex",
    background: "#eef1f6",
    border: "1px solid #d7dce7",
    borderRadius: "8px",
    overflow: "hidden",
  },
  tab: {
    border: "none",
    background: "transparent",
    padding: "12px 26px",
    fontSize: "18px",
    color: "#394253",
    cursor: "pointer",
    minWidth: "190px",
  },
  activeTab: {
    background: "#6d93c9",
    color: "#fff",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "18px",
    alignItems: "start",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
  },
  panel: {
    background: "#fbfbfd",
    border: "1px solid #e0e4ec",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    padding: "14px 18px",
  },
  draggingPanel: {
    opacity: 0.55,
    background: "#eef2f8",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    cursor: "grab",
  },
  panelTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 500,
    color: "#3a4151",
  },
  chevron: {
    color: "#9097a7",
    fontSize: "22px",
    lineHeight: 1,
  },
  sectionBody: {
    borderTop: "1px solid #ebeef4",
  },
  row: {
    minHeight: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    borderBottom: "1px solid #ebeef4",
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  },
  rowText: {
    fontSize: "18px",
    color: "#454d5d",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowRightCluster: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  checkbox: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    border: "2px solid #c6cbd7",
    background: "#f8f9fc",
    flexShrink: 0,
  },
  radio: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "2px solid #aeb5c3",
    background: "#f8f9fc",
    flexShrink: 0,
  },
  metaPill: {
    minWidth: "78px",
    textAlign: "center",
    padding: "7px 12px",
    borderRadius: "6px",
    border: "1px solid #d8dde8",
    background: "#f9fafc",
    color: "#495264",
    fontSize: "16px",
  },
  priorityPill: {
    padding: "5px 14px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.1,
  },
  ownerSelect: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #d4d9e4",
    background: "#f7f8fb",
    color: "#4f586b",
    fontSize: "14px",
    minWidth: "74px",
    textAlign: "center",
  },
  iconButton: {
    border: "none",
    background: "transparent",
    color: "#b1b7c4",
    fontSize: "18px",
    cursor: "pointer",
    padding: 0,
    width: "20px",
  },
  addRow: {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #dce1ea",
    borderRadius: "6px",
    background: "#fafbfd",
    minHeight: "40px",
    padding: "0 12px",
  },
  addPlus: {
    color: "#7c8596",
    fontSize: "18px",
    flexShrink: 0,
  },
  addInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "16px",
    color: "#4d5567",
  },
  hiddenAddButton: {
    display: "none",
  },
  rightTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  ownerTabs: {
    display: "inline-flex",
    border: "1px solid #d7dce6",
    borderRadius: "6px",
    overflow: "hidden",
  },
  ownerTab: {
    border: "none",
    background: "#f8f9fc",
    color: "#3f4757",
    fontSize: "18px",
    padding: "10px 24px",
    cursor: "pointer",
  },
  ownerTabActive: {
    background: "#6d93c9",
    color: "#fff",
  },
  timeCard: {
    minWidth: "148px",
    textAlign: "center",
    padding: "10px 18px",
    borderRadius: "6px",
    background: "#69a7ad",
    color: "#fff",
    fontSize: "22px",
    fontWeight: 500,
  },
  subPanel: {
    border: "1px solid #e4e8ef",
    borderRadius: "8px",
    padding: "14px 16px",
    marginBottom: "14px",
    background: "#fcfcfe",
  },
  linkAddButton: {
    border: "none",
    background: "transparent",
    color: "#7a8191",
    fontSize: "16px",
    cursor: "pointer",
    padding: 0,
  },
  timeText: {
    fontSize: "18px",
    color: "#454d5d",
    flexShrink: 0,
  },
  avatar: {
    fontSize: "24px",
    lineHeight: 1,
    flexShrink: 0,
  },
  commentsWrap: {
    marginTop: "4px",
  },
  commentRow: {
    display: "flex",
    gap: "12px",
    padding: "12px 0",
    borderTop: "1px solid #ebeef4",
  },
  commentAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#eef2f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: "17px",
    color: "#454d5d",
    lineHeight: 1.45,
  },
  mentionPill: {
    background: "#e4e9f8",
    color: "#4f6295",
    padding: "3px 8px",
    borderRadius: "10px",
    display: "inline-block",
    marginRight: "2px",
  },
  commentTime: {
    marginTop: "4px",
    fontSize: "14px",
    color: "#8b92a2",
    textAlign: "right",
  },
  commentInputRow: {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #dce1ea",
    borderRadius: "6px",
    background: "#fafbfd",
    minHeight: "40px",
    padding: "0 10px 0 14px",
  },
  commentInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "16px",
    color: "#4d5567",
  },
  sendButton: {
    border: "none",
    background: "transparent",
    color: "#6c7486",
    fontSize: "20px",
    cursor: "pointer",
    padding: 0,
  },
};
