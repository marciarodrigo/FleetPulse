import React from "react";
import { AlertCircle } from "lucide-react";

const PriorityBadge = ({ priority }) => {
  if (!priority) return null;

  const p = priority.toLowerCase();
  let badgeClass = "priority-medium";

  if (p === "high") {
    badgeClass = "priority-high";
  } else if (p === "low") {
    badgeClass = "priority-low";
  }

  return (
    <span className={`priority-badge ${badgeClass}`}>
      {p === "high" && <AlertCircle size={14} className="priority-icon" />}
      {priority} Priority
    </span>
  );
};

export default PriorityBadge;

