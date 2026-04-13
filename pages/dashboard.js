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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
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

        <p>This is your operating system dashboard.</p>
      </div>
    </div>
  );
}
