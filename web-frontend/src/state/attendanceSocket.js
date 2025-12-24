/**
 * Attendance socket state manager.
 * Connects to socket.io and keeps `logs` (latest 20) and `totalCount` in memory.
 */

import { io } from 'socket.io-client';
import { AttendanceAction, AttendanceStatus } from '../types/attendance.js';

/**
 * @typedef {Object} AttendanceLog
 * @property {string} id
 * @property {string} employeeName
 * @property {'CHECK_IN'|'CHECK_OUT'} action
 * @property {string} timestamp
 * @property {'NORMAL'|'LATE'|'ERROR'|'FORBIDDEN'} status
 * @property {string} message
 */

/** @type {AttendanceLog[]} */
let logs = [];

/** @type {number} */
let totalCount = 0;

let socket = null;
const subscribers = new Set();

/**
 * Initialize the socket connection (singleton).
 * @param {string} [url]
 * @returns {import('socket.io-client').Socket}
 */
export function initAttendanceSocket(url = 'http://localhost:3000') {
  if (socket) return socket;
  socket = io(url);

  socket.on('connect', () => {
    // connected
  });

  socket.on('new_log', (data) => {
    handleNewLog(data);
  });

  socket.on('disconnect', () => {
    // optional: handle disconnect
  });

  return socket;
}

/**
 * Handle incoming log: increment totalCount, add to top, keep latest 20.
 * @param {AttendanceLog} log
 */
function handleNewLog(log) {
  totalCount += 1;
  logs.unshift(log);
  if (logs.length > 20) logs.length = 20;
  notifySubscribers();
}

function notifySubscribers() {
  const snapshot = { logs: [...logs], totalCount, stress: { running: _stressTimer != null, rate: _stressRate, generated: _stressGenerated } };
  for (const cb of subscribers) {
    try { cb(snapshot); } catch (err) { console.error('subscriber error', err); }
  }
}

/**
 * Subscribe to state updates. Immediately invokes the callback with current state.
 * @param {(state: {logs: AttendanceLog[], totalCount: number}) => void} cb
 * @returns {() => void} unsubscribe function
 */
/**
 * Subscribe to state updates. Immediately invokes the callback with current state.
 * @param {(state: {logs: AttendanceLog[], totalCount: number, stress: object}) => void} cb
 * @returns {() => void} unsubscribe function
 */
export function subscribe(cb) {
  subscribers.add(cb);
  

  cb({ 
    logs: [...logs], 
    totalCount, 
    stress: { 
      running: _stressTimer != null, 
      rate: _stressRate, 
      generated: _stressGenerated 
    } 
  });
  
  return () => subscribers.delete(cb);
}

export function getLogs() { return [...logs]; }
export function getTotalCount() { return totalCount; }

/**
 * Disconnect and clear state.
 */
export function disconnect() {
  if (socket) {
    try { socket.disconnect(); } catch (e) { /* ignore */ }
    socket = null;
  }
  subscribers.clear();
  logs = [];
  totalCount = 0;
}

// ---- Stress test helpers (for local simulation) ----
let _stressTimer = null;
let _stressRate = 0;
let _stressGenerated = 0;

function generateFakeLog() {
  const names = ['Alice Johnson','Bob Smith','Carol Lee','David Kim','Eva Brown','Frank White','Grace Lin','Henry Yu'];
  const actions = ['CHECK_IN','CHECK_OUT'];
  const statuses = ['NORMAL','LATE','ERROR','FORBIDDEN'];

  const name = names[Math.floor(Math.random()*names.length)];
  const action = actions[Math.floor(Math.random()*actions.length)];

  // make NORMAL more likely
  const r = Math.random();
  let status;
  if (r < 0.75) status = 'NORMAL';
  else if (r < 0.9) status = 'LATE';
  else if (r < 0.98) status = 'ERROR';
  else status = 'FORBIDDEN';

  const now = new Date();
  const pad = (v) => String(v).padStart(2,'0');
  const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const message = status === 'NORMAL' ? (action === 'CHECK_IN' ? 'Check in successfully' : 'Check out successfully') :
    status === 'LATE' ? `Late ${Math.floor(Math.random()*30)+1} mins` :
    status === 'ERROR' ? 'Device error' : 'Forbidden location';

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    employeeName: name,
    action,
    timestamp,
    status,
    message,
  };
}

/**
 * Start a stress test that emits `rate` fake logs per second locally.
 * @param {number} rate - logs per second (default 50)
 */
export function startStressTest(rate = 50) {
  stopStressTest();
  _stressRate = rate;
  _stressGenerated = 0;
  const intervalMs = Math.max(1, Math.floor(1000 / rate));
  _stressTimer = setInterval(() => {
    const log = generateFakeLog();
    _stressGenerated += 1;
    handleNewLog(log);
    // notify subscribers so UI can update generated count/rate
    notifySubscribers();
  }, intervalMs);
  notifySubscribers();
}

export function stopStressTest() {
  if (_stressTimer) {
    clearInterval(_stressTimer);
    _stressTimer = null;
    _stressRate = 0;
    notifySubscribers();
  }
}

export function isStressTestRunning() {
  return _stressTimer != null;
}

/**
 * Return current stress test metrics.
 * @returns {{running:boolean, rate:number, generated:number}}
 */
export function getStressStatus() {
  return { running: _stressTimer != null, rate: _stressRate, generated: _stressGenerated };
}

/**
 * Reset the stress-generated counter to zero (keeps running state).
 */
export function resetStressCounter() {
  _stressGenerated = 0;
  notifySubscribers();
}
