import React, { useEffect, useState } from 'react';
import { 
  initAttendanceSocket, 
  subscribe, 
  startStressTest, 
  stopStressTest, 
  resetStressCounter 
} from '../state/attendanceSocket.js';
import './Dashboard.css';

export default function Dashboard() {
  // State lưu trữ dữ liệu từ socket
  const [data, setData] = useState({
    logs: [],
    totalCount: 0,
    stress: { running: false, rate: 0, generated: 0 }
  });

  useEffect(() => {
    // 1. Khởi tạo kết nối Socket
    initAttendanceSocket('http://localhost:3000');

    // 2. Đăng ký nhận dữ liệu (Subscribe)
    // Hàm này sẽ được gọi mỗi khi có Log mới hoặc thay đổi từ Stress Test
    const unsubscribe = subscribe((newData) => {
      setData(newData);
    });

    // 3. Hủy đăng ký khi tắt trang
    return () => {
      unsubscribe();
    };
  }, []);

  // Các hàm xử lý sự kiện
  const toggleStressTest = () => {
    if (data.stress.running) {
      stopStressTest();
    } else {
      startStressTest(50); // Chạy 50 logs/giây
    }
  };

  const handleResetCounter = () => {
    resetStressCounter();
  };

  return (
    <div className="dashboard">
      {/* --- Phần 1: Các thẻ số liệu (Widgets) --- */}
      <div className="cards">
        <div className="card">
          <div className="card-title">Total Check-ins</div>
          <div className="card-value">{data.totalCount}</div>
        </div>
        <div className="card">
          <div className="card-title">Live Logs</div>
          <div className="card-value">{data.logs.length}</div>
        </div>
        {/* Thẻ hiển thị trạng thái Test Tải */}
        <div className="card" style={{ borderColor: data.stress.running ? '#d97706' : 'transparent', borderWidth: data.stress.running ? '2px' : '0' }}>
          <div className="card-title">Stress Generated</div>
          <div className="card-value" style={{ color: data.stress.running ? '#d97706' : '#111827' }}>
            {data.stress.generated}
          </div>
        </div>
      </div>

      {/* --- Phần 2: Bảng Nhật ký (Table) --- */}
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
            {data.logs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.employeeName}</td>
                <td>
                  <span className={`badge ${log.action === 'CHECK_IN' ? 'in' : 'out'}`}>
                    {log.action}
                  </span>
                </td>
                <td className={`status ${log.status.toLowerCase()}`}>
                  {log.status}
                </td>
                <td>{log.message}</td>
              </tr>
            ))}
            {data.logs.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Phần 3: Thanh điều khiển nổi (Floating Tray) --- */}
      <div className="floating-tray">
        <div className="tray-info">
          <span className="tray-label">Stress Test:</span>
          <span className={`tray-status ${data.stress.running ? 'active' : ''}`}>
            {data.stress.running ? `RUNNING (${data.stress.rate}/s)` : 'STOPPED'}
          </span>
        </div>
        <div className="tray-actions">
          <button 
            className={`btn-stress ${data.stress.running ? 'stop' : 'start'}`} 
            onClick={toggleStressTest}
          >
            {data.stress.running ? 'STOP' : 'START 50/s'}
          </button>
          
          <button className="btn-reset" onClick={handleResetCounter}>
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}