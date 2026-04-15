import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Label } from 'recharts';
import { format, parseISO, differenceInDays } from 'date-fns';
import type { DisplayableProjectType } from '@/features/investments/types';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';

interface StatusPageProps {
    project: DisplayableProjectType;
    onChange: (field: keyof DisplayableProjectType, value: any) => void;
}
// A utility to clamp a number between a min and max value.
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(n, max));

// A reusable stat card component
const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="p-3 rounded-full mr-4" style={{ backgroundColor: color, color: 'white' }}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

// A reusable component for financial or effort stats
const MetricDisplay: React.FC<{ label: string; planned?: number | null; actual?: number | null; unit: string }> = ({ label, planned = 0, actual = 0, unit }) => {
    const variance = (actual || 0) - (planned || 0);
    const getVarianceColor = () => {
        if (variance > 0) return 'var(--destructive)';
        if (variance < 0) return 'var(--success)';
        return 'var(--text-primary)';
    };

    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold">{`${(actual || 0).toLocaleString()}${unit}`}</p>
                <p className="text-sm text-muted-foreground">/ ${(planned || 0).toLocaleString()}${unit} Planned</p>
            </div>
            <p className="text-xs mt-1" style={{ color: getVarianceColor() }}>
                {variance !== 0 ? `${Math.abs(variance).toLocaleString()}${unit} ${variance > 0 ? 'over' : 'under'} budget` : 'On budget'}
            </p>
        </div>
    );
};

export const StatusPage: React.FC<StatusPageProps> = ({ project, onChange }) => {
    // Determine if the fields should be read-only based on user permissions.
    const { user: currentUser } = useAuth() as { user: { id: number; is_superuser: boolean; } | null, token: string | null };
    const isReadOnly = currentUser?.is_superuser === false;

    const progress = clamp(project.progress || 0);
    const progressData = [
        { name: 'Done', value: progress },
        { name: 'Remaining', value: 100 - progress },
    ];

    const start = project.start_date ? parseISO(project.start_date) : new Date();
    let end = project.end_date ? parseISO(project.end_date) : start;
    if (end < start) end = start;
    const today = new Date();

    const timelineData = [{ name: project.name, range: [start.getTime(), end.getTime()] }];
    const durationInDays = differenceInDays(end, start);
    const daysRemaining = differenceInDays(end, today);
    const axisPadding = durationInDays * 0.15 * (24 * 60 * 60 * 1000);
    const domainMin = start.getTime() - axisPadding;
    const domainMax = end.getTime() + axisPadding;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { range } = payload[0].payload;
            const startDate = new Date(range[0]);
            const endDate = new Date(range[1]);
            return (
                <div className="p-3 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Duration: {differenceInDays(endDate, startDate)} days</p>
                </div>
            );
        }
        return null;
    };

    const TodayLabel = ({ viewBox }: any) => {
        const { x, y } = viewBox;
        return (
            <g>
                <text x={x} y={y - 10} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight="bold">
                    Today: {format(today, 'MMM d')}
                </text>
            </g>
        );
    };

    return (
        <div className="space-y-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Calendar} label="Start Date" value={format(start, 'MMM d, yyyy')} color="var(--primary)" />
                <StatCard icon={CheckCircle} label="Finish Date" value={format(end, 'MMM d, yyyy')} color="var(--primary)" />
                <StatCard icon={Clock} label="Days Remaining" value={`${daysRemaining > 0 ? daysRemaining : 0}`} color="var(--primary)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Timeline Chart */}
                    <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card)' }}>
                        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" domain={[domainMin, domainMax]} tickFormatter={(tick) => format(new Date(tick), 'MMM d')} stroke="var(--text-primary)" fontSize={12} />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                                    <Bar dataKey="range" barSize={35} radius={[10, 10, 10, 10]}>
                                        <Cell fill="url(#progressGradientStatus)" />
                                    </Bar>
                                    <defs>
                                        <linearGradient id="progressGradientStatus" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset={`${progress}%`} stopColor="var(--primary)" />
                                            <stop offset={`${progress}%`} stopColor="var(--muted)" />
                                        </linearGradient>
                                    </defs>
                                    <ReferenceLine x={today.getTime()} stroke="var(--text-primary)" strokeDasharray="3 3" strokeWidth={1.5}>
                                        <Label content={<TodayLabel />} position="top" />
                                    </ReferenceLine>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Financials & Effort */}
                    <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card)' }}>
                        <h3 className="text-lg font-semibold mb-6">Financials & Effort</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MetricDisplay
                                label="Cost"
                                planned={project.planned_cost ? Number(project.planned_cost) : null}
                                actual={project.actual_cost ? Number(project.actual_cost) : null}
                                unit=" $"
                            />
                            <MetricDisplay
                                label="Effort"
                                planned={project.planned_effort ? Number(project.planned_effort) : null}
                                actual={project.actual_effort ? Number(project.actual_effort) : null}
                                unit=" hrs"
                            />

                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    {/* Status & Progress */}
                    <div className="p-6 rounded-2xl shadow-sm border flex flex-col items-center" style={{ backgroundColor: 'var(--card)' }}>
                        <h3 className="text-lg font-semibold mb-4">Status & Progress</h3>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={progressData} innerRadius={65} outerRadius={85} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                                        {progressData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={idx === 0 ? 'var(--primary)' : 'var(--muted)'} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '2.2rem' }}>
                                {progress}%
                                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'normal' }}>Complete</span>
                            </div>
                        </div>
                        <div className="mt-6 w-full space-y-4">
                            <div>
                                <label htmlFor="progress-slider" className="block text-sm font-medium mb-1">Progress (%)</label>
                                <input
                                    id="progress-slider"
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={progress}
                                    onChange={(e) => onChange('progress', parseInt(e.target.value))}
                                    className="w-full h-2 rounded-lg accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isReadOnly}
                                />
                                <p className="text-sm text-right mt-1">{progress}%</p>
                            </div>



                            <div>
                                <label htmlFor="status-select" className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    id="status-select"
                                    value={project.status || 'Active'}
                                    onChange={(e) => onChange('status', e.target.value)}
                                    className="w-full p-3 rounded-xl appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    disabled={isReadOnly}
                                >
                                    <option>Active</option>
                                    <option>On Hold</option>
                                    <option>Completed</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
