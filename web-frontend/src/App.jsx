import React from 'react';
// Import Dashboard. Đảm bảo file Dashboard.jsx nằm đúng thư mục pages
import Dashboard from './pages/Dashboard';

function App() {
  return (
    // Height 100vh để full màn hình
    <div style={{ width: '100%', height: '100vh' }}>
      <Dashboard />
    </div>
  );
}

export default App;