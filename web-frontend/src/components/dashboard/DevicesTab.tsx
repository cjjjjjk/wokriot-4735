import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import {
    getDevices,
    controlDoor,
    controlRfid,
    controlDeviceActivation,
    deleteDevice,
    filterAttendanceLogs,
    Device
} from '../../services/api';
import './DevicesTab.css';

// interface cho attendance log
interface AttendanceLog {
    id: number;
    rfid_uid: string;
    timestamp: string;
    device_id: string;
    code: string;
    error_code: string | null;
    created_at: string;
}

interface Pagination {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

const DevicesTab = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    // device states
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // selected device for logs filter
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    // attendance logs states
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        per_page: 10,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
    });

    // lấy danh sách devices
    const fetchDevices = async () => {
        setLoading(true);
        try {
            const response = await getDevices();
            setDevices(response.data || []);
        } catch (err) {
            showToast('error', t('devices.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    // refresh cả devices và logs
    const fetchAll = async () => {
        await fetchDevices();
        await fetchLogs(selectedDeviceId, 1);
    };

    // lấy attendance logs
    const fetchLogs = async (deviceId: string | null = null, page: number = 1, perPage?: number) => {
        setLogsLoading(true);
        try {
            const actualPerPage = perPage ?? pagination.per_page;
            const params: { device_id?: string; page: number; per_page: number } = {
                page,
                per_page: actualPerPage
            };

            if (deviceId) {
                params.device_id = deviceId;
            }

            const response = await filterAttendanceLogs(params);
            setLogs(response.data?.attendance_logs || []);
            setPagination(prev => ({
                ...prev,
                ...response.data?.pagination,
                page,
                per_page: actualPerPage
            }));
        } catch (err) {
            showToast('error', t('devices.logsError'));
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
        fetchLogs();
    }, []);

    // khi chọn device để xem detail
    const handleSelectDevice = (deviceId: string) => {
        if (selectedDeviceId === deviceId) {
            // nếu đang chọn device này, bỏ chọn và hiển thị tất cả
            setSelectedDeviceId(null);
            fetchLogs(null, 1);
        } else {
            setSelectedDeviceId(deviceId);
            fetchLogs(deviceId, 1);
        }
    };

    // clear filter - hiển thị tất cả logs
    const handleClearFilter = () => {
        setSelectedDeviceId(null);
        fetchLogs(null, 1);
    };

    // xử lý toggle door
    const handleDoorToggle = async (device: Device) => {
        const newState = device.door_state === 'OPEN' ? 'CLOSE' : 'OPEN';
        setActionLoading(`door-${device.device_id}`);
        try {
            await controlDoor(device.device_id, newState);
            showToast('success', t('devices.doorSuccess'));
            setDevices(prev => prev.map(d =>
                d.device_id === device.device_id
                    ? { ...d, door_state: newState === 'OPEN' ? 'OPEN' : 'CLOSED' }
                    : d
            ));
        } catch (err) {
            showToast('error', t('devices.doorError'));
        } finally {
            setActionLoading(null);
        }
    };

    // xử lý toggle RFID
    const handleRfidToggle = async (device: Device) => {
        const newEnabled = !device.rfid_enabled;
        setActionLoading(`rfid-${device.device_id}`);
        try {
            await controlRfid(device.device_id, newEnabled);
            showToast('success', t('devices.rfidSuccess'));
            setDevices(prev => prev.map(d =>
                d.device_id === device.device_id
                    ? { ...d, rfid_enabled: newEnabled }
                    : d
            ));
        } catch (err) {
            showToast('error', t('devices.rfidError'));
        } finally {
            setActionLoading(null);
        }
    };

    // xử lý toggle activate
    const handleActivateToggle = async (device: Device) => {
        const newActive = !device.is_active;
        setActionLoading(`activate-${device.device_id}`);
        try {
            await controlDeviceActivation(device.device_id, newActive);
            showToast('success', t('devices.activateSuccess'));
            setDevices(prev => prev.map(d =>
                d.device_id === device.device_id
                    ? { ...d, is_active: newActive }
                    : d
            ));
        } catch (err) {
            showToast('error', t('devices.activateError'));
        } finally {
            setActionLoading(null);
        }
    };

    // xử lý xoá device
    const handleDelete = async (device: Device) => {
        const confirmMessage = t('devices.confirmDelete').replace('{name}', device.name || device.device_id);
        if (!confirm(confirmMessage)) return;

        setActionLoading(`delete-${device.device_id}`);
        try {
            await deleteDevice(device.device_id);
            showToast('success', t('devices.deleteSuccess'));
            // nếu đang filter bởi device này, clear filter
            if (selectedDeviceId === device.device_id) {
                setSelectedDeviceId(null);
                fetchLogs(null, 1);
            }
            fetchDevices();
        } catch (err) {
            showToast('error', t('devices.deleteError'));
        } finally {
            setActionLoading(null);
        }
    };

    // format thời gian
    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return t('devices.never');
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
    };

    // pagination handlers
    const handlePageChange = (newPage: number) => {
        fetchLogs(selectedDeviceId, newPage);
    };

    const handlePerPageChange = (newPerPage: number) => {
        fetchLogs(selectedDeviceId, 1, newPerPage);
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neu-light-text dark:text-neu-dark-text">
                    {t('devices.title')}
                </h2>
                <button
                    onClick={fetchAll}
                    disabled={loading || logsLoading}
                    className="neu-button flex items-center gap-2"
                >
                    <RefreshCw className={`w-5 h-5 ${loading || logsLoading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </button>
            </div>

            {/* devices table */}
            <div className="neu-card animate-fade-in">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : devices.length === 0 ? (
                    <div className="text-center py-12 text-neu-light-text/60 dark:text-neu-dark-text/60">
                        {t('devices.noDevices')}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                                    <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">#</th>
                                    <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('devices.deviceId')}</th>
                                    <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('devices.name')}</th>
                                    <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text">{t('devices.lastSeen')}</th>
                                    <th className="p-3 text-center text-neu-light-text dark:text-neu-dark-text">{t('devices.door')}</th>
                                    <th className="p-3 text-center text-neu-light-text dark:text-neu-dark-text">{t('devices.rfid')}</th>
                                    <th className="p-3 text-center text-neu-light-text dark:text-neu-dark-text">{t('devices.active')}</th>
                                    <th className="p-3 text-center text-neu-light-text dark:text-neu-dark-text">{t('manager.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((device, idx) => (
                                    <tr
                                        key={device.id}
                                        className={`border-b border-neu-light-shadow/10 dark:border-neu-dark-shadow/10 
                                            ${selectedDeviceId === device.device_id ? 'bg-primary-500/10' : ''}`}
                                    >
                                        <td className="p-3 text-neu-light-text dark:text-neu-dark-text">{idx + 1}</td>
                                        <td className="p-3">
                                            <span className="font-mono text-sm text-primary-500">{device.device_id}</span>
                                        </td>
                                        <td className="p-3 text-neu-light-text dark:text-neu-dark-text">{device.name}</td>
                                        <td className="p-3 text-sm text-neu-light-text/70 dark:text-neu-dark-text/70">
                                            {formatDateTime(device.last_seen)}
                                        </td>
                                        {/* door toggle */}
                                        <td className="p-3">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleDoorToggle(device)}
                                                    disabled={actionLoading === `door-${device.device_id}`}
                                                    className={`toggle-button ${device.door_state === 'OPEN' ? 'toggle-on' : 'toggle-off'}`}
                                                    title={device.door_state === 'OPEN' ? t('devices.doorOpen') : t('devices.doorClosed')}
                                                >
                                                    <span className="toggle-slider"></span>
                                                    <span className="toggle-label">
                                                        {actionLoading === `door-${device.device_id}` ? '...' :
                                                            device.door_state === 'OPEN' ? 'OPEN' : 'CLOSED'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        {/* rfid toggle */}
                                        <td className="p-3">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleRfidToggle(device)}
                                                    disabled={actionLoading === `rfid-${device.device_id}`}
                                                    className={`toggle-button ${device.rfid_enabled ? 'toggle-on' : 'toggle-off'}`}
                                                    title={device.rfid_enabled ? t('devices.rfidOn') : t('devices.rfidOff')}
                                                >
                                                    <span className="toggle-slider"></span>
                                                    <span className="toggle-label">
                                                        {actionLoading === `rfid-${device.device_id}` ? '...' :
                                                            device.rfid_enabled ? 'ON' : 'OFF'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        {/* activate toggle */}
                                        <td className="p-3">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleActivateToggle(device)}
                                                    disabled={actionLoading === `activate-${device.device_id}`}
                                                    className={`toggle-button ${device.is_active ? 'toggle-on' : 'toggle-off'}`}
                                                    title={device.is_active ? t('profile.active') : t('profile.inactive')}
                                                >
                                                    <span className="toggle-slider"></span>
                                                    <span className="toggle-label">
                                                        {actionLoading === `activate-${device.device_id}` ? '...' :
                                                            device.is_active ? 'ON' : 'OFF'}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                        {/* actions: detail + delete */}
                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                {/* detail button */}
                                                <button
                                                    onClick={() => handleSelectDevice(device.device_id)}
                                                    className={`neu-icon-button p-2 ${selectedDeviceId === device.device_id
                                                        ? 'bg-primary-500 text-white'
                                                        : 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
                                                        }`}
                                                    title={t('devices.viewLogs')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {/* delete button */}
                                                <button
                                                    onClick={() => handleDelete(device)}
                                                    disabled={actionLoading === `delete-${device.device_id}`}
                                                    className="neu-icon-button p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
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
                )}
            </div>

            {/* attendance logs section */}
            <div className="neu-card animate-fade-in">
                {/* logs header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-neu-light-text dark:text-neu-dark-text">
                            {t('devices.logsTitle')}
                        </h3>
                        {selectedDeviceId && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full">
                                <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                                    {selectedDeviceId}
                                </span>
                                <button
                                    onClick={handleClearFilter}
                                    className="p-0.5 hover:bg-primary-500/20 rounded-full transition-colors"
                                    title={t('devices.showAll')}
                                >
                                    <X className="w-3 h-3 text-primary-500" />
                                </button>
                            </div>
                        )}
                    </div>
                    <span className="text-sm text-neu-light-text/60 dark:text-neu-dark-text/60">
                        {t('devices.totalLogs')}: {pagination.total_items}
                    </span>
                </div>

                {/* logs table */}
                {logsLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-neu-light-text/60 dark:text-neu-dark-text/60">
                        {t('devices.noLogs')}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                                        <th className="p-2 text-left text-sm text-neu-light-text dark:text-neu-dark-text">#</th>
                                        <th className="p-2 text-left text-sm text-neu-light-text dark:text-neu-dark-text">{t('logs.timestamp')}</th>
                                        <th className="p-2 text-left text-sm text-neu-light-text dark:text-neu-dark-text">{t('devices.deviceId')}</th>
                                        <th className="p-2 text-left text-sm text-neu-light-text dark:text-neu-dark-text">RFID UID</th>
                                        <th className="p-2 text-left text-sm text-neu-light-text dark:text-neu-dark-text">{t('logs.code')}</th>
                                        <th className="p-2 text-left text-sm text-neu-light-text dark:text-neu-dark-text">{t('logs.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, idx) => (
                                        <tr key={log.id} className="border-b border-neu-light-shadow/10 dark:border-neu-dark-shadow/10">
                                            <td className="p-2 text-sm text-neu-light-text dark:text-neu-dark-text">
                                                {(pagination.page - 1) * pagination.per_page + idx + 1}
                                            </td>
                                            <td className="p-2 text-sm text-neu-light-text dark:text-neu-dark-text">
                                                {formatDateTime(log.timestamp)}
                                            </td>
                                            <td className="p-2">
                                                <span className="font-mono text-xs text-primary-500">{log.device_id}</span>
                                            </td>
                                            <td className="p-2">
                                                <span className="font-mono text-xs text-neu-light-text dark:text-neu-dark-text">
                                                    {log.rfid_uid}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium
                                                    ${log.code === 'REALTIME'
                                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                    }`}>
                                                    {log.code}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                {log.error_code ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                                        {log.error_code}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                                        OK
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* pagination */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={!pagination.has_prev}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    className="neu-icon-button p-1.5 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-neu-light-text dark:text-neu-dark-text">
                                    {pagination.page} / {pagination.total_pages}
                                </span>
                                <button
                                    disabled={!pagination.has_next}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    className="neu-icon-button p-1.5 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-neu-light-text dark:text-neu-dark-text">{t('common.perPage')}:</span>
                                {[10, 20, 50].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => handlePerPageChange(size)}
                                        className={`px-2 py-0.5 rounded text-xs transition-all ${pagination.per_page === size
                                            ? 'bg-primary-500 text-white'
                                            : 'text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg'
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
        </div>
    );
};

export default DevicesTab;
