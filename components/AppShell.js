import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const starterItems = [
  {
    id: "1",
    owner: "Mark",
    day: "Monday",
    type: "Meeting",
    title: "Morning Huddle",
    start: "8:00 AM",
    end: "8:30 AM",
    location: "Office",
    interruptions: "No Interruptions",
    notes: "Review day plan, priorities, and decisions needed.",
  },
  {
    id: "2",
    owner: "Mark",
    day: "Monday",
    type: "Execution",
    title: "Dealer Follow-Ups",
    start: "10:00 AM",
    end: "11:30 AM",
    location: "Office",
    interruptions: "Urgent Only",
    notes: "Protected time to work through dealer items.",
  },
  {
    id: "3",
    owner: "Dane",
    day: "Tuesday",
    type: "Focus",
    title: "Sales Planning",
    start: "9:00 AM",
    end: "10:30 AM",
    location: "Office",
    interruptions: "Open",
    notes: "Review weekly priorities and key account follow-ups.",
  },
];

export default function ExecutiveFlow() {
  const [selectedOwner, setSelectedOwner] = useState("Mark");
  const [items, setItems] = useState(starterItems);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    owner: "Mark",
    day: "Monday",
    type: "Meeting",
    title: "",
    start: "",
    end: "",
    location: "",
    interruptions: "Open",
    notes: "",
  });

  const visibleItems = useMemo(() => {
    return items.filter((item) => item.owner === selectedOwner);
  }, [items, selectedOwner]);

  function getDayItems(day) {
    return visibleItems.filter((item) => item.day === day);
  }

  function addItem() {
    if (!newItem.title.trim()) return;

    setItems([
      ...items,
      {
        ...newItem,
        id: String(Date.now()),
        owner: selectedOwner,
      },
    ]);

    setNewItem({
      owner: selectedOwner,
      day: "Monday",
      type: "Meeting",
      title: "",
      start: "",
      end: "",
      location: "",
      interruptions: "Open",
      notes: "",
    });

    setShowAddForm(false);
  }

  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id));
  }

  function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceDay = source.droppableId;
    const destinationDay = destination.droppableId;

    const ownerItems = items.filter((item) => item.owner === selectedOwner);
    const otherItems = items.filter((item) => item.owner !== selectedOwner);

    const sourceItems = ownerItems.filter((item) => item.day === sourceDay);
    const destinationItems = ownerItems.filter((item) => item.day === destinationDay);

    if (sourceDay === destinationDay) {
      const reordered = Array.from(sourceItems);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      const untouched = ownerItems.filter((item) => item.day !== sourceDay);

      setItems([...otherItems, ...untouched, ...reordered]);
      return;
    }

    const movingItem = sourceItems.find((item) => item.id === draggableId);
    if (!movingItem) return;

    const updatedSource = sourceItems.filter((item) => item.id !== draggableId);
    const updatedDestination = Array.from(destinationItems);

    updatedDestination.splice(destination.index, 0, {
      ...movingItem,
      day: destinationDay,
    });

    const untouched = ownerItems.filter(
      (item) => item.day !== sourceDay && item.day !== destinationDay
    );

    setItems([...otherItems, ...untouched, ...updatedSource, ...updatedDestination]);
  }

  function getTypeClass(type) {
    if (type === "Meeting") return "typeMeeting";
    if (type === "Focus") return "typeFocus";
    if (type === "Execution") return "typeExecution";
    if (type === "Task") return "typeTask";
    return "typeDefault";
  }

  function getInterruptionClass(value) {
    if (value === "No Interruptions") return "interruptRed";
    if (value === "Urgent Only") return "interruptYellow";
    return "interruptGreen";
  }

  return (
    <div className="page">
      <div className="header">
        <div>
          <p className="eyebrow">Executive Operations</p>
          <h1>Executive Flow</h1>
          <p className="subtext">
            Plan Mark and Dane&apos;s week, protect execution time, and keep the day clear.
          </p>
        </div>

        <div className="headerActions">
          <div className="ownerToggle">
            <button
              className={selectedOwner === "Mark" ? "active" : ""}
              onClick={() => setSelectedOwner("Mark")}
            >
              Mark
            </button>
            <button
              className={selectedOwner === "Dane" ? "active" : ""}
              onClick={() => setSelectedOwner("Dane")}
            >
              Dane
            </button>
          </div>

          <button className="primaryBtn" onClick={() => setShowAddForm(true)}>
            + Add Block
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="modalBackdrop">
          <div className="modal">
            <div className="modalHeader">
              <h2>Add Schedule Block</h2>
              <button className="iconBtn" onClick={() => setShowAddForm(false)}>
                ×
              </button>
            </div>

            <div className="formGrid">
              <label>
                Title
                <input
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Dealer call, focus time, execution block..."
                />
              </label>

              <label>
                Day
                <select
                  value={newItem.day}
                  onChange={(e) => setNewItem({ ...newItem, day: e.target.value })}
                >
                  {days.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>

              <label>
                Type
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                >
                  <option>Meeting</option>
                  <option>Focus</option>
                  <option>Execution</option>
                  <option>Task</option>
                </select>
              </label>

              <label>
                Interruptions
                <select
                  value={newItem.interruptions}
                  onChange={(e) =>
                    setNewItem({ ...newItem, interruptions: e.target.value })
                  }
                >
                  <option>Open</option>
                  <option>Urgent Only</option>
                  <option>No Interruptions</option>
                </select>
              </label>

              <label>
                Start Time
                <input
                  value={newItem.start}
                  onChange={(e) => setNewItem({ ...newItem, start: e.target.value })}
                  placeholder="8:00 AM"
                />
              </label>

              <label>
                End Time
                <input
                  value={newItem.end}
                  onChange={(e) => setNewItem({ ...newItem, end: e.target.value })}
                  placeholder="9:00 AM"
                />
              </label>

              <label>
                Location
                <input
                  value={newItem.location}
                  onChange={(e) =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                  placeholder="Office, Teams, Boardroom..."
                />
              </label>

              <label className="full">
                Notes
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Details, prep notes, meeting purpose..."
                />
              </label>
            </div>

            <div className="modalActions">
              <button className="secondaryBtn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="primaryBtn" onClick={addItem}>
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={sidebarOpen ? "layout" : "layout fullWidth"}>
        <main className="calendarWrap">
          <div className="calendarTop">
            <div>
              <h2>{selectedOwner}&apos;s Weekly Plan</h2>
              <p>Drag blocks between days or reorder inside each day.</p>
            </div>

            <button className="secondaryBtn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "Hide List" : "Show List"}
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="calendarGrid">
              {days.map((day) => {
                const dayItems = getDayItems(day);

                return (
                  <Droppable droppableId={day} key={day}>
                    {(provided, snapshot) => (
                      <section
                        className={`dayColumn ${snapshot.isDraggingOver ? "dragOver" : ""}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="dayHeader">
                          <h3>{day}</h3>
                          <span>{dayItems.length} blocks</span>
                        </div>

                        <div className="dayBody">
                          {dayItems.length === 0 && (
                            <div className="emptyState">Drop blocks here.</div>
                          )}

                          {dayItems.map((item, index) => (
                            <Draggable draggableId={item.id} index={index} key={item.id}>
                              {(provided, snapshot) => (
                                <article
                                  className={`scheduleCard ${
                                    snapshot.isDragging ? "dragging" : ""
                                  }`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="cardTop">
                                    <span
                                      className={`typeBadge ${getTypeClass(item.type)}`}
                                    >
                                      {item.type}
                                    </span>
                                    <button
                                      className="deleteBtn"
                                      onClick={() => deleteItem(item.id)}
                                    >
                                      ×
                                    </button>
                                  </div>

                                  <h4>{item.title}</h4>

                                  <div className="meta">
                                    <span>
                                      {item.start || "Time TBD"}
                                      {item.end ? ` - ${item.end}` : ""}
                                    </span>
                                    {item.location && <span>{item.location}</span>}
                                  </div>

                                  <span
                                    className={`interruptBadge ${getInterruptionClass(
                                      item.interruptions
                                    )}`}
                                  >
                                    {item.interruptions}
                                  </span>

                                  {item.notes && <p className="notes">{item.notes}</p>}

                                  <div className="dragHint">Drag to move</div>
                                </article>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}
                        </div>
                      </section>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </main>

        {sidebarOpen && (
          <aside className="sidebar">
            <div className="sidebarHeader">
              <div>
                <p className="eyebrow">Daily List</p>
                <h2>{selectedOwner}&apos;s Blocks</h2>
              </div>
            </div>

            <div className="list">
              {visibleItems.length === 0 && (
                <div className="emptyState">Nothing planned yet.</div>
              )}

              {days.map((day) => {
                const dayItems = getDayItems(day);
                if (dayItems.length === 0) return null;

                return (
                  <div key={day} className="listDay">
                    <h3>{day}</h3>

                    {dayItems.map((item) => (
                      <div key={item.id} className="listItem">
                        <div>
                          <strong>{item.title}</strong>
                          <p>
                            {item.start || "Time TBD"}
                            {item.end ? ` - ${item.end}` : ""} · {item.type}
                          </p>
                        </div>

                        <span
                          className={`dot ${getInterruptionClass(item.interruptions)}`}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111827;
          padding: 28px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
          color: #6b7280;
          margin: 0 0 6px;
          font-weight: 700;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.04em;
          font-weight: 750;
        }

        h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.02em;
        }

        h3 {
          margin: 0;
          font-size: 14px;
        }

        h4 {
          margin: 10px 0 8px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .subtext {
          margin: 7px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .headerActions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ownerToggle {
          display: flex;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 4px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
        }

        .ownerToggle button {
          border: 0;
          background: transparent;
          padding: 9px 16px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 650;
          color: #6b7280;
        }

        .ownerToggle button.active {
          background: #111827;
          color: #ffffff;
        }

        .primaryBtn,
        .secondaryBtn {
          border: 0;
          border-radius: 13px;
          padding: 11px 15px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .primaryBtn {
          background: #111827;
          color: #ffffff;
        }

        .secondaryBtn {
          background: #ffffff;
          color: #111827;
          border: 1px solid #e5e7eb;
        }

        .primaryBtn:hover,
        .secondaryBtn:hover {
          transform: translateY(-1px);
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 18px;
          align-items: start;
        }

        .layout.fullWidth {
          grid-template-columns: 1fr;
        }

        .calendarWrap,
        .sidebar {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.05);
        }

        .calendarWrap {
          padding: 18px;
          overflow: hidden;
        }

        .calendarTop {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }

        .calendarTop p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .calendarGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(190px, 1fr));
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .dayColumn {
          background: #f9fafb;
          border: 1px solid #eef0f3;
          border-radius: 18px;
          min-height: 580px;
          display: flex;
          flex-direction: column;
          transition: 0.15s ease;
        }

        .dayColumn.dragOver {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .dayHeader {
          padding: 14px;
          border-bottom: 1px solid #eef0f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dayHeader span {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 650;
        }

        .dayBody {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .scheduleCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }

        .scheduleCard:hover {
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.07);
        }

        .scheduleCard.dragging {
          transform: rotate(1deg);
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.16);
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .typeBadge,
        .interruptBadge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 750;
          padding: 5px 8px;
        }

        .typeMeeting {
          background: #eef2ff;
          color: #3730a3;
        }

        .typeFocus {
          background: #ecfdf5;
          color: #047857;
        }

        .typeExecution {
          background: #111827;
          color: #ffffff;
        }

        .typeTask {
          background: #fff7ed;
          color: #c2410c;
        }

        .typeDefault {
          background: #f3f4f6;
          color: #374151;
        }

        .interruptGreen {
          background: #ecfdf5;
          color: #047857;
        }

        .interruptYellow {
          background: #fffbeb;
          color: #b45309;
        }

        .interruptRed {
          background: #fef2f2;
          color: #b91c1c;
        }

        .deleteBtn,
        .iconBtn {
          border: 0;
          background: #f3f4f6;
          color: #6b7280;
          width: 26px;
          height: 26px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        }

        .deleteBtn:hover,
        .iconBtn:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-bottom: 10px;
          color: #6b7280;
          font-size: 12px;
        }

        .notes {
          margin: 10px 0 0;
          color: #4b5563;
          font-size: 12px;
          line-height: 1.45;
        }

        .dragHint {
          margin-top: 10px;
          font-size: 11px;
          color: #9ca3af;
          font-weight: 650;
        }

        .emptyState {
          border: 1px dashed #d1d5db;
          color: #9ca3af;
          font-size: 13px;
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          background: #ffffff;
        }

        .sidebar {
          padding: 18px;
          position: sticky;
          top: 18px;
        }

        .sidebarHeader {
          margin-bottom: 16px;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .listDay h3 {
          margin-bottom: 8px;
          color: #374151;
        }

        .listItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #f9fafb;
          margin-bottom: 8px;
        }

        .listItem strong {
          font-size: 13px;
        }

        .listItem p {
          margin: 3px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          flex-shrink: 0;
          padding: 0;
        }

        .modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.42);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          background: #ffffff;
          border-radius: 24px;
          padding: 20px;
          width: min(760px, 100%);
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
        }

        label.full {
          grid-column: 1 / -1;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px;
          padding: 11px;
          font-size: 13px;
          outline: none;
          color: #111827;
        }

        textarea {
          min-height: 90px;
          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #111827;
          background: #ffffff;
        }

        .modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }

        @media (max-width: 1200px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
          }
        }

        @media (max-width: 760px) {
          .page {
            padding: 18px;
          }

          .header {
            flex-direction: column;
          }

          .headerActions {
            width: 100%;
            justify-content: space-between;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
