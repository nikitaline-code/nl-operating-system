@@ -2,41 +2,24 @@ import { useEffect, useState } from "react";

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
const blankMeeting = { name: "", location: "", time: "" };
const blankTask = { title: "", urgency: "Medium", details: "", showDetails: false };
const blankDecision = { title: "", details: "", showDetails: false };

export default function MeetingsPage() {
  const [mode, setMode] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");
  const [selectedDate, setSelectedDate] = useState(today);

  const [weeklyPriorities, setWeeklyPriorities] = useState(["", "", ""]);

  const [weeklyPriorities, setWeeklyPriorities] = useState(["", ""]);
  const [weeklyCalendar, setWeeklyCalendar] = useState([{ ...blankMeeting }]);
  const [weeklyTasks, setWeeklyTasks] = useState([{ ...blankTask }]);
  const [weeklyDecisions, setWeeklyDecisions] = useState([{ ...blankDecision }]);

  const [markDailyCalendar, setMarkDailyCalendar] = useState([{ ...blankMeeting }]);
  const [daneDailyCalendar, setDaneDailyCalendar] = useState([{ ...blankMeeting }]);

  const [markDailyTasks, setMarkDailyTasks] = useState([{ ...blankTask }]);
  const [daneDailyTasks, setDaneDailyTasks] = useState([{ ...blankTask }]);

  const [markDailyDecisions, setMarkDailyDecisions] = useState([{ ...blankDecision }]);
  const [daneDailyDecisions, setDaneDailyDecisions] = useState([{ ...blankDecision }]);

@@ -68,45 +51,17 @@ export default function MeetingsPage() {
    setDaneDailyDecisions(savedDaneDecisions ? JSON.parse(savedDaneDecisions) : [{ ...blankDecision }]);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("weeklyPriorities", JSON.stringify(weeklyPriorities));
  }, [weeklyPriorities]);
  useEffect(() => localStorage.setItem("weeklyPriorities", JSON.stringify(weeklyPriorities)), [weeklyPriorities]);
  useEffect(() => localStorage.setItem("meetingWeeklyCalendar", JSON.stringify(weeklyCalendar)), [weeklyCalendar]);
  useEffect(() => localStorage.setItem("meetingWeeklyTasks", JSON.stringify(weeklyTasks)), [weeklyTasks]);
  useEffect(() => localStorage.setItem("meetingWeeklyDecisions", JSON.stringify(weeklyDecisions)), [weeklyDecisions]);

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
  useEffect(() => localStorage.setItem(`meetingMarkDailyCalendar-${selectedDate}`, JSON.stringify(markDailyCalendar)), [markDailyCalendar, selectedDate]);
  useEffect(() => localStorage.setItem(`meetingDaneDailyCalendar-${selectedDate}`, JSON.stringify(daneDailyCalendar)), [daneDailyCalendar, selectedDate]);
  useEffect(() => localStorage.setItem(`meetingMarkDailyTasks-${selectedDate}`, JSON.stringify(markDailyTasks)), [markDailyTasks, selectedDate]);
  useEffect(() => localStorage.setItem(`meetingDaneDailyTasks-${selectedDate}`, JSON.stringify(daneDailyTasks)), [daneDailyTasks, selectedDate]);
  useEffect(() => localStorage.setItem(`meetingMarkDailyDecisions-${selectedDate}`, JSON.stringify(markDailyDecisions)), [markDailyDecisions, selectedDate]);
  useEffect(() => localStorage.setItem(`meetingDaneDailyDecisions-${selectedDate}`, JSON.stringify(daneDailyDecisions)), [daneDailyDecisions, selectedDate]);

  function changeDay(amount) {
    const d = new Date(selectedDate);
@@ -116,10 +71,7 @@ export default function MeetingsPage() {

  function updateRow(array, setArray, index, field, value) {
    const updated = [...array];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    updated[index] = { ...updated[index], [field]: value };
    setArray(updated);
  }

@@ -131,20 +83,6 @@ export default function MeetingsPage() {
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

@@ -164,166 +102,12 @@ export default function MeetingsPage() {
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
  const activeDailyCalendar = dailyPerson === "Mark" ? markDailyCalendar : daneDailyCalendar;
  const setActiveDailyCalendar = dailyPerson === "Mark" ? setMarkDailyCalendar : setDaneDailyCalendar;
  const activeDailyTasks = dailyPerson === "Mark" ? markDailyTasks : daneDailyTasks;
  const setActiveDailyTasks = dailyPerson === "Mark" ? setMarkDailyTasks : setDaneDailyTasks;
  const activeDailyDecisions = dailyPerson === "Mark" ? markDailyDecisions : daneDailyDecisions;
  const setActiveDailyDecisions = dailyPerson === "Mark" ? setMarkDailyDecisions : setDaneDailyDecisions;

  return (
    <div className="meetingsPage">
@@ -334,18 +118,8 @@ export default function MeetingsPage() {
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
          <button className={mode === "weekly" ? "active" : ""} onClick={() => setMode("weekly")}>Weekly</button>
          <button className={mode === "daily" ? "active" : ""} onClick={() => setMode("daily")}>Daily</button>
        </div>
      </div>

@@ -358,9 +132,7 @@ export default function MeetingsPage() {
                  <h2>Weekly Priorities</h2>
                  <p>Top focus items</p>
                </div>
                <button className="smallBtn" onClick={addPriority}>
                  +
                </button>
                <button className="smallBtn" onClick={() => setWeeklyPriorities([...weeklyPriorities, ""])}>+</button>
              </div>

              <div className="priorityList">
@@ -369,35 +141,24 @@ export default function MeetingsPage() {
                    <span>{index + 1}</span>
                    <input
                      value={priority}
                      onChange={(e) => updatePriority(index, e.target.value)}
                      onChange={(e) => {
                        const updated = [...weeklyPriorities];
                        updated[index] = e.target.value;
                        setWeeklyPriorities(updated);
                      }}
                      placeholder="Add priority..."
                    />
                    <button onClick={() => deletePriority(index)}>×</button>
                    <button onClick={() => setWeeklyPriorities(weeklyPriorities.filter((_, i) => i !== index))}>×</button>
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
            <CalendarSection title="Calendar Review" rows={weeklyCalendar} setRows={setWeeklyCalendar} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} />
            <TasksSection title="Weekly Tasks" rows={weeklyTasks} setRows={setWeeklyTasks} assignedFrom="Weekly Meeting" updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} sendMeetingTaskToTasks={sendMeetingTaskToTasks} />
            <DecisionsSection title="Decisions Needed" rows={weeklyDecisions} setRows={setWeeklyDecisions} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} />
          </main>
        </div>
      )}
@@ -406,53 +167,22 @@ export default function MeetingsPage() {
        <>
          <div className="dateBar">
            <button onClick={() => changeDay(-1)}>← Previous Day</button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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
            <button className={dailyPerson === "Mark" ? "active" : ""} onClick={() => setDailyPerson("Mark")}>Mark</button>
            <button className={dailyPerson === "Dane" ? "active" : ""} onClick={() => setDailyPerson("Dane")}>Dane</button>
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
          <CalendarSection title={`${dailyPerson} Daily Calendar`} rows={activeDailyCalendar} setRows={setActiveDailyCalendar} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} />
          <TasksSection title={`${dailyPerson} Daily Tasks`} rows={activeDailyTasks} setRows={setActiveDailyTasks} assignedFrom={dailyPerson} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} sendMeetingTaskToTasks={sendMeetingTaskToTasks} />
          <DecisionsSection title={`${dailyPerson} Decisions Needed`} rows={activeDailyDecisions} setRows={setActiveDailyDecisions} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} />
        </>
      )}

      <style jsx>{`
      <style jsx global>{`
        .meetingsPage {
          padding: 32px;
          max-width: 1280px;
@@ -468,19 +198,21 @@ export default function MeetingsPage() {
          margin-bottom: 24px;
        }

        h1 {
        .meetingsPage h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.04em;
          font-weight: 800;
        }

        h2 {
        .meetingsPage h2 {
          margin: 0;
          font-size: 15px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }

        p {
        .meetingsPage p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 12px;
@@ -518,7 +250,7 @@ export default function MeetingsPage() {
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          margin-bottom: 12px;
        }

        .topToggle,
@@ -546,20 +278,26 @@ export default function MeetingsPage() {
          width: 160px;
        }

        button {
        .meetingsPage button {
          border: none;
          background: #111;
          color: #fff;
          border-radius: 9px;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .meetingsPage button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .smallBtn {
          width: 28px;
          height: 28px;
          padding: 0;
          padding: 0 !important;
        }

        .topToggle button,
@@ -574,9 +312,9 @@ export default function MeetingsPage() {
          color: #fff;
        }

        input,
        select,
        textarea {
        .meetingsPage input,
        .meetingsPage select,
        .meetingsPage textarea {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 10px;
@@ -585,18 +323,21 @@ export default function MeetingsPage() {
          outline: none;
          color: #111;
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
        }

        input:focus,
        select:focus,
        textarea:focus {
        .meetingsPage input:focus,
        .meetingsPage select:focus,
        .meetingsPage textarea:focus {
          border-color: #111;
          background: #fff;
        }

        .calendarList,
        .taskFlowList,
        .decisionList {
        .decisionList,
        .priorityList {
          display: flex;
          flex-direction: column;
          gap: 8px;
@@ -626,7 +367,7 @@ export default function MeetingsPage() {

        .decisionRow {
          display: grid;
          grid-template-columns: 1fr 32px;
          grid-template-columns: 1fr 82px 32px;
          gap: 8px;
          align-items: center;
        }
@@ -639,21 +380,19 @@ export default function MeetingsPage() {
        }

        .detailBtn {
          background: #f3f4f6;
          color: #111;
          background: #f3f4f6 !important;
          color: #111 !important;
        }

        .deleteBtn {
          background: #f3f4f6;
          color: #111;
          background: #f3f4f6 !important;
          color: #111 !important;
          width: 32px;
          height: 32px;
          padding: 0;
          padding: 0 !important;
        }

        .priorityList {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

@@ -682,22 +421,22 @@ export default function MeetingsPage() {
        }

        .priorityItem input {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 12px;
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          font-size: 12px !important;
          height: 100%;
          min-width: 0;
        }

        .priorityItem button {
          background: #f3f4f6;
          color: #111;
          background: #f3f4f6 !important;
          color: #111 !important;
          width: 16px;
          height: 16px;
          border-radius: 5px;
          font-size: 10px;
          padding: 0;
          padding: 0 !important;
        }

        @media (max-width: 1000px) {
@@ -729,3 +468,114 @@ export default function MeetingsPage() {
    </div>
  );
}

function CalendarSection({ title, rows, setRows, updateRow, addRow, deleteRow }) {
  return (
    <section className="meetingCard">
      <div className="sectionHeader">
        <div>
          <h2>{title}</h2>
          <p>Add meeting name, location, and time.</p>
        </div>
        <button className="smallBtn" onClick={() => addRow(rows, setRows, blankMeeting)}>+</button>
      </div>

      <div className="calendarList">
        {rows.map((meeting, index) => (
          <div className="calendarRow" key={index}>
            <input value={meeting.name} onChange={(e) => updateRow(rows, setRows, index, "name", e.target.value)} placeholder="Meeting name" />
            <input value={meeting.location} onChange={(e) => updateRow(rows, setRows, index, "location", e.target.value)} placeholder="Location" />
            <input type="time" value={meeting.time} onChange={(e) => updateRow(rows, setRows, index, "time", e.target.value)} />
            <button className="deleteBtn" onClick={() => deleteRow(rows, setRows, index)}>×</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function TasksSection({ title, rows, setRows, assignedFrom, updateRow, addRow, deleteRow, sendMeetingTaskToTasks }) {
  return (
    <section className="meetingCard">
      <div className="sectionHeader">
        <div>
          <h2>{title}</h2>
          <p>Add task name, priority, and optional hidden details.</p>
        </div>
        <button className="smallBtn" onClick={() => addRow(rows, setRows, blankTask)}>+</button>
      </div>

      <div className="taskFlowList">
        {rows.map((task, index) => (
          <div className="taskBlock" key={index}>
            <div className="taskFlowRow">
              <input value={task.title} onChange={(e) => updateRow(rows, setRows, index, "title", e.target.value)} placeholder="Task name" />

              <select value={task.urgency} onChange={(e) => updateRow(rows, setRows, index, "urgency", e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <button className="detailBtn" onClick={() => updateRow(rows, setRows, index, "showDetails", !task.showDetails)}>
                Details
              </button>

              <button onClick={() => sendMeetingTaskToTasks(task, assignedFrom)}>Send</button>

              <button className="deleteBtn" onClick={() => deleteRow(rows, setRows, index)}>×</button>
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

function DecisionsSection({ title, rows, setRows, updateRow, addRow, deleteRow }) {
  return (
    <section className="meetingCard">
      <div className="sectionHeader">
        <div>
          <h2>{title}</h2>
          <p>Add each decision as its own item.</p>
        </div>
        <button className="smallBtn" onClick={() => addRow(rows, setRows, blankDecision)}>+</button>
      </div>

      <div className="decisionList">
        {rows.map((decision, index) => (
          <div className="decisionBlock" key={index}>
            <div className="decisionRow">
              <input value={decision.title} onChange={(e) => updateRow(rows, setRows, index, "title", e.target.value)} placeholder="Decision needed" />

              <button className="detailBtn" onClick={() => updateRow(rows, setRows, index, "showDetails", !decision.showDetails)}>
                Details
              </button>

              <button className="deleteBtn" onClick={() => deleteRow(rows, setRows, index)}>×</button>
            </div>

            {decision.showDetails && (
              <textarea
                className="detailsBox"
                value={decision.details}
                onChange={(e) => updateRow(rows, setRows, index, "details", e.target.value)}
                placeholder="Notes / context..."
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
