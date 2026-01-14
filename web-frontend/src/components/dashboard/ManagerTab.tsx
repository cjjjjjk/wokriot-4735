import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, ChevronLeft, ChevronRight, X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { getUsers, createUser, updateUser, deleteUser, filterAttendanceLogs } from '../../services/api';

interface User {
    id: number;
    full_name: string;
    email: string;
    rfid_uid: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
}

interface AttendanceLog {
    id: number;
    rfid_uid: string;
    timestamp: string;
    device_id: string;
    code: string;
    error_code: string | null;
}

interface Pagination {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

const ManagerTab = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        rfid_uid: '',
        is_admin: false,
        is_active: true,
    });
    const [submitting, setSubmitting] = useState(false);

    // copy rfid state
    const [copiedRfid, setCopiedRfid] = useState<string | null>(null);

    // user logs for edit modal
    const [userLogs, setUserLogs] = useState<AttendanceLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPagination, setLogsPagination] = useState<Pagination>({
        page: 1,
        per_page: 5,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
    });

    // lấy danh sách users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({ page, per_page: perPage });
            setUsers(response.data?.users || []);
            setTotalPages(response.data?.pagination?.total_pages || 1);
        } catch (err) {
            showToast('error', t('manager.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    // lấy logs của user được chọn
    const fetchUserLogs = async (rfidUid: string, logsPage: number = 1) => {
        setLogsLoading(true);
        try {
            const response = await filterAttendanceLogs({
                rfid_uid: rfidUid,
                page: logsPage,
                per_page: logsPagination.per_page
            });
            setUserLogs(response.data?.attendance_logs || []);
            setLogsPagination(prev => ({
                ...prev,
                ...response.data?.pagination,
                page: logsPage
            }));
        } catch (err) {
            console.error('Failed to fetch user logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, perPage]);

    // copy rfid to clipboard
    const handleCopyRfid = async (rfid: string) => {
        try {
            await navigator.clipboard.writeText(rfid);
            setCopiedRfid(rfid);
            setTimeout(() => setCopiedRfid(null), 2000);
        } catch (err) {
            showToast('error', 'Failed to copy');
        }
    };

    // reset form
    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            rfid_uid: '',
            is_admin: false,
            is_active: true,
        });
        setUserLogs([]);
        setLogsPagination({
            page: 1,
            per_page: 5,
            total_items: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false
        });
    };

    // mở modal tạo user
    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    // mở modal edit user
    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            rfid_uid: user.rfid_uid,
            is_admin: user.is_admin,
            is_active: user.is_active,
        });
        setShowEditModal(true);
        // fetch logs for this user
        fetchUserLogs(user.rfid_uid, 1);
    };

    // đóng modals
    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
    };

    // xử lý form change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // tạo user mới
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createUser(formData);
            showToast('success', t('manager.createSuccess'));
            closeModals();
            fetchUsers();
        } catch (err: any) {
            const msg = err.response?.data?.error || t('manager.createError');
            showToast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    // cập nhật user
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setSubmitting(true);
        try {
            await updateUser(selectedUser.id, formData);
            showToast('success', t('manager.updateSuccess'));
            closeModals();
            fetchUsers();
        } catch (err: any) {
            const msg = err.response?.data?.error || t('manager.updateError');
            showToast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    // xóa user
    const handleDelete = async (user: User) => {
        if (!confirm(t('manager.confirmDelete').replace('{name}', user.full_name))) return;

        try {
            await deleteUser(user.id);
            showToast('success', t('manager.deleteSuccess'));
            fetchUsers();
        } catch (err: any) {
            const msg = err.response?.data?.error || t('manager.deleteError');
            showToast('error', msg);
        }
    };

    // format datetime
    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neu-light-text dark:text-neu-dark-text">
                    {t('manager.title')}
                </h2>
                <button
                    onClick={openCreateModal}
                    className="neu-button flex items-center gap-2 bg-primary-500 text-white hover:bg-primary-600"
                >
                    <UserPlus className="w-5 h-5" />
                    {t('manager.createUser')}
                </button>
            </div>

            {/* users table */}
            <div className="neu-card animate-fade-in">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">#</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('manager.name')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('manager.email')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('manager.rfid')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('manager.status')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('manager.role')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('manager.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={user.id} className="border-b border-neu-light-shadow/10 dark:border-neu-dark-shadow/10">
                                            <td className="p-3 text-neu-light-text dark:text-neu-dark-text">{(page - 1) * perPage + idx + 1}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full neu-card flex items-center justify-center">
                                                        <span className="text-sm font-bold text-primary-500">{user.full_name.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-neu-light-text dark:text-neu-dark-text">{user.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-neu-light-text dark:text-neu-dark-text">{user.email}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-neu-light-text dark:text-neu-dark-text font-mono text-sm">
                                                        {user.rfid_uid}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopyRfid(user.rfid_uid)}
                                                        className="p-1 rounded hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg transition-colors"
                                                        title={t('manager.copyRfid')}
                                                    >
                                                        {copiedRfid === user.rfid_uid ? (
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5 text-neu-light-text/50 dark:text-neu-dark-text/50" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_active
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    {user.is_active ? t('profile.active') : t('profile.inactive')}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {user.is_admin && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary-500 text-white">
                                                        Admin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="neu-icon-button p-2"
                                                        title={t('common.edit')}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="neu-icon-button p-2 text-red-500"
                                                        title={t('common.delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* pagination */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="neu-icon-button disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-neu-light-text dark:text-neu-dark-text">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="neu-icon-button disabled:opacity-50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neu-light-text dark:text-neu-dark-text">{t('common.perPage')}:</span>
                                {[20, 50, 100].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => { setPerPage(size); setPage(1); }}
                                        className={`px-3 py-1 rounded-neu text-sm transition-all ${perPage === size
                                            ? 'bg-primary-500 text-white shadow-neu-sm'
                                            : 'text-neu-light-text dark:text-neu-dark-text hover:shadow-neu-sm dark:hover:shadow-neu-dark-sm'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* create modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
                    onClick={closeModals}
                >
                    <div
                        className="neu-card max-w-md w-full mx-4 animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-neu-light-text dark:text-neu-dark-text">
                                {t('manager.createUser')}
                            </h3>
                            <button onClick={closeModals} className="neu-icon-button p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neu-light-text dark:text-neu-dark-text mb-2">
                                    {t('manager.name')} *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="neu-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neu-light-text dark:text-neu-dark-text mb-2">
                                    {t('manager.email')} *
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="neu-input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neu-light-text dark:text-neu-dark-text mb-2">
                                    {t('manager.rfid')} *
                                </label>
                                <input
                                    type="text"
                                    name="rfid_uid"
                                    value={formData.rfid_uid}
                                    onChange={handleChange}
                                    required
                                    className="neu-input"
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_admin"
                                        checked={formData.is_admin}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-neu-light-text dark:text-neu-dark-text">Admin</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-neu-light-text dark:text-neu-dark-text">{t('profile.active')}</span>
                                </label>
                            </div>

                            <p className="text-xs text-neu-light-text/60 dark:text-neu-dark-text/60">
                                {t('manager.passwordHint')}
                            </p>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="neu-button flex-1"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="neu-button flex-1 bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
                                >
                                    {submitting ? t('common.loading') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* edit modal with logs */}
            {showEditModal && selectedUser && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
                    onClick={closeModals}
                >
                    <div
                        className="neu-card max-w-4xl w-full mx-4 animate-scale-in max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-neu-light-text dark:text-neu-dark-text">
                                {t('manager.editUser')} - {selectedUser.full_name}
                            </h3>
                            <button onClick={closeModals} className="neu-icon-button p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-6 flex-1 overflow-hidden">
                            {/* form bên trái - thu gọn */}
                            <div className="w-72 flex-shrink-0">
                                <form onSubmit={handleUpdate} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-neu-light-text dark:text-neu-dark-text mb-1">
                                            {t('manager.name')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            className="neu-input text-sm py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-neu-light-text dark:text-neu-dark-text mb-1">
                                            {t('manager.email')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="neu-input text-sm py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-neu-light-text dark:text-neu-dark-text mb-1">
                                            {t('manager.rfid')} *
                                        </label>
                                        <input
                                            type="text"
                                            name="rfid_uid"
                                            value={formData.rfid_uid}
                                            onChange={handleChange}
                                            required
                                            className="neu-input text-sm py-2"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_admin"
                                                checked={formData.is_admin}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm text-neu-light-text dark:text-neu-dark-text">Admin</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm text-neu-light-text dark:text-neu-dark-text">{t('profile.active')}</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-2 pt-3">
                                        <button
                                            type="button"
                                            onClick={closeModals}
                                            className="neu-button flex-1 text-sm py-2"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="neu-button flex-1 bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 text-sm py-2"
                                        >
                                            {submitting ? t('common.loading') : t('common.save')}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* logs bên phải */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-l border-neu-light-shadow/20 dark:border-neu-dark-shadow/20 pl-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-neu-light-text dark:text-neu-dark-text">
                                        {t('manager.userLogs')}
                                    </h4>
                                    <span className="text-xs text-neu-light-text/60 dark:text-neu-dark-text/60">
                                        {logsPagination.total_items} {t('manager.records')}
                                    </span>
                                </div>

                                {/* logs table với scroll */}
                                <div className="flex-1 overflow-auto min-h-0">
                                    {logsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : userLogs.length === 0 ? (
                                        <div className="text-center py-8 text-sm text-neu-light-text/60 dark:text-neu-dark-text/60">
                                            {t('devices.noLogs')}
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-neu-light-surface dark:bg-neu-dark-surface">
                                                <tr className="border-b border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                                                    <th className="p-2 text-left text-xs text-neu-light-text dark:text-neu-dark-text">{t('logs.timestamp')}</th>
                                                    <th className="p-2 text-left text-xs text-neu-light-text dark:text-neu-dark-text">{t('logs.device')}</th>
                                                    <th className="p-2 text-left text-xs text-neu-light-text dark:text-neu-dark-text">{t('logs.code')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userLogs.map(log => (
                                                    <tr key={log.id} className="border-b border-neu-light-shadow/10 dark:border-neu-dark-shadow/10">
                                                        <td className="p-2 text-xs text-neu-light-text dark:text-neu-dark-text">
                                                            {formatDateTime(log.timestamp)}
                                                        </td>
                                                        <td className="p-2">
                                                            <span className="font-mono text-xs text-primary-500">{log.device_id}</span>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium
                                                                ${log.code === 'REALTIME'
                                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                }`}>
                                                                {log.code}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* logs pagination */}
                                {logsPagination.total_pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-neu-light-shadow/20 dark:border-neu-dark-shadow/20 mt-3">
                                        <button
                                            disabled={!logsPagination.has_prev}
                                            onClick={() => fetchUserLogs(selectedUser.rfid_uid, logsPagination.page - 1)}
                                            className="p-1 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs text-neu-light-text dark:text-neu-dark-text">
                                            {logsPagination.page} / {logsPagination.total_pages}
                                        </span>
                                        <button
                                            disabled={!logsPagination.has_next}
                                            onClick={() => fetchUserLogs(selectedUser.rfid_uid, logsPagination.page + 1)}
                                            className="p-1 disabled:opacity-50"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTab;
