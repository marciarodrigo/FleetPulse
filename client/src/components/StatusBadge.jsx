import React from "react";

const StatusBadge = ({ status, type = "vehicle" }) => {
  if (!status) return <span className="status-badge badge-neutral">—</span>;

  let colorClass = "badge-neutral";

  const s = status.toLowerCase();

  if (s === "active" || s === "completed" || s === "in stock") {
    colorClass = "badge-green";
  } else if (s === "in service" || s === "in progress" || s === "low stock") {
    colorClass = "badge-orange";
  } else if (s === "maintenance" || s === "overdue" || s === "out of stock") {
    colorClass = "badge-red";
  } else if (s === "scheduled" || s === "pending") {
    colorClass = "badge-blue";
  } else if (s === "inactive") {
    colorClass = "badge-gray";
  }

  return <span className={`status-badge ${colorClass}`}>{status}</span>;
};

export default StatusBadge;

