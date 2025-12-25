import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getWorkedDay, getWorkedMonth, getMyAttendanceLogs } from '../../services/api';
import './GeneralTab.css';

interface WorkedDayData {
    date: string;
    times: [string, string][];
    total_times: number;
    type: number;
    ot_times: [string, string][];
}

interface WorkedMonthData {
    month: string;
    worked_days: WorkedDayData[];
}

const GeneralTab: React.FC = () => {
    const { t } = useLanguage();
    const [todayData, setTodayData] = useState<WorkedDayData | null>(null);
    const [weekData, setWeekData] = useState<WorkedDayData[]>([]);
    const [monthData, setMonthData] = useState<WorkedMonthData | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [logsPage, setLogsPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(20);
    const [logsTotalPages, setLogsTotalPages] = useState(1);
    const [logsFilter, setLogsFilter] = useState({ month: '', day: '' });
    const [loading, setLoading] = useState({ today: true, week: true, month: false, logs: false });

    // lấy dữ liệu ngày hôm nay
    useEffect(() => {
        const fetchToday = async () => {
            try {
                const data = await getWorkedDay();
                setTodayData(data);
            } catch (err) {
                console.error('Error fetching today data:', err);
            } finally {
                setLoading(prev => ({ ...prev, today: false }));
            }
        };
        fetchToday();
    }, []);

    // lấy dữ liệu tuần này (từ Chủ Nhật đến Thứ Bảy)
    useEffect(() => {
        const fetchWeek = async () => {
            try {
                const today = new Date();
                const weekDays: WorkedDayData[] = [];

                // tính ngày Chủ Nhật đầu tuần (day 0)
                const currentDay = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - currentDay);

                // lấy dữ liệu cho 7 ngày từ CN đến T7
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    try {
                        const data = await getWorkedDay(dateStr);
                        weekDays.push(data);
                    } catch {
                        weekDays.push({
                            date: dateStr,
                            times: [],
                            total_times: 0,
                            type: 0,
                            ot_times: []
                        });
                    }
                }
                setWeekData(weekDays);
            } catch (err) {
                console.error('Error fetching week data:', err);
            } finally {
                setLoading(prev => ({ ...prev, week: false }));
            }
        };
        fetchWeek();
    }, []);

    // lấy dữ liệu tháng khi submit
    const handleMonthSubmit = async () => {
        setLoading(prev => ({ ...prev, month: true }));
        try {
            const data = await getWorkedMonth(selectedMonth);
            setMonthData(data);
        } catch (err) {
            console.error('Error fetching month data:', err);
        } finally {
            setLoading(prev => ({ ...prev, month: false }));
        }
    };

    // lấy attendance logs khi submit
    const handleLogsSubmit = async () => {
        setLoading(prev => ({ ...prev, logs: true }));
        try {
            const params: any = { page: logsPage, per_page: logsPerPage };
            if (logsFilter.month) params.month = logsFilter.month;
            if (logsFilter.day) params.day = logsFilter.day;

            const data = await getMyAttendanceLogs(params);
            setLogs(data.items || []);
            setLogsTotalPages(data.pages || 1);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(prev => ({ ...prev, logs: false }));
        }
    };

    // helper: lấy ngày trong tuần
    const getDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
    };

    // helper: tính vị trí trên timeline (6h-24h = 18 giờ)
    const getTimePosition = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const startMinutes = 6 * 60;
        const endMinutes = 24 * 60;
        return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
    };

    // render calendar cho tháng
    const renderCalendar = () => {
        if (!monthData) return null;

        const [year, month] = selectedMonth.split('-').map(Number);
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const startPadding = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const workedDaysMap = new Map<string, WorkedDayData>();
        // đảm bảo worked_days tồn tại trước khi forEach
        if (monthData.worked_days && Array.isArray(monthData.worked_days)) {
            monthData.worked_days.forEach(day => {
                workedDaysMap.set(day.date, day);
            });
        }

        const cells = [];

        // padding đầu tháng
        for (let i = 0; i < startPadding; i++) {
            cells.push(<div key={`pad-${i}`} className="calendar-cell empty"></div>);
        }

        // các ngày trong tháng
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = workedDaysMap.get(dateStr);

            cells.push(
                <div
                    key={day}
                    className={`calendar-cell ${dayData?.type === 1 ? 'full' : dayData?.type === 0.5 ? 'half' : ''}`}
                >
                    <span className="day-number">{day}</span>
                    {dayData && dayData.times.length > 0 && (
                        <div className="day-info">
                            <span className="time-range">
                                {dayData.times[0]?.[0]} - {dayData.times[dayData.times.length - 1]?.[0]}
                            </span>
                            <span className="hours">{dayData.total_times}h</span>
                        </div>
                    )}
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="general-tab">
            {/* hàng 1: nhật ký hôm nay + biểu đồ tuần */}
            <div className="row row-1">
                {/* panel nhật ký hôm nay */}
                <div className="panel today-panel">
                    <h3 className="panel-title">{t('general.todayLog')}</h3>
                    {loading.today ? (
                        <div className="loading-spinner"></div>
                    ) : todayData ? (
                        <div className="today-content">
                            <div className="today-summary">
                                <div className="summary-item">
                                    <span className="label">{t('general.totalHours')}</span>
                                    <span className="value">{todayData.total_times}h</span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">{t('general.status')}</span>
                                    <span className={`value status-${todayData.type === 1 ? 'full' : todayData.type === 0.5 ? 'half' : 'none'}`}>
                                        {todayData.type === 1 ? t('general.fullDay') : todayData.type === 0.5 ? t('general.halfDay') : t('general.absent')}
                                    </span>
                                </div>
                            </div>
                            <div className="today-times">
                                {(todayData.times || []).map(([time, status], idx) => (
                                    <div key={idx} className={`time-entry ${idx % 2 === 0 ? 'in' : 'out'}`}>
                                        <span className="entry-type">{idx % 2 === 0 ? 'IN' : 'OUT'}</span>
                                        <span className="entry-time">{time}</span>
                                        <span className={`entry-status ${status === 'SUCCESS' ? 'success' : 'error'}`}>
                                            {status === 'SUCCESS' ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">{t('general.noData')}</p>
                    )}
                </div>

                {/* panel biểu đồ tuần */}
                <div className="panel week-panel">
                    <h3 className="panel-title">{t('general.weekChart')}</h3>
                    {loading.week ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        <div className="week-chart">
                            {/* trục Y: thời gian */}
                            <div className="chart-y-axis">
                                {[6, 9, 12, 15, 18, 21, 24].map(h => (
                                    <span key={h} className="y-label">{h}:00</span>
                                ))}
                            </div>

                            {/* các cột ngày */}
                            <div className="chart-columns">
                                {weekData.map((day, idx) => {
                                    // CN (idx=0) và T7 (idx=6) là ngày nghỉ
                                    const isWeekend = idx === 0 || idx === 6;
                                    return (
                                        <div key={idx} className={`chart-column ${isWeekend ? 'weekend' : ''}`}>
                                            <div className="column-bars">
                                                {(day.times || []).map(([time, status], i) => {
                                                    const pos = getTimePosition(time);
                                                    const isIn = i % 2 === 0;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`time-bar ${isIn ? 'bar-in' : 'bar-out'} ${status !== 'SUCCESS' ? 'error' : ''}`}
                                                            style={{ bottom: `${pos}%` }}
                                                            title={`${isIn ? 'IN' : 'OUT'}: ${time}`}
                                                        >
                                                            <span className="bar-label">{time}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <span className="column-label">{getDayName(day.date)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* hàng 2: lịch tháng */}
            <div className="row row-2">
                <div className="panel month-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">{t('general.monthCalendar')}</h3>
                        <div className="month-selector">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                            <button
                                className="submit-btn"
                                onClick={handleMonthSubmit}
                                disabled={loading.month}
                            >
                                {loading.month ? t('common.loading') : t('common.submit')}
                            </button>
                        </div>
                    </div>

                    {monthData && (
                        <div className="calendar-container">
                            <div className="calendar-header">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                    <div key={d} className="calendar-header-cell">{d}</div>
                                ))}
                            </div>
                            <div className="calendar-grid">
                                {renderCalendar()}
                            </div>
                            <div className="calendar-legend">
                                <span className="legend-item"><span className="dot full"></span> {t('general.fullDay')}</span>
                                <span className="legend-item"><span className="dot half"></span> {t('general.halfDay')}</span>
                                <span className="legend-item"><span className="dot none"></span> {t('general.absent')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* hàng 3: chi tiết logs */}
            <div className="row row-3">
                <div className="panel logs-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">{t('general.detailLogs')}</h3>
                        <div className="logs-filter">
                            <input
                                type="month"
                                placeholder="Month"
                                value={logsFilter.month}
                                onChange={(e) => setLogsFilter(prev => ({ ...prev, month: e.target.value }))}
                            />
                            <input
                                type="date"
                                placeholder="Day"
                                value={logsFilter.day}
                                onChange={(e) => setLogsFilter(prev => ({ ...prev, day: e.target.value }))}
                            />
                            <button
                                className="submit-btn"
                                onClick={handleLogsSubmit}
                                disabled={loading.logs}
                            >
                                {loading.logs ? t('common.loading') : t('common.submit')}
                            </button>
                        </div>
                    </div>

                    {logs.length > 0 && (
                        <>
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{t('logs.timestamp')}</th>
                                        <th>{t('logs.device')}</th>
                                        <th>{t('logs.code')}</th>
                                        <th>{t('logs.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, idx) => (
                                        <tr key={log.id}>
                                            <td>{(logsPage - 1) * logsPerPage + idx + 1}</td>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td>{log.device_id}</td>
                                            <td>{log.code}</td>
                                            <td>
                                                <span className={`status-badge ${log.error_code ? 'error' : 'success'}`}>
                                                    {log.error_code || 'SUCCESS'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* pagination */}
                            <div className="pagination">
                                <div className="pagination-controls">
                                    <button
                                        disabled={logsPage <= 1}
                                        onClick={() => { setLogsPage(p => p - 1); handleLogsSubmit(); }}
                                    >
                                        «
                                    </button>
                                    <span>{logsPage} / {logsTotalPages}</span>
                                    <button
                                        disabled={logsPage >= logsTotalPages}
                                        onClick={() => { setLogsPage(p => p + 1); handleLogsSubmit(); }}
                                    >
                                        »
                                    </button>
                                </div>
                                <div className="per-page-selector">
                                    <span>{t('common.perPage')}:</span>
                                    {[20, 50, 100].map(size => (
                                        <button
                                            key={size}
                                            className={logsPerPage === size ? 'active' : ''}
                                            onClick={() => { setLogsPerPage(size); setLogsPage(1); }}
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
        </div>
    );
};

export default GeneralTab;
