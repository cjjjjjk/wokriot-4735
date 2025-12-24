import React, { useEffect, useState } from 'react';
import { initAttendanceSocket, subscribe } from '../state/attendanceSocket.js';
import './Dashboard.css';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    initAttendanceSocket('http://localhost:3000');
    const unsubscribe = subscribe(({ logs, totalCount }) => {
      setLogs(logs);
      setTotalCount(totalCount);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="cards">
        <div className="card">
          <div className="card-title">Total Logs</div>
          <div className="card-value">{totalCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Showing</div>
          <div className="card-value">{logs.length}</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="log-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Employee</th>
              <th>Action</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.employeeName}</td>
                <td>{log.action}</td>
                <td className={`status ${log.status.toLowerCase()}`}>{log.status}</td>
                <td>{log.message}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">No logs yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
