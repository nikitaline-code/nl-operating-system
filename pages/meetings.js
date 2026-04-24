import { useEffect, useState } from "react";

export default function MeetingsPage() {
  const [mode, setMode] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");

  const [weeklyTasks, setWeeklyTasks] = useState([
    { title: "", urgency: "Medium" },
  ]);

  const [markDailyTasks, setMarkDailyTasks] = useState([
    { title: "", urgency: "Medium" },
  ]);

  const [daneDailyTasks, setDaneDailyTasks] = useState([
    { title: "", urgency: "Medium" },
  ]);

  const [weeklyNotes, setWeeklyNotes] = useState({
    calendar: "",
    email: "",
    decisions: "",
    priorities: "",
  });

  const [dailyNotes, setDailyNotes] = useState({
    Mark: {
      calendar: "",
      email: "",
      decisions: "",
      priorities: "",
    },
    Dane: {
      calendar: "",
      email: "",
      decisions: "",
      priorities: "",
    },
  });

  useEffect(() => {
    const savedWeeklyTasks = localStorage.getItem("meetingWeeklyTasks");
    const savedMarkDaily = localStorage.getItem("meetingMarkDailyTasks");
    const savedDaneDaily = localStorage.getItem("meetingDaneDailyTasks");
    const savedWeeklyNotes = localStorage.getItem("meetingWeeklyNotes");
    const savedDailyNotes = localStorage.getItem("meetingDailyNotes");

    if (savedWeeklyTasks) setWeeklyTasks(JSON.parse(savedWeeklyTasks));
    if (savedMarkDaily) setMarkDailyTasks(JSON.parse(savedMarkDaily));
    if (savedDaneDaily) setDaneDailyTasks(JSON.parse(savedDaneDaily));
    if (savedWeeklyNotes) setWeeklyNotes(JSON.parse(savedWeeklyNotes));
    if (savedDailyNotes) setDailyNotes(JSON.parse(savedDailyNotes));
  }, []);

  useEffect(() => {
    localStorage.setItem("meetingWeeklyTasks", JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);

  useEffect(() => {
    localStorage.setItem("meetingMarkDailyTasks", JSON.stringify(markDailyTasks));
  }, [markDailyTasks]);

  useEffect(() => {
    localStorage.setItem("meetingDaneDailyTasks", JSON.stringify(daneDailyTasks));
  }, [daneDailyTasks]);

  useEffect(() => {
    localStorage.setItem("meetingWeeklyNotes", JSON.stringify(weeklyNotes));
  }, [weeklyNotes]);

  useEffect(() => {
    localStorage.setItem("meetingDailyNotes", JSON.stringify(dailyNotes));
  }, [dailyNotes]);

  function sendMeetingTaskToTasks(taskTitle, assignedFrom, urgency) {
    if (!taskTitle.trim()) return;

    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      assignedFrom,
      urgency,
      dueDate: "",
      complete: false,
      source: "Meetings",
    };

    localStorage.setItem("tasks", JSON.stringify([newTask, ...existingTasks]));
  }

  function updateTaskItem(array, setArray, index, field, value) {
    const updated = [...array];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setArray(updated);
  }

  function addTaskRow(array, setArray) {
    setArray([...array, { title: "", urgency: "Medium" }]);
  }

  function deleteTaskRow(array, setArray, index) {
    setArray(array.filter((_, i) => i !== index));
  }

  function updateWeeklyNote(section, value) {
    setWeeklyNotes({
      ...weeklyNotes,
      [section]: value,
    });
  }

  function updateDailyNote(section, value) {
    setDailyNotes({
      ...dailyNotes,
      [dailyPerson]: {
        ...dailyNotes[dailyPerson],
        [section]: value,
      },
    });
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
          <p>Daily and weekly notes, decisions, priorities, and task flow.</p>
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
        <>
          <div className="sectionsGrid">
            <section className="meetingCard">
              <h2>Weekly Calendar Review</h2>
              <textarea
                value={weeklyNotes.calendar}
                onChange={(e) => updateWeeklyNote("calendar", e.target.value)}
                placeholder="Review the week’s calendar, conflicts, key meetings, prep needed, and follow-ups..."
              />
            </section>

            <section className="meetingCard">
              <h2>Email Review</h2>
              <textarea
                value={weeklyNotes.email}
                onChange={(e) => updateWeeklyNote("email", e.target.value)}
                placeholder="Review email asks, replies needed, dealer items, and items to route..."
              />
            </section>

            <section className="meetingCard">
              <h2>Decisions Needed</h2>
              <textarea
                value={weeklyNotes.decisions}
                onChange={(e) => updateWeeklyNote("decisions", e.target.value)}
                placeholder="List decisions needed from Mark/Dane..."
              />
            </section>

            <section className="meetingCard">
              <h2>Top Priorities</h2>
              <textarea
                value={weeklyNotes.priorities}
                onChange={(e) => updateWeeklyNote("priorities", e.target.value)}
                placeholder="List the top priorities for the week..."
              />
            </section>
          </div>

          <section className="meetingCard taskCard">
            <div className="sectionHeader">
              <div>
                <h2>Weekly Tasks</h2>
                <p>Send weekly meeting items directly to Tasks page</p>
              </div>

              <button onClick={() => addTaskRow(weeklyTasks, setWeeklyTasks)}>
                +
              </button>
            </div>

            <div className="taskFlowList">
              {weeklyTasks.map((task, index) => (
                <div className="taskFlowRow" key={index}>
                  <input
                    value={task.title}
                    onChange={(e) =>
                      updateTaskItem(
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
                      updateTaskItem(
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
        </>
      )}

      {mode === "daily" && (
        <>
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

          <div className="sectionsGrid">
            <section className="meetingCard">
              <h2>Daily Calendar Review</h2>
              <textarea
                value={dailyNotes[dailyPerson]?.calendar || ""}
                onChange={(e) => updateDailyNote("calendar", e.target.value)}
                placeholder={`Review ${dailyPerson}'s calendar, conflicts, prep, and follow-ups...`}
              />
            </section>

            <section className="meetingCard">
              <h2>Email Review</h2>
              <textarea
                value={dailyNotes[dailyPerson]?.email || ""}
                onChange={(e) => updateDailyNote("email", e.target.value)}
                placeholder={`Review ${dailyPerson}'s email asks, replies needed, and items to route...`}
              />
            </section>

            <section className="meetingCard">
              <h2>Decisions Needed</h2>
              <textarea
                value={dailyNotes[dailyPerson]?.decisions || ""}
                onChange={(e) => updateDailyNote("decisions", e.target.value)}
                placeholder={`List decisions needed from ${dailyPerson}...`}
              />
            </section>

            <section className="meetingCard">
              <h2>Top Priorities</h2>
              <textarea
                value={dailyNotes[dailyPerson]?.priorities || ""}
                onChange={(e) => updateDailyNote("priorities", e.target.value)}
                placeholder={`List ${dailyPerson}'s top priorities for the day...`}
              />
            </section>
          </div>

          <section className="meetingCard taskCard">
            <div className="sectionHeader">
              <div>
                <h2>{dailyPerson} Daily Tasks</h2>
                <p>Send daily meeting items directly to Tasks page</p>
              </div>

              <button onClick={() => addTaskRow(activeDailyTasks, setActiveDailyTasks)}>
                +
              </button>
            </div>

            <div className="taskFlowList">
              {activeDailyTasks.map((task, index) => (
                <div className="taskFlowRow" key={index}>
                  <input
                    value={task.title}
                    onChange={(e) =>
                      updateTaskItem(
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
                      updateTaskItem(
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

        .sectionsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .meetingCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.035);
        }

        .taskCard {
          margin-top: 0;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .topToggle,
        .personToggle {
          display: flex;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 5px;
        }

        .personToggle {
          width: fit-content;
          margin-bottom: 18px;
        }

        button {
          border: none;
          background: #111;
          color: #fff;
          border-radius: 9px;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        button:hover {
          transform: translateY(-1px);
          opacity: 0.9;
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
          min-height: 95px;
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

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #111;
          background: #fff;
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

        .taskFlowRow .deleteBtn {
          background: #f3f4f6;
          color: #111;
          width: 32px;
          height: 32px;
          padding: 0;
        }

        @media (max-width: 1000px) {
          .sectionsGrid {
            grid-template-columns: 1fr;
          }

          .meetingsHeader {
            flex-direction: column;
          }

          .taskFlowRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
