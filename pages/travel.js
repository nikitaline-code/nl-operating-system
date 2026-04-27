import { useEffect, useState } from "react";

const starterDealers = [
  {
    id: 1,
    name: "Roblin Vet",
    location: "Virden, MB",
    contact: "",
    notes: "Exclusive / important partner. Add address, phone, and visit notes here.",
  },
];

const starterTrips = [
  {
    id: 1,
    name: "Dealer Visit - Manitoba",
    date: "May 14 - May 16",
    status: "Planning",
    dealerId: 1,
  },
];

const starterItinerary = [
  {
    id: 1,
    time: "8:00 AM",
    title: "Depart",
    type: "Travel",
    notes: "Leave for dealer visit",
    open: false,
  },
  {
    id: 2,
    time: "11:00 AM",
    title: "Dealer Meeting",
    type: "Meeting",
    notes: "Review location, credit line, next steps",
    open: false,
  },
];

const starterHotels = [
  {
    id: 1,
    name: "",
    location: "",
    rate: "",
    notes: "",
  },
];

const starterCars = [
  {
    id: 1,
    company: "",
    pickup: "",
    dropoff: "",
    confirmation: "",
  },
];

export default function TravelPage() {
  const [dealers, setDealers] = useState(starterDealers);
  const [trips, setTrips] = useState(starterTrips);
  const [selectedTrip, setSelectedTrip] = useState(starterTrips[0]);
  const [itinerary, setItinerary] = useState(starterItinerary);
  const [hotels, setHotels] = useState(starterHotels);
  const [cars, setCars] = useState(starterCars);
  const [tripTasks, setTripTasks] = useState([]);
  const [tripNotes, setTripNotes] = useState("");
  const [newTripTask, setNewTripTask] = useState("");
  const [taskAssignedFrom, setTaskAssignedFrom] = useState("Mark");
  const [taskUrgency, setTaskUrgency] = useState("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);

  const selectedDealer = dealers.find((d) => d.id === selectedTrip?.dealerId);

  useEffect(() => {
    const savedTravel = localStorage.getItem("travelPageData");

    if (savedTravel) {
      const parsed = JSON.parse(savedTravel);

      if (parsed.dealers) setDealers(parsed.dealers);
      if (parsed.trips) setTrips(parsed.trips);
      if (parsed.selectedTrip) setSelectedTrip(parsed.selectedTrip);
      if (parsed.itinerary) setItinerary(parsed.itinerary);
      if (parsed.hotels) setHotels(parsed.hotels);
      if (parsed.cars) setCars(parsed.cars);
      if (parsed.tripTasks) setTripTasks(parsed.tripTasks);
      if (parsed.tripNotes) setTripNotes(parsed.tripNotes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "travelPageData",
      JSON.stringify({
        dealers,
        trips,
        selectedTrip,
        itinerary,
        hotels,
        cars,
        tripTasks,
        tripNotes,
      })
    );
  }, [dealers, trips, selectedTrip, itinerary, hotels, cars, tripTasks, tripNotes]);

  const updateTrip = (field, value) => {
    const updatedTrip = { ...selectedTrip, [field]: value };
    setSelectedTrip(updatedTrip);
    setTrips(trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
  };

  const addTrip = () => {
    const newTrip = {
      id: Date.now(),
      name: "New Trip",
      date: "Add dates",
      status: "Planning",
      dealerId: dealers[0]?.id || null,
    };

    setTrips([...trips, newTrip]);
    setSelectedTrip(newTrip);
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

  const addItineraryItem = () => {
    setItinerary([
      ...itinerary,
      {
        id: Date.now(),
        time: "",
        title: "New Item",
        type: "Travel",
        notes: "",
        open: false,
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

  const toggleNotes = (id) => {
    setItinerary(
      itinerary.map((item) =>
        item.id === id ? { ...item, open: !item.open } : item
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

  const addHotel = () => {
    setHotels([
      ...hotels,
      {
        id: Date.now(),
        name: "",
        location: "",
        rate: "",
        notes: "",
      },
    ]);
  };

  const updateHotel = (id, field, value) => {
    setHotels(
      hotels.map((hotel) =>
        hotel.id === id ? { ...hotel, [field]: value } : hotel
      )
    );
  };

  const deleteHotel = (id) => {
    setHotels(hotels.filter((hotel) => hotel.id !== id));
  };

  const addCar = () => {
    setCars([
      ...cars,
      {
        id: Date.now(),
        company: "",
        pickup: "",
        dropoff: "",
        confirmation: "",
      },
    ]);
  };

  const updateCar = (id, field, value) => {
    setCars(cars.map((car) => (car.id === id ? { ...car, [field]: value } : car)));
  };

  const deleteCar = (id) => {
    setCars(cars.filter((car) => car.id !== id));
  };

  const addTripTask = () => {
    if (!newTripTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTripTask,
      assignedFrom: taskAssignedFrom,
      urgency: taskUrgency,
      dueDate: taskDueDate,
      complete: false,
      source: "Travel",
      tripName: selectedTrip?.name || "",
    };

    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    localStorage.setItem("tasks", JSON.stringify([task, ...savedTasks]));

    setTripTasks([task, ...tripTasks]);
    setNewTripTask("");
    setTaskAssignedFrom("Mark");
    setTaskUrgency("Medium");
    setTaskDueDate("");
  };

  const deleteTripTask = (id) => {
    setTripTasks(tripTasks.filter((task) => task.id !== id));

    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    localStorage.setItem(
      "tasks",
      JSON.stringify(savedTasks.filter((task) => task.id !== id))
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
              Plan dealer visits, hotels, rental cars, tasks, notes, and daily travel details.
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
                  <p>Drag items to reorder. Click notes to expand details.</p>
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

                    <input
                      className="itemTitle"
                      value={item.title}
                      onChange={(e) => updateItinerary(item.id, "title", e.target.value)}
                      placeholder="Item title"
                    />

                    <select
                      className="typeSelect"
                      value={item.type}
                      onChange={(e) => updateItinerary(item.id, "type", e.target.value)}
                    >
                      <option>Travel</option>
                      <option>Meeting</option>
                      <option>Dealer Location</option>
                      <option>Hotel</option>
                      <option>Rental Car</option>
                      <option>Food / Break</option>
                    </select>

                    <button className="notesBtn" onClick={() => toggleNotes(item.id)}>
                      {item.open ? "Hide" : "Notes"}
                    </button>

                    <button className="deleteBtn" onClick={() => deleteItinerary(item.id)}>
                      ×
                    </button>

                    {item.open && (
                      <textarea
                        className="notesBox"
                        value={item.notes}
                        onChange={(e) =>
                          updateItinerary(item.id, "notes", e.target.value)
                        }
                        placeholder="Add notes..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Trip Tasks & Notes</h2>
                  <p>Tasks added here also show on your main Tasks page.</p>
                </div>
              </div>

              <div className="taskAddGrid">
                <input
                  value={newTripTask}
                  onChange={(e) => setNewTripTask(e.target.value)}
                  placeholder="Add a trip task..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTripTask();
                  }}
                />

                <select
                  value={taskAssignedFrom}
                  onChange={(e) => setTaskAssignedFrom(e.target.value)}
                >
                  <option>Mark</option>
                  <option>Dane</option>
                  <option>Nikita</option>
                </select>

                <select
                  value={taskUrgency}
                  onChange={(e) => setTaskUrgency(e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />

                <button className="smallBtn" onClick={addTripTask}>
                  Add
                </button>
              </div>

              <div className="tripTaskList">
                {tripTasks.map((task) => (
                  <div className="tripTaskItem" key={task.id}>
                    <div>
                      <div className="tripTaskTitle">{task.title}</div>
                      <div className="tripTaskMeta">
                        <span>From: {task.assignedFrom}</span>
                        <span>{task.urgency}</span>
                        {task.dueDate && <span>Due: {task.dueDate}</span>}
                      </div>
                    </div>

                    <button className="deleteBtn" onClick={() => deleteTripTask(task.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                className="tripNotesBox"
                value={tripNotes}
                onChange={(e) => setTripNotes(e.target.value)}
                placeholder="Add general trip notes, dealer follow-ups, reminders, hotel notes, visit details..."
              />
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

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Recommended Hotels</h2>
                  <p>Add each hotel as its own line.</p>
                </div>

                <button className="smallBtn" onClick={addHotel}>
                  + Add Hotel
                </button>
              </div>

              <div className="lineList">
                {hotels.map((hotel) => (
                  <div className="hotelLine" key={hotel.id}>
                    <input
                      value={hotel.name}
                      onChange={(e) => updateHotel(hotel.id, "name", e.target.value)}
                      placeholder="Hotel name"
                    />

                    <input
                      value={hotel.location}
                      onChange={(e) =>
                        updateHotel(hotel.id, "location", e.target.value)
                      }
                      placeholder="Location"
                    />

                    <input
                      value={hotel.rate}
                      onChange={(e) => updateHotel(hotel.id, "rate", e.target.value)}
                      placeholder="Rate / booking link"
                    />

                    <input
                      value={hotel.notes}
                      onChange={(e) => updateHotel(hotel.id, "notes", e.target.value)}
                      placeholder="Notes"
                    />

                    <button className="deleteBtn" onClick={() => deleteHotel(hotel.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Rental Cars</h2>
                  <p>Add each rental option as its own line.</p>
                </div>

                <button className="smallBtn" onClick={addCar}>
                  + Add Rental
                </button>
              </div>

              <div className="lineList">
                {cars.map((car) => (
                  <div className="carLine" key={car.id}>
                    <input
                      value={car.company}
                      onChange={(e) => updateCar(car.id, "company", e.target.value)}
                      placeholder="Company"
                    />

                    <input
                      value={car.pickup}
                      onChange={(e) => updateCar(car.id, "pickup", e.target.value)}
                      placeholder="Pickup"
                    />

                    <input
                      value={car.dropoff}
                      onChange={(e) => updateCar(car.id, "dropoff", e.target.value)}
                      placeholder="Drop-off"
                    />

                    <input
                      value={car.confirmation}
                      onChange={(e) =>
                        updateCar(car.id, "confirmation", e.target.value)
                      }
                      placeholder="Confirmation / notes"
                    />

                    <button className="deleteBtn" onClick={() => deleteCar(car.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
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

        .formGrid,
        .taskAddGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .taskAddGrid {
          grid-template-columns: 1fr 120px 120px 140px 70px;
          margin-bottom: 10px;
        }

        input,
        textarea,
        select {
          width: 100%;
          max-width: 100%;
          border: 1px solid #e5e7eb;
          background: #f8f9fb;
          border-radius: 12px;
          padding: 7px 10px;
          font-size: 12px;
          color: #111;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
        }

        input,
        select {
          height: 30px;
        }

        textarea {
          resize: vertical;
          min-height: 48px;
          line-height: 1.35;
        }

        input:focus,
        textarea:focus,
        select:focus {
          background: #fff;
          border-color: #111;
        }

        .itineraryList,
        .lineList,
        .tripTaskList {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .itineraryItem {
          display: grid;
          grid-template-columns: 20px 72px minmax(0, 1fr) 120px 78px 28px;
          gap: 7px;
          align-items: center;
          padding: 8px 9px;
          border: 1px solid #eceef2;
          border-radius: 14px;
          background: #fafafa;
        }

        .hotelLine,
        .carLine {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr 1.2fr 28px;
          gap: 8px;
          align-items: center;
          padding: 8px;
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 14px;
        }

        .tripTaskItem {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 14px;
        }

        .tripTaskTitle {
          font-size: 12px;
          font-weight: 700;
        }

        .tripTaskMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
          font-size: 11px;
          color: #6b7280;
        }

        .tripNotesBox {
          margin-top: 10px;
          min-height: 70px;
        }

        .dragHandle {
          cursor: grab;
          color: #aaa;
          font-size: 14px;
          user-select: none;
          text-align: center;
        }

        .timeInput {
          font-size: 11px;
          font-weight: 750;
          text-align: center;
          background: #fff;
        }

        .itemTitle {
          font-size: 12px;
          font-weight: 700;
          background: #fff;
        }

        .typeSelect {
          height: 30px;
          font-size: 11px;
          background: #fff;
        }

        .notesBtn {
          height: 30px;
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .deleteBtn {
          border: none;
          background: #f1f1f1;
          border-radius: 999px;
          height: 28px;
          width: 28px;
          cursor: pointer;
          font-size: 15px;
          color: #555;
          padding: 0;
        }

        .deleteBtn:hover,
        .notesBtn:hover {
          background: #111;
          color: #fff;
        }

        .notesBox {
          grid-column: 3 / 7;
          min-height: 42px;
          margin-top: 0;
          background: #fff;
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

        @media (max-width: 1050px) {
          .layout,
          .mainGrid,
          .formGrid,
          .dealerGrid,
          .taskAddGrid {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: span 1;
          }

          .itineraryItem,
          .hotelLine,
          .carLine {
            grid-template-columns: 1fr;
          }

          .notesBox {
            grid-column: auto;
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
