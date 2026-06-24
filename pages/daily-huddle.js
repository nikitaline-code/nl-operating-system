import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daily-huddle-mf";

const blankData = {
  meetings: [
    { time: "9:00 AM – 10:00 AM", title: "Leadership Standup", attendees: "Mark, Dane, Nikita", location: "Zoom Link" },
  ],
  tasks: [
    { task: "Finish dealer pricing updates", owner: "Nikita", status: "In Progress", due: "Overdue" },
  ],
  emails: [
    { from: "Dustin Doe", subject: "Updated pricing proposal", status: "Waiting for Response" },
  ],
  clarifications: [
    { item: "Confirm dealer contract terms", requestedFrom: "Dane" },
  ],
  notes: {
    schedule: "",
    tasks: "",
    emails: "",
    clarifications: "",
  },
};

export default function DailyHuddle() {
  const [activeExec, setActiveExec] = useState("MF");
  const [data, setData] = useState(blankData);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) setData(JSON.parse(savedData));
  }, []);

  useEffect(() => {
    setSaved(false);

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      if (activeExec === "MF") {
        localStorage.setItem("mark-dashboard-sync", JSON.stringify({
          source: "Daily Huddle",
          updatedAt: new Date().toISOString(),
          tasks: data.tasks,
          emails: data.emails,
          clarifications: data.clarifications,
          meetings: data.meetings,
        }));
      }

      setSaved(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [data, activeExec]);

  const updateRow = (section, index, field, value) => {
    setData((prev) => {
      const copy = [...prev[section]];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, [section]: copy };
    });
  };

  const addRow = (section) => {
    const templates = {
      meetings: { time: "", title: "", attendees: "", location: "" },
      tasks: { task: "", owner: "", status: "Not Started", due: "Due Today" },
      emails: { from: "", subject: "", status: "Needs Follow Up" },
      clarifications: { item: "", requestedFrom: "" },
    };

    setData((prev) => ({
      ...prev,
      [section]: [...prev[section], templates[section]],
    }));
  };

  const deleteRow = (section, index) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const updateNote = (key, value) => {
    setData((prev) => ({
      ...prev,
      notes: { ...prev.notes, [key]: value },
    }));
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="titleWrap">
          <span className="badge">1</span>
          <h1>DAILY HUDDLE</h1>
        </div>

        <div className="actions">
          <div className="toggle">
            <button
              className={activeExec === "MF" ? "active" : ""}
              onClick={() => setActiveExec("MF")}
            >
              MF
            </button>
            <button
              className={activeExec === "DF" ? "active" : ""}
              onClick={() => setActiveExec("DF")}
            >
              DF
            </button>
          </div>

          <button className="sendBtn">✉ Send to Mark</button>
        </div>
      </header>

      <main>
        <Section number="1" title="Daily Schedule (Meetings & Events)">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Meeting / Event</th>
                <th>Attendees</th>
                <th>Location / Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.meetings.map((row, i) => (
                <tr key={i}>
                  <td><Editable value={row.time} onChange={(v) => updateRow("meetings", i, "time", v)} /></td>
                  <td><Editable value={row.title} onChange={(v) => updateRow("meetings", i, "title", v)} /></td>
                  <td><Editable value={row.attendees} onChange={(v) => updateRow("meetings", i, "attendees", v)} /></td>
                  <td><Editable value={row.location} onChange={(v) => updateRow("meetings", i, "location", v)} /></td>
                  <td><button className="dots" onClick={() => deleteRow("meetings", i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <AddButton label="Add meeting or event" onClick={() => addRow("meetings")} />
          <Note value={data.notes.schedule} onChange={(v) => updateNote("schedule", v)} placeholder="Add any notes for today's schedule..." />
        </Section>

        <Section number="2" title="Daily Task Review">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.tasks.map((row, i) => (
                <tr key={i}>
                  <td><Editable value={row.task} onChange={(v) => updateRow("tasks", i, "task", v)} /></td>
                  <td><Editable value={row.owner} onChange={(v) => updateRow("tasks", i, "owner", v)} /></td>
                  <td><Editable value={row.status} onChange={(v) => updateRow("tasks", i, "status", v)} /></td>
                  <td>
                    <span className={`dueDot ${dotClass(row.due)}`} />
                    <Editable value={row.due} onChange={(v) => updateRow("tasks", i, "due", v)} />
                  </td>
                  <td><button className="dots" onClick={() => deleteRow("tasks", i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <AddButton label="Add task" onClick={() => addRow("tasks")} />
          <Note value={data.notes.tasks} onChange={(v) => updateNote("tasks", v)} placeholder="Add any task notes from the discussion..." />
        </Section>

        <Section number="3" title="Email Review">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.emails.map((row, i) => (
                <tr key={i}>
                  <td><Editable value={row.from} onChange={(v) => updateRow("emails", i, "from", v)} /></td>
                  <td><Editable value={row.subject} onChange={(v) => updateRow("emails", i, "subject", v)} /></td>
                  <td><Editable value={row.status} onChange={(v) => updateRow("emails", i, "status", v)} /></td>
                  <td><button className="dots" onClick={() => deleteRow("emails", i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <AddButton label="Add email item" onClick={() => addRow("emails")} />
          <Note value={data.notes.emails} onChange={(v) => updateNote("emails", v)} placeholder="Add email notes..." />
        </Section>

        <Section number="4" title="Clarifications Required">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Requested From</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.clarifications.map((row, i) => (
                <tr key={i}>
                  <td><Editable value={row.item} onChange={(v) => updateRow("clarifications", i, "item", v)} /></td>
                  <td><Editable value={row.requestedFrom} onChange={(v) => updateRow("clarifications", i, "requestedFrom", v)} /></td>
                  <td><button className="dots" onClick={() => deleteRow("clarifications", i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <AddButton label="Add clarification" onClick={() => addRow("clarifications")} />
          <Note value={data.notes.clarifications} onChange={(v) => updateNote("clarifications", v)} placeholder="Add clarification notes..." />
        </Section>

        <div className="bottom">
          <span>{saved ? "✓ All changes saved" : "Saving..."}</span>
          <button className="endBtn">End Huddle & Save</button>
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #faf7f1;
          color: #0f172a;
          font-family: Inter, Arial, sans-serif;
          padding-bottom: 40px;
        }

        .topbar {
          height: 78px;
          border-bottom: 1px solid #e6ded0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 34px;
          background: #fbf8f2;
        }

        .titleWrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        h1 {
          font-size: 18px;
          letter-spacing: 0.01em;
          margin: 0;
          font-weight: 700;
        }

        .badge {
          background: #efdcb8;
          color: #111827;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 13px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .toggle {
          background: white;
          border: 1px solid #e5ddcf;
          border-radius: 999px;
          padding: 3px;
          display: flex;
        }

        .toggle button {
          border: 0;
          background: transparent;
          padding: 10px 28px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          color: #475569;
        }

        .toggle button.active {
          background: #d9a354;
          color: white;
        }

        .sendBtn {
          border: 1px solid #e1d7c7;
          background: white;
          border-radius: 8px;
          padding: 11px 18px;
          font-weight: 700;
          cursor: pointer;
        }

        main {
          max-width: 1180px;
          margin: 36px auto;
          padding: 0 24px;
        }

        .bottom {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 20px;
          margin-top: 24px;
          color: #64748b;
          font-size: 13px;
        }

        .endBtn {
          background: #d9a354;
          color: white;
          border: 0;
          border-radius: 8px;
          padding: 14px 26px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Section({ number, title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="section">
      <div className="sectionHeader">
        <div className="sectionTitle">
          <span>{number}</span>
          <h2>{title}</h2>
        </div>

        <div className="sectionActions">
          <button>Open Dashboard ↗</button>
          <button onClick={() => setOpen(!open)}>{open ? "⌃" : "⌄"}</button>
        </div>
      </div>

      {open && <div className="sectionBody">{children}</div>}

      <style jsx>{`
        .section {
          background: #fffdfa;
          border: 1px solid #e4dccf;
          border-radius: 10px;
          margin-bottom: 18px;
          overflow: hidden;
        }

        .sectionHeader {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          border-bottom: 1px solid #eee6da;
        }

        .sectionTitle {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sectionTitle span {
          background: #f2e3c8;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .sectionActions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sectionActions button {
          border: 0;
          background: transparent;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
        }

        .sectionBody {
          padding: 0 22px 18px;
        }
      `}</style>
    </section>
  );
}

function Editable({ value, onChange }) {
  return (
    <input
      className="editable"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type here..."
    />
  );
}

function AddButton({ label, onClick }) {
  return (
    <button className="addBtn" onClick={onClick}>
      + {label}
    </button>
  );
}

function Note({ value, onChange, placeholder }) {
  return (
    <div className="noteWrap">
      <label>NOTES</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function dotClass(due) {
  const value = due.toLowerCase();

  if (value.includes("overdue")) return "red";
  if (value.includes("today")) return "orange";
  if (value.includes("tomorrow")) return "yellow";
  return "green";
}
