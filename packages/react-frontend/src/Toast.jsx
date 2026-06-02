import React, { useEffect } from "react";

function Toast({ message, onDismiss, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const tone = /error|fail|invalid/i.test(message)
    ? "toast--error"
    : "toast--ok";

  return (
    <div className={`toast ${tone}`} role="status">
      <span>{message}</span>
      <button
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default Toast;
