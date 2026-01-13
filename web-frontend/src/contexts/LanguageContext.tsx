import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// translations
const translations: Record<Language, Record<string, string>> = {
    en: {
        // login page
        'login.welcome': 'Welcome Back',
        'login.subtitle': 'Please enter your details to sign in.',
        'login.email': 'Email Address',
        'login.password': 'Password',
        'login.submit': 'Sign In',
        'login.success': 'Login successful!',
        'login.error': 'Login failed. Please check your credentials.',

        // header
        'header.hello': 'Hello',
        'header.profile': 'Profile',
        'header.logout': 'Logout',

        // tabs
        'tabs.general': 'General',
        'tabs.profile': 'Profile',
        'tabs.manager': 'Manager',
        'tabs.devices': 'Devices',

        // general tab
        'general.todayLog': 'Today\'s Attendance',
        'general.weekChart': 'Weekly Chart',
        'general.monthCalendar': 'Monthly Calendar',
        'general.detailLogs': 'Detailed Logs',
        'general.totalHours': 'Total Hours',
        'general.status': 'Status',
        'general.fullDay': 'Full Day',
        'general.halfDay': 'Half Day',
        'general.absent': 'Absent',
        'general.noData': 'No data available',
        'general.thisWeek': 'This Week',

        // logs
        'logs.timestamp': 'Timestamp',
        'logs.device': 'Device',
        'logs.code': 'Code',
        'logs.status': 'Status',

        // profile
        'profile.fullName': 'Full Name',
        'profile.email': 'Email',
        'profile.rfidUid': 'RFID UID',
        'profile.status': 'Status',
        'profile.role': 'Role',
        'profile.active': 'Active',
        'profile.inactive': 'Inactive',
        'profile.admin': 'Admin',
        'profile.user': 'User',
        'profile.emailHint': 'Email cannot be changed',
        'profile.updateSuccess': 'Profile updated successfully!',
        'profile.updateError': 'Failed to update profile',

        // manager
        'manager.title': 'User Management',
        'manager.createUser': 'Create User',
        'manager.editUser': 'Edit User',
        'manager.name': 'Name',
        'manager.email': 'Email',
        'manager.rfid': 'RFID UID',
        'manager.status': 'Status',
        'manager.role': 'Role',
        'manager.actions': 'Actions',
        'manager.passwordHint': 'Default password: 1',
        'manager.createSuccess': 'User created successfully!',
        'manager.createError': 'Failed to create user',
        'manager.updateSuccess': 'User updated successfully!',
        'manager.updateError': 'Failed to update user',
        'manager.deleteSuccess': 'User deleted successfully!',
        'manager.deleteError': 'Failed to delete user',
        'manager.confirmDelete': 'Are you sure you want to delete {name}?',
        'manager.fetchError': 'Failed to fetch users',
        'manager.copyRfid': 'Copy RFID',
        'manager.userLogs': 'Attendance Logs',
        'manager.records': 'records',

        // devices
        'devices.title': 'Device Management',
        'devices.deviceId': 'Device ID',
        'devices.name': 'Name',
        'devices.lastSeen': 'Last Seen',
        'devices.door': 'Door',
        'devices.rfid': 'RFID',
        'devices.active': 'Active',
        'devices.noDevices': 'No devices found',
        'devices.never': 'Never',
        'devices.doorOpen': 'Door is open',
        'devices.doorClosed': 'Door is closed',
        'devices.rfidOn': 'RFID scanning enabled',
        'devices.rfidOff': 'RFID scanning disabled',
        'devices.doorSuccess': 'Door control successful!',
        'devices.doorError': 'Failed to control door',
        'devices.rfidSuccess': 'RFID control successful!',
        'devices.rfidError': 'Failed to control RFID',
        'devices.activateSuccess': 'Device status updated!',
        'devices.activateError': 'Failed to update device status',
        'devices.deleteSuccess': 'Device deleted successfully!',
        'devices.deleteError': 'Failed to delete device',
        'devices.confirmDelete': 'Are you sure you want to delete {name}?',
        'devices.fetchError': 'Failed to fetch devices',
        'devices.logsTitle': 'Attendance Logs',
        'devices.viewLogs': 'View logs for this device',
        'devices.showAll': 'Show all logs',
        'devices.totalLogs': 'Total logs',
        'devices.noLogs': 'No logs found',
        'devices.logsError': 'Failed to fetch logs',

        // common
        'common.loading': 'Loading...',
        'common.submit': 'Submit',
        'common.close': 'Close',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.search': 'Search',
        'common.perPage': 'Per page',
        'common.refresh': 'Refresh',
    },
    vi: {
        // login page
        'login.welcome': 'Chào mừng trở lại',
        'login.subtitle': 'Vui lòng nhập thông tin để đăng nhập.',
        'login.email': 'Địa chỉ Email',
        'login.password': 'Mật khẩu',
        'login.submit': 'Đăng nhập',
        'login.success': 'Đăng nhập thành công!',
        'login.error': 'Đăng nhập thất bại. Vui lòng kiểm tra lại.',

        // header
        'header.hello': 'Xin chào',
        'header.profile': 'Hồ sơ',
        'header.logout': 'Đăng xuất',

        // tabs
        'tabs.general': 'Chung',
        'tabs.profile': 'Hồ sơ',
        'tabs.manager': 'Quản lý',
        'tabs.devices': 'Thiết bị',

        // general tab
        'general.todayLog': 'Chấm công hôm nay',
        'general.weekChart': 'Biểu đồ tuần',
        'general.monthCalendar': 'Lịch tháng',
        'general.detailLogs': 'Chi tiết nhật ký',
        'general.totalHours': 'Tổng giờ',
        'general.status': 'Trạng thái',
        'general.fullDay': 'Đủ ngày',
        'general.halfDay': 'Nửa ngày',
        'general.absent': 'Vắng',
        'general.noData': 'Không có dữ liệu',
        'general.thisWeek': 'Tuần hiện tại',

        // logs
        'logs.timestamp': 'Thời gian',
        'logs.device': 'Thiết bị',
        'logs.code': 'Mã',
        'logs.status': 'Trạng thái',

        // profile
        'profile.fullName': 'Họ và tên',
        'profile.email': 'Email',
        'profile.rfidUid': 'RFID UID',
        'profile.status': 'Trạng thái',
        'profile.role': 'Vai trò',
        'profile.active': 'Hoạt động',
        'profile.inactive': 'Ngừng hoạt động',
        'profile.admin': 'Quản trị viên',
        'profile.user': 'Người dùng',
        'profile.emailHint': 'Email không thể thay đổi',
        'profile.updateSuccess': 'Cập nhật hồ sơ thành công!',
        'profile.updateError': 'Không thể cập nhật hồ sơ',

        // manager
        'manager.title': 'Quản lý người dùng',
        'manager.createUser': 'Tạo người dùng',
        'manager.editUser': 'Sửa người dùng',
        'manager.name': 'Tên',
        'manager.email': 'Email',
        'manager.rfid': 'RFID UID',
        'manager.status': 'Trạng thái',
        'manager.role': 'Vai trò',
        'manager.actions': 'Thao tác',
        'manager.passwordHint': 'Mật khẩu mặc định: 1',
        'manager.createSuccess': 'Tạo người dùng thành công!',
        'manager.createError': 'Không thể tạo người dùng',
        'manager.updateSuccess': 'Cập nhật người dùng thành công!',
        'manager.updateError': 'Không thể cập nhật người dùng',
        'manager.deleteSuccess': 'Xóa người dùng thành công!',
        'manager.deleteError': 'Không thể xóa người dùng',
        'manager.confirmDelete': 'Bạn có chắc muốn xóa {name}?',
        'manager.fetchError': 'Không thể tải danh sách người dùng',
        'manager.copyRfid': 'Sao chép RFID',
        'manager.userLogs': 'Nhật ký chấm công',
        'manager.records': 'bản ghi',

        // devices
        'devices.title': 'Quản lý thiết bị',
        'devices.deviceId': 'Mã thiết bị',
        'devices.name': 'Tên',
        'devices.lastSeen': 'Lần cuối hoạt động',
        'devices.door': 'Cửa',
        'devices.rfid': 'RFID',
        'devices.active': 'Hoạt động',
        'devices.noDevices': 'Không có thiết bị nào',
        'devices.never': 'Chưa bao giờ',
        'devices.doorOpen': 'Cửa đang mở',
        'devices.doorClosed': 'Cửa đang đóng',
        'devices.rfidOn': 'Đang bật quẹt thẻ',
        'devices.rfidOff': 'Đã tắt quẹt thẻ',
        'devices.doorSuccess': 'Điều khiển cửa thành công!',
        'devices.doorError': 'Điều khiển cửa thất bại',
        'devices.rfidSuccess': 'Điều khiển RFID thành công!',
        'devices.rfidError': 'Điều khiển RFID thất bại',
        'devices.activateSuccess': 'Cập nhật trạng thái thiết bị thành công!',
        'devices.activateError': 'Cập nhật trạng thái thiết bị thất bại',
        'devices.deleteSuccess': 'Xoá thiết bị thành công!',
        'devices.deleteError': 'Xoá thiết bị thất bại',
        'devices.confirmDelete': 'Bạn có chắc muốn xoá {name}?',
        'devices.fetchError': 'Không thể tải danh sách thiết bị',
        'devices.logsTitle': 'Nhật ký quẹt thẻ',
        'devices.viewLogs': 'Xem nhật ký thiết bị này',
        'devices.showAll': 'Hiển thị tất cả',
        'devices.totalLogs': 'Tổng số bản ghi',
        'devices.noLogs': 'Không có nhật ký nào',
        'devices.logsError': 'Không thể tải nhật ký',

        // common
        'common.loading': 'Đang tải...',
        'common.submit': 'Xác nhận',
        'common.close': 'Đóng',
        'common.save': 'Lưu',
        'common.cancel': 'Hủy',
        'common.confirm': 'Xác nhận',
        'common.delete': 'Xóa',
        'common.edit': 'Sửa',
        'common.search': 'Tìm kiếm',
        'common.perPage': 'Mỗi trang',
        'common.refresh': 'Làm mới',
    }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // lấy ngôn ngữ từ localStorage hoặc mặc định là 'vi'
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'en' || saved === 'vi') ? saved : 'vi';
    });

    // hàm dịch text theo key
    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    // cập nhật ngôn ngữ và lưu vào localStorage
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
