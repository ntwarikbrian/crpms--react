import React, { useState } from 'react';

export default function LoadingSpinner({ isLoading, message = 'Loading...' }) {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
