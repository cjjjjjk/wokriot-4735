import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import './ManagerTab.css';

interface User {
    id: number;
    full_name: string;
    email: string;
    rfid_uid: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
}

const ManagerTab: React.FC = () => {
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

    // lấy danh sách users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({ page, per_page: perPage });
            // API trả về structure: { data: { users: [...], pagination: {...} } }
            setUsers(response.data?.users || []);
            setTotalPages(response.data?.pagination?.total_pages || 1);
        } catch (err) {
            showToast('error', t('manager.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, perPage]);

    // reset form
    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            rfid_uid: '',
            is_admin: false,
            is_active: true,
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

    return (
        <div className="manager-tab">
            <div className="manager-header">
                <h2>{t('manager.title')}</h2>
                <button className="btn-create" onClick={openCreateModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    {t('manager.createUser')}
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner"></div>
            ) : (
                <>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t('manager.name')}</th>
                                    <th>{t('manager.email')}</th>
                                    <th>{t('manager.rfid')}</th>
                                    <th>{t('manager.status')}</th>
                                    <th>{t('manager.role')}</th>
                                    <th>{t('manager.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => (
                                    <tr key={user.id}>
                                        <td>{(page - 1) * perPage + idx + 1}</td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="user-avatar">{user.full_name.charAt(0)}</span>
                                                {user.full_name}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td><code>{user.rfid_uid}</code></td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                {user.is_active ? t('profile.active') : t('profile.inactive')}
                                            </span>
                                        </td>
                                        <td>
                                            {user.is_admin && <span className="role-badge admin">Admin</span>}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-action edit" onClick={() => openEditModal(user)} title={t('common.edit')}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button className="btn-action delete" onClick={() => handleDelete(user)} title={t('common.delete')}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination */}
                    <div className="pagination">
                        <div className="pagination-controls">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>«</button>
                            <span>{page} / {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>»</button>
                        </div>
                        <div className="per-page-selector">
                            <span>{t('common.perPage')}:</span>
                            {[20, 50, 100].map(size => (
                                <button
                                    key={size}
                                    className={perPage === size ? 'active' : ''}
                                    onClick={() => { setPerPage(size); setPage(1); }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* create modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('manager.createUser')}</h3>
                            <button className="modal-close" onClick={closeModals}>×</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('manager.name')} *</label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('manager.email')} *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('manager.rfid')} *</label>
                                    <input type="text" name="rfid_uid" value={formData.rfid_uid} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="is_admin" checked={formData.is_admin} onChange={handleChange} />
                                        <span>Admin</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                        <span>{t('profile.active')}</span>
                                    </label>
                                </div>
                                <p className="form-hint">{t('manager.passwordHint')}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModals}>{t('common.cancel')}</button>
                                <button type="submit" className="btn-save" disabled={submitting}>
                                    {submitting ? t('common.loading') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* edit modal */}
            {showEditModal && selectedUser && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('manager.editUser')}</h3>
                            <button className="modal-close" onClick={closeModals}>×</button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>{t('manager.name')} *</label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('manager.email')} *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>{t('manager.rfid')} *</label>
                                    <input type="text" name="rfid_uid" value={formData.rfid_uid} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="is_admin" checked={formData.is_admin} onChange={handleChange} />
                                        <span>Admin</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                        <span>{t('profile.active')}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={closeModals}>{t('common.cancel')}</button>
                                <button type="submit" className="btn-save" disabled={submitting}>
                                    {submitting ? t('common.loading') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTab;
