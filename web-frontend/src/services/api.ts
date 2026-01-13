import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// tạo axios instance với base config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// interceptor để thêm token vào mỗi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// interceptor để xử lý response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// === ATTENDANCE LOGS API ===

// lấy logs của user hiện tại
export const getMyAttendanceLogs = async (params?: {
    day?: string;
    month?: string;
    page?: number;
    per_page?: number;
}) => {
    const response = await api.get('/attendance-logs/me', { params });
    return response.data;
};

// lấy logs của tất cả users (admin only)
export const getAllAttendanceLogs = async (params?: {
    page?: number;
    per_page?: number;
    rfid_uid?: string;
}) => {
    const response = await api.get('/attendance-logs', { params });
    return response.data;
};

// filter logs (admin only)
export const filterAttendanceLogs = async (params?: {
    day?: string;
    month?: string;
    rfid_uid?: string;
    device_id?: string;
    page?: number;
    per_page?: number;
}) => {
    const response = await api.get('/attendance-logs/filter', { params });
    return response.data;
};

// === WORKED DAY API ===

// lấy thông tin làm việc theo ngày
export const getWorkedDay = async (date?: string) => {
    const response = await api.get('/worked-day/day', {
        params: date ? { date } : {}
    });
    // API trả về { data: {...}, is_success, message }
    return response.data.data || response.data;
};

// lấy thông tin làm việc theo tháng
export const getWorkedMonth = async (month?: string) => {
    const response = await api.get('/worked-day/month', {
        params: month ? { month } : {}
    });
    // API trả về { data: { month, worked_days }, is_success, message }
    return response.data.data || response.data;
};

// === USER MANAGEMENT API ===

// lấy danh sách users (admin only)
export const getUsers = async (params?: {
    page?: number;
    per_page?: number;
}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

// lấy user theo id (admin only)
export const getUserById = async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

// tạo user mới (admin only)
export const createUser = async (userData: {
    rfid_uid: string;
    email: string;
    full_name: string;
    is_admin?: boolean;
    is_active?: boolean;
}) => {
    const response = await api.post('/users', userData);
    return response.data;
};

// cập nhật user (admin only)
export const updateUser = async (id: number, userData: {
    full_name?: string;
    email?: string;
    rfid_uid?: string;
    is_active?: boolean;
    is_admin?: boolean;
}) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

// xóa user (admin only)
export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

// cập nhật thông tin user hiện tại
export const updateMe = async (userData: {
    full_name?: string;
    rfid_uid?: string;
}) => {
    const response = await api.put('/users/me', userData);
    return response.data;
};

// === DEVICE MANAGEMENT API (admin only) ===

// interface cho device
export interface Device {
    id: number;
    device_id: string;
    name: string;
    is_active: boolean;
    door_state: 'OPEN' | 'CLOSED';
    rfid_enabled: boolean;
    last_seen: string | null;
    created_at: string;
}

// lấy danh sách devices (admin only)
export const getDevices = async (): Promise<{ data: Device[]; is_success: boolean; message: string }> => {
    const response = await api.get('/devices');
    return response.data;
};

// lấy thông tin một device (admin only)
export const getDeviceById = async (deviceId: string) => {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data;
};

// điều khiển cửa (mở/đóng) - admin only
export const controlDoor = async (deviceId: string, action: 'OPEN' | 'CLOSE') => {
    const response = await api.post(`/devices/${deviceId}/door`, { action });
    return response.data;
};

// bật/tắt chức năng quẹt thẻ RFID - admin only
export const controlRfid = async (deviceId: string, enabled: boolean) => {
    const response = await api.post(`/devices/${deviceId}/rfid`, { enabled });
    return response.data;
};

// kích hoạt/vô hiệu hoá thiết bị - admin only
export const controlDeviceActivation = async (deviceId: string, active: boolean) => {
    const response = await api.post(`/devices/${deviceId}/activate`, { active });
    return response.data;
};

// cập nhật thông tin device - admin only
export const updateDevice = async (deviceId: string, data: { name?: string }) => {
    const response = await api.put(`/devices/${deviceId}`, data);
    return response.data;
};

// xoá device - admin only
export const deleteDevice = async (deviceId: string) => {
    const response = await api.delete(`/devices/${deviceId}`);
    return response.data;
};

export default api;
