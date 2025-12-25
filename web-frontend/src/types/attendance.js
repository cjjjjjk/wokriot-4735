/**
 * @typedef {'CHECK_IN'|'CHECK_OUT'} AttendanceAction
 */

/**
 * @typedef {'NORMAL'|'LATE'|'ERROR'|'FORBIDDEN'} AttendanceStatus
 */

/**
 * @typedef {Object} AttendanceLog
 * @property {string} id - Unique identifier
 * @property {string} employeeName - Employee full name
 * @property {AttendanceAction} action - 'CHECK_IN' or 'CHECK_OUT'
 * @property {string} timestamp - Time in HH:mm:ss format
 * @property {AttendanceStatus} status - Attendance status
 * @property {string} message - Human-readable message (e.g., 'Check in successfully')
 */

/**
 * Runtime constants for actions.
 * Exported so they can be referenced at runtime from JS.
 */
export const AttendanceAction = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
};

/**
 * Runtime constants for statuses.
 */
export const AttendanceStatus = {
  NORMAL: 'NORMAL',
  LATE: 'LATE',
  ERROR: 'ERROR',
  FORBIDDEN: 'FORBIDDEN',
};

/**
 * Optional helper to create an `AttendanceLog` object.
 * @param {{id:string, employeeName:string, action:AttendanceAction, timestamp:string, status:AttendanceStatus, message:string}} props
 * @returns {AttendanceLog}
 */
export function createAttendanceLog(props) {
  return { ...props };
}

// Example usage (for editors that pick up JSDoc types):
// /** @type {AttendanceLog} */
// const example = createAttendanceLog({
//   id: 'abc123',
//   employeeName: 'Jane Doe',
//   action: AttendanceAction.CHECK_IN,
//   timestamp: '08:15:00',
//   status: AttendanceStatus.LATE,
//   message: 'Late 15 mins'
// });
