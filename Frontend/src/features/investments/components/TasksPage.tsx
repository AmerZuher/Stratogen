import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { TaskResponse, InvestmentsService, TaskCreate, TaskUpdate, UserResponse, InvestmentResponse, AuthenticationService, UserSummary } from '@/api';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal'
import { useAuth } from '@/providers/AuthContext';
import { Plus, Loader2, AlertTriangle, CheckCircle, Clock, PlayCircle, PauseCircle, Trash2, CheckSquare } from 'lucide-react';

interface TasksPageProps {
    investmentId: number;
}

// Helper to get status styles
const getStatusStyles = (status?: string | null) => {
    switch (status) {
        case 'Not Started':
            return { icon: Clock, color: 'var(--text-primary)', bgColor: 'var(--muted)' };
        case 'In Progress':
            return { icon: PlayCircle, color: 'var(--primary)', bgColor: 'var(--primary-muted)' };
        case 'Completed':
            return { icon: CheckCircle, color: 'var(--success)', bgColor: 'var(--success-muted)' };
        case 'On Hold':
            return { icon: PauseCircle, color: 'var(--warning)', bgColor: 'var(--warning-muted)' };
        default:
            return { icon: Clock, color: 'var(--text-primary)', bgColor: 'var(--muted)' };
    }
};

export const TasksPage: React.FC<TasksPageProps> = ({ investmentId }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [investment, setInvestment] = useState<InvestmentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

    const fetchData = useCallback(async () => {
        if (!investmentId) return;
        try {
            setIsLoading(true);
            const [taskData, investmentData] = await Promise.all([
                InvestmentsService.getInvestmentTasksApiInvestmentsInvestmentIdTasksGet({ investmentId }),
                InvestmentsService.getInvestmentApiInvestmentsInvestmentIdGet({ investmentId })
            ]);
            setTasks(taskData);
            setInvestment(investmentData);
        } catch (err: any) {
            setError(err.message || "Failed to fetch data.");
        } finally {
            setIsLoading(false);
        }
    }, [investmentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (task: TaskResponse | null = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = async (taskData: TaskCreate | TaskUpdate, investmentIdForCreate?: number) => {
        try {
            if (editingTask) {
                await InvestmentsService.updateTaskApiInvestmentsTasksTaskIdPut({
                    taskId: editingTask.id,
                    requestBody: taskData as TaskUpdate,
                });
            } else {
                await InvestmentsService.createTaskApiInvestmentsInvestmentIdTasksPost({
                    investmentId: investmentIdForCreate || investmentId,
                    requestBody: taskData as TaskCreate,
                });
            }
            await fetchData(); // Refresh list
            handleCloseModal();
        } catch (err: any) {
            console.error("Failed to save task:", err);
            alert("Failed to save task. Please check the console for details.");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await InvestmentsService.deleteTaskApiInvestmentsTasksTaskIdDelete({ taskId });
                await fetchData(); // Refresh list
            } catch (err: any) {
                console.error("Failed to delete task:", err);
                alert("Failed to delete task.");
            }
        }
    };

    const handleTaskClick = (taskId: number) => {
        navigate(`/tasks/${taskId}`);
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A';
        return format(parseISO(dateStr), 'MMM d, yyyy');
    };

    return (
        <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Project Tasks</h3>
                {currentUser && currentUser.is_superuser && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                        <Plus size={16} />
                        New Task
                    </button>
                )}
            </div>

            {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>}
            {error && <div className="text-center py-10" style={{ color: 'var(--destructive)' }}><AlertTriangle className="mx-auto mb-2" />{error}</div>}

            {!isLoading && !error && tasks.length === 0 && (
                <div className="text-center py-10" style={{ color: 'var(--text-primary)' }}>
                    <CheckSquare className="mx-auto h-10 w-10" />
                    <p className="mt-2">No tasks have been created yet.</p>
                </div>
            )}

            {!isLoading && !error && tasks.length > 0 && (
                <div className="space-y-4">
                    {tasks.map(task => {
                        const { icon: Icon, color, bgColor } = getStatusStyles(task.status);
                        return (
                            <div
                                key={task.id}
                                className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                                style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
                                onClick={() => handleTaskClick(task.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">{task.name}</h4>
                                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                            Owner: {users.find(u => u.id === task.owner_id)?.username || 'Unassigned'}
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: bgColor, color: color }}>
                                        <Icon size={14} />
                                        {task.status}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>{task.description}</p>
                                <div className="mt-4 flex justify-between items-center text-sm" style={{ color: 'var(--text-primary)' }}>
                                    <span>Start: {formatDate(task.start_date)}</span>
                                    <span>Finish: {formatDate(task.end_date)}</span>
                                    <div className="flex items-center gap-2">
                                        {currentUser && currentUser.is_superuser && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTask(task.id);
                                                }}
                                                className="p-2 hover:bg-[var(--destructive-muted)] rounded-md"
                                                style={{ color: 'var(--destructive)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <CreateTaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleSaveTask}
                    investments={investment ? [investment] : []}
                    currentUser={currentUser} users={[]} 
                />

            )}

        </div>
    );
};
