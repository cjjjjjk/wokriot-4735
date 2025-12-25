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
