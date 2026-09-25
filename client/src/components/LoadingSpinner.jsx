import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading data..." }) => {
  return (
    <div className="loading-state-container">
      <Loader2 size={36} className="spinner-icon" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;

