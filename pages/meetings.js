import { useEffect, useState } from "react";

export default function MeetingsPage() {
  const defaultMeetings = [
    {
      id: 1,
      title: "Daily Huddle",
      owner: "Mark",
      notes: "Review priority asks, schedule changes, urgent follow-ups.",
    },
    {
      id: 2,
      title: "Weekly Executive Sync",
      owner: "Dane",
      notes: "Strategic updates, approvals, key decisions, and deadlines.",
    },
    {
      id: 3,
      title: "Inbox / Communication Review",
      owner: "Nikita",
      notes: "Review emails, WhatsApp, texts, and incoming requests.",
    },
    {
      id: 4,
      title: "Pending Decisions",
      owner: "Mark + Dane",
      notes: "Items waiting on approval or executive direction.",
    },
    {
      id: 5,
      title: "Follow-Ups",
      owner: "Nikita",
      notes: "Outstanding tasks to chase, delegate, or close.",
    },
  ];

  const [meetingItems, setMeetingItems] = useState(defaultMeetings);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("meetingItems");
    if (saved) {
      setMeetingItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("meetingItems", JSON.stringify(meetingItems));
  }, [meetingItems]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updated = [...meetingItems];
    const draggedItem = updated[draggedIndex];

    updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setMeetingItems(updated);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const addMeetingItem = () => {
    if (!newTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      owner: newOwner || "Unassigned",
      notes: newNotes || "No notes added.",
    };

    setMeetingItems([...meetingItems, newItem]);
    setNewTitle("");
    setNewOwner("");
    setNewNotes("");
  };

  const deleteMeetingItem = (id) => {
    setMeetingItems(meetingItems.filter((item) => item.id !== id));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Meetings</h1>
          <p style={styles.subtitle}>
            Drag and drop items to reorder your meeting page.
          </p>
        </div>

        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Add Meeting Item</h2>

          <input
            type="text"
            placeholder="Meeting title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={styles.input}
          />

          <input
            type="text"
            placeholder="Owner"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={addMeetingItem} style={styles.addButton}>
            Add Item
          </button>
        </div>

        <div style={styles.list}>
          {meetingItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              style={{
                ...styles.card,
                ...(draggedIndex === index ? styles.draggingCard : {}),
              }}
            >
              <div style={styles.dragHandle}>☰</div>

              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.owner}>{item.owner}</p>
                <p style={styles.notes}>{item.notes}</p>
              </div>

              <button
                onClick={() => deleteMeetingItem(item.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111",
  },
  subtitle: {
    marginTop: "8px",
    color: "#666",
    fontSize: "16px",
  },
  formCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    border: "1px solid #e3e3e3",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "20px",
    color: "#111",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "12px 14px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  addButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    background: "#ffffff",
    border: "1px solid #e3e3e3",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    cursor: "grab",
  },
  draggingCard: {
    opacity: 0.5,
    background: "#eef3ff",
  },
  dragHandle: {
    fontSize: "22px",
    color: "#888",
    paddingTop: "4px",
    userSelect: "none",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "20px",
    color: "#111",
  },
  owner: {
    margin: "0 0 8px 0",
    fontWeight: "600",
    color: "#444",
  },
  notes: {
    margin: 0,
    color: "#666",
    lineHeight: "1.5",
  },
  deleteButton: {
    background: "#e5484d",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};
