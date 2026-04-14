import { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([
    { id: 1, name: "Wake up", completed: false },
    { id: 2, name: "Workout", completed: false },
    { id: 3, name: "Read", completed: false },
  ]);

  const [newTask, setNewTask] = useState("");
  const [assigned, setAssigned] = useState("Mark");
  const [urgency, setUrgency] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  // ADD TASK
  const addTask = () => {
    if (!newTask) return;

    const task = {
      id: Date.now(),
      content: newTask,
      assigned_to: assigned,
      urgency,
      due_date: dueDate,
      is_complete: false,
    };

    setTasks([task, ...tasks]);
    setNewTask("");
    setDueDate("");
  };

  // TOGGLE TASK
  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, is_complete: !t.is_complete } : t
      )
    );
  };

  // DELETE TASK
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // TOGGLE HABIT
  const toggleHabit = (id) => {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, completed: !h.completed } : h
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Daily OS</h1>
          <p className="text-sm text-gray-500 mt-1">
            Focused execution for today
          </p>
        </div>

        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          {hideCompleted ? "Show Completed" : "Hide Completed"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase">Open Tasks</p>
          <p className="text-2xl font-semibold mt-1">
            {tasks.filter((t) => !t.is_complete).length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase">Completed</p>
          <p className="text-2xl font-semibold mt-1">
            {tasks.filter((t) => t.is_complete).length}
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-4 gap-6">
        
        {/* HABITS */}
        <div className="col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">
            Daily Habits
          </h2>

          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">
                  {habit.name}
                </span>

                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(habit.id)}
                  className="accent-black"
                />
              </div>
            ))}
          </div>
        </div>

        {/* TASKS */}
        <div className="col-span-3 space-y-4">
          
          {/* ADD TASK */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3 items-center">
            
            <input
              type="text"
              placeholder="Add task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />

            <select
              value={assigned}
              onChange={(e) => setAssigned(e.target.value)}
              className="px-2 py-2 border rounded-lg text-sm"
            >
              <option>Mark</option>
              <option>Dane</option>
            </select>

            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="px-2 py-2 border rounded-lg text-sm"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2 py-2 border rounded-lg text-sm"
            />

            <button
              onClick={addTask}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm"
            >
              Add
            </button>
          </div>

          {/* TASK LIST */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            
            <div className="space-y-2">
              {tasks
                .filter((t) => (hideCompleted ? !t.is_complete : true))
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center px-3 py-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      
                      <input
                        type="checkbox"
                        checked={task.is_complete}
                        onChange={() => toggleTask(task.id)}
                      />

                      <div>
                        <p className={task.is_complete ? "line-through text-gray-400 text-sm" : "text-sm"}>
                          {task.content}
                        </p>

                        <div className="flex gap-2 mt-1">
                          
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.urgency === "High"
                              ? "bg-red-100 text-red-600"
                              : task.urgency === "Medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {task.urgency}
                          </span>

                          <span className="text-xs text-gray-400">
                            {task.assigned_to}
                          </span>

                          {task.due_date && (
                            <span className="text-xs text-gray-400">
                              {task.due_date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
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
