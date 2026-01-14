// user data structure
export interface User {
    id: number;
    full_name: string;
    email: string;
    rfid_uid: string;
    is_active: boolean;
    is_admin: boolean;
    created_at?: string;
}

// login request
export interface LoginRequest {
    email: string;
    password: string;
}

// login response data
export interface LoginResponseData {
    token: string;
    user: User;
}

// login response (wrapped)
export interface LoginResponse {
    is_success: boolean;
    message: string;
    error_code: string | null;
    data: LoginResponseData;
}

// api error response
export interface ApiError {
    error: string;
    message?: string;
}

// attendance log
export interface AttendanceLog {
    id: number;
    rfid_uid: string;
    timestamp: string;
    device_id: string;
    code: 'REALTIME' | 'OFFLINE_SYNC';
    error_code?: 'USER_NOT_FOUND' | 'USER_NOT_ACTIVE' | 'UNKNOWN_ERROR' | null;
    created_at: string;
}

// pagination response
export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}
