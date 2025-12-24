/**
 * Attendance action types.
 */
export type AttendanceAction = 'CHECK_IN' | 'CHECK_OUT';

/**
 * Attendance status types.
 */
export type AttendanceStatus = 'NORMAL' | 'LATE' | 'ERROR' | 'FORBIDDEN';

/**
 * Attendance log record.
 */
export interface AttendanceLog {
  /** Unique identifier */
  id: string;
  /** Employee full name */
  employeeName: string;
  /** 'CHECK_IN' or 'CHECK_OUT' */
  action: AttendanceAction;
  /** Timestamp in HH:mm:ss format */
  timestamp: string;
  /** Attendance status */
  status: AttendanceStatus;
  /** Human-readable message (e.g., 'Check in successfully', 'Late 15 mins') */
  message: string;
}

/** Example
const example: AttendanceLog = {
  id: 'abc123',
  employeeName: 'Jane Doe',
  action: 'CHECK_IN',
  timestamp: '08:15:00',
  status: 'LATE',
  message: 'Late 15 mins'
};
*/