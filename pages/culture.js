import { useEffect, useState } from "react";

const CULTURE_EVENTS_KEY = "aq-culture-events";

const CULTURE_CALENDAR_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTN2oKkZ7hTRcmN22q6649bOJxJ300-KppLvg3R0LEdnS5J5t-bWW8V5DRJyz4pAe3SfgArIPFHcWzh/pubhtml?gid=609870041&single=true";

export default function CulturePage() {
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(true);
  const [showCultureCalendar, setShowCultureCalendar] = useState(true);

  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    headcount: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(CULTURE_EVENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setEvents(parsed);
      if (parsed.length > 0) setActiveEventId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CULTURE_EVENTS_KEY, JSON.stringify(events));
  }, [events]);

  const activeEvent = events.find((event) => event.id === activeEventId);

  function addEvent() {
    if (!newEvent.name.trim()) return;

    const event = {
      id: Date.now(),
      name: newEvent.name,
      date: newEvent.date,
      location: newEvent.location,
      headcount: newEvent.headcount,
      food: "",
      drinks: "",
      supplies: "",
      agenda: "",
      notes: "",
      checklist: [],
    };

    setEvents([event, ...events]);
    setActiveEventId(event.id);

    setNewEvent({
      name: "",
      date: "",
      location: "",
      headcount: "",
    });
  }

  function deleteEvent(id) {
    const updated = events.filter((event) => event.id !== id);
    setEvents(updated);
    setActiveEventId(updated[0]?.id || null);
  }

  function updateActiveEvent(field, value) {
    setEvents(
      events.map((event) =>
        event.id === activeEventId ? { ...event, [field]: value } : event
      )
    );
  }

  function addChecklistItem() {
    if (!activeEvent) return;

    const item = {
      id: Date.now(),
      text: "New checklist item",
      completed: false,
    };

    updateActiveEvent("checklist", [...activeEvent.checklist, item]);
  }

  function updateChecklistItem(id, value) {
    updateActiveEvent(
      "checklist",
      activeEvent.checklist.map((item) =>
        item.id === id ? { ...item, text: value } : item
      )
    );
  }

  function toggleChecklistItem(id) {
    updateActiveEvent(
      "checklist",
      activeEvent.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  function deleteChecklistItem(id) {
    updateActiveEvent(
      "checklist",
      activeEvent.checklist.filter((item) => item.id !== id)
    );
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="top">
          <div>
            <p className="eyebrow">AQ CULTURE</p>
            <h1>Culture & Event Center</h1>
            <p className="subtitle">
              Plan team events, launches, food counts, supplies, checklists, and follow-ups.
            </p>
          </div>
        </div>

        <section className="card">
          <div className="sectionToggle">
            <div>
              <h2>Create Event</h2>
              <p>Add lunches, launches, snack stations, dealer events, or culture projects.</p>
            </div>

            <button
              className="toggleBtn"
              onClick={() => setShowCreateEvent(!showCreateEvent)}
            >
              {showCreateEvent ? "Minimize" : "Expand"}
            </button>
          </div>

          {showCreateEvent && (
            <div className="eventGrid">
              <input
                placeholder="Event name"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              />

              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />

              <input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
              />

              <input
                placeholder="Headcount"
                value={newEvent.headcount}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, headcount: e.target.value })
                }
              />

              <button onClick={addEvent}>Add Event</button>
            </div>
          )}
        </section>

        <section className="card">
          <div className="sectionToggle">
            <div>
              <h2>Culture Calendar</h2>
              <p>Embedded Google Sheets culture calendar.</p>
            </div>

            <button
              className="toggleBtn"
              onClick={() => setShowCultureCalendar(!showCultureCalendar)}
            >
              {showCultureCalendar ? "Minimize" : "Expand"}
            </button>
          </div>

          {showCultureCalendar && (
            <div className="calendarBox">
              <iframe
                src={CULTURE_CALENDAR_LINK}
                className="calendarFrame"
              />

              <a
                href={CULTURE_CALENDAR_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="calendarLink"
              >
                Open Full Culture Calendar
              </a>

              <p className="calendarNote">
                Use this for launches, birthdays, team lunches, dealer events,
                internal culture activities, planning reminders, setup timelines,
                and food ordering deadlines.
              </p>
            </div>
          )}
        </section>

        <div className="layout">
          <section className="card eventListCard">
            <div className="cardHeader">
              <div>
                <h2>Upcoming Events</h2>
                <p>Select an event to plan.</p>
              </div>
            </div>

            <div className="eventList">
              {events.length === 0 ? (
                <p className="empty">No events added yet.</p>
              ) : (
                events.map((event) => (
                  <button
                    key={event.id}
                    className={
                      activeEventId === event.id ? "eventButton active" : "eventButton"
                    }
                    onClick={() => setActiveEventId(event.id)}
                  >
                    <strong>{event.name}</strong>
                    <span>
                      {event.date || "No date"} · {event.location || "No location"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="card plannerCard">
            {!activeEvent ? (
              <p className="empty">Select or create an event to start planning.</p>
            ) : (
              <>
                <div className="plannerHeader">
                  <div>
                    <p className="eyebrow">EVENT PLAN</p>
                    <h2>{activeEvent.name}</h2>
                    <p>
                      {activeEvent.date || "No date"} ·{" "}
                      {activeEvent.location || "No location"} ·{" "}
                      {activeEvent.headcount || "No headcount"} people
                    </p>
                  </div>

                  <button
                    className="deleteEvent"
                    onClick={() => deleteEvent(activeEvent.id)}
                  >
                    Delete Event
                  </button>
                </div>

                <div className="detailGrid">
                  <Field
                    label="Event Name"
                    value={activeEvent.name}
                    onChange={(value) => updateActiveEvent("name", value)}
                  />

                  <Field
                    label="Date"
                    type="date"
                    value={activeEvent.date}
                    onChange={(value) => updateActiveEvent("date", value)}
                  />

                  <Field
                    label="Location"
                    value={activeEvent.location}
                    onChange={(value) => updateActiveEvent("location", value)}
                  />

                  <Field
                    label="Headcount"
                    value={activeEvent.headcount}
                    onChange={(value) => updateActiveEvent("headcount", value)}
                  />
                </div>

                <PlanningBox
                  title="Food Plan"
                  value={activeEvent.food}
                  placeholder="Meals, snacks, serving amounts, special dietary notes..."
                  onChange={(value) => updateActiveEvent("food", value)}
                />

                <PlanningBox
                  title="Drinks"
                  value={activeEvent.drinks}
                  placeholder="Water, coffee, pop, juice, coolers, quantities..."
                  onChange={(value) => updateActiveEvent("drinks", value)}
                />

                <PlanningBox
                  title="Supplies / Shopping List"
                  value={activeEvent.supplies}
                  placeholder="Plates, napkins, cutlery, signage, baskets, decorations..."
                  onChange={(value) => updateActiveEvent("supplies", value)}
                />

                <PlanningBox
                  title="Agenda / Run of Show"
                  value={activeEvent.agenda}
                  placeholder="Timing, setup, event flow, speakers, breaks..."
                  onChange={(value) => updateActiveEvent("agenda", value)}
                />

                <div className="checklistHeader">
                  <div>
                    <h3>Checklist</h3>
                    <p>Tasks for planning, setup, ordering, and follow-up.</p>
                  </div>
                  <button onClick={addChecklistItem}>Add Item</button>
                </div>

                <div className="checklist">
                  {activeEvent.checklist.length === 0 ? (
                    <p className="empty">No checklist items yet.</p>
                  ) : (
                    activeEvent.checklist.map((item) => (
                      <div className="checkItem" key={item.id}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                        />

                        <input
                          value={item.text}
                          onChange={(e) =>
                            updateChecklistItem(item.id, e.target.value)
                          }
                        />

                        <button
                          className="smallDelete"
                          onClick={() => deleteChecklistItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <PlanningBox
                  title="Notes / Follow-Ups"
                  value={activeEvent.notes}
                  placeholder="Post-event notes, feedback, who to follow up with..."
                  onChange={(value) => updateActiveEvent("notes", value)}
                />
              </>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          padding: 40px 24px;
          color: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .shell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .top {
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 10px;
          letter-spacing: 0.18em;
          font-weight: 700;
          color: #64748b;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.04em;
        }

        h2 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 800;
        }

        .subtitle {
          margin: 8px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .card {
          background: white;
          border: 1px solid #dfe3ea;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.045);
          margin-bottom: 18px;
        }

        .sectionToggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .sectionToggle p,
        .cardHeader p,
        .plannerHeader p,
        .checklistHeader p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .toggleBtn {
          background: white;
          color: #020617;
          border: 1px solid #dbe2ea;
        }

        .calendarBox {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 18px;
          background: #f8fafc;
        }

        .calendarFrame {
          width: 100%;
          height: 500px;
          border: none;
          border-radius: 14px;
          background: white;
          margin-bottom: 14px;
        }

        .calendarLink {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border-radius: 999px;
          background: #020617;
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .calendarNote {
          margin: 14px 0 0;
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
        }

        .eventGrid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 0.8fr 110px;
          gap: 10px;
          margin-top: 16px;
        }

        .layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 18px;
        }

        .eventList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .eventButton {
          text-align: left;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 14px;
          padding: 13px;
          cursor: pointer;
        }

        .eventButton strong {
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .eventButton span {
          font-size: 11px;
          color: #64748b;
        }

        .eventButton.active {
          background: #020617;
          color: white;
        }

        .eventButton.active span {
          color: #cbd5e1;
        }

        .plannerHeader {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .plannerHeader h2 {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 800;
        }

        .detailGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .field label,
        .planningBox label {
          display: block;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 7px;
          font-weight: 700;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cfd6df;
          background: #f8fafc;
          border-radius: 12px;
          font-size: 13px;
          outline: none;
        }

        input {
          height: 38px;
          padding: 0 12px;
        }

        textarea {
          min-height: 92px;
          padding: 12px;
          resize: vertical;
          font-family: inherit;
        }

        button {
          border: none;
          background: #020617;
          color: white;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .deleteEvent,
        .smallDelete {
          background: white;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .planningBox {
          margin-bottom: 14px;
        }

        .checklistHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 18px 0 12px;
        }

        .checklistHeader h3 {
          margin: 0 0 4px;
          font-size: 15px;
        }

        .checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .checkItem {
          display: grid;
          grid-template-columns: 22px 1fr 80px;
          gap: 10px;
          align-items: center;
        }

        .checkItem input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .empty {
          margin: 0;
          padding: 14px;
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 950px) {
          .eventGrid,
          .layout,
          .detailGrid {
            grid-template-columns: 1fr;
          }

          .sectionToggle,
          .plannerHeader,
          .checklistHeader {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function PlanningBox({ title, value, placeholder, onChange }) {
  return (
    <div className="planningBox">
      <label>{title}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
