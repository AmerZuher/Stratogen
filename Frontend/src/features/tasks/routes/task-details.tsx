import { InvestmentsService, TaskResponse, InvestmentResponse, UserResponse } from '@/api';
import { useAuth } from '@/providers/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertTriangle,
    Lightbulb,
    Briefcase,
    FileText,
    TrendingUp,
    Building2
} from 'lucide-react';

type TaskUpdate = Partial<Omit<TaskResponse, 'id' | 'created_at' | 'investment_id'>>;

const GetInvestmentIcon = ({ type }: { type: string }) => {
    const iconProps = { size: 18, className: "text-gray-500" };
    switch (type) {
        case 'IDEA': return <Lightbulb {...iconProps} />;
        case 'PROJECT': return <Briefcase {...iconProps} />;
        case 'SME': return <Building2 {...iconProps} />;
        case 'RFP': return <FileText {...iconProps} />;
        case 'KPI': return <TrendingUp {...iconProps} />;
        default: return <Briefcase {...iconProps} />;
    }
};

export default function TaskDetailsPage() {
    const { user: currentUser } = useAuth() as { user: UserResponse | null };
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const taskIdNum = Number(id);

    const [task, setTask] = useState<TaskResponse | null>(null);
    const [investment, setInvestment] = useState<InvestmentResponse | null>(null);
    const [editedTask, setEditedTask] = useState<TaskUpdate>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fields are read-only if the user is not a superuser and not the task owner.
    const isReadOnly = !currentUser?.is_superuser && currentUser?.id !== task?.owner_id;

    const taskStatusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

    const loadTaskDetails = useCallback(async () => {
        try {
            setIsLoading(true);
            const taskData = await InvestmentsService.getTaskApiInvestmentsTasksTaskIdGet({ taskId: taskIdNum });
            const investmentData = await InvestmentsService.getInvestmentApiInvestmentsInvestmentIdGet({ investmentId: taskData.investment_id });
            setTask(taskData);
            setInvestment(investmentData);
            // Populate the form with fetched data
            setEditedTask({
                name: taskData.name,
                description: taskData.description,
                status: taskData.status,
                start_date: taskData.start_date,
                end_date: taskData.end_date,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load task details.');
        } finally {
            setIsLoading(false);
        }
    }, [taskIdNum]);

    useEffect(() => {
        loadTaskDetails();
    }, [loadTaskDetails]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Format date to ISO string for API consistency
        setEditedTask(prev => ({ ...prev, [name]: value ? new Date(value).toISOString() : null }));
    };

    const handleSaveChanges = async () => {
        if (!task) return;
        setIsSaving(true);
        try {
            await InvestmentsService.updateTaskApiInvestmentsTasksTaskIdPut({
                taskId: task.id,
                requestBody: editedTask,
            });
            await loadTaskDetails(); // Refresh data after saving
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>;
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center p-4" style={{ color: 'var(--destructive)' }}>
                <AlertTriangle className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-xl font-semibold">Failed to load task</h3>
                <p className="mt-2 text-sm">{error}</p>
            </div>
        );
    }

    if (!task || !investment) {
        return <div className="text-center py-20">Task not found.</div>;
    }

    return (
        <div className="max-w-screen-lg mx-auto p-6" style={{ color: 'var(--foreground)' }}>
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-semibold"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        <ArrowLeft size={16} /> Back to your tasks
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving || isReadOnly}
                        className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--text-secondary)' }}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Task Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-1">Task Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={editedTask.name || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Description:</label>
                        <textarea
                            name="description"
                            value={editedTask.description || ''}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full rounded-lg border p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                {/* Details Table */}
                <div className="border-t mt-6 pt-6 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--muted)' }}>
                                <th className="p-3 text-left">Investment</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Start Date</th>
                                <th className="p-3 text-left">Due Date</th>
                                <th className="p-3 text-left">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t" style={{ borderColor: 'var(--border)' }}>
                                <td className="p-3 flex items-center gap-2">
                                    <GetInvestmentIcon type={investment.type} /> {investment.name}
                                </td>
                                <td className="p-3">
                                    <select
                                        name="status"
                                        value={editedTask.status || ''}
                                        onChange={handleInputChange}
                                        className="rounded-md border p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                                        disabled={isReadOnly}
                                    >
                                        {taskStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="p-3">
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={(editedTask.start_date || '').split('T')[0]}
                                        onChange={handleDateChange}
                                        className="rounded-md border p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                                        disabled={isReadOnly}
                                    />
                                </td>
                                <td className="p-3">
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={(editedTask.end_date || '').split('T')[0]}
                                        onChange={handleDateChange}
                                        className="rounded-md border p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                                        disabled={isReadOnly}
                                    />
                                </td>
                                <td className="p-3">{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

