import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { updateMe } from '../../services/api';
import './ProfileTab.css';

const ProfileTab: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        rfid_uid: user?.rfid_uid || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateMe(formData);
            showToast('success', t('profile.updateSuccess'));
            setIsEditing(false);
            if (refreshUser) refreshUser();
        } catch (err: any) {
            const msg = err.response?.data?.error || t('profile.updateError');
            showToast('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || '',
            rfid_uid: user?.rfid_uid || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="profile-tab">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar">
                        <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="profile-info">
                        <h2>{user?.full_name}</h2>
                        <p>{user?.email}</p>
                        {user?.is_admin && <span className="admin-badge">Admin</span>}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label>{t('profile.fullName')}</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        ) : (
                            <span className="field-value">{user?.full_name}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('profile.email')}</label>
                        <span className="field-value readonly">{user?.email}</span>
                        {isEditing && <small className="hint">{t('profile.emailHint')}</small>}
                    </div>

                    <div className="form-group">
                        <label>{t('profile.rfidUid')}</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="rfid_uid"
                                value={formData.rfid_uid}
                                onChange={handleChange}
                                required
                            />
                        ) : (
                            <span className="field-value">{user?.rfid_uid}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('profile.status')}</label>
                        <span className={`field-value status ${user?.is_active ? 'active' : 'inactive'}`}>
                            {user?.is_active ? t('profile.active') : t('profile.inactive')}
                        </span>
                    </div>

                    <div className="form-group">
                        <label>{t('profile.role')}</label>
                        <span className="field-value">
                            {user?.is_admin ? t('profile.admin') : t('profile.user')}
                        </span>
                    </div>

                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                    disabled={loading}
                                >
                                    {loading ? t('common.loading') : t('common.save')}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn-edit"
                                onClick={() => setIsEditing(true)}
                            >
                                {t('common.edit')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileTab;
