import { useState } from 'react';
import { Edit2, Save, X, User as UserIcon, Mail, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { updateMe } from '../../services/api';

const ProfileTab = () => {
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
        <div className="max-w-3xl mx-auto">
            <div className="neu-card animate-fade-in">
                {/* profile header */}
                <div className="flex items-center gap-6 pb-6 border-b border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                    {/* avatar */}
                    <div className="w-24 h-24 rounded-full neu-card flex items-center justify-center">
                        <span className="text-4xl font-bold bg-gradient-to-br from-primary-400 to-primary-600 bg-clip-text text-transparent">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* user info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-neu-light-text dark:text-neu-dark-text">
                            {user?.full_name}
                        </h2>
                        <p className="text-neu-light-text/70 dark:text-neu-dark-text/70 mt-1">
                            {user?.email}
                        </p>
                        {user?.is_admin && (
                            <span className="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-lg bg-primary-500 text-white">
                                Admin
                            </span>
                        )}
                    </div>

                    {/* edit button */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="neu-icon-button"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* profile form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* full name */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-neu-light-text dark:text-neu-dark-text">
                            <UserIcon className="w-4 h-4" />
                            {t('profile.fullName')}
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="neu-input"
                            />
                        ) : (
                            <div className="px-4 py-3 rounded-neu bg-neu-light-bg dark:bg-neu-dark-bg text-neu-light-text dark:text-neu-dark-text">
                                {user?.full_name}
                            </div>
                        )}
                    </div>

                    {/* email (readonly) */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-neu-light-text dark:text-neu-dark-text">
                            <Mail className="w-4 h-4" />
                            {t('profile.email')}
                        </label>
                        <div className="px-4 py-3 rounded-neu bg-neu-light-bg dark:bg-neu-dark-bg text-neu-light-text/50 dark:text-neu-dark-text/50">
                            {user?.email}
                        </div>
                        {isEditing && (
                            <p className="text-xs text-neu-light-text/60 dark:text-neu-dark-text/60">
                                {t('profile.emailHint')}
                            </p>
                        )}
                    </div>

                    {/* rfid uid */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-neu-light-text dark:text-neu-dark-text">
                            <CreditCard className="w-4 h-4" />
                            {t('profile.rfidUid')}
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="rfid_uid"
                                value={formData.rfid_uid}
                                onChange={handleChange}
                                required
                                className="neu-input"
                            />
                        ) : (
                            <div className="px-4 py-3 rounded-neu bg-neu-light-bg dark:bg-neu-dark-bg text-neu-light-text dark:text-neu-dark-text font-mono">
                                {user?.rfid_uid}
                            </div>
                        )}
                    </div>

                    {/* status */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-neu-light-text dark:text-neu-dark-text">
                            {user?.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {t('profile.status')}
                        </label>
                        <div className={`px-4 py-3 rounded-neu flex items-center gap-2 ${user?.is_active
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}>
                            {user?.is_active ? t('profile.active') : t('profile.inactive')}
                        </div>
                    </div>

                    {/* role */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-neu-light-text dark:text-neu-dark-text">
                            <Shield className="w-4 h-4" />
                            {t('profile.role')}
                        </label>
                        <div className="px-4 py-3 rounded-neu bg-neu-light-bg dark:bg-neu-dark-bg text-neu-light-text dark:text-neu-dark-text">
                            {user?.is_admin ? t('profile.admin') : t('profile.user')}
                        </div>
                    </div>

                    {/* action buttons */}
                    {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="neu-button flex-1 flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="neu-button flex-1 flex items-center justify-center gap-2
                         bg-gradient-to-r from-primary-500 to-primary-600 text-white
                         hover:from-primary-600 hover:to-primary-700
                         disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {t('common.save')}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfileTab;
