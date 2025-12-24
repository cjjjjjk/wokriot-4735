import React from 'react';
import '../pages/Dashboard.css';

export default function StressTray({ visible, running, rate, generated, onToggle, onReset, onHide }) {
  if (!visible) return null;

  return (
    <div className="stress-overlay" role="dialog" aria-label="Stress Test Controls">
      <button className={`stress-control ${running ? 'running' : ''}`} onClick={onToggle}>
        {running ? 'Stop' : 'Start'}
      </button>
      <button className="stress-reset" onClick={onReset}>Reset</button>
      <div className="stress-metrics">Rate: <strong>{rate}</strong>/s &nbsp;•&nbsp; Generated: <strong>{generated}</strong></div>
      <button className="stress-hide" onClick={onHide}>Hide</button>
    </div>
  );
}
