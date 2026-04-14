const today = new Date();

const overdueTasks = tasks.filter(
  (t) =>
    t.due_date &&
    new Date(t.due_date) < today &&
    !t.is_complete
);

const highTasks = tasks.filter(
  (t) => t.urgency === "High" && !t.is_complete
);

const mediumTasks = tasks.filter(
  (t) => t.urgency === "Medium" && !t.is_complete
);

const lowTasks = tasks.filter(
  (t) => t.urgency === "Low" && !t.is_complete
);
