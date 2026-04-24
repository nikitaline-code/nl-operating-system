import { useEffect, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

export default function MeetingsPage() {
  const [mode, setMode] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");
  const [selectedDate, setSelectedDate] = useState(today);

  const [weeklyPriorities, setWeeklyPriorities] = useState(["", "", ""]);
  const [calendarReview, setCalendarReview] = useState("");
  const [decisionsNeeded, setDecisionsNeeded] = useState("");

  const [weeklyTasks, setWeeklyTasks] = useState([
    { title: "", urgency: "Medium" },
  ]);

  const [markDailyTasks, setMarkDailyTasks] = useState([
    { title: "", urgency: "Medium" },
  ]);

  const [daneDailyTasks, setDaneDailyTasks] = useState([
    { title: "", urgency: "Medium" },
  ]);

  const [dailyNotes, setDailyNotes] = useState({
    Mark: "",
    Dane: "",
  });

  useEffect(() => {
    const savedPriorities = localStorage.getItem("weeklyPriorities");
    const savedCalendar = localStorage.getItem("meetingCalendarReview");
    const savedDecisions = localStorage.getItem("meetingDecisionsNeeded");
    const savedWeeklyTasks = localStorage.getItem("meetingWeeklyTasks");

    if (savedPriorities) setWeeklyPriorities(JSON.parse(savedPriorities));
    if (savedCalendar) setCalendarReview(savedCalendar);
    if (savedDecisions) setDecisionsNeeded(savedDecisions);
    if (savedWeeklyTasks) setWeeklyTasks(JSON.parse(savedWeeklyTasks));
  }, []);

  useEffect(() => {
    const savedDailyNotes = localStorage.getItem(
      `meetingDailyNotes-${selectedDate}`
    );
    const savedMarkDaily = localStorage.getItem(
      `meetingMarkDailyTasks-${selectedDate}`
    );
    const savedDaneDaily = localStorage.getItem(
      `meetingDaneDailyTasks-${selectedDate}`
    );

    setDailyNotes(savedDailyNotes ? JSON.parse(savedDailyNotes) : { Mark: "", Dane: "" });

    setMarkDailyTasks(
      savedMarkDaily ? JSON.parse(savedMarkDaily) : [{ title: "", urgency: "Medium" }]
    );

    setDaneDailyTasks(
      savedDaneDaily ? JSON.parse(savedDaneDaily) : [{ title: "", urgency: "Medium" }]
    );
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("weeklyPriorities", JSON.stringify(weeklyPriorities));
  }, [weeklyPriorities]);

  useEffect(() => {
    localStorage.setItem("meetingCalendarReview", calendarReview);
  }, [calendarReview]);

  useEffect(() => {
    localStorage.setItem("meetingDecisionsNeeded", decisionsNeeded);
  }, [decisionsNeeded]);

  useEffect(() => {
    localStorage.setItem("meetingWeeklyTasks", JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  useEffect(() => {
    localStorage.setItem(
      `meetingDailyNotes-${selectedDate}`,
      JSON.stringify(dailyNotes)
    );
  }, [dailyNotes, selectedDate]);

  useEffect(() => {
    localStorage.setItem(
      `meetingMarkDailyTasks-${selectedDate}`,
      JSON.stringify(markDailyTasks)
    );
  }, [markDailyTasks, selectedDate]);

  useEffect(() => {
    localStorage.setItem(
      `meetingDaneDailyTasks-${selectedDate}`,
      JSON.stringify(daneDailyTasks)
    );
  }, [daneDailyTasks, selectedDate]);

  function changeDay(amount) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + amount);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  function sendMeetingTaskToTasks(taskTitle, assignedFrom, urgency) {
    if (!taskTitle.trim()) return;

    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      assignedFrom,
      urgency,
      dueDate: selectedDate,
      complete: false,
      source: "Meetings",
    };

    localStorage.setItem("tasks", JSON.stringify([newTask, ...existingTasks]));
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

  function updateTaskRow(array, setArray, index, field, value) {
    const updated = [...array];
    updated[index] = { ...updated[index], [field]: value };
    setArray(updated);
  }

  function addTaskRow(array, setArray) {
    setArray([...array, { title: "", urgency: "Medium" }]);
  }

  function deleteTaskRow(array, setArray, index) {
    setArray(array.filter((_, i) => i !== index));
  }

  const activeDailyTasks =
    dailyPerson === "Mark" ? markDailyTasks : daneDailyTasks;

  const setActiveDailyTasks =
    dailyPerson === "Mark" ? setMarkDailyTasks : setDaneDailyTasks;

  return (
    <div className="meetingsPage">
      <div className="meetingsHeader">
        <div>
          <h1>Meetings</h1>
          <p>Weekly alignment and daily huddle items.</p>
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
            <section className="meetingCard">
              <h2>Calendar Review</h2>
              <textarea
                value={calendarReview}
                onChange={(e) => setCalendarReview(e.target.value)}
                placeholder="Review key meetings, conflicts, prep needed, and follow-ups..."
              />
            </section>

            <section className="meetingCard">
              <h2>Decisions Needed</h2>
              <textarea
                value={decisionsNeeded}
                onChange={(e) => setDecisionsNeeded(e.target.value)}
                placeholder="List decisions needed from Mark/Dane..."
              />
            </section>

            <section className="meetingCard">
              <div className="sectionHeader">
                <div>
                  <h2>Weekly Tasks</h2>
                  <p>Send items directly to Tasks page</p>
                </div>
                <button
                  className="smallBtn"
                  onClick={() => addTaskRow(weeklyTasks, setWeeklyTasks)}
                >
                  +
                </button>
              </div>

              <div className="taskFlowList">
                {weeklyTasks.map((task, index) => (
                  <div className="taskFlowRow" key={index}>
                    <input
                      value={task.title}
                      onChange={(e) =>
                        updateTaskRow(
                          weeklyTasks,
                          setWeeklyTasks,
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Add weekly task..."
                    />

                    <select
                      value={task.urgency}
                      onChange={(e) =>
                        updateTaskRow(
                          weeklyTasks,
                          setWeeklyTasks,
                          index,
                          "urgency",
                          e.target.value
                        )
                      }
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>

                    <button
                      onClick={() =>
                        sendMeetingTaskToTasks(
                          task.title,
                          "Weekly Meeting",
                          task.urgency
                        )
                      }
                    >
                      Send
                    </button>

                    <button
                      className="deleteBtn"
                      onClick={() =>
                        deleteTaskRow(weeklyTasks, setWeeklyTasks, index)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
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

          <section className="meetingCard">
            <h2>{dailyPerson} Daily Huddle</h2>
            <p>Daily Calendar Review · Email Review · Decisions Needed · Top Priorities</p>

            <textarea
              value={dailyNotes[dailyPerson] || ""}
              onChange={(e) =>
                setDailyNotes({
                  ...dailyNotes,
                  [dailyPerson]: e.target.value,
                })
              }
              placeholder={`Add ${dailyPerson}'s daily meeting notes...`}
            />
          </section>

          <section className="meetingCard dailyTasksCard">
            <div className="sectionHeader">
              <div>
                <h2>{dailyPerson} Daily Tasks</h2>
                <p>Send daily huddle items directly to Tasks page</p>
              </div>
              <button
                className="smallBtn"
                onClick={() => addTaskRow(activeDailyTasks, setActiveDailyTasks)}
              >
                +
              </button>
            </div>

            <div className="taskFlowList">
              {activeDailyTasks.map((task, index) => (
                <div className="taskFlowRow" key={index}>
                  <input
                    value={task.title}
                    onChange={(e) =>
                      updateTaskRow(
                        activeDailyTasks,
                        setActiveDailyTasks,
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder={`Add ${dailyPerson} task...`}
                  />

                  <select
                    value={task.urgency}
                    onChange={(e) =>
                      updateTaskRow(
                        activeDailyTasks,
                        setActiveDailyTasks,
                        index,
                        "urgency",
                        e.target.value
                      )
                    }
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>

                  <button
                    onClick={() =>
                      sendMeetingTaskToTasks(
                        task.title,
                        dailyPerson,
                        task.urgency
                      )
                    }
                  >
                    Send
                  </button>

                  <button
                    className="deleteBtn"
                    onClick={() =>
                      deleteTaskRow(activeDailyTasks, setActiveDailyTasks, index)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
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

        textarea {
          width: 100%;
          min-height: 120px;
          margin-top: 12px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          resize: vertical;
          color: #111;
        }

        input,
        select {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 10px;
          padding: 10px 11px;
          font-size: 13px;
          outline: none;
          color: #111;
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

        .taskFlowList {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .taskFlowRow {
          display: grid;
          grid-template-columns: 1fr 110px 70px 32px;
          gap: 8px;
          align-items: center;
        }

        .deleteBtn {
          background: #f3f4f6;
          color: #111;
          width: 32px;
          height: 32px;
          padding: 0;
        }

        .dailyTasksCard {
          margin-top: 18px;
        }

        @media (max-width: 1000px) {
          .meetingGrid {
            grid-template-columns: 1fr;
          }

          .prioritySide {
            position: static;
          }

          .taskFlowRow,
          .dateBar {
            grid-template-columns: 1fr;
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
