import { useEffect, useState } from "react";

const starterDealers = [
  {
    id: 1,
    owner: "Mark",
    name: "Roblin Vet",
    location: "Virden, MB",
    contact: "",
    notes: "Exclusive / important partner.",
  },
];

const starterTrips = [
  {
    id: 1,
    owner: "Mark",
    name: "Dealer Visit - Manitoba",
    date: "May 14 - May 16",
    status: "Planning",
    dealerIds: [1],
  },
  {
    id: 2,
    owner: "Dane",
    name: "New Trip",
    date: "Add dates",
    status: "Planning",
    dealerIds: [],
  },
];

const starterItinerary = [
  {
    id: 1,
    date: "",
    activity: "Depart",
    departTime: "8:00 AM",
    arriveTime: "",
    location: "",
    reservation: "",
    type: "Travel",
    notes: "Leave for dealer visit",
    open: false,
  },
  {
    id: 2,
    date: "",
    activity: "Dealer Meeting",
    departTime: "11:00 AM",
    arriveTime: "",
    location: "",
    reservation: "",
    type: "Meeting",
    notes: "Review location, credit line, next steps",
    open: false,
  },
];

export default function TravelPage() {
  const [activePerson, setActivePerson] = useState("Mark");
  const [dealers, setDealers] = useState(starterDealers);
  const [trips, setTrips] = useState(starterTrips);
  const [selectedTrip, setSelectedTrip] = useState(starterTrips[0]);
  const [itinerary, setItinerary] = useState(starterItinerary);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [flights, setFlights] = useState([]);
  const [flightSearch, setFlightSearch] = useState({
    from: "YWG",
    to: "",
    depart: "",
    returnDate: "",
    passengers: "1",
  });
  const [tripTasks, setTripTasks] = useState([]);
  const [tripNotes, setTripNotes] = useState("");
  const [newTripTask, setNewTripTask] = useState("");
  const [taskAssignedFrom, setTaskAssignedFrom] = useState("Mark");
  const [taskUrgency, setTaskUrgency] = useState("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);

  const visibleTrips = trips.filter((trip) => trip.owner === activePerson);
  const visibleDealers = dealers.filter((dealer) => dealer.owner === activePerson);

  const selectedDealers = visibleDealers.filter((d) =>
    selectedTrip?.dealerIds?.includes(d.id)
  );

  useEffect(() => {
    const savedTravel = localStorage.getItem("travelPageData");

    if (savedTravel) {
      const parsed = JSON.parse(savedTravel);

      setDealers(
        parsed.dealers
          ? parsed.dealers.map((dealer) => ({
              ...dealer,
              owner: dealer.owner || "Mark",
            }))
          : starterDealers
      );

      setTrips(
        parsed.trips
          ? parsed.trips.map((trip) => ({
              ...trip,
              owner: trip.owner || "Mark",
              dealerIds: trip.dealerIds || [],
            }))
          : starterTrips
      );

      setItinerary(
        parsed.itinerary
          ? parsed.itinerary.map((item) => ({
              id: item.id,
              date: item.date || "",
              activity: item.activity || item.title || "New Item",
              departTime: item.departTime || item.time || "",
              arriveTime: item.arriveTime || "",
              location: item.location || "",
              reservation: item.reservation || "",
              type: item.type || "Travel",
              notes: item.notes || "",
              open: item.open || false,
            }))
          : starterItinerary
      );

      if (parsed.activePerson) setActivePerson(parsed.activePerson);

      if (parsed.selectedTrip) {
        setSelectedTrip({
          ...parsed.selectedTrip,
          owner: parsed.selectedTrip.owner || "Mark",
          dealerIds: parsed.selectedTrip.dealerIds || [],
        });
      }

      if (parsed.hotels) setHotels(parsed.hotels);
      if (parsed.cars) setCars(parsed.cars);
      if (parsed.flights) setFlights(parsed.flights);
      if (parsed.flightSearch) setFlightSearch(parsed.flightSearch);
      if (parsed.tripTasks) setTripTasks(parsed.tripTasks);
      if (parsed.tripNotes) setTripNotes(parsed.tripNotes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "travelPageData",
      JSON.stringify({
        activePerson,
        dealers,
        trips,
        selectedTrip,
        itinerary,
        hotels,
        cars,
        flights,
        flightSearch,
        tripTasks,
        tripNotes,
      })
    );
  }, [
    activePerson,
    dealers,
    trips,
    selectedTrip,
    itinerary,
    hotels,
    cars,
    flights,
    flightSearch,
    tripTasks,
    tripNotes,
  ]);

  const switchPerson = (person) => {
    setActivePerson(person);
    const firstTripForPerson = trips.find((trip) => trip.owner === person);

    if (firstTripForPerson) {
      setSelectedTrip(firstTripForPerson);
    } else {
      const newTrip = {
        id: Date.now(),
        owner: person,
        name: "New Trip",
        date: "Add dates",
        status: "Planning",
        dealerIds: [],
      };

      setTrips([...trips, newTrip]);
      setSelectedTrip(newTrip);
    }
  };

  const updateTrip = (field, value) => {
    const updatedTrip = { ...selectedTrip, [field]: value };
    setSelectedTrip(updatedTrip);
    setTrips(trips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
  };

  const toggleDealerForTrip = (dealerId) => {
    const current = selectedTrip?.dealerIds || [];
    const updatedDealerIds = current.includes(dealerId)
      ? current.filter((id) => id !== dealerId)
      : [...current, dealerId];

    updateTrip("dealerIds", updatedDealerIds);
  };

  const addTrip = () => {
    const newTrip = {
      id: Date.now(),
      owner: activePerson,
      name: "New Trip",
      date: "Add dates",
      status: "Planning",
      dealerIds: [],
    };

    setTrips([...trips, newTrip]);
    setSelectedTrip(newTrip);
  };

  const addDealer = () => {
    setDealers([
      ...dealers,
      {
        id: Date.now(),
        owner: activePerson,
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
        date: "",
        activity: "New Item",
        departTime: "",
        arriveTime: "",
        location: "",
        reservation: "",
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

  const updateFlightSearch = (field, value) => {
    setFlightSearch({
      ...flightSearch,
      [field]: value,
    });
  };

  const searchGoogleFlights = () => {
    const query = `Flights from ${flightSearch.from} to ${flightSearch.to} departing ${flightSearch.depart}${
      flightSearch.returnDate ? ` returning ${flightSearch.returnDate}` : ""
    } for ${flightSearch.passengers} passenger`;

    const url = `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  };

  const addFlight = () => {
    setFlights([
      ...flights,
      {
        id: Date.now(),
        airline: "",
        flightNumber: "",
        from: flightSearch.from || "",
        to: flightSearch.to || "",
        departDate: flightSearch.depart || "",
        departTime: "",
        arriveTime: "",
        confirmation: "",
        notes: "",
      },
    ]);
  };

  const updateFlight = (id, field, value) => {
    setFlights(
      flights.map((flight) =>
        flight.id === id ? { ...flight, [field]: value } : flight
      )
    );
  };

  const deleteFlight = (id) => {
    setFlights(flights.filter((flight) => flight.id !== id));
  };

  const addFlightToTripPlan = (flight) => {
    const flightItem = {
      id: Date.now(),
      date: flight.departDate || "",
      activity: `${flight.airline || "Flight"} ${flight.flightNumber || ""}`.trim(),
      departTime: flight.departTime || "",
      arriveTime: flight.arriveTime || "",
      location: `${flight.from || ""} → ${flight.to || ""}`,
      reservation: flight.confirmation || "",
      type: "Flight",
      notes: flight.notes || "",
      open: false,
    };

    setItinerary([...itinerary, flightItem]);
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

  const csvSafe = (value) => {
    const text = String(value || "").replace(/"/g, '""');
    return `"${text}"`;
  };

  const downloadExcelCSV = () => {
    const rows = [];

    rows.push(["Trip Plan"]);
    rows.push(["Owner", selectedTrip?.owner || activePerson]);
    rows.push(["Trip Name", selectedTrip?.name || ""]);
    rows.push(["Trip Dates", selectedTrip?.date || ""]);
    rows.push([]);
    rows.push([
      "Date",
      "Activity",
      "Departure Time",
      "Arrival Time",
      "Location",
      "Reservation #",
      "Type",
      "Notes",
    ]);

    itinerary.forEach((item) => {
      rows.push([
        item.date || "",
        item.activity || "",
        item.departTime || "",
        item.arriveTime || "",
        item.location || "",
        item.reservation || "",
        item.type || "",
        item.notes || "",
      ]);
    });

    const csv = rows.map((row) => row.map(csvSafe).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const fileName = `${selectedTrip?.owner || activePerson}-${selectedTrip?.name || "trip-plan"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}-trip-plan.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    const timelineRows = itinerary
      .map(
        (item) => `
          <div class="timelineItem">
            <div class="timeBlock">
              <div class="date">${item.date || ""}</div>
              <div class="time">${item.departTime || ""}</div>
              ${item.arriveTime ? `<div class="arrive">Arrive: ${item.arriveTime}</div>` : ""}
            </div>
            <div class="dot"></div>
            <div class="details">
              <div class="type">${item.type || "Trip Item"}</div>
              <h3>${item.activity || ""}</h3>
              ${item.location ? `<p><strong>Location:</strong> ${item.location}</p>` : ""}
              ${item.reservation ? `<p><strong>Reservation:</strong> ${item.reservation}</p>` : ""}
              ${item.notes ? `<p>${item.notes}</p>` : ""}
            </div>
          </div>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedTrip?.name || "Trip Plan"}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              color: #111;
              padding: 40px;
              background: #fff;
            }
            .header {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .eyebrow {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.14em;
              color: #777;
              margin-bottom: 8px;
            }
            h1 {
              margin: 0;
              font-size: 30px;
              letter-spacing: -0.04em;
            }
            .date {
              font-size: 12px;
              color: #666;
              font-weight: 700;
            }
            .owner {
              margin-top: 8px;
              display: inline-block;
              font-size: 11px;
              font-weight: 700;
              padding: 5px 9px;
              border-radius: 999px;
              background: #111;
              color: #fff;
            }
            .timelineItem {
              display: grid;
              grid-template-columns: 120px 24px 1fr;
              gap: 14px;
              margin-bottom: 22px;
              page-break-inside: avoid;
            }
            .timeBlock {
              text-align: right;
              padding-top: 4px;
            }
            .time {
              font-size: 13px;
              font-weight: 700;
              margin-top: 4px;
            }
            .arrive {
              font-size: 11px;
              color: #777;
              margin-top: 3px;
            }
            .dot {
              width: 12px;
              height: 12px;
              background: #111;
              border-radius: 999px;
              margin-top: 8px;
              position: relative;
            }
            .dot:after {
              content: "";
              position: absolute;
              top: 14px;
              left: 5px;
              width: 1px;
              height: 54px;
              background: #ddd;
            }
            .timelineItem:last-child .dot:after {
              display: none;
            }
            .details {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 14px 16px;
              background: #fafafa;
            }
            .type {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #555;
              background: #f1f1f1;
              padding: 4px 8px;
              border-radius: 999px;
              margin-bottom: 8px;
            }
            h3 {
              margin: 0;
              font-size: 16px;
            }
            p {
              margin: 8px 0 0;
              font-size: 13px;
              line-height: 1.45;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="eyebrow">Travel Itinerary</div>
            <h1>${selectedTrip?.name || "Trip Plan"}</h1>
            <div class="date">${selectedTrip?.date || ""}</div>
            <div class="owner">${selectedTrip?.owner || activePerson}</div>
          </div>
          <div>${timelineRows}</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="page">
      <div className="shell">
        <header className="topHeader noPrint">
          <div>
            <p className="eyebrow">Travel Planning</p>
            <h1>Trips</h1>
            <p className="subtext">
              Plan dealer visits, hotels, flights, rental cars, tasks, notes, and itineraries.
            </p>
          </div>

          <div className="headerActions">
            <button className="secondaryBtn" onClick={downloadExcelCSV}>
              Download Excel
            </button>

            <button className="secondaryBtn" onClick={printPDF}>
              Timeline PDF
            </button>

            <button className="primaryBtn" onClick={addTrip}>
              + New Trip
            </button>
          </div>
        </header>

        <div className="layout">
          <aside className="sidebarCard noPrint">
            <div className="personToggle">
              <button
                className={activePerson === "Mark" ? "activePerson" : ""}
                onClick={() => switchPerson("Mark")}
              >
                Mark
              </button>

              <button
                className={activePerson === "Dane" ? "activePerson" : ""}
                onClick={() => switchPerson("Dane")}
              >
                Dane
              </button>
            </div>

            <h2>{activePerson}'s Trips</h2>

            {visibleTrips.map((trip) => (
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
                  <p>This trip is assigned to {selectedTrip?.owner || activePerson}.</p>
                </div>

                <span className="ownerBadge">{selectedTrip?.owner || activePerson}</span>
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
                  value={selectedTrip?.status || "Planning"}
                  onChange={(e) => updateTrip("status", e.target.value)}
                >
                  <option>Planning</option>
                  <option>Booked</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="selectedDealersPrint">
                <h3>Dealers Included</h3>

                {selectedDealers.length === 0 && (
                  <p className="emptySmall">No dealers selected.</p>
                )}

                {selectedDealers.map((dealer) => (
                  <div className="summaryLine" key={dealer.id}>
                    <strong>{dealer.name}</strong>
                    <span>{dealer.location}</span>
                    <span>{dealer.contact}</span>
                  </div>
                ))}
              </div>

              <div className="dealerSelectGrid">
                {visibleDealers.map((dealer) => (
                  <label className="dealerSelect" key={dealer.id}>
                    <input
                      type="checkbox"
                      checked={selectedTrip?.dealerIds?.includes(dealer.id) || false}
                      onChange={() => toggleDealerForTrip(dealer.id)}
                    />

                    <span>
                      <strong>{dealer.name}</strong>
                      <small>{dealer.location || "No location added"}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Trip Plan</h2>
                  <p>Use this like an itinerary: date, activity, depart/arrival times, location, and reservation.</p>
                </div>

                <button className="smallBtn" onClick={addItineraryItem}>
                  + Add Item
                </button>
              </div>

              <div className="itineraryHeader">
                <span></span>
                <span>Date</span>
                <span>Activity</span>
                <span>Depart Time</span>
                <span>Arrival Time</span>
                <span>Location</span>
                <span>Reservation #</span>
                <span>Type</span>
                <span>Notes</span>
                <span></span>
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
                      type="date"
                      value={item.date || ""}
                      onChange={(e) => updateItinerary(item.id, "date", e.target.value)}
                    />

                    <input
                      value={item.activity || ""}
                      onChange={(e) => updateItinerary(item.id, "activity", e.target.value)}
                      placeholder="Activity"
                    />

                    <input
                      value={item.departTime || ""}
                      onChange={(e) =>
                        updateItinerary(item.id, "departTime", e.target.value)
                      }
                      placeholder="Depart"
                    />

                    <input
                      value={item.arriveTime || ""}
                      onChange={(e) =>
                        updateItinerary(item.id, "arriveTime", e.target.value)
                      }
                      placeholder="Arrive"
                    />

                    <input
                      value={item.location || ""}
                      onChange={(e) => updateItinerary(item.id, "location", e.target.value)}
                      placeholder="Location / link"
                    />

                    <input
                      value={item.reservation || ""}
                      onChange={(e) =>
                        updateItinerary(item.id, "reservation", e.target.value)
                      }
                      placeholder="Reservation #"
                    />

                    <select
                      value={item.type || "Travel"}
                      onChange={(e) => updateItinerary(item.id, "type", e.target.value)}
                    >
                      <option>Travel</option>
                      <option>Flight</option>
                      <option>Hotel</option>
                      <option>Rental Car</option>
                      <option>Meeting</option>
                      <option>Dealer Visit</option>
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
                      onChange={(e) => updateHotel(hotel.id, "location", e.target.value)}
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
                      onChange={(e) => updateCar(car.id, "confirmation", e.target.value)}
                      placeholder="Confirmation / notes"
                    />

                    <button className="deleteBtn" onClick={() => deleteCar(car.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>Flights</h2>
                  <p>Search Google Flights, then save booked flight details here.</p>
                </div>

                <button className="smallBtn" onClick={addFlight}>
                  + Add Flight
                </button>
              </div>

              <div className="flightSearchGrid">
                <input
                  value={flightSearch.from}
                  onChange={(e) => updateFlightSearch("from", e.target.value)}
                  placeholder="From e.g. YWG"
                />

                <input
                  value={flightSearch.to}
                  onChange={(e) => updateFlightSearch("to", e.target.value)}
                  placeholder="To e.g. YYC"
                />

                <input
                  type="date"
                  value={flightSearch.depart}
                  onChange={(e) => updateFlightSearch("depart", e.target.value)}
                />

                <input
                  type="date"
                  value={flightSearch.returnDate}
                  onChange={(e) => updateFlightSearch("returnDate", e.target.value)}
                />

                <input
                  value={flightSearch.passengers}
                  onChange={(e) => updateFlightSearch("passengers", e.target.value)}
                  placeholder="Passengers"
                />

                <button className="secondaryBtn" onClick={searchGoogleFlights}>
                  Search Flights
                </button>
              </div>

              <div className="lineList">
                {flights.map((flight) => (
                  <div className="flightLine" key={flight.id}>
                    <input
                      value={flight.airline}
                      onChange={(e) => updateFlight(flight.id, "airline", e.target.value)}
                      placeholder="Airline"
                    />

                    <input
                      value={flight.flightNumber}
                      onChange={(e) =>
                        updateFlight(flight.id, "flightNumber", e.target.value)
                      }
                      placeholder="Flight #"
                    />

                    <input
                      value={flight.from}
                      onChange={(e) => updateFlight(flight.id, "from", e.target.value)}
                      placeholder="From"
                    />

                    <input
                      value={flight.to}
                      onChange={(e) => updateFlight(flight.id, "to", e.target.value)}
                      placeholder="To"
                    />

                    <input
                      type="date"
                      value={flight.departDate || ""}
                      onChange={(e) =>
                        updateFlight(flight.id, "departDate", e.target.value)
                      }
                    />

                    <input
                      value={flight.departTime}
                      onChange={(e) =>
                        updateFlight(flight.id, "departTime", e.target.value)
                      }
                      placeholder="Depart"
                    />

                    <input
                      value={flight.arriveTime}
                      onChange={(e) =>
                        updateFlight(flight.id, "arriveTime", e.target.value)
                      }
                      placeholder="Arrive"
                    />

                    <input
                      value={flight.confirmation}
                      onChange={(e) =>
                        updateFlight(flight.id, "confirmation", e.target.value)
                      }
                      placeholder="Confirm #"
                    />

                    <button className="tinyBtn" onClick={() => addFlightToTripPlan(flight)}>
                      + Plan
                    </button>

                    <button className="deleteBtn" onClick={() => deleteFlight(flight.id)}>
                      ×
                    </button>
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
                placeholder="Add trip notes, dealer follow-ups, reminders, hotel notes, visit details..."
              />
            </section>

            <section className="card wide">
              <div className="sectionHeader">
                <div>
                  <h2>{activePerson}'s Dealer Directory</h2>
                  <p>Add dealer locations once, then pull them into any {activePerson} trip.</p>
                </div>

                <button className="smallBtn" onClick={addDealer}>
                  + Add Dealer
                </button>
              </div>

              <div className="dealerGrid">
                {visibleDealers.map((dealer) => (
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

        .headerActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
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

        h3 {
          margin: 0 0 8px;
          font-size: 12px;
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

        .personToggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: #f3f4f6;
          padding: 5px;
          border-radius: 999px;
          margin-bottom: 14px;
        }

        .personToggle button {
          border: none;
          background: transparent;
          color: #555;
          border-radius: 999px;
          height: 28px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .personToggle button.activePerson {
          background: #111;
          color: #fff;
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

        .ownerBadge {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 999px;
          background: #111;
          color: #fff;
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
        .smallBtn,
        .secondaryBtn {
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 700;
        }

        .primaryBtn {
          background: #111;
          color: #fff;
          padding: 9px 14px;
          font-size: 12px;
        }

        .secondaryBtn {
          background: #fff;
          color: #111;
          border: 1px solid #e5e7eb;
          padding: 9px 14px;
          font-size: 12px;
        }

        .smallBtn {
          background: #111;
          color: #fff;
          padding: 8px 11px;
          font-size: 11px;
          white-space: nowrap;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 140px;
          gap: 10px;
        }

        .dealerSelectGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .dealerSelect {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 14px;
          padding: 10px;
          cursor: pointer;
        }

        .dealerSelect input[type="checkbox"] {
          width: 13px;
          height: 13px;
          min-width: 13px;
          margin-top: 1px;
          padding: 0;
          accent-color: #111;
        }

        .dealerSelect strong,
        .dealerSelect small {
          display: block;
        }

        .dealerSelect strong {
          font-size: 12px;
        }

        .dealerSelect small {
          font-size: 11px;
          color: #6b7280;
          margin-top: 3px;
        }

        .selectedDealersPrint {
          margin-top: 12px;
        }

        .summaryLine {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 12px;
        }

        .emptySmall {
          font-size: 12px;
          color: #777;
        }

        .taskAddGrid {
          display: grid;
          grid-template-columns: 1fr 120px 120px 140px 70px;
          gap: 10px;
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
          gap: 7px;
        }

        .itineraryHeader,
        .itineraryItem {
          display: grid;
          grid-template-columns: 22px 112px 1.2fr 92px 92px 1.3fr 118px 115px 70px 28px;
          gap: 6px;
          align-items: center;
        }

        .itineraryHeader {
          padding: 0 9px 6px;
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
        }

        .itineraryItem {
          padding: 7px 9px;
          border: 1px solid #eceef2;
          border-radius: 12px;
          background: #fafafa;
        }

        .itineraryItem input,
        .itineraryItem select {
          height: 28px;
          font-size: 11px;
          border-radius: 9px;
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

        .flightSearchGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 140px 140px 110px 130px;
          gap: 8px;
          margin-bottom: 12px;
          padding: 10px;
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 14px;
        }

        .flightLine {
          display: grid;
          grid-template-columns: 1fr 90px 70px 70px 118px 95px 95px 120px 68px 28px;
          gap: 8px;
          align-items: center;
          padding: 8px;
          background: #fafafa;
          border: 1px solid #eceef2;
          border-radius: 14px;
        }

        .tinyBtn {
          height: 28px;
          border: none;
          background: #111;
          color: #fff;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          padding: 0 8px;
          white-space: nowrap;
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

        .notesBtn {
          height: 28px;
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
        .notesBtn:hover,
        .tinyBtn:hover {
          background: #111;
          color: #fff;
          opacity: 0.9;
        }

        .notesBox {
          grid-column: 3 / 11;
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
          .taskAddGrid,
          .dealerSelectGrid,
          .flightSearchGrid,
          .flightLine {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: span 1;
          }

          .itineraryHeader {
            display: none;
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
