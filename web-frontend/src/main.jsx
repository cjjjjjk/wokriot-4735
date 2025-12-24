import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Tìm cái thẻ div id="root" bên trong index.html
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("LỖI: Không tìm thấy thẻ <div id='root'> trong index.html");
}