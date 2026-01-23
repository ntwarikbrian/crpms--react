import React, { useState } from 'react';

export default function AlertBox({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const alertClass = {
    success: 'alert alert-success',
    error: 'alert alert-error',
    warning: 'alert alert-warning',
    info: 'alert alert-info',
  }[type];

  return (
    <div className={`${alertClass} animate-slideDown flex justify-between items-start`}>
      <p className="font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="text-xl font-bold opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
