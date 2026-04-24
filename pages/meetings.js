import { useEffect, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

const blankMeeting = {
  name: "",
  location: "",
  time: "",
};

const blankTask = {
  title: "",
  urgency: "Medium",
  details: "",
  showDetails: false,
};

const blankDecision = {
  title: "",
  details: "",
};

export default function MeetingsPage() {
  const [mode, setMode] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");
  const [selectedDate, setSelectedDate] = useState(today);

  const [weeklyPriorities, setWeeklyPriorities] = useState(["", "", ""]);

  const [weeklyCalendar, setWeeklyCalendar] = useState([{ ...blankMeeting }]);
  const [weeklyTasks, setWeeklyTasks] = useState([{ ...blankTask }]);
  const [weeklyDecisions, setWeeklyDecisions] = useState([{ ...blankDecision }]);

  const [markDailyCalendar, setMarkDailyCalendar] = useState([{ ...blankMeeting }]);
  const [daneDailyCalendar, setDaneDailyCalendar] = useState([{ ...blankMeeting }]);

  const [markDailyTasks, setMarkDailyTasks] = useState([{ ...blankTask }]);
  const [daneDailyTasks, setDaneDailyTasks] = useState([{ ...blankTask }]);

  const [markDailyDecisions, setMarkDailyDecisions] = useState([{ ...blankDecision }]);
  const [daneDailyDecisions, setDaneDailyDecisions] = useState([{ ...blankDecision }]);

  useEffect(() => {
    const savedPriorities = localStorage.getItem("weeklyPriorities");
    const savedWeeklyCalendar = localStorage.getItem("meetingWeeklyCalendar");
    const savedWeeklyTasks = localStorage.getItem("meetingWeeklyTasks");
    const savedWeeklyDecisions = localStorage.getItem("meetingWeeklyDecisions");

    if (savedPriorities) setWeeklyPriorities(JSON.parse(savedPriorities));
    if (savedWeeklyCalendar) setWeeklyCalendar(JSON.parse(savedWeeklyCalendar));
    if (savedWeeklyTasks) setWeeklyTasks(JSON.parse(savedWeeklyTasks));
    if (savedWeeklyDecisions) setWeeklyDecisions(JSON.parse(savedWeeklyDecisions));
  }, []);

  useEffect(() => {
    const savedMarkCalendar = localStorage.getItem(`meetingMarkDailyCalendar-${selectedDate}`);
    const savedDaneCalendar = localStorage.getItem(`meetingDaneDailyCalendar-${selectedDate}`);
    const savedMarkTasks = localStorage.getItem(`meetingMarkDailyTasks-${selectedDate}`);
    const savedDaneTasks = localStorage.getItem(`meetingDaneDailyTasks-${selectedDate}`);
    const savedMarkDecisions = localStorage.getItem(`meetingMarkDailyDecisions-${selectedDate}`);
    const savedDaneDecisions = localStorage.getItem(`meetingDaneDailyDecisions-${selectedDate}`);

    setMarkDailyCalendar(savedMarkCalendar ? JSON.parse(savedMarkCalendar) : [{ ...blankMeeting }]);
    setDaneDailyCalendar(savedDaneCalendar ? JSON.parse(savedDaneCalendar) : [{ ...blankMeeting }]);
    setMarkDailyTasks(savedMarkTasks ? JSON.parse(savedMarkTasks) : [{ ...blankTask }]);
    setDaneDailyTasks(savedDaneTasks ? JSON.parse(savedDaneTasks) : [{ ...blankTask }]);
    setMarkDailyDecisions(savedMarkDecisions ? JSON.parse(savedMarkDecisions) : [{ ...blankDecision }]);
    setDaneDailyDecisions(savedDaneDecisions ? JSON.parse(savedDaneDecisions) : [{ ...blankDecision }]);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("weeklyPriorities", JSON.stringify(weeklyPriorities));
  }, [weeklyPriorities]);

  useEffect(() => {
    localStorage.setItem("meetingWeeklyCalendar", JSON.stringify(weeklyCalendar));
  }, [weeklyCalendar]);

  useEffect(() => {
    localStorage.setItem("meetingWeeklyTasks", JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  useEffect(() => {
    localStorage.setItem("meetingWeeklyDecisions", JSON.stringify(weeklyDecisions));
  }, [weeklyDecisions]);

  useEffect(() => {
    localStorage.setItem(`meetingMarkDailyCalendar-${selectedDate}`, JSON.stringify(markDailyCalendar));
  }, [markDailyCalendar, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`meetingDaneDailyCalendar-${selectedDate}`, JSON.stringify(daneDailyCalendar));
  }, [daneDailyCalendar, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`meetingMarkDailyTasks-${selectedDate}`, JSON.stringify(markDailyTasks));
  }, [markDailyTasks, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`meetingDaneDailyTasks-${selectedDate}`, JSON.stringify(daneDailyTasks));
  }, [daneDailyTasks, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`meetingMarkDailyDecisions-${selectedDate}`, JSON.stringify(markDailyDecisions));
  }, [markDailyDecisions, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`meetingDaneDailyDecisions-${selectedDate}`, JSON.stringify(daneDailyDecisions));
  }, [daneDailyDecisions, selectedDate]);

  function changeDay(amount) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + amount);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  function updateRow(array, setArray, index, field, value) {
    const updated = [...array];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setArray(updated);
  }

  function addRow(array, setArray, blankItem) {
    setArray([...array, { ...blankItem }]);
  }

  function deleteRow(array, setArray, index) {
    setArray(array.filter((_, i) => i !== index));
  }

  function updatePriority(index, value) {
    const updated = [...weeklyPriorities];
    updated[index] = value;
    setWeeklyPriorities(updated);
  }

  function addPriority() {
    setWeeklyPriorities([...weeklyPriorities, ""]);
  }

  function deletePriority(index) {
    setWeeklyPriorities(weeklyPriorities.filter((_, i) => i !== index));
  }

  function sendMeetingTaskToTasks(task, assignedFrom) {
    if (!task.title.trim()) return;

    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    const newTask = {
      id: Date.now(),
      title: task.title,
      assignedFrom,
      urgency: task.urgency,
      dueDate: mode === "daily" ? selectedDate : "",
      details: task.details || "",
      complete: false,
      source: "Meetings",
    };

    localStorage.setItem("tasks", JSON.stringify([newTask, ...existingTasks]));
  }

  const activeDailyCalendar =
    dailyPerson === "Mark" ? markDailyCalendar : daneDailyCalendar;
  const setActiveDailyCalendar =
    dailyPerson === "Mark" ? setMarkDailyCalendar : setDaneDailyCalendar;

  const activeDailyTasks =
    dailyPerson === "Mark" ? markDailyTasks : daneDailyTasks;
  const setActiveDailyTasks =
    dailyPerson === "Mark" ? setMarkDailyTasks : setDaneDailyTasks;

  const activeDailyDecisions =
    dailyPerson === "Mark" ? markDailyDecisions : daneDailyDecisions;
  const setActiveDailyDecisions =
    dailyPerson === "Mark" ? setMarkDailyDecisions : setDaneDailyDecisions;

  function CalendarSection({ title, rows, setRows }) {
    return (
      <section className="meetingCard">
        <div className="sectionHeader">
          <div>
            <h2>{title}</h2>
            <p>Add meeting name, location, and time.</p>
          </div>
          <button className="smallBtn" onClick={() => addRow(rows, setRows, blankMeeting)}>
            +
          </button>
        </div>

        <div className="calendarList">
          {rows.map((meeting, index) => (
            <div className="calendarRow" key={index}>
              <input
                value={meeting.name}
                onChange={(e) => updateRow(rows, setRows, index, "name", e.target.value)}
                placeholder="Meeting name"
              />
              <input
                value={meeting.location}
                onChange={(e) => updateRow(rows, setRows, index, "location", e.target.value)}
                placeholder="Location"
              />
              <input
                type="time"
                value={meeting.time}
                onChange={(e) => updateRow(rows, setRows, index, "time", e.target.value)}
              />
              <button className="deleteBtn" onClick={() => deleteRow(rows, setRows, index)}>
                ×
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function TasksSection({ title, rows, setRows, assignedFrom }) {
    return (
      <section className="meetingCard">
        <div className="sectionHeader">
          <div>
            <h2>{title}</h2>
            <p>Add task name, priority, and optional hidden details.</p>
          </div>
          <button className="smallBtn" onClick={() => addRow(rows, setRows, blankTask)}>
            +
          </button>
        </div>

        <div className="taskFlowList">
          {rows.map((task, index) => (
            <div className="taskBlock" key={index}>
              <div className="taskFlowRow">
                <input
                  value={task.title}
                  onChange={(e) => updateRow(rows, setRows, index, "title", e.target.value)}
                  placeholder="Task name"
                />

                <select
                  value={task.urgency}
                  onChange={(e) => updateRow(rows, setRows, index, "urgency", e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <button
                  className="detailBtn"
                  onClick={() =>
                    updateRow(rows, setRows, index, "showDetails", !task.showDetails)
                  }
                >
                  Details
                </button>

                <button onClick={() => sendMeetingTaskToTasks(task, assignedFrom)}>
                  Send
                </button>

                <button className="deleteBtn" onClick={() => deleteRow(rows, setRows, index)}>
                  ×
                </button>
              </div>

              {task.showDetails && (
                <textarea
                  className="detailsBox"
                  value={task.details}
                  onChange={(e) => updateRow(rows, setRows, index, "details", e.target.value)}
                  placeholder="Add more details here..."
                />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  function DecisionsSection({ title, rows, setRows }) {
    return (
      <section className="meetingCard">
        <div className="sectionHeader">
          <div>
            <h2>{title}</h2>
            <p>Add each decision as its own item.</p>
          </div>
          <button className="smallBtn" onClick={() => addRow(rows, setRows, blankDecision)}>
            +
          </button>
        </div>

        <div className="decisionList">
          {rows.map((decision, index) => (
            <div className="decisionBlock" key={index}>
              <div className="decisionRow">
                <input
                  value={decision.title}
                  onChange={(e) => updateRow(rows, setRows, index, "title", e.target.value)}
                  placeholder="Decision needed"
                />
                <button className="deleteBtn" onClick={() => deleteRow(rows, setRows, index)}>
                  ×
                </button>
              </div>

              <textarea
                className="detailsBox"
                value={decision.details}
                onChange={(e) => updateRow(rows, setRows, index, "details", e.target.value)}
                placeholder="Notes / context..."
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="meetingsPage">
      <div className="meetingsHeader">
        <div>
          <h1>Meetings</h1>
          <p>Calendar first, then tasks, then decisions.</p>
        </div>

        <div className="topToggle">
          <button
            className={mode === "weekly" ? "active" : ""}
            onClick={() => setMode("weekly")}
          >
            Weekly
          </button>
          <button
            className={mode === "daily" ? "active" : ""}
            onClick={() => setMode("daily")}
          >
            Daily
          </button>
        </div>
      </div>

      {mode === "weekly" && (
        <div className="meetingGrid">
          <aside className="prioritySide">
            <div className="meetingCard">
              <div className="sectionHeader">
                <div>
                  <h2>Weekly Priorities</h2>
                  <p>Top focus items</p>
                </div>
                <button className="smallBtn" onClick={addPriority}>
                  +
                </button>
              </div>

              <div className="priorityList">
                {weeklyPriorities.map((priority, index) => (
                  <div className="priorityItem" key={index}>
                    <span>{index + 1}</span>
                    <input
                      value={priority}
                      onChange={(e) => updatePriority(index, e.target.value)}
                      placeholder="Add priority..."
                    />
                    <button onClick={() => deletePriority(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="mainColumn">
            <CalendarSection
              title="Calendar Review"
              rows={weeklyCalendar}
              setRows={setWeeklyCalendar}
            />

            <TasksSection
              title="Weekly Tasks"
              rows={weeklyTasks}
              setRows={setWeeklyTasks}
              assignedFrom="Weekly Meeting"
            />

            <DecisionsSection
              title="Decisions Needed"
              rows={weeklyDecisions}
              setRows={setWeeklyDecisions}
            />
          </main>
        </div>
      )}

      {mode === "daily" && (
        <>
          <div className="dateBar">
            <button onClick={() => changeDay(-1)}>← Previous Day</button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button onClick={() => changeDay(1)}>Next Day →</button>
          </div>

          <div className="personToggle">
            <button
              className={dailyPerson === "Mark" ? "active" : ""}
              onClick={() => setDailyPerson("Mark")}
            >
              Mark
            </button>
            <button
              className={dailyPerson === "Dane" ? "active" : ""}
              onClick={() => setDailyPerson("Dane")}
            >
              Dane
            </button>
          </div>

          <CalendarSection
            title={`${dailyPerson} Daily Calendar`}
            rows={activeDailyCalendar}
            setRows={setActiveDailyCalendar}
          />

          <TasksSection
            title={`${dailyPerson} Daily Tasks`}
            rows={activeDailyTasks}
            setRows={setActiveDailyTasks}
            assignedFrom={dailyPerson}
          />

          <DecisionsSection
            title={`${dailyPerson} Decisions Needed`}
            rows={activeDailyDecisions}
            setRows={setActiveDailyDecisions}
          />
        </>
      )}

      <style jsx>{`
        .meetingsPage {
          padding: 32px;
          max-width: 1280px;
          margin: 0 auto;
          color: #111;
        }

        .meetingsHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.04em;
        }

        h2 {
          margin: 0;
          font-size: 15px;
          letter-spacing: -0.02em;
        }

        p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .meetingGrid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 18px;
          align-items: start;
        }

        .prioritySide {
          position: sticky;
          top: 24px;
        }

        .mainColumn {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .meetingCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.035);
          margin-bottom: 18px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .topToggle,
        .personToggle,
        .dateBar {
          display: flex;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 5px;
        }

        .personToggle,
        .dateBar {
          width: fit-content;
          margin-bottom: 18px;
        }

        .dateBar {
          align-items: center;
        }

        .dateBar input {
          width: 160px;
        }

        button {
          border: none;
          background: #111;
          color: #fff;
          border-radius: 9px;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
        }

        .smallBtn {
          width: 28px;
          height: 28px;
          padding: 0;
        }

        .topToggle button,
        .personToggle button {
          background: transparent;
          color: #444;
        }

        .topToggle button.active,
        .personToggle button.active {
          background: #111;
          color: #fff;
        }

        input,
        select,
        textarea {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 10px;
          padding: 10px 11px;
          font-size: 13px;
          outline: none;
          color: #111;
          font-family: inherit;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #111;
          background: #fff;
        }

        .calendarList,
        .taskFlowList,
        .decisionList {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .calendarRow {
          display: grid;
          grid-template-columns: 1.5fr 1fr 130px 32px;
          gap: 8px;
          align-items: center;
        }

        .taskBlock,
        .decisionBlock {
          border: 1px solid #eeeeee;
          background: #ffffff;
          border-radius: 12px;
          padding: 8px;
        }

        .taskFlowRow {
          display: grid;
          grid-template-columns: 1fr 110px 82px 70px 32px;
          gap: 8px;
          align-items: center;
        }

        .decisionRow {
          display: grid;
          grid-template-columns: 1fr 32px;
          gap: 8px;
          align-items: center;
        }

        .detailsBox {
          width: 100%;
          min-height: 70px;
          margin-top: 8px;
          resize: vertical;
        }

        .detailBtn {
          background: #f3f4f6;
          color: #111;
        }

        .deleteBtn {
          background: #f3f4f6;
          color: #111;
          width: 32px;
          height: 32px;
          padding: 0;
        }

        .priorityList {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .priorityItem {
          display: grid;
          grid-template-columns: 16px 1fr 18px;
          gap: 5px;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 6px;
          height: 32px;
        }

        .priorityItem span {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
        }

        .priorityItem input {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 12px;
          height: 100%;
          min-width: 0;
        }

        .priorityItem button {
          background: #f3f4f6;
          color: #111;
          width: 16px;
          height: 16px;
          border-radius: 5px;
          font-size: 10px;
          padding: 0;
        }

        @media (max-width: 1000px) {
          .meetingGrid {
            grid-template-columns: 1fr;
          }

          .prioritySide {
            position: static;
          }

          .calendarRow,
          .taskFlowRow,
          .decisionRow {
            grid-template-columns: 1fr;
          }

          .dateBar {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }

          .dateBar input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
