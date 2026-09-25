import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const Toast = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle size={20} className="toast-icon text-green-500" />,
    error: <AlertTriangle size={20} className="toast-icon text-red-500" />,
    info: <Info size={20} className="toast-icon text-blue-500" />
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      {icons[type] || icons.info}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

