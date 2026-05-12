import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Meetings", href: "/meetings" },
  { label: "Executive Flow", href: "/executive-flow" },
  { label: "Communication", href: "/communications" },
  { label: "Travel", href: "/travel" },
  { label: "East", href: "/east" },
  { label: "South", href: "/south" },
  { label: "Dealer Offboarding", href: "/dealer-offboarding" },
  { label: "AQ Culture", href: "/culture" },
  { label: "PLAUD Notes", href: "/plaud" },
];

export default function AppShell({ children }) {
  const router = useRouter();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">NL</div>
          <div>
            <strong>Operating System</strong>
            <span>Command Center</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const active = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="content">{children}</main>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 205px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 18px 10px;
          z-index: 100;
          overflow-y: auto;
        }

        .content {
          margin-left: 205px;
          min-height: 100vh;
          min-width: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          padding: 0 4px;
        }

        .brandMark {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: #111827;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .brand strong {
          display: block;
          font-size: 13px;
          letter-spacing: -0.02em;
        }

        .brand span {
          display: block;
          margin-top: 1px;
          font-size: 10px;
          color: #6b7280;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        nav :global(a) {
          text-decoration: none;
          color: #4b5563;
          font-size: 13px;
          font-weight: 650;
          padding: 9px 9px;
          border-radius: 10px;
          transition: 0.15s ease;
        }

        nav :global(a:hover) {
          background: #f3f4f6;
          color: #111827;
        }

        nav :global(a.active) {
          background: #111827;
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .sidebar {
            position: static;
            width: auto;
            border-right: 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .content {
            margin-left: 0;
          }

          nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
          }

          nav :global(a) {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
