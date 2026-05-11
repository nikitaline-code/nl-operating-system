import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Daily Page", href: "/daily" },
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
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
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
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          background: #f5f6f8;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .sidebar {
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 22px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding: 0 6px;
        }

        .brandMark {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: #111827;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .brand strong {
          display: block;
          font-size: 14px;
          letter-spacing: -0.02em;
        }

        .brand span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          color: #6b7280;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        nav :global(a) {
          text-decoration: none;
          color: #4b5563;
          font-size: 14px;
          font-weight: 650;
          padding: 10px 12px;
          border-radius: 12px;
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

        .content {
          min-width: 0;
        }

        @media (max-width: 900px) {
          .shell {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
            height: auto;
            border-right: 0;
            border-bottom: 1px solid #e5e7eb;
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
