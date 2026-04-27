import { useState } from "react";

const starterTrips = [
  {
    id: 1,
    name: "Dealer Visit - Manitoba",
    date: "May 14 - May 16",
    status: "Planning",
    dealer: "Roblin Vet / Virden Location",
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
  const [trips, setTrips] = useState(starterTrips);
  const [selectedTrip, setSelectedTrip] = useState(starterTrips[0]);
  const [itinerary, setItinerary] = useState(starterItinerary);

  const [hotels, setHotels] = useState([
    { id: 1, name: "Recommended Hotel", location: "Near dealer", notes: "Add rate / contact / booking link" },
  ]);

  const [rentalCars, setRentalCars] = useState([
    { id: 1, company: "Enterprise", pickup: "Winnipeg Airport", notes: "Add confirmation number" },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);

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

  const handleDragStart = (item) => {
    setDraggedItem(item);
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

  const addHotel = () => {
    setHotels([
      ...hotels,
      { id: Date.now(), name: "New Hotel", location: "", notes: "" },
    ]);
  };

  const updateHotel = (id, field, value) => {
    setHotels(
      hotels.map((hotel) =>
        hotel.id === id ? { ...hotel, [field]: value } : hotel
      )
    );
  };

  const addRentalCar = () => {
    setRentalCars([
      ...rentalCars,
      { id: Date.now(), company: "Rental Car", pickup: "", notes: "" },
    ]);
  };

  const updateRentalCar = (id, field, value) => {
    setRentalCars(
      rentalCars.map((car) =>
        car.id === id ? { ...car, [field]: value } : car
      )
    );
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

          <button
            className="primaryBtn"
            onClick={() => {
              const newTrip = {
                id: Date.now(),
                name: "New Trip",
                date: "Add dates",
                status: "Planning",
                dealer: "Dealer name",
                location: "Location",
              };
              setTrips([...trips, newTrip]);
              setSelectedTrip(newTrip);
            }}
          >
            + New Trip
          </button>
        </header>

        <div className="layout">
          <aside className="sidebarCard">
            <h2>Upcoming Trips</h2>

            {trips.map((trip) => (
              <div
                key={trip.id}
                className={`tripCard ${
                  selectedTrip?.id === trip.id ? "active" : ""
                }`}
                onClick={() => setSelectedTrip(trip)}
              >
                <div className="tripTitle">{trip.name}</div>
                <div className="tripMeta">{trip.date}</div>
                <div className="badge">{trip.status}</div>
              </div>
            ))}
          </aside>

          <main className="mainGrid">
            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Trip Overview</h2>
                  <p>Dealer, location, dates, and key trip details.</p>
                </div>
              </div>

              <div className="formGrid">
                <input
                  value={selectedTrip?.name || ""}
                  onChange={(e) =>
                    setSelectedTrip({ ...selectedTrip, name: e.target.value })
                  }
                  placeholder="Trip name"
                />
                <input
                  value={selectedTrip?.date || ""}
                  onChange={(e) =>
                    setSelectedTrip({ ...selectedTrip, date: e.target.value })
                  }
                  placeholder="Trip dates"
                />
                <input
                  value={selectedTrip?.dealer || ""}
                  onChange={(e) =>
                    setSelectedTrip({ ...selectedTrip, dealer: e.target.value })
                  }
                  placeholder="Dealer location / contact"
                />
                <input
                  value={selectedTrip?.location || ""}
                  onChange={(e) =>
                    setSelectedTrip({ ...selectedTrip, location: e.target.value })
                  }
                  placeholder="City / province"
                />
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Trip Plan</h2>
                  <p>Drag items to slide things around as plans change.</p>
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
                    onDragStart={() => handleDragStart(item)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(item)}
                  >
                    <div className="dragHandle">⋮⋮</div>

                    <input
                      className="timeInput"
                      value={item.time}
                      onChange={(e) =>
                        updateItinerary(item.id, "time", e.target.value)
                      }
                      placeholder="Time"
                    />

                    <div className="itemMain">
                      <input
                        className="itemTitle"
                        value={item.title}
                        onChange={(e) =>
                          updateItinerary(item.id, "title", e.target.value)
                        }
                        placeholder="Item title"
                      />

                      <textarea
                        value={item.notes}
                        onChange={(e) =>
                          updateItinerary(item.id, "notes", e.target.value)
                        }
                        placeholder="Add notes..."
                      />
                    </div>

                    <select
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
                ))}
              </div>
            </section>

            <section className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Dealer Locations</h2>
                  <p>Keep dealer addresses, contacts, and notes here.</p>
                </div>
              </div>

              <div className="infoBlock">
                <label>Dealer / Location</label>
                <input placeholder="Dealer name" defaultValue={selectedTrip?.dealer} />

                <label>Address</label>
                <input placeholder="Street address" />

                <label>Contact</label>
                <input placeholder="Name / phone / email" />

                <label>Notes</label>
                <textarea placeholder="Add details about the visit..." />
              </div>
            </section>

            <section className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Recommended Hotels</h2>
                  <p>Add options, rates, links, and booking notes.</p>
                </div>
                <button className="smallBtn" onClick={addHotel}>
                  + Add
                </button>
              </div>

              {hotels.map((hotel) => (
                <div className="miniCard" key={hotel.id}>
                  <input
                    value={hotel.name}
                    onChange={(e) =>
                      updateHotel(hotel.id, "name", e.target.value)
                    }
                    placeholder="Hotel name"
                  />
                  <input
                    value={hotel.location}
                    onChange={(e) =>
                      updateHotel(hotel.id, "location", e.target.value)
                    }
                    placeholder="Location"
                  />
                  <textarea
                    value={hotel.notes}
                    onChange={(e) =>
                      updateHotel(hotel.id, "notes", e.target.value)
                    }
                    placeholder="Rate, booking link, parking, notes..."
                  />
                </div>
              ))}
            </section>

            <section className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Rental Car</h2>
                  <p>Rental company, pickup, drop-off, and confirmations.</p>
                </div>
                <button className="smallBtn" onClick={addRentalCar}>
                  + Add
                </button>
              </div>

              {rentalCars.map((car) => (
                <div className="miniCard" key={car.id}>
                  <input
                    value={car.company}
                    onChange={(e) =>
                      updateRentalCar(car.id, "company", e.target.value)
                    }
                    placeholder="Rental company"
                  />
                  <input
                    value={car.pickup}
                    onChange={(e) =>
                      updateRentalCar(car.id, "pickup", e.target.value)
                    }
                    placeholder="Pickup / drop-off"
                  />
                  <textarea
                    value={car.notes}
                    onChange={(e) =>
                      updateRentalCar(car.id, "notes", e.target.value)
                    }
                    placeholder="Confirmation number, vehicle type, notes..."
                  />
                </div>
              ))}
            </section>

            <section className="card">
              <div className="sectionHeader">
                <div>
                  <h2>Quick Notes</h2>
                  <p>Anything important for the trip.</p>
                </div>
              </div>

              <textarea
                className="largeNotes"
                placeholder="Flight info, meal plans, dealer asks, exec preferences, prep notes..."
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
          margin-bottom: 24px;
        }

        .eyebrow {
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #777;
          margin: 0 0 6px;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.04em;
          font-weight: 750;
        }

        h2 {
          margin: 0;
          font-size: 15px;
          letter-spacing: -0.01em;
        }

        .subtext,
        .sectionHeader p {
          margin: 6px 0 0;
          color: #777;
          font-size: 13px;
          line-height: 1.4;
        }

        .layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 18px;
        }

        .sidebarCard,
        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
        }

        .sidebarCard {
          padding: 18px;
          height: fit-content;
        }

        .mainGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .wide {
          grid-column: span 2;
        }

        .card {
          padding: 20px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .tripCard {
          padding: 14px;
          border: 1px solid #eceef2;
          border-radius: 16px;
          background: #f8f9fb;
          margin-top: 12px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .tripCard:hover {
          transform: translateY(-1px);
          background: #f3f4f6;
        }

        .tripCard.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .tripTitle {
          font-size: 13px;
          font-weight: 700;
        }

        .tripMeta {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }

        .tripCard.active .tripMeta {
          color: #d1d5db;
        }

        .badge {
          display: inline-flex;
          margin-top: 10px;
          font-size: 10px;
          padding: 5px 8px;
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
          font-weight: 650;
          transition: 0.2s ease;
        }

        .primaryBtn {
          padding: 11px 16px;
          font-size: 13px;
        }

        .smallBtn {
          padding: 8px 12px;
          font-size: 12px;
        }

        .primaryBtn:hover,
        .smallBtn:hover {
          transform: translateY(-1px);
          opacity: 0.88;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #e5e7eb;
          background: #f8f9fb;
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 13px;
          color: #111;
          outline: none;
          font-family: inherit;
        }

        textarea {
          resize: vertical;
          min-height: 70px;
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
          gap: 10px;
        }

        .itineraryItem {
          display: grid;
          grid-template-columns: 28px 90px 1fr 145px 34px;
          gap: 10px;
          align-items: start;
          padding: 12px;
          border: 1px solid #eceef2;
          border-radius: 18px;
          background: #fafafa;
          transition: 0.2s ease;
        }

        .itineraryItem:hover {
          background: #f4f5f7;
          transform: translateY(-1px);
        }

        .dragHandle {
          cursor: grab;
          color: #aaa;
          font-size: 18px;
          padding-top: 8px;
          user-select: none;
        }

        .timeInput {
          font-weight: 650;
        }

        .itemTitle {
          font-weight: 700;
          margin-bottom: 8px;
          background: #fff;
        }

        .deleteBtn {
          border: none;
          background: #f1f1f1;
          border-radius: 999px;
          height: 32px;
          width: 32px;
          cursor: pointer;
          font-size: 18px;
          color: #555;
        }

        .deleteBtn:hover {
          background: #111;
          color: #fff;
        }

        .infoBlock {
          display: grid;
          gap: 10px;
        }

        label {
          font-size: 11px;
          color: #777;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }

        .miniCard {
          padding: 12px;
          border-radius: 18px;
          background: #fafafa;
          border: 1px solid #eceef2;
          display: grid;
          gap: 10px;
          margin-bottom: 10px;
        }

        .largeNotes {
          min-height: 180px;
        }

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .mainGrid {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: span 1;
          }

          .itineraryItem {
            grid-template-columns: 1fr;
          }

          .formGrid {
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
