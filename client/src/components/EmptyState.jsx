import React from "react";
import { Inbox, Plus } from "lucide-react";

const EmptyState = ({
  icon: Icon = Inbox,
  title = "No records found",
  description = "Get started by adding your first record.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon-wrapper">
        <Icon size={40} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className="primary-button" onClick={onAction}>
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

