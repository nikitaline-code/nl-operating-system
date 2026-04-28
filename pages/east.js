import { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEET_CSV_URL = https://docs.google.com/spreadsheets/d/e/2PACX-1vT1AfbA0b8VKuuf8Ho2FSmzK1JH_bq1yn07umiQurWyLRW96NuQ8s-vz6M-4NKp3WFKf4fI353l2UlO/pub?gid=1945000950&single=true&output=csv;

export default function EastPage() {
  const [activePerson, setActivePerson] = useState("Mark");
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSheet() {
      try {
        const res = await fetch(GOOGLE_SHEET_CSV_URL);
        const text = await res.text();

        const rows = text
          .split("\n")
          .map((row) => row.trim())
          .filter(Boolean);

        const dataRows = rows.slice(1);

        const parsed = dataRows.map((row, index) => {
          const columns = row.split(",");

          return {
            id: index + 1,
            owner: columns[0]?.trim() || "Mark",
            name: columns[1]?.trim() || "",
            location: columns[2]?.trim() || "",
            contact: columns[3]?.trim() || "",
            notes: columns[4]?.trim() || "",
          };
        });

        setDealers(parsed);
      } catch (error) {
        console.error("Could not load Google Sheet:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSheet();
  }, []);

  const visibleDealers = useMemo(() => {
    return dealers.filter((dealer) => {
      const matchesOwner = dealer.owner === activePerson;

      const matchesSearch =
        dealer.name.toLowerCase().includes(search.toLowerCase()) ||
        dealer.location.toLowerCase().includes(search.toLowerCase()) ||
        dealer.contact.toLowerCase().includes(search.toLowerCase()) ||
        dealer.notes.toLowerCase().includes(search.toLowerCase());

      return matchesOwner && matchesSearch;
    });
  }, [dealers, activePerson, search]);

  return (
    <div className="page">
      <div className="shell">
        <header className="topHeader">
          <div>
            <p className="eyebrow">Google Sheet Sync</p>
            <h1>East</h1>
            <p className="subtext">
              Dealer information pulled from your Google Sheet and displayed in your website style.
            </p>
          </div>

          <div className="personToggle">
            <button
              className={activePerson === "Mark" ? "active" : ""}
              onClick={() => setActivePerson("Mark")}
            >
              Mark
            </button>

            <button
              className={activePerson === "Dane" ? "active" : ""}
              onClick={() => setActivePerson("Dane")}
            >
              Dane
            </button>
          </div>
        </header>

        <section className="toolbarCard">
          <div>
            <h2>{activePerson}'s East Dealers</h2>
            <p>
              Update the Google Sheet and refresh this page to see the latest list.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dealers, locations, contacts..."
          />
        </section>

        <section className="card">
          <div className="sectionHeader">
            <div>
              <h2>Dealer Directory</h2>
              <p>{visibleDealers.length} showing</p>
            </div>
          </div>

          {loading ? (
            <div className="emptyState">Loading Google Sheet...</div>
          ) : visibleDealers.length === 0 ? (
            <div className="emptyState">
              No dealers showing. Check your Google Sheet link or owner column.
            </div>
          ) : (
            <div className="dealerGrid">
              {visibleDealers.map((dealer) => (
                <div className="dealerCard" key={dealer.id}>
                  <div className="dealerTop">
                    <div>
                      <h3>{dealer.name || "Unnamed Dealer"}</h3>
                      <p>{dealer.location || "No location added"}</p>
                    </div>

                    <span>{dealer.owner}</span>
                  </div>

                  <div className="dealerDetails">
                    <div>
                      <label>Contact</label>
                      <p>{dealer.contact || "—"}</p>
                    </div>

                    <div>
                      <label>Notes</label>
                      <p>{dealer.notes || "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 32px;
        }

        .shell {
          max-width: 1380px;
          margin: 0 auto;
        }

        .topHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0 0 7px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6b7280;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.05em;
        }

        h2 {
          margin: 0;
          font-size: 15px;
          letter-spacing: -0.02em;
        }

        h3 {
          margin: 0;
          font-size: 14px;
          letter-spacing: -0.02em;
        }

        p {
          margin: 5px 0 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .subtext {
          max-width: 560px;
        }

        .personToggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: #eceef2;
          padding: 5px;
          border-radius: 999px;
          min-width: 180px;
        }

        .personToggle button {
          border: none;
          background: transparent;
          color: #555;
          border-radius: 999px;
          height: 30px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .personToggle button.active {
          background: #111;
          color: #fff;
        }

        .toolbarCard,
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .toolbarCard {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }

        .card {
          padding: 18px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        input {
          width: 100%;
          border: 1px solid #e5e7eb;
          background: #f8f9fb;
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 13px;
          color: #111;
          outline: none;
          box-sizing: border-box;
        }

        input:focus {
          background: #fff;
          border-color: #111;
        }

        .dealerGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .dealerCard {
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 18px;
          padding: 14px;
          min-width: 0;
        }

        .dealerTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .dealerTop span {
          height: fit-content;
          background: #111;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 999px;
          padding: 5px 8px;
        }

        .dealerDetails {
          display: grid;
          gap: 10px;
        }

        label {
          display: block;
          font-size: 10px;
          color: #777;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
          margin-bottom: 3px;
        }

        .dealerDetails p {
          margin: 0;
          color: #222;
          font-size: 12px;
        }

        .emptyState {
          padding: 28px;
          text-align: center;
          color: #777;
          font-size: 13px;
          border: 1px dashed #d1d5db;
          border-radius: 16px;
          background: #fafafa;
        }

        @media (max-width: 1050px) {
          .topHeader,
          .toolbarCard {
            grid-template-columns: 1fr;
            flex-direction: column;
          }

          .dealerGrid {
            grid-template-columns: 1fr;
          }

          .personToggle {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
