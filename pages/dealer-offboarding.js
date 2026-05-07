import { useEffect, useMemo, useState } from "react";

const SOP_STEPS = [
  {
    title: "Pull Full Inventory List",
    owner: "Daniel / Nikita",
    details: [
      "Export full inventory from system",
      "Include product, serial #, SKU, location, condition",
      "Physically verify units with photos",
    ],
  },
  {
    title: "Set Pricing & Discounts",
    owner: "Daniel",
    details: [
      "Define discount % by product",
      "Set minimum floor pricing",
      "Get finance + sales approval",
    ],
  },
  {
    title: "Set Dealer Allocation Plan",
    owner: "Account Manager",
    details: [
      "Identify priority dealers",
      "A dealers first, then B dealers",
      "Ensure product mix and avoid cherry-picking",
    ],
  },
  {
    title: "Build Master Inventory Sheet",
    owner: "Nikita",
    details: [
      "Product | Serial | SKU | Regular Price | Discount % | Discounted Price | Condition",
      "Add Dealer dropdown",
      "Add Status: Available / Pending / Claimed",
    ],
  },
  {
    title: "Create Dealer Summary Sheet",
    owner: "Nikita",
    details: [
      "Group products by quantity",
      "Show prices and discounts clearly",
      "Make it easy for dealer to decide",
    ],
  },
  {
    title: "Define Logistics & Terms",
    owner: "Nikita",
    details: [
      "Freight responsibility",
      "Ship-from location and contact",
      "Pickup/shipping timeline",
      "Payment terms",
    ],
  },
  {
    title: "Draft Dealer Email",
    owner: "Nikita",
    details: [
      "Attach summary sheet",
      "Include available units, pricing, deadline, and response instructions",
      "Mention unclaimed inventory may go to auction",
      "CC Account Manager on all comms",
    ],
  },
  {
    title: "Internal Review",
    owner: "Nikita / Account Manager",
    details: [
      "Check pricing accuracy",
      "Confirm clarity and completeness",
      "Make sure it is easy to understand quickly",
    ],
  },
  {
    title: "Send to Dealers",
    owner: "Nikita",
    details: ["Send to A dealers first", "Expand to B dealers if needed"],
  },
  {
    title: "Call Dealers Same Day",
    owner: "Account Manager",
    details: [
      "Walk through opportunity",
      "Highlight margin and urgency",
      "Answer questions",
    ],
  },
  {
    title: "Track Responses Live",
    owner: "Nikita",
    details: [
      "Update inventory sheet",
      "Available / Pending / Claimed",
      "Assign units as dealers commit",
    ],
  },
  {
    title: "48-Hour Follow-Up",
    owner: "Dane",
    details: [
      "Call and text dealers",
      "Push for decisions",
      "Address questions or concerns",
    ],
  },
  {
    title: "Final Reminder",
    owner: "Nikita",
    details: [
      "Send last-call email 24 hours before deadline",
      "Reinforce auction consequence",
    ],
  },
  {
    title: "Confirm Commitments",
    owner: "Nikita",
    details: [
      "Get written confirmation",
      "Confirm units, pricing, freight, and payment terms",
    ],
  },
  {
    title: "Email Dealer Once They Commit",
    owner: "Nikita",
    details: ["Confirm commitment and next steps in writing"],
  },
  {
    title: "Create Orders / Quotes",
    owner: "Inside Sales",
    details: ["Enter into system", "Assign to dealers"],
  },
  {
    title: "Coordinate Fulfillment",
    owner: "Inside Sales",
    details: [
      "Schedule shipping/pickup with Michelle",
      "Confirm timing with dealer",
      "Get pictures of full truckloads leaving dealership yard once loaded",
    ],
  },
  {
    title: "Confirm Payment",
    owner: "Inside Sales / Daniel",
    details: ["Confirm cash terms or Huntington/DLL payment path"],
  },
  {
    title: "Remove Access",
    owner: "Inside Sales",
    details: [
      "Remove from dealer map internally and on website",
      "Remove portal access",
      "Shut down Huntington/DLL account",
      "Change Salesforce status to closed dealership",
    ],
  },
  {
    title: "Finalize Remaining Inventory",
    owner: "Nikita / Finance",
    details: [
      "Reconcile sold vs remaining inventory",
      "Send leftovers to auction or secondary dealers",
    ],
  },
  {
    title: "Send Final Email Overview",
    owner: "Nikita",
    details: [
      "Send full summary once equipment is delivered",
      "Include product transfers",
      "Confirm account/system updates",
      "Send to Michelle, CFO, Daniel, Account Manager",
    ],
  },
];

