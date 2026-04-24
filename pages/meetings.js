import { useEffect, useState } from "react";

export default function MeetingsPage() {
  const [mode, setMode] = useState("weekly");
  const [dailyPerson, setDailyPerson] = useState("Mark");

  const [weeklyTasks, setWeeklyTasks] = useState([""]);
  const [markDailyTasks, setMarkDailyTasks] = useState([""]);
  const [daneDailyTasks, setDaneDailyTasks] = useState([""]);

  const [weeklyPriorities, setWeeklyPriorities] = useState(["", "", ""]);
  const [calendarReview, setCalendarReview] = useState("");
  const [decisionsNeeded, setDecisionsNeeded] = useState("");

  useEffect(() => {
    const savedWeeklyTasks = localStorage.getItem("meetingWeeklyTasks");
    const savedMarkDaily = localStorage.getItem("meetingMarkDailyTasks");
    const savedDaneDaily = localStorage.getItem("meetingDaneDailyTasks");
    const savedPriorities = localStorage.getItem("weeklyPriorities");
    const savedCalendar = localStorage.getItem("meetingCalendarReview");
    const savedDecisions = localStorage.getItem("meetingDecisionsNeeded");

    if (savedWeeklyTasks) setWeeklyTasks(JSON.parse(savedWeeklyTasks));
    if (savedMarkDaily) setMarkDailyTasks(JSON.parse(savedMarkDaily));
    if (savedDaneDaily) setDaneDailyTasks(JSON.parse(savedDaneDaily));
    if (savedPriorities) setWeeklyPriorities(JSON.parse(savedPriorities));
    if (savedCalendar) setCalendarReview(savedCalendar);
    if (savedDecisions) setDecisionsNeeded(savedDecisions);
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
    localStorage.setItem("weeklyPriorities", JSON.stringify(weeklyPriorities));
  }, [weeklyPriorities]);

  useEffect(() => {
    localStorage.setItem("meetingCalendarReview", calendarReview);
  }, [calendarReview]);

  useEffect(() => {
    localStorage.setItem("meetingDecisionsNeeded", decisionsNeeded);
  }, [decisionsNeeded]);

  function sendMeetingTaskToTasks(taskTitle, assignedFrom = "Meetings", urgency = "Medium") {
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

  function updateArrayItem(array, setArray, index, value) {
    const updated = [...array];
    updated[index] = value;
    setArray(updated);
  }

  function addArrayItem(array, setArray) {
    setArray([...array, ""]);
  }

  function deleteArrayItem(array, setArray, index) {
    setArray(array.filter((_, i) => i !== index));
  }

  const activeDailyTasks = dailyPerson === "Mark" ? markDailyTasks : daneDailyTasks;
  const setActiveDailyTasks = dailyPerson === "Mark" ? setMarkDailyTasks : setDaneDailyTasks;

  return (
    <div className="meetingsPage">
      <div className="meetingsHeader">
        <div>
          <h1>Meetings</h1>
          <p>Daily and weekly meeting notes, priorities, decisions, and task flow.</p>
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
          <section className="meetingCard sideCard">
            <div className="sectionHeader">
              <div>
                <h2>Weekly Priorities</h2>
                <p>Flows to Tasks page priorities</p>
              </div>
              <button onClick={() => addArrayItem(weeklyPriorities, setWeeklyPriorities)}>
                +
              </button>
            </div>

            <div className="compactList">
              {weeklyPriorities.map((priority, index) => (
                <div className="compactRow" key={index}>
                  <span>{index + 1}</span>
                  <input
                    value={priority}
                    onChange={(e) =>
                      updateArrayItem(
                        weeklyPriorities,
                        setWeeklyPriorities,
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Add priority..."
                  />
                  <button
                    onClick={() =>
                      deleteArrayItem(weeklyPriorities, setWeeklyPriorities, index)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

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
                placeholder="List decisions that need Mark/Dane input..."
              />
            </section>

            <section className="meetingCard">
              <div className="sectionHeader">
                <div>
                  <h2>Weekly Tasks</h2>
                  <p>Send items directly to Tasks page</p>
                </div>
                <button onClick={() => addArrayItem(weeklyTasks, setWeeklyTasks)}>
                  +
                </button>
              </div>

              <div className="taskFlowList">
                {weeklyTasks.map((task, index) => (
                  <div className="taskFlowRow" key={index}>
                    <input
                      value={task}
                      onChange={(e) =>
                        updateArrayItem(weeklyTasks, setWeeklyTasks, index, e.target.value)
                      }
                      placeholder="Add weekly meeting task..."
                    />

                    <button
                      onClick={() =>
                        sendMeetingTaskToTasks(task, "Weekly Meeting", "Medium")
                      }
                    >
                      Send
                    </button>

                    <button
                      className="deleteBtn"
                      onClick={() => deleteArrayItem(weeklyTasks, setWeeklyTasks, index)}
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
        <div>
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

          <div className="dailyGrid">
            <section className="meetingCard">
              <h2>{dailyPerson} Daily Huddle</h2>
              <p className="miniText">
                Daily Calendar Review · Email Review · Decisions Needed · Top Priorities
              </p>

              <textarea placeholder={`Add ${dailyPerson}'s daily meeting notes...`} />
            </section>

            <section className="meetingCard">
              <div className="sectionHeader">
                <div>
                  <h2>{dailyPerson} Daily Tasks</h2>
                  <p>Send daily meeting items directly to Tasks page</p>
                </div>
                <button onClick={() => addArrayItem(activeDailyTasks, setActiveDailyTasks)}>
                  +
                </button>
              </div>

              <div className="taskFlowList">
                {activeDailyTasks.map((task, index) => (
                  <div className="taskFlowRow" key={index}>
                    <input
                      value={task}
                      onChange={(e) =>
                        updateArrayItem(
                          activeDailyTasks,
                          setActiveDailyTasks,
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Add ${dailyPerson} task...`}
                    />

                    <button
                      onClick={() =>
                        sendMeetingTaskToTasks(task, dailyPerson, "Medium")
                      }
                    >
                      Send
                    </button>

                    <button
                      className="deleteBtn"
                      onClick={() =>
                        deleteArrayItem(activeDailyTasks, setActiveDailyTasks, index)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
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

        .mainColumn {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .dailyGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .meetingCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.035);
        }

        .sideCard {
          position: sticky;
          top: 24px;
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

        input {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 10px;
          padding: 10px 11px;
          font-size: 13px;
          outline: none;
          color: #111;
        }

        input:focus,
        textarea:focus {
          border-color: #111;
          background: #fff;
        }

        .compactList {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .compactRow {
          display: grid;
          grid-template-columns: 16px 1fr 18px;
          gap: 5px;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 6px;
          height: 32px;
        }

        .compactRow span {
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

        .compactRow input {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 12px;
          height: 100%;
          min-width: 0;
        }

        .compactRow button {
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
          grid-template-columns: 1fr 70px 32px;
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

        .miniText {
          margin-top: 8px;
        }

        @media (max-width: 1000px) {
          .meetingGrid {
            grid-template-columns: 1fr;
          }

          .sideCard {
            position: static;
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
