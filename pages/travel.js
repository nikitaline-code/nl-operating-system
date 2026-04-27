const downloadExcelCSV = () => {
  const rows = [];

  rows.push(["Trip Plan"]);
  rows.push(["Trip Name", selectedTrip?.name || ""]);
  rows.push(["Trip Dates", selectedTrip?.date || ""]);
  rows.push([]);

  rows.push(["Time", "Title", "Type", "Notes"]);

  itinerary.forEach((item) => {
    rows.push([item.time, item.title, item.type, item.notes]);
  });

  const csv = rows.map((row) => row.map(csvSafe).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const fileName = `${selectedTrip?.name || "trip-plan"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}-trip-plan.csv`;
  link.click();

  URL.revokeObjectURL(url);
};
