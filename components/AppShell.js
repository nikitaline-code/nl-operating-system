import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { label: "Daily Page", href: "/daily" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Meetings", href: "/meetings" },
  { label: "Communication", href: "/communications" },
  { label: "Travel", href: "/travel" },
  { label: "East", href: "/east" },
  { label: "South", href: "/south" },
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

      <style jsx>{`
        .appShell {
          display: flex;
          min-height: 100vh;
          background: #f5f6f8;
        }

        .sideNav {
          width: 240px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          padding: 24px 18px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .sideHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eef2f7;
        }

        .sideLogo {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #020617;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
        }

        .sideTitle {
          font-size: 14px;
          font-weight: 800;
          color: #020617;
          line-height: 1.2;
        }

        .sideSub {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .sideLinks {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sideLink {
          text-decoration: none;
          color: #334155;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 12px;
          border-radius: 12px;
          transition: all 0.15s ease;
        }

        .sideLink:hover {
          background: #f1f5f9;
          color: #020617;
        }

        .sideLink.active {
          background: #020617;
          color: white;
        }

        .pageArea {
          flex: 1;
          margin-left: 240px;
          padding: 0;
          min-height: 100vh;
        }

        @media (max-width: 900px) {
          .sideNav {
            position: relative;
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }

          .pageArea {
            margin-left: 0;
          }

          .sideLinks {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