const blankCase = () => ({
  id: Date.now(),
  dealerName: "",
  accountManager: "",
  status: "New",
  priority: "Normal",
  deadline: "",
  auctionDate: "",
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: SOP_STEPS.map((step, index) => ({
    id: index + 1,
    ...step,
    checked: false,
    notes: "",
    dueDate: "",
  })),
});

export default function DealerOffboardingPage() {
  const [cases, setCases] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("dealerOffboardingCases");

    if (saved) {
      const parsed = JSON.parse(saved);
      setCases(parsed);
      if (parsed.length) setActiveId(parsed[0].id);
    } else {
      const first = blankCase();
      setCases([first]);
      setActiveId(first.id);
    }
  }, []);

  useEffect(() => {
    if (cases.length) {
      localStorage.setItem("dealerOffboardingCases", JSON.stringify(cases));
    }
  }, [cases]);

  const activeCase = useMemo(
    () => cases.find((item) => item.id === activeId),
    [cases, activeId]
  );

  const updateCase = (updates) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === activeId
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const updateStep = (stepId, updates) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === activeId
          ? {
              ...item,
              updatedAt: new Date().toISOString(),
              steps: item.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
            }
          : item
      )
    );
  };

  const createNewCase = () => {
    const next = blankCase();
    setCases((prev) => [next, ...prev]);
    setActiveId(next.id);
    setChecklistOpen(true);
  };

  const deleteCase = () => {
    if (!activeCase) return;

    const confirmed = confirm(
      `Delete ${activeCase.dealerName || "this offboarding"}?`
    );

    if (!confirmed) return;

    const remaining = cases.filter((item) => item.id !== activeId);

    if (remaining.length) {
      setCases(remaining);
      setActiveId(remaining[0].id);
    } else {
      const fresh = blankCase();
      setCases([fresh]);
      setActiveId(fresh.id);
    }
  };

  const completedCount = activeCase?.steps.filter((s) => s.checked).length || 0;
  const totalCount = activeCase?.steps.length || 0;
  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const visibleSteps =
    activeCase?.steps.filter((step) => showCompleted || !step.checked) || [];

  return (
    <div className="page">
      <div className="shell">
        <aside className="sidebar">
          <div className="sidebarTop">
            <div>
              <p className="eyebrow">Dealer Process</p>
              <h1>Offboarding</h1>
            </div>

            <button className="newBtn" onClick={createNewCase}>
              + New Situation
            </button>
          </div>

          <div className="caseList">
            {cases.map((item) => {
              const done = item.steps?.filter((s) => s.checked).length || 0;
              const total = item.steps?.length || SOP_STEPS.length;
              const percent = Math.round((done / total) * 100);

              return (
                <button
                  key={item.id}
                  className={`caseCard ${item.id === activeId ? "active" : ""}`}
                  onClick={() => setActiveId(item.id)}
                >
                  <div className="caseTitle">
                    {item.dealerName || "Untitled Offboarding"}
                  </div>
                  <div className="caseMeta">
                    {item.status} · {percent}% complete
                  </div>
                  <div className="miniBar">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="main">
          {activeCase && (
            <>
              <section className="hero">
                <div>
                  <p className="eyebrow">Active Situation</p>
                  <h2>{activeCase.dealerName || "New Dealer Offboarding"}</h2>
                  <p className="sub">
                    Track the full offboarding process, commitments, inventory
                    movement, access removal, and final closeout.
                  </p>
                </div>

                <div className="progressBox">
                  <div className="progressNumber">{progress}%</div>
                  <div className="progressLabel">
                    {completedCount} of {totalCount} complete
                  </div>
                  <div className="progressBar">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="grid">
                  <label>
                    Dealer Name
                    <input
                      value={activeCase.dealerName}
                      onChange={(e) =>
                        updateCase({ dealerName: e.target.value })
                      }
                      placeholder="Example: Huntington Dealer"
                    />
                  </label>

                  <label>
                    Account Manager
                    <input
                      value={activeCase.accountManager}
                      onChange={(e) =>
                        updateCase({ accountManager: e.target.value })
                      }
                      placeholder="Example: Dane"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={activeCase.status}
                      onChange={(e) => updateCase({ status: e.target.value })}
                    >
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Inventory Being Transferred</option>
                      <option>Final Review</option>
                      <option>Closed Case</option>
                    </select>
                  </label>

                  <label>
                    Priority
                    <select
                      value={activeCase.priority}
                      onChange={(e) => updateCase({ priority: e.target.value })}
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </label>

                  <label>
                    Dealer Deadline
                    <input
                      type="date"
                      value={activeCase.deadline}
                      onChange={(e) =>
                        updateCase({ deadline: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Auction Date
                    <input
                      type="date"
                      value={activeCase.auctionDate}
                      onChange={(e) =>
                        updateCase({ auctionDate: e.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="full">
                  Situation Notes
                  <textarea
                    value={activeCase.notes}
                    onChange={(e) => updateCase({ notes: e.target.value })}
                    placeholder="Add overview, risks, dealer details, inventory notes, or internal reminders..."
                  />
                </label>
              </section>

              <section className="toolbar">
                <div>
                  <h3>Offboarding Checklist</h3>
                  <p>
                    {checklistOpen
                      ? `${visibleSteps.length} steps showing`
                      : `${completedCount} of ${totalCount} complete`}
                  </p>
                </div>

                <div className="toolbarActions">
                  <button
                    className="ghost"
                    onClick={() => setChecklistOpen((prev) => !prev)}
                  >
                    {checklistOpen ? "Minimize" : "Open Checklist"}
                  </button>

                  <button
                    className="ghost"
                    onClick={() => setShowCompleted((prev) => !prev)}
                  >
                    {showCompleted ? "Hide Completed" : "Show Completed"}
                  </button>

                  <button className="danger" onClick={deleteCase}>
                    Delete Situation
                  </button>
                </div>
              </section>

              {checklistOpen && (
                <section className="steps">
                  {visibleSteps.map((step) => {
                    const expanded = expandedSteps[step.id];

                    return (
                      <div
                        key={step.id}
                        className={`stepCard ${step.checked ? "checked" : ""}`}
                      >
                        <div className="stepHeader">
                          <button
                            className={`check ${step.checked ? "on" : ""}`}
                            onClick={() =>
                              updateStep(step.id, { checked: !step.checked })
                            }
                            aria-label="Check off step"
                          >
                            ✓
                          </button>

                          <div className="stepMain">
                            <div className="stepTitleRow">
                              <h4>
                                {step.id}. {step.title}
                              </h4>
                              <span>{step.owner}</span>
                            </div>

                            <div className="stepDetailPreview">
                              {step.details.join(" · ")}
                            </div>
                          </div>

                          <button
                            className="expand"
                            onClick={() =>
                              setExpandedSteps((prev) => ({
                                ...prev,
                                [step.id]: !prev[step.id],
                              }))
                            }
                          >
                            {expanded ? "Close" : "Details"}
                          </button>
                        </div>

                        {expanded && (
                          <div className="stepBody">
                            <ul>
                              {step.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                              ))}
                            </ul>

                            <div className="stepInputs">
                              <label>
                                Due Date
                                <input
                                  type="date"
                                  value={step.dueDate}
                                  onChange={(e) =>
                                    updateStep(step.id, {
                                      dueDate: e.target.value,
                                    })
                                  }
                                />
                              </label>

                              <label>
                                Notes / Details
                                <textarea
                                  value={step.notes}
                                  onChange={(e) =>
                                    updateStep(step.id, {
                                      notes: e.target.value,
                                    })
                                  }
                                  placeholder="Add notes, links, contacts, confirmation details, or follow-up reminders..."
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .shell {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 22px;
          padding: 26px;
        }

        .sidebar,
        .panel,
        .hero,
        .toolbar,
        .stepCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
        }

        .sidebar {
          padding: 18px;
          height: calc(100vh - 52px);
          position: sticky;
          top: 26px;
          overflow: auto;
        }

        .sidebarTop {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 18px;
        }

        .eyebrow {
          margin: 0 0 4px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 700;
        }

        h1,
        h2,
        h3,
        h4 {
          margin: 0;
          letter-spacing: -0.03em;
        }

        h1 {
          font-size: 26px;
        }

        h2 {
          font-size: 30px;
        }

        h3 {
          font-size: 18px;
        }

        h4 {
          font-size: 15px;
          font-weight: 650;
        }

        .newBtn,
        .ghost,
        .danger,
        .expand {
          border: 1px solid #d1d5db;
          border-radius: 999px;
          background: #ffffff;
          color: #111827;
          padding: 9px 14px;
          font-size: 13px;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .newBtn {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .newBtn:hover,
        .ghost:hover,
        .expand:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .newBtn:hover {
          background: #1f2937;
          color: white;
        }

        .danger {
          color: #991b1b;
          border-color: #fecaca;
        }

        .danger:hover {
          background: #fff1f2;
        }

        .caseList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .caseCard {
          text-align: left;
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 16px;
          padding: 13px;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .caseCard:hover,
        .caseCard.active {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .caseTitle {
          font-size: 14px;
          font-weight: 650;
          color: #111827;
        }

        .caseMeta {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .miniBar,
        .progressBar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 99px;
          overflow: hidden;
          margin-top: 10px;
        }

        .miniBar span,
        .progressBar span {
          display: block;
          height: 100%;
          background: #111827;
          border-radius: 99px;
        }

        .main {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .hero {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .sub {
          margin: 8px 0 0;
          color: #6b7280;
          max-width: 720px;
          font-size: 14px;
          line-height: 1.5;
        }

        .progressBox {
          min-width: 190px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 16px;
          background: #fafafa;
        }

        .progressNumber {
          font-size: 30px;
          font-weight: 750;
          letter-spacing: -0.04em;
        }

        .progressLabel {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .panel {
          padding: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 12px;
          color: #374151;
          font-weight: 600;
        }

        input,
        select,
        textarea {
          border: 1px solid #d1d5db;
          border-radius: 13px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          background: #fff;
          color: #111827;
          font-family: inherit;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #111827;
        }

        textarea {
          min-height: 88px;
          resize: vertical;
        }

        .full {
          margin-top: 14px;
        }

        .toolbar {
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .toolbar p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .toolbarActions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stepCard {
          padding: 14px;
          transition: 0.18s ease;
        }

        .stepCard.checked {
          background: #fbfbfb;
        }

        .stepHeader {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .check {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 7px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: transparent;
          cursor: pointer;
          font-size: 13px;
          line-height: 1;
        }

        .check.on {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .stepMain {
          flex: 1;
          min-width: 0;
        }

        .stepTitleRow {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .stepTitleRow span {
          font-size: 11px;
          color: #374151;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .stepDetailPreview {
          margin-top: 5px;
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stepBody {
          margin: 14px 0 0 36px;
          border-top: 1px solid #eef0f3;
          padding-top: 14px;
        }

        ul {
          margin: 0 0 14px;
          padding-left: 18px;
          color: #4b5563;
          font-size: 13px;
          line-height: 1.6;
        }

        .stepInputs {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 14px;
        }

        @media (max-width: 980px) {
          .shell {
            grid-template-columns: 1fr;
          }

          .sidebar {
            height: auto;
            position: relative;
            top: auto;
          }

          .hero,
          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .stepInputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
