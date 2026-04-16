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
      title: newTitle.trim(),
      owner: newOwner.trim() || "Unassigned",
      notes: newNotes.trim() || "No notes added.",
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
      <div style={styles.overlay} />

      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <p style={styles.eyebrow}>Executive Operating System</p>
            <h1 style={styles.title}>Meetings</h1>
            <p style={styles.subtitle}>
              Reorder items by dragging them into the order you want.
            </p>
          </div>
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.formCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Add Meeting Item</h2>
              <p style={styles.sectionSubtitle}>
                Add a new agenda block, review section, or recurring meeting item.
              </p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                placeholder="Meeting title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Owner</label>
              <input
                type="text"
                placeholder="Owner"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                placeholder="Notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                style={styles.textarea}
              />
            </div>

            <button onClick={addMeetingItem} style={styles.addButton}>
              Add Item
            </button>
          </div>

          <div style={styles.listPanel}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Meeting Flow</h2>
              <p style={styles.sectionSubtitle}>
                Drag cards to reorder how your meeting page runs.
              </p>
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
                  <div style={styles.dragHandle}>⋮⋮</div>

                  <div style={styles.cardContent}>
                    <div style={styles.cardTopRow}>
                      <div>
                        <h3 style={styles.cardTitle}>{item.title}</h3>
                        <div style={styles.ownerBadge}>{item.owner}</div>
                      </div>
                    </div>

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
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7f8fa 0%, #eef1f5 100%)",
    padding: "36px 20px 48px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 35%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: "1180px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  topBar: {
    marginBottom: "24px",
  },
  eyebrow: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#7b8190",
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.05,
    color: "#101114",
    fontWeight: 750,
  },
  subtitle: {
    marginTop: "10px",
    color: "#666f7d",
    fontSize: "16px",
    maxWidth: "560px",
    lineHeight: 1.5,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "22px",
    alignItems: "start",
  },
  formCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    padding: "22px",
    border: "1px solid rgba(16,17,20,0.07)",
    boxShadow: "0 18px 50px rgba(16, 17, 20, 0.08)",
    position: "sticky",
    top: "24px",
  },
  listPanel: {
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    padding: "22px",
    border: "1px solid rgba(16,17,20,0.07)",
    boxShadow: "0 18px 50px rgba(16, 17, 20, 0.06)",
  },
  cardHeader: {
    marginBottom: "18px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111318",
    fontWeight: 700,
  },
  sectionSubtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#707887",
    lineHeight: 1.5,
  },
  fieldGroup: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#5f6775",
    fontWeight: 600,
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #d9dee7",
    background: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    color: "#111318",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #d9dee7",
    background: "#ffffff",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    color: "#111318",
  },
  addButton: {
    width: "100%",
    background: "#111318",
    color: "#ffffff",
    border: "none",
    padding: "14px 18px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
    marginTop: "6px",
    boxShadow: "0 10px 22px rgba(17,19,24,0.18)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "28px 1fr auto",
    alignItems: "start",
    gap: "16px",
    background: "#ffffff",
    border: "1px solid rgba(16,17,20,0.08)",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 10px 30px rgba(16,17,20,0.05)",
    cursor: "grab",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
  },
  draggingCard: {
    opacity: 0.55,
    transform: "scale(0.99)",
    background: "#f3f6fb",
  },
  dragHandle: {
    fontSize: "18px",
    color: "#98a0ae",
    userSelect: "none",
    lineHeight: 1.2,
    paddingTop: "4px",
    letterSpacing: "1px",
  },
  cardContent: {
    minWidth: 0,
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#12141a",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  ownerBadge: {
    display: "inline-flex",
    marginTop: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f2f4f7",
    color: "#444c59",
    fontSize: "12px",
    fontWeight: 700,
  },
  notes: {
    margin: 0,
    color: "#687181",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  deleteButton: {
    background: "#f04f55",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    alignSelf: "start",
    boxShadow: "0 8px 18px rgba(240,79,85,0.2)",
  },
};
