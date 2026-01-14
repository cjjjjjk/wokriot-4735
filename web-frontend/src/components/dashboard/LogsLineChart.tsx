import React, { useEffect, useState } from 'react';
import { getWorkedMonth } from '../../services/api';

interface LogsLineChartProps {
    month: string;
}

const LogsLineChart: React.FC<LogsLineChartProps> = ({ month }) => {
    const [stats, setStats] = useState<{ day: number; count: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!month) return;
            setLoading(true);
            try {
                const res = await getWorkedMonth(month);
                if (!res) return;

                const [y, m] = month.split('-').map(Number);
                const daysInMonth = new Date(y, m, 0).getDate();
                const workedDays = res.worked_days || [];

                const dailyCounts = Array.from({ length: daysInMonth }, (_, i) => {
                    const dayNum = i + 1;
                    const dayData = workedDays.find((d: any) => {
                        const date = new Date(d.date);
                        return date.getDate() === dayNum;
                    });
                    const count = dayData && dayData.times ? dayData.times.length * 2 : 0;
                    return { day: dayNum, count };
                });
                setStats(dailyCounts);
            } catch (err) {
                console.error('Chart fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [month]);

    if (loading) return <div className="h-40 w-full flex items-center justify-center text-xs text-neu-light-text/50">Loading chart...</div>;
    if (stats.length === 0) return null;

    // Chart Dimensions (Virtual)
    const CHART_WIDTH = 1000;
    const CHART_HEIGHT = 200;
    const PADDING_TOP = 20;
    const PADDING_BOTTOM = 30;
    const PADDING_LEFT = 30;
    const PADDING_RIGHT = 20;

    // Data Ranges
    const maxCount = Math.max(Math.max(...stats.map(s => s.count)), 4); // Min max is 4 to avoid flat line at 0
    const xStep = (CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT) / (stats.length - 1);

    // Scale Helpers
    const getX = (index: number) => PADDING_LEFT + index * xStep;
    const getY = (count: number) => CHART_HEIGHT - PADDING_BOTTOM - (count / maxCount) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);

    // Generate Points
    const points = stats.map((s, i) => `${getX(i)},${getY(s.count)}`).join(' ');

    // Generate Area Path (start bottom-left, go to points, end bottom-right)
    const areaPath = `
        M ${getX(0)},${CHART_HEIGHT - PADDING_BOTTOM} 
        ${points.replace(/ /g, ' L ')} 
        L ${getX(stats.length - 1)},${CHART_HEIGHT - PADDING_BOTTOM} 
        Z
    `;

    return (
        <div className="w-full">
            <h4 className="text-xs font-bold text-neu-light-text dark:text-neu-dark-text mb-2 opacity-70 uppercase flex justify-between">
                <span>Activity Overview</span>
                <span>{month}</span>
            </h4>

            <div className="w-full relative bg-neu-light-bg/50 dark:bg-neu-dark-bg/50 rounded-lg p-2 border border-neu-light-shadow/10 dark:border-neu-dark-shadow/10">
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-auto overflow-visible select-none">
                    {/* Grid Y (Horizontal) */}
                    {Array.from({ length: maxCount + 1 }).map((_, i) => {
                        const val = i;
                        const y = getY(val);
                        // Only draw lines for even integers or if range is small
                        if (maxCount > 10 && i % 2 !== 0) return null;

                        return (
                            <g key={`grid-y-${i}`}>
                                <line
                                    x1={PADDING_LEFT}
                                    y1={y}
                                    x2={CHART_WIDTH - PADDING_RIGHT}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    className="text-neu-light-text/10 dark:text-neu-dark-text/10"
                                />
                                <text
                                    x={PADDING_LEFT - 5}
                                    y={y}
                                    dy="3"
                                    textAnchor="end"
                                    className="text-[10px] fill-neu-light-text/60 dark:fill-neu-dark-text/60 font-mono"
                                >
                                    {val}
                                </text>
                            </g>
                        );
                    })}

                    {/* Grid X (Vertical) - Optional: Tick marks only */}
                    {stats.map((_, i) => (
                        <line
                            key={`tick-x-${i}`}
                            x1={getX(i)}
                            y1={CHART_HEIGHT - PADDING_BOTTOM}
                            x2={getX(i)}
                            y2={PADDING_TOP}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            className="text-neu-light-text/5 dark:text-neu-dark-text/5"
                        />
                    ))}

                    {/* Area Fill */}
                    <path d={areaPath} className="fill-primary-500/10 dark:fill-primary-400/10" />

                    {/* Main Line */}
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        points={points}
                        className="text-primary-500 drop-shadow-md"
                    />

                    {/* Dots and X Labels */}
                    {stats.map((s, i) => (
                        <g key={s.day} className="group">
                            {/* X Label */}
                            <text
                                x={getX(i)}
                                y={CHART_HEIGHT - PADDING_BOTTOM + 15}
                                textAnchor="middle"
                                className="text-[10px] fill-neu-light-text/70 dark:fill-neu-dark-text/70 font-mono"
                            >
                                {s.day}
                            </text>

                            {/* Hover Interaction Area (invisible rect for better UX) */}
                            <rect
                                x={getX(i) - (xStep / 2)}
                                y={0}
                                width={xStep}
                                height={CHART_HEIGHT}
                                fill="transparent"
                                className="cursor-pointer"
                            />

                            {/* Dot */}
                            <circle
                                cx={getX(i)}
                                cy={getY(s.count)}
                                r={s.count > 0 ? 3 : 2}
                                className={`stroke-2 transition-all duration-200 group-hover:r-5
                                    ${s.count > 0
                                        ? 'fill-white dark:fill-neu-dark-bg stroke-primary-500'
                                        : 'fill-neu-light-text/20 dark:fill-neu-dark-text/20 stroke-transparent'
                                    }`}
                            />

                            {/* Tooltip Value (Always visible on hover) */}
                            {s.count > 0 && (
                                <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <rect
                                        x={getX(i) - 10}
                                        y={getY(s.count) - 25}
                                        width="20"
                                        height="16"
                                        rx="4"
                                        fill="currentColor"
                                        className="text-neu-dark-bg dark:text-neu-light-bg"
                                    />
                                    <text
                                        x={getX(i)}
                                        y={getY(s.count) - 14}
                                        textAnchor="middle"
                                        className="text-[10px] fill-white dark:fill-black font-bold"
                                    >
                                        {s.count}
                                    </text>
                                </g>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            <div className="flex justify-between items-center mt-2 text-[10px] text-neu-light-text/50 dark:text-neu-dark-text/50 px-2">
                <span>Day of Month</span>
                <span>Log Counts</span>
            </div>
        </div>
    );
};

export default LogsLineChart;
