import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daily-os-communications-v1";

function seedData() {
  return {
    selectedOwner: "Mark",
    emailTab: "Inbox",
    messageTab: "WhatsApp",
    emails: {
      Mark: {
        Inbox: [
          {
            id: 1,
            from: "Client X",
            subject: "Need revised proposal",
            preview: "Can you confirm the final timeline and pricing today?",
            time: "1h ago",
          },
          {
            id: 2,
            from: "Vendor",
            subject: "Invoice question",
            preview: "Please review the attached invoice and confirm.",
            time: "3h ago",
          },
        ],
        "Assign to EA": [],
        Processed: [],
      },
      Nikita: {
        Inbox: [
          {
            id: 3,
            from: "Lauren @ Client X",
            subject: "Follow-up",
            preview: "Checking in from today. Let me know next steps.",
            time: "2h ago",
          },
        ],
        "Assign to EA": [],
        Processed: [],
      },
      Dane: {
        Inbox: [
          {
            id: 4,
            from: "Dane",
            subject: "Funding round note",
            preview: "Need your take on the proposal update.",
            time: "Yesterday",
          },
        ],
        "Assign to EA": [],
        Processed: [],
      },
    },
    messages: {
      WhatsApp: [
        {
          id: 101,
          name: "Jess",
          preview: "I’ll finalize the details and send the updated doc by EOD.",
          time: "2m",
          unread: 1,
        },
        {
          id: 102,
          name: "Michael",
          preview: "When can we schedule a call?",
          time: "2h",
          unread: 1,
        },
        {
          id: 103,
          name: "Dane",
          preview: "Got it. I’ll update the timeline based on this.",
          time: "Yesterday",
          unread: 0,
        },
      ],
      Texts: [
        {
          id: 201,
          name: "Amanda",
          preview: "Great meeting earlier. Let’s move forward with the plan.",
          time: "Yesterday",
          unread: 0,
        },
        {
          id: 202,
          name: "Brad @ LimoHireCo",
          preview: "Here’s the receipt for the trip last night.",
          time: "Monday",
          unread: 0,
        },
      ],
    },
  };
}

