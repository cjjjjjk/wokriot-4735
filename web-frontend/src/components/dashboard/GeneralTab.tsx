import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getWorkedDay, getWorkedMonth, getMyAttendanceLogs } from '../../services/api';
import LogsLineChart from './LogsLineChart';
import MonthHoursChart from './MonthHoursChart';

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

const GeneralTab = () => {
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
    const [logsPerPage, setLogsPerPage] = useState(10);
    const [logsPagination, setLogsPagination] = useState({
        has_next: false,
        has_prev: false,
        total_items: 0,
        total_pages: 1,
        page: 1,
        per_page: 10
    });
    const [logsFilter, setLogsFilter] = useState(() => {
        const now = new Date();
        return { month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, day: '' };
    });
    const [loading, setLoading] = useState({ today: true, week: true, month: false, logs: false });
    const [weekOffset, setWeekOffset] = useState(0);

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

    // lấy dữ liệu tuần (từ Chủ Nhật đến Thứ Bảy) theo offset
    useEffect(() => {
        const fetchWeek = async () => {
            setLoading(prev => ({ ...prev, week: true }));
            try {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + (weekOffset * 7));

                const weekDays: WorkedDayData[] = [];

                // tính ngày Chủ Nhật đầu tuần (day 0)
                const currentDay = targetDate.getDay();
                const startOfWeek = new Date(targetDate);
                startOfWeek.setDate(targetDate.getDate() - currentDay);

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
    }, [weekOffset]);

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
    const fetchLogs = async (page = logsPage) => {
        setLoading(prev => ({ ...prev, logs: true }));
        try {
            const params: any = { page, per_page: logsPerPage };
            if (logsFilter.month) params.month = logsFilter.month;
            if (logsFilter.day) params.day = logsFilter.day;

            const res = await getMyAttendanceLogs(params);
            if (res.data) {
                setLogs(res.data.attendance_logs || []);
                setLogsPagination(res.data.pagination || {
                    has_next: false,
                    has_prev: false,
                    total_items: 0,
                    total_pages: 1,
                    page: 1,
                    per_page: 10
                });
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(prev => ({ ...prev, logs: false }));
        }
    };

    // lấy attendance logs khi submit
    const handleLogsSubmit = () => {
        setLogsPage(1);
        fetchLogs(1);
    };

    // auto fetch logs on mount and pagination change
    useEffect(() => {
        fetchLogs();
    }, [logsPage, logsPerPage]);

    // helper: lấy ngày trong tuần
    const getDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
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
        if (monthData.worked_days && Array.isArray(monthData.worked_days)) {
            monthData.worked_days.forEach(day => {
                workedDaysMap.set(day.date, day);
            });
        }

        const cells = [];

        // padding đầu tháng
        for (let i = 0; i < startPadding; i++) {
            cells.push(<div key={`pad-${i}`} className="p-2"></div>);
        }

        // các ngày trong tháng
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = workedDaysMap.get(dateStr);

            const h = dayData?.total_times || 0;
            let themeClass = "bg-neu-light-surface dark:bg-neu-dark-surface text-neu-light-text dark:text-neu-dark-text";
            if (h >= 8) themeClass = "bg-blue-100 dark:bg-primary-900/30 text-blue-700 dark:text-primary-300 shadow-sm";
            else if (h >= 4) themeClass = "bg-primary-100 dark:bg-blue-900/30 text-primary-700 dark:text-blue-300 shadow-sm";
            else if (h > 0) themeClass = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 shadow-sm";

            cells.push(
                <div
                    key={day}
                    className={`p-1.5 rounded shadow-sm transition-all h-[4.5rem] flex flex-col justify-between border-l-[4px] border-black/5 hover:border-black hover:shadow-md dark:border-white/10 ${themeClass}`}
                >
                    <div className="flex justify-between items-start">
                        <span className="px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 text-[16px] font-bold">
                            {day}
                        </span>
                        {h > 0 && <span className="text-[12px] font-bold">{h}h</span>}
                    </div>
                    {dayData && dayData.times && dayData.times.length > 0 && (
                        <div className="text-[10px] font-mono text-center opacity-90 mt-1">
                            {(() => {
                                const first = dayData.times[0]?.[0]?.substring(0, 5);
                                const last = dayData.times[dayData.times.length - 1]?.[0]?.substring(0, 5);
                                return `${first} - ${last}`;
                            })()}
                        </div>
                    )}
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="space-y-4">
            {/* hàng 1: nhật ký hôm nay + biểu đồ tuần */}
            <div className="grid lg:grid-cols-[3fr_7fr] gap-4">
                {/* panel nhật ký hôm nay */}
                <div className="neu-card animate-fade-in h-full flex flex-col max-h-[28rem]">
                    <h3 className="text-xl font-bold text-neu-light-text dark:text-neu-dark-text flex items-center gap-2 shrink-0 mb-4">
                        <Clock className="w-5 text-primary-500" />
                        {t('general.todayLog')}
                    </h3>
                    {loading.today ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : todayData ? (
                        <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-hidden">
                            {/* summary (fixed) */}
                            <div className="grid grid-cols-2 gap-4 shrink-0">
                                <div className="px-4 py-2 rounded-neu neu-input select-none dark:bg-neu-dark-surface/5">
                                    <div className="text-sm text-neu-light-text/70 dark:text-neu-dark-text/70">{t('general.totalHours')}</div>
                                    <div className="text-2xl font-bold text-primary-500">{todayData.total_times}h</div>
                                </div>
                                <div className="px-4 py-2 rounded-neu neu-input select-none dark:bg-neu-dark-surface/5">
                                    <div className="text-sm text-neu-light-text/70 dark:text-neu-dark-text/70">{t('general.status')}</div>
                                    <div className={`text-lg font-bold ${todayData.type === 1 ? 'text-green-500' : todayData.type === 0.5 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {todayData.type === 1 ? t('general.fullDay') : todayData.type === 0.5 ? t('general.halfDay') : t('general.absent')}
                                    </div>
                                </div>
                            </div>

                            {/* time entries (scrollable) */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {(todayData.times || []).map(([time, status], idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-3 rounded-neu ${idx % 2 === 0
                                            ? 'bg-green-50 dark:bg-green-900/10'
                                            : 'bg-blue-50 dark:bg-blue-900/10'
                                            }`}
                                    >
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${idx % 2 === 0 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                            }`}>
                                            {idx % 2 === 0 ? 'IN' : 'OUT'}
                                        </span>
                                        <span className="font-mono text-neu-light-text dark:text-neu-dark-text">{time}</span>
                                        <span className={status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}>
                                            {status === 'SUCCESS' ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center py-8 text-neu-light-text/50 dark:text-neu-dark-text/50">{t('general.noData')}</p>
                    )}
                </div>

                {/* panel biểu đồ tuần */}
                <div className="neu-card animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-neu-light-text dark:text-neu-dark-text flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            {t('general.weekChart')}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setWeekOffset(prev => prev - 1)}
                                className="p-1.5 rounded-lg text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg transition-colors"
                                title={t('general.prevWeek')}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-medium min-w-[3rem] text-center text-neu-light-text/70 dark:text-neu-dark-text/70">
                                {weekOffset === 0 ? t('general.thisWeek') : weekOffset > 0 ? `+${weekOffset} w` : `${weekOffset} w`}
                            </span>
                            <button
                                onClick={() => setWeekOffset(prev => prev + 1)}
                                className="p-1.5 rounded-lg text-neu-light-text dark:text-neu-dark-text hover:bg-neu-light-bg dark:hover:bg-neu-dark-bg transition-colors"
                                title={t('general.nextWeek')}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {loading.week ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Chart Main Area */}
                            <div className="flex h-72">
                                {/* Trục Y: Fixed Width (Hours) */}
                                <div className="w-10 flex flex-col justify-between text-[10px] text-right pr-2 py-1 text-neu-light-text/60 dark:text-neu-dark-text/60 font-medium select-none">
                                    {[14, 12, 10, 8, 6, 4, 2, 0].map(h => (
                                        <span key={h} className="leading-none">{h}h</span>
                                    ))}
                                </div>

                                {/* Graph Area */}
                                <div className="flex-1 relative border-l border-b border-neu-light-shadow dark:border-neu-dark-shadow bg-neu-dark-bg/5 dark:bg-neu-dark-bg/30">
                                    {/* Grid Lines (Background) - Horizontal */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                                        {[14, 12, 10, 8, 6, 4, 2, 0].map(h => (
                                            <div key={h} className="w-full border-b border-dashed border-neu-light-shadow dark:border-neu-dark-shadow h-0"></div>
                                        ))}
                                    </div>

                                    {/* Day Columns */}
                                    <div className="absolute inset-0 flex items-end z-10">
                                        {weekData.map((day, idx) => {
                                            const isWeekend = idx === 0 || idx === 6;
                                            const heightPercent = Math.min((day.total_times || 0) / 14 * 100, 100);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex-1 h-full relative group flex items-end justify-center pb-[1px] border-r border-dashed border-neu-light-shadow/10 dark:border-neu-dark-shadow/10 last:border-r-0 ${isWeekend ? 'bg-red-50/20 dark:bg-red-900/5' : 'hover:bg-neu-light-bg/30 dark:hover:bg-neu-dark-bg/30'
                                                        }`}
                                                >
                                                    {/* Hour Bar */}
                                                    <div
                                                        className="w-[60%] rounded-t-sm bg-blue-400 shadow-sm transition-all duration-300 group-hover:w-[70%] group-hover:brightness-110 relative"
                                                        style={{ height: `${heightPercent}%` }}
                                                        title={`${day.total_times}h`}
                                                    >
                                                        {/* Tooltip on hover */}
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neu-dark-bg text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                                                            {day.total_times}h
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Labels (Aligned with Columns) */}
                            <div className="flex mt-2">
                                <div className="w-10"></div> {/* Spacer matching Y-axis width */}
                                <div className="flex-1 flex text-center">
                                    {weekData.map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col gap-0.5">
                                            <span className="text-[10px] uppercase font-bold text-neu-light-text dark:text-neu-dark-text opacity-80">
                                                {getDayName(day.date)}
                                            </span>
                                            <span className={`text-[10px] font-bold ${day.total_times > 0
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-gray-300 dark:text-gray-700'
                                                }`}>
                                                {day.total_times > 0 ? `${day.total_times}h` : '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* hàng 2: lịch tháng */}
            <div className="neu-card animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-neu-light-text dark:text-neu-dark-text flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        {t('general.monthCalendar')}
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="neu-input"
                        />
                        <button
                            onClick={handleMonthSubmit}
                            disabled={loading.month}
                            className="neu-button bg-primary-500 text-white hover:bg-primary-600"
                        >
                            {loading.month ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t('common.submit')
                            )}
                        </button>
                    </div>
                </div>

                {monthData && (
                    <div className="space-y-6">
                        <div className="bg-white/20 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 p-4 shadow-sm">
                            {/* calendar header */}
                            <div className="grid grid-cols-7 gap-2 mb-2 border-b border-black/10 dark:border-white/5 pb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                    <div key={d} className="text-center font-bold text-neu-light-text dark:text-neu-dark-text p-2 text-sm opacity-80">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            {/* calendar grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendar()}
                            </div>
                        </div>
                        {/* Hours Chart */}
                        <MonthHoursChart month={selectedMonth} data={monthData?.worked_days || []} />
                    </div>
                )}
            </div>

            {/* hàng 3: chi tiết logs */}
            <div className="neu-card animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-neu-light-text dark:text-neu-dark-text flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary-500" />
                        {t('general.detailLogs')}
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="month"
                            value={logsFilter.month}
                            onChange={(e) => setLogsFilter(prev => ({ ...prev, month: e.target.value, day: '' }))}
                            className="neu-input"
                        />
                        <input
                            type="date"
                            value={logsFilter.day}
                            onChange={(e) => setLogsFilter(prev => ({ ...prev, day: e.target.value }))}
                            className="neu-input"
                        />
                        <button
                            onClick={handleLogsSubmit}
                            disabled={loading.logs}
                            className="neu-button bg-primary-500 text-white hover:bg-primary-600"
                        >
                            {loading.logs ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t('common.submit')
                            )}
                        </button>
                    </div>
                </div>

                {logs.length > 0 && (
                    <div className="space-y-4">
                        {/* table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neu-light-shadow/20 dark:border-neu-dark-shadow/20">
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text text-sm">#</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text text-sm">{t('logs.timestamp')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text text-sm">{t('logs.device')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text text-sm">{t('logs.code')}</th>
                                        <th className="p-3 text-left text-neu-light-text dark:text-neu-dark-text text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, idx) => (
                                        <tr key={log.id} className="border-b border-neu-light-shadow/10 dark:border-neu-dark-shadow/10 even:bg-black/5 dark:even:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            <td className="p-3 text-neu-light-text dark:text-neu-dark-text text-sm">{(logsPage - 1) * logsPerPage + idx + 1}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold font-mono">
                                                    {(() => {
                                                        const d = new Date(log.timestamp);
                                                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                                                    })()}
                                                </span>
                                            </td>
                                            <td className="p-3 text-neu-light-text dark:text-neu-dark-text text-sm">{log.device_id}</td>
                                            <td className="p-3 text-neu-light-text dark:text-neu-dark-text text-sm font-mono">{log.code}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${!log.error_code
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-red-600 text-white'
                                                    }`}>
                                                    {!log.error_code ? 'SUCCESS' : log.error_code}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* pagination */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={!logsPagination.has_prev}
                                    onClick={() => setLogsPage(p => p - 1)}
                                    className="p-1.5 rounded bg-neu-light-bg dark:bg-neu-dark-bg disabled:opacity-50 hover:bg-neu-light-bg/50 dark:hover:bg-neu-dark-bg/50 transition-colors text-neu-light-text dark:text-neu-dark-text"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-neu-light-text dark:text-neu-dark-text">
                                    {logsPage} / {logsPagination.total_pages}
                                </span>
                                <button
                                    disabled={!logsPagination.has_next}
                                    onClick={() => setLogsPage(p => p + 1)}
                                    className="p-1.5 rounded bg-neu-light-bg dark:bg-neu-dark-bg disabled:opacity-50 hover:bg-neu-light-bg/50 dark:hover:bg-neu-dark-bg/50 transition-colors text-neu-light-text dark:text-neu-dark-text"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neu-light-text dark:text-neu-dark-text">{t('common.perPage')}:</span>
                                {[10, 20, 50].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => { setLogsPerPage(size); setLogsPage(1); }}
                                        className={`px-3 py-1 rounded-neu text-sm transition-all ${logsPerPage === size
                                            ? 'bg-primary-500 text-white shadow-neu-sm'
                                            : 'text-neu-light-text dark:text-neu-dark-text hover:shadow-neu-sm dark:hover:shadow-neu-dark-sm'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attendance Chart */}
                        <div className="mt-8 border-t border-neu-light-shadow/10 dark:border-neu-dark-shadow/10 pt-6">
                            <LogsLineChart month={logsFilter.month} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneralTab;
