import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
const [tasks, setTasks] = useState([]);
const [newTask, setNewTask] = useState("");
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/");
      } else {
        setUser(data.session.user);
      }
    };

  checkUser();
fetchTasks();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };const fetchTasks = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("Task List")
    .select("*")
    .eq("user_id", user.id);

  if (!error) {
    setTasks(data);
  }
};
  const addTask = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!newTask) return;

  const { error } = await supabase.from("Task List").insert([
    {
      content: newTask,
      is_complete: false,
      user_id: user.id, // 🔥 THIS FIXES YOUR RLS ISSUE
    },
  ]);

  if (!error) {
    setNewTask("");
    fetchTasks(); // refresh list
  } else {
    console.error(error);
  }
};

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{
        width: "250px",
        background: "#111",
        color: "white",
        padding: "20px"
      }}>
        <h2>NL OS</h2>
        <p>Dashboard</p>
        <p>Tasks</p>
        <p>Notes</p>
        <p>Calendar</p>

        <button onClick={handleLogout} style={{ marginTop: 20 }}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "40px" }}>
        <h1>Welcome 🚀</h1>

        {user && (
          <p>Logged in as: {user.email}</p>
        )}

      <h2>Tasks</h2>

<input
  type="text"
  placeholder="Add a task..."
  value={newTask}
  onChange={(e) => setNewTask(e.target.value)}
/>

<button onClick={addTask}>Add</button>

<ul>
  {tasks.map((task) => (
    <li key={task.id}>{task.content}</li>
  ))}
</ul>
      </div>
    </div>
  );
}
