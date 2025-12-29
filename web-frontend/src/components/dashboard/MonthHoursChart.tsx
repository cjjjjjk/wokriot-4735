import React from 'react';

interface WorkedDayData {
    date: string;
    times: [string, string][];
    total_times: number;
    type: number;
    ot_times: [string, string][];
}

interface MonthHoursChartProps {
    month: string;
    data: WorkedDayData[];
}

const MonthHoursChart: React.FC<MonthHoursChartProps> = ({ month, data }) => {
    if (!month) return null;

    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();

    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const dayData = (data || []).find((d: any) => {
            const date = new Date(d.date);
            return date.getDate() === dayNum;
        });
        return { day: dayNum, hours: dayData ? (dayData.total_times || 0) : 0 };
    });

    const maxHours = 14;

    // Virtual Layout for Scale
    const CHART_WIDTH = 1000;
    const CHART_HEIGHT = 200;
    const PADDING_TOP = 40;
    const PADDING_BOTTOM = 30;
    const PADDING_LEFT = 40;
    const PADDING_RIGHT = 20;

    const availableWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const stepX = availableWidth / daysInMonth; // Width per day slot
    const barWidth = stepX * 0.65; // Bar takes 65% of slot

    const getY = (h: number) => {
        const effectiveH = Math.min(h, maxHours);
        return CHART_HEIGHT - PADDING_BOTTOM - (effectiveH / maxHours) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
    };

    const bottomY = CHART_HEIGHT - PADDING_BOTTOM;

    return (
        <div className="w-full mt-6 border-t border-neu-light-shadow/10 dark:border-neu-dark-shadow/10 pt-6">
            <h4 className="text-sm font-bold text-neu-light-text dark:text-neu-dark-text mb-4 uppercase flex justify-between items-center tracking-wider opacity-80">
                <span>Monthly Hours</span>
                <span className="text-xs opacity-60">{month}</span>
            </h4>

            {/* Added stronger background, border, and shadow for distinction */}
            <div className="w-full relative bg-white/10 dark:bg-black/20 rounded-xl border border-neu-light-shadow/20 dark:border-neu-dark-shadow/20 p-4 shadow-sm">
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-auto overflow-visible select-none">

                    {/* Horizontal Grid (Hours) */}
                    {[0, 4, 8, 12].map(h => {
                        const y = getY(h);
                        const isZero = h === 0;
                        return (
                            <g key={`y-${h}`}>
                                <line
                                    x1={PADDING_LEFT}
                                    y1={y}
                                    x2={CHART_WIDTH - PADDING_RIGHT}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth={isZero ? "2" : "1"}
                                    // Increased opacity for clearer grid
                                    className={isZero ? "text-neu-light-text/60 dark:text-neu-dark-text/60" : "text-gray-300 dark:text-gray-700"}
                                />
                                <text
                                    x={PADDING_LEFT - 8}
                                    y={y}
                                    dy="3"
                                    textAnchor="end"
                                    className={`text-[12px] font-mono ${isZero ? "fill-neu-light-text dark:fill-neu-dark-text font-bold" : "fill-neu-light-text/60 dark:fill-neu-dark-text/60"}`}
                                >
                                    {h}h
                                </text>
                            </g>
                        );
                    })}

                    {/* Bars and Interactions */}
                    {chartData.map((d, i) => {
                        const xSlotStart = PADDING_LEFT + i * stepX;
                        const xCenter = xSlotStart + stepX / 2;
                        const xBar = xCenter - barWidth / 2;

                        const y = getY(d.hours);
                        const barHeight = bottomY - y;

                        let colorClass = "fill-neu-light-text/5 dark:fill-neu-dark-text/5";
                        if (d.hours >= 8) colorClass = "fill-blue-400 dark:fill-primary-400";
                        else if (d.hours >= 4) colorClass = "fill-primary-500 dark:fill-blue-400";
                        else if (d.hours > 0) colorClass = "fill-yellow-400 dark:fill-yellow-400";

                        const r = Math.min(barWidth / 3, barHeight);

                        const pathD = barHeight > 0 ? `
                              M ${xBar},${bottomY}
                              L ${xBar},${y + r}
                              Q ${xBar},${y} ${xBar + r},${y}
                              L ${xBar + barWidth - r},${y}
                              Q ${xBar + barWidth},${y} ${xBar + barWidth},${y + r}
                              L ${xBar + barWidth},${bottomY}
                              Z
                          ` : '';

                        return (
                            <g key={d.day} className="group">
                                <rect
                                    x={xSlotStart}
                                    y={PADDING_TOP}
                                    width={stepX}
                                    height={CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM}
                                    fill="transparent"
                                    className="cursor-pointer"
                                />

                                {barHeight > 0 && (
                                    <path
                                        d={pathD}
                                        className={`${colorClass} transition-all duration-200 group-hover:opacity-80`}
                                    />
                                )}

                                <text
                                    x={xCenter}
                                    y={CHART_HEIGHT - 10}
                                    textAnchor="middle"
                                    className="text-[10px] fill-neu-light-text/70 dark:fill-neu-dark-text/70 font-mono font-medium"
                                >
                                    {d.day}
                                </text>

                                {d.hours > 0 && (
                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <text
                                            x={xCenter}
                                            y={y - 6}
                                            textAnchor="middle"
                                            className="text-[12px] fill-neu-light-text dark:fill-neu-dark-text font-bold shadow-md drop-shadow-md"
                                        >
                                            {d.hours.toFixed(1)}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default MonthHoursChart;