export default function CommunicationsPage() {
  const [data, setData] = useState(seedData);
  const [search, setSearch] = useState("");
  const [newEmailDraft, setNewEmailDraft] = useState("");

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

  const owners = ["Mark", "Nikita", "Dane"];
  const emailTabs = ["Inbox", "Assign to EA", "Processed"];
  const messageTabs = ["WhatsApp", "Texts"];

  const selectedOwner = data.selectedOwner;
  const selectedEmailTab = data.emailTab;
  const selectedMessageTab = data.messageTab;

  const currentEmails = data.emails[selectedOwner][selectedEmailTab] || [];
  const currentMessages = data.messages[selectedMessageTab] || [];

  const filteredEmails = useMemo(() => {
    if (!search.trim()) return currentEmails;
    const q = search.toLowerCase();
    return currentEmails.filter(
      (item) =>
        item.from.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q)
    );
  }, [currentEmails, search]);

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return currentMessages;
    const q = search.toLowerCase();
    return currentMessages.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.preview.toLowerCase().includes(q)
    );
  }, [currentMessages, search]);

  function setOwner(owner) {
    setData((prev) => ({ ...prev, selectedOwner: owner }));
  }

  function setEmailTab(tab) {
    setData((prev) => ({ ...prev, emailTab: tab }));
  }

  function setMessageTab(tab) {
    setData((prev) => ({ ...prev, messageTab: tab }));
  }

  function moveEmail(id, fromTab, toTab) {
    if (fromTab === toTab) return;

    setData((prev) => {
      const ownerData = prev.emails[selectedOwner];
      const movingItem = ownerData[fromTab].find((item) => item.id === id);
      if (!movingItem) return prev;

      return {
        ...prev,
        emails: {
          ...prev.emails,
          [selectedOwner]: {
            ...ownerData,
            [fromTab]: ownerData[fromTab].filter((item) => item.id !== id),
            [toTab]: [movingItem, ...ownerData[toTab]],
          },
        },
      };
    });
  }

  function deleteEmail(id, fromTab) {
    setData((prev) => {
      const ownerData = prev.emails[selectedOwner];
      return {
        ...prev,
        emails: {
          ...prev.emails,
          [selectedOwner]: {
            ...ownerData,
            [fromTab]: ownerData[fromTab].filter((item) => item.id !== id),
          },
        },
      };
    });
  }

  function addEmailManually() {
    if (!newEmailDraft.trim()) return;

    const newItem = {
      id: Date.now(),
      from: "New item",
      subject: newEmailDraft.trim(),
      preview: "Added manually",
      time: "now",
    };

    setData((prev) => {
      const ownerData = prev.emails[selectedOwner];
      return {
        ...prev,
        emails: {
          ...prev.emails,
          [selectedOwner]: {
            ...ownerData,
            Inbox: [newItem, ...ownerData.Inbox],
          },
        },
      };
    });

    setNewEmailDraft("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Communication Center</div>
          <h1 style={styles.title}>Manage inbox, WhatsApp, and texts</h1>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.panel}>
          <div style={styles.panelTop}>
            <div style={styles.ownerToggle}>
              {owners.map((owner) => (
                <button
                  key={owner}
                  style={{
                    ...styles.ownerToggleBtn,
                    ...(selectedOwner === owner ? styles.ownerToggleBtnActive : {}),
                  }}
                  onClick={() => setOwner(owner)}
                >
                  {owner}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              style={styles.search}
            />
          </div>

          <div style={styles.panelTitle}>Email Inbox</div>

          <div style={styles.tabRow}>
            {emailTabs.map((tab) => (
              <button
                key={tab}
                style={{
                  ...styles.tabBtn,
                  ...(selectedEmailTab === tab ? styles.tabBtnActive : {}),
                }}
                onClick={() => setEmailTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.quickAddRow}>
            <input
              value={newEmailDraft}
              onChange={(e) => setNewEmailDraft(e.target.value)}
              placeholder="Add manual item..."
              style={styles.inlineInput}
            />
            <button style={styles.addBtn} onClick={addEmailManually}>
              Add
            </button>
          </div>

          <div style={styles.list}>
            {filteredEmails.map((item) => (
              <div key={item.id} style={styles.itemRow}>
                <div style={styles.itemMain}>
                  <div style={styles.itemTopLine}>
                    <span style={styles.itemName}>{item.from}</span>
                    <span style={styles.itemTime}>{item.time}</span>
                  </div>
                  <div style={styles.itemSubject}>{item.subject}</div>
                  <div style={styles.itemPreview}>{item.preview}</div>
                </div>

                <div style={styles.actions}>
                  {selectedEmailTab !== "Assign to EA" && (
                    <button
                      style={styles.smallPill}
                      onClick={() => moveEmail(item.id, selectedEmailTab, "Assign to EA")}
                    >
                      Assign to EA
                    </button>
                  )}

                  {selectedEmailTab !== "Processed" && (
                    <button
                      style={styles.smallPill}
                      onClick={() => moveEmail(item.id, selectedEmailTab, "Processed")}
                    >
                      Processed
                    </button>
                  )}

                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteEmail(item.id, selectedEmailTab)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {filteredEmails.length === 0 && (
              <div style={styles.emptyState}>No items here.</div>
            )}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTop}>
            <div style={styles.rightToggle}>
              {messageTabs.map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...styles.tabBtn,
                    ...(selectedMessageTab === tab ? styles.tabBtnActive : {}),
                  }}
                  onClick={() => setMessageTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={styles.searchStub}>Search</div>
          </div>

          <div style={styles.panelTitle}>
            {selectedMessageTab === "WhatsApp" ? "WhatsApp" : "Texts"}
          </div>

          <div style={styles.list}>
            {filteredMessages.map((item) => (
              <div key={item.id} style={styles.messageRow}>
                <div style={styles.avatar}>{item.name.charAt(0)}</div>

                <div style={styles.itemMain}>
                  <div style={styles.itemTopLine}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemTime}>{item.time}</span>
                  </div>
                  <div style={styles.itemPreview}>{item.preview}</div>
                </div>

                {item.unread > 0 && <div style={styles.unread}>{item.unread}</div>}
              </div>
            ))}

            {filteredMessages.length === 0 && (
              <div style={styles.emptyState}>No messages here.</div>
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
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  panel: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    minHeight: 640,
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

  tabRow: {
    display: "flex",
    gap: 8,
    marginBottom: 14,
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

  search: {
    width: 150,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 13,
    outline: "none",
  },

  searchStub: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    fontSize: 13,
    color: "#6B7280",
    minWidth: 92,
    textAlign: "center",
  },

  quickAddRow: {
    display: "flex",
    gap: 8,
    marginBottom: 14,
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
    padding: "14px 0",
    borderBottom: "1px solid #F0F1F3",
  },

  itemMain: {
    flex: 1,
    minWidth: 0,
  },

  itemTopLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },

  itemName: {
    fontSize: 15,
    fontWeight: 600,
  },

  itemSubject: {
    fontSize: 13,
    color: "#111827",
    marginBottom: 2,
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
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-end",
  },

  smallPill: {
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    padding: "6px 10px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 11,
    color: "#374151",
  },

  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "#9CA3AF",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },

  messageRow: {
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

  unread: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    background: "#EEF2FF",
    color: "#4F46E5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    flexShrink: 0,
    marginTop: 4,
  },

  emptyState: {
    color: "#6B7280",
    fontSize: 13,
    padding: "12px 0",
  },
};
