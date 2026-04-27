import { useState } from "react";

const starterDealers = [
  {
    id: 1,
    name: "Roblin Vet",
    location: "Virden, MB",
    contact: "",
    notes: "Exclusive / important partner. Add address, phone, and visit notes here.",
  },
  {
    id: 2,
    name: "Dealer Name",
    location: "City, Province",
    contact: "",
    notes: "",
  },
];

const starterTrips = [
  {
    id: 1,
    name: "Dealer Visit - Manitoba",
    date: "May 14 - May 16",
    status: "Planning",
    dealerId: 1,
    location: "Virden, MB",
  },
];

const starterItinerary = [
  {
    id: 1,
    time: "8:00 AM",
    title: "Depart",
    type: "Travel",
    notes: "Leave for dealer visit",
  },
  {
    id: 2,
    time: "11:00 AM",
    title: "Dealer Meeting",
    type: "Meeting",
    notes: "Review location, credit line, next steps",
  },
  {
    id: 3,
    time: "2:00 PM",
    title: "Site Visit",
    type: "Dealer Location",
    notes: "Walk through setup and requirements",
  },
];

export default function TravelPage() {
  const [dealers, setDealers] = useState(starterDealers);
  const [trips, setTrips] = useState(starterTrips);
  const [selectedTrip, setSelectedTrip] = useState(starterTrips[0]);
  const [itinerary, setItinerary] = useState(starterItinerary);
  const [draggedItem, setDraggedItem] = useState(null);

  const selectedDealer = dealers.find((d) => d.id === selectedTrip?.dealerId);

  const updateTrip = (field, value) => {
    const updatedTrip = { ...selectedTrip, [field]: value };
    setSelectedTrip(updatedTrip);
    setTrips(trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
  };

  const addDealer = () => {
    setDealers([
      ...dealers,
      {
        id: Date.now(),
        name: "New Dealer",
        location: "",
        contact: "",
        notes: "",
      },
    ]);
  };

  const updateDealer = (id, field, value) => {
    setDealers(
      dealers.map((dealer) =>
        dealer.id === id ? { ...dealer, [field]: value } : dealer
      )
    );
  };

  const addTrip = () => {
    const newTrip = {
      id: Date.now(),
      name: "New Trip",
      date: "Add dates",
      status: "Planning",
      dealerId: dealers[0]?.id || null,
      location: "",
    };

    setTrips([...trips, newTrip]);
    setSelectedTrip(newTrip);
  };

  const addItineraryItem = () => {
    setItinerary([
      ...itinerary,
      {
        id: Date.now(),
        time: "",
        title: "New Item",
        type: "Travel",
        notes: "",
      },
    ]);
  };

  const updateItinerary = (id, field, value) => {
    setItinerary(
      itinerary.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const deleteItinerary = (id) => {
    setItinerary(itinerary.filter((item) => item.id !== id));
  };

  const handleDrop = (targetItem) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const draggedIndex = itinerary.findIndex((i) => i.id === draggedItem.id);
    const targetIndex = itinerary.findIndex((i) => i.id === targetItem.id);

    const updated = [...itinerary];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, removed);

    setItinerary(updated);
    setDraggedItem(null);
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="topHeader">
          <div>
            <p className="eyebrow">Travel Planning</p>
            <h1>Trips</h1>
            <p className="subtext">
              Plan dealer visits, hotels, rental cars, locations, and daily travel details.
            </p>
          </div>

          <button className="primaryBtn" onClick={addTrip}>
            + New Trip
          </button>
        </header>

        <div className="layout">
          <aside className="sidebarCard">
            <h2>Upcoming Trips</h2>

            {trips.map((trip) => (
              <button
                key={trip.id}
                className={`tripCard ${selectedTrip?.id === trip.id ? "active" : ""}`}
                onClick={() => setSelectedTrip(trip)}
              >
                <span className="tripTitle">{trip.name}</span>
                <span className="tripMeta">{trip.date}</span>
                <span className="badge">{trip.status}</span>
              </button>
            ))}
          </aside>

          <main className="mainGrid">
            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Trip Overview</h2>
                  <p>Choose the dealer from your directory, then plan the visit.</p>
                </div>
              </div>

              <div className="formGrid">
                <input
                  value={selectedTrip?.name || ""}
                  onChange={(e) => updateTrip("name", e.target.value)}
                  placeholder="Trip name"
                />

                <input
                  value={selectedTrip?.date || ""}
                  onChange={(e) => updateTrip("date", e.target.value)}
                  placeholder="Trip dates"
                />

                <select
                  value={selectedTrip?.dealerId || ""}
                  onChange={(e) => updateTrip("dealerId", Number(e.target.value))}
                >
                  {dealers.map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </option>
                  ))}
                </select>

                <input
                  value={selectedDealer?.location || ""}
                  readOnly
                  placeholder="Dealer location"
                />
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Trip Plan</h2>
                  <p>Drag items to reorder. Keep each item compact and easy to scan.</p>
                </div>

                <button className="smallBtn" onClick={addItineraryItem}>
                  + Add Item
                </button>
              </div>

              <div className="itineraryList">
                {itinerary.map((item) => (
                  <div
                    key={item.id}
                    className="itineraryItem"
                    draggable
                    onDragStart={() => setDraggedItem(item)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(item)}
                  >
                    <div className="dragHandle">⋮⋮</div>

                    <input
                      className="timeInput"
                      value={item.time}
                      onChange={(e) => updateItinerary(item.id, "time", e.target.value)}
                      placeholder="Time"
                    />

                    <div className="itemMain">
                      <div className="itemTop">
                        <input
                          className="itemTitle"
                          value={item.title}
                          onChange={(e) =>
                            updateItinerary(item.id, "title", e.target.value)
                          }
                          placeholder="Item title"
                        />

                        <select
                          className="typeSelect"
                          value={item.type}
                          onChange={(e) =>
                            updateItinerary(item.id, "type", e.target.value)
                          }
                        >
                          <option>Travel</option>
                          <option>Meeting</option>
                          <option>Dealer Location</option>
                          <option>Hotel</option>
                          <option>Rental Car</option>
                          <option>Food / Break</option>
                        </select>

                        <button
                          className="deleteBtn"
                          onClick={() => deleteItinerary(item.id)}
                        >
                          ×
                        </button>
                      </div>

                      <textarea
                        value={item.notes}
                        onChange={(e) => updateItinerary(item.id, "notes", e.target.value)}
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Dealer Directory</h2>
                  <p>Add dealer locations once, then pull them into any trip.</p>
                </div>

                <button className="smallBtn" onClick={addDealer}>
                  + Add Dealer
                </button>
              </div>

              <div className="dealerGrid">
                {dealers.map((dealer) => (
                  <div className="dealerCard" key={dealer.id}>
                    <input
                      value={dealer.name}
                      onChange={(e) => updateDealer(dealer.id, "name", e.target.value)}
                      placeholder="Dealer name"
                    />

                    <input
                      value={dealer.location}
                      onChange={(e) =>
                        updateDealer(dealer.id, "location", e.target.value)
                      }
                      placeholder="City / Province"
                    />

                    <input
                      value={dealer.contact}
                      onChange={(e) =>
                        updateDealer(dealer.id, "contact", e.target.value)
                      }
                      placeholder="Contact / phone / email"
                    />

                    <textarea
                      value={dealer.notes}
                      onChange={(e) =>
                        updateDealer(dealer.id, "notes", e.target.value)
                      }
                      placeholder="Dealer notes, address, visit details..."
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Recommended Hotels</h2>
                  <p>Add hotel options, rates, links, and notes.</p>
                </div>
              </div>

              <textarea
                className="largeNotes"
                placeholder="Hotel name, rate, booking link, address, parking, notes..."
              />
            </section>

            <section className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Rental Car</h2>
                  <p>Keep rental details and confirmation info here.</p>
                </div>
              </div>

              <textarea
                className="largeNotes"
                placeholder="Company, pickup, drop-off, confirmation number, vehicle type..."
              />
            </section>
          </main>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f5f6f8;
          color: #111;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 28px;
        }

        .shell {
          max-width: 1380px;
          margin: 0 auto;
        }

        .topHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
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
          font-size: 32px;
          letter-spacing: -0.04em;
        }

        h2 {
          margin: 0;
          font-size: 14px;
          letter-spacing: -0.02em;
        }

        .subtext,
        .sectionHeader p {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.4;
        }

        .layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 18px;
        }

        .sidebarCard,
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
        }

        .sidebarCard {
          padding: 16px;
          height: fit-content;
        }

        .mainGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .wide {
          grid-column: span 2;
        }

        .card {
          padding: 18px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }

        .tripCard {
          width: 100%;
          text-align: left;
          display: block;
          padding: 13px;
          border: 1px solid #eceef2;
          border-radius: 14px;
          background: #f8f9fb;
          margin-top: 10px;
          cursor: pointer;
        }

        .tripCard.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .tripTitle,
        .tripMeta {
          display: block;
        }

        .tripTitle {
          font-size: 12px;
          font-weight: 750;
        }

        .tripMeta {
          font-size: 11px;
          color: #777;
          margin-top: 5px;
        }

        .tripCard.active .tripMeta {
          color: #d1d5db;
        }

        .badge {
          display: inline-flex;
          margin-top: 10px;
          font-size: 10px;
          padding: 4px 7px;
          border-radius: 999px;
          background: #eef0f3;
          color: #444;
        }

        .tripCard.active .badge {
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
        }

        .primaryBtn,
        .smallBtn {
          border: none;
          background: #111;
          color: #fff;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 700;
        }

        .primaryBtn {
          padding: 9px 14px;
          font-size: 12px;
        }

        .smallBtn {
          padding: 8px 11px;
          font-size: 11px;
          white-space: nowrap;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        input,
        textarea,
        select {
          width: 100%;
          max-width: 100%;
          border: 1px solid #e5e7eb;
          background: #f8f9fb;
          border-radius: 12px;
          padding: 9px 11px;
          font-size: 12px;
          color: #111;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
        }

        textarea {
          resize: vertical;
          min-height: 56px;
        }

        input:focus,
        textarea:focus,
        select:focus {
          background: #fff;
          border-color: #111;
        }

        .itineraryList {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .itineraryItem {
          display: grid;
          grid-template-columns: 24px 82px 1fr;
          gap: 9px;
          align-items: start;
          padding: 10px;
          border: 1px solid #eceef2;
          border-radius: 16px;
          background: #fafafa;
        }

        .dragHandle {
          cursor: grab;
          color: #aaa;
          font-size: 15px;
          padding-top: 9px;
          user-select: none;
        }

        .timeInput {
          font-weight: 750;
          text-align: center;
        }

        .itemMain {
          min-width: 0;
        }

        .itemTop {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 130px 30px;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
        }

        .itemTitle {
          font-weight: 700;
          background: #fff;
        }

        .typeSelect {
          height: 36px;
          font-size: 12px;
          background: #fff;
        }

        .deleteBtn {
          border: none;
          background: #f1f1f1;
          border-radius: 999px;
          height: 30px;
          width: 30px;
          cursor: pointer;
          font-size: 16px;
          color: #555;
        }

        .dealerGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .dealerCard {
          display: grid;
          gap: 8px;
          padding: 12px;
          border-radius: 16px;
          background: #fafafa;
          border: 1px solid #eceef2;
          min-width: 0;
        }

        .largeNotes {
          min-height: 140px;
        }

        @media (max-width: 1050px) {
          .layout,
          .mainGrid,
          .formGrid,
          .dealerGrid {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: span 1;
          }

          .itemTop {
            grid-template-columns: 1fr;
          }

          .topHeader {
            flex-direction: column;
            gap: 14px;
          }
        }
      `}</style>
    </div>
  );
}
