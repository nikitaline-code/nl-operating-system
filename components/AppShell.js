import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Daily Page", href: "/daily" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Meetings", href: "/meetings" },
  { label: "Communication", href: "/communications" },
  { label: "Travel", href: "/travel" },
];

export default function AppShell({ children }) {
  const router = useRouter();

  return (
    <div className="appShell">
      <aside className="sideNav">
        <div className="sideHeader">
          <div className="sideLogo">N</div>
          <div>
            <div className="sideTitle">Operating System</div>
            <div className="sideSub">Nikita</div>
          </div>
        </div>

        <nav className="sideLinks">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "sideLink active" : "sideLink"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="pageArea">{children}</main>
    </div>
  );
}
