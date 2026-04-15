import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ListTodo, CheckCircle, Clock, XCircle, Loader2, AlertTriangle, User,
    Briefcase, Calendar, Info, Plus, Lightbulb, FolderKanban, Building2,
    FileText, TrendingUp, ArrowUpDown
} from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';

import {
    InvestmentsService,
    AuthenticationService,
    TaskResponse,
    UserResponse,
    InvestmentResponse,
    TaskCreate
} from '@/api';

// Define the types for sorting
type SortKey = 'name' | 'status' | 'investment_type' | 'created_at' | 'start_date' | 'end_date';
type SortOrder = 'asc' | 'desc';


// ---- Helper Component for Displaying Dates ----
const DateDisplay = ({ label, date, icon: Icon }: { label: string, date: string | null | undefined, icon: React.ElementType }) => {
    if (!date) return null;
    return (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
            <Icon size={14} />
            <span>{label}: {new Date(date).toLocaleDateString()}</span>
        </div>
    );
};

// ---- Status Badge Component ----
const StatusBadge = ({ status }: { status: string | null | undefined }) => {
    const currentStatus = status || 'Not Started';
    let colorClass, Icon;
    switch (currentStatus.toLowerCase()) {
        case 'not started': colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'; Icon = ListTodo; break;
        case 'in progress': colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'; Icon = Clock; break;
        case 'completed': colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; Icon = CheckCircle; break;
        case 'on hold': colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; Icon = XCircle; break;
        default: colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'; Icon = ListTodo;
    }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
            <Icon size={12} />
            {currentStatus}
        </span>
    );
};

// ---- Investment Type Helpers ----
const getInvestmentIcon = (type: string | undefined) => {
    const iconProps = { size: 14, className: 'flex-shrink-0' };
    switch (type) {
        case 'IDEA': return <Lightbulb {...iconProps} />;
        case 'PROJECT': return <FolderKanban {...iconProps} />;
        case 'SME': return <Building2 {...iconProps} />;
        case 'RFP': return <FileText {...iconProps} />;
        case 'KPI': return <TrendingUp {...iconProps} />;
        default: return <Briefcase {...iconProps} />;
    }
};

const getInvestmentPath = (investment: InvestmentResponse | undefined): string => {
    if (!investment) return '/';
    const { id, type } = investment;
    switch (type) {
        case 'PROJECT': return `/projects/${id}`;
        case 'IDEA': return `/ideas/${id}`;
        case 'SME': return `/smes/${id}`;
        case 'RFP': return `/rfps/${id}`;
        case 'KPI': return `/kpis/${id}`;
        default: return `/investments/${id}`; // Fallback path
    }
};


// ---- Main Tasks Page Component ----
export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [investments, setInvestments] = useState<InvestmentResponse[]>([]);
    const [investmentsMap, setInvestmentsMap] = useState<Map<number, InvestmentResponse>>(new Map());
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for sorting
    const [sortKey, setSortKey] = useState<SortKey>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const tasksData = await InvestmentsService.getMyTasksApiInvestmentsTasksMyTasksGet();
            setTasks(tasksData);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            setError("Could not load your assigned tasks.");
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const userData = await AuthenticationService.readUsersMeApiAuthMeGet();
                setCurrentUser(userData);

                const investmentsData = await InvestmentsService.getInvestmentsApiInvestmentsGet({});
                setInvestments(investmentsData);
                setInvestmentsMap(new Map(investmentsData.map(inv => [inv.id, inv])));

                await fetchTasks();

            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred while fetching your data.');
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, []);

    // Memoized sorting logic
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            let aValue, bValue;

            if (sortKey === 'investment_type') {
                aValue = investmentsMap.get(a.investment_id)?.type;
                bValue = investmentsMap.get(b.investment_id)?.type;
            } else {
                aValue = a[sortKey];
                bValue = b[sortKey];
            }

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (['created_at', 'start_date', 'end_date'].includes(sortKey)) {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                comparison = dateA - dateB;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [tasks, sortKey, sortOrder, investmentsMap]);

    const handleCreateTask = async (taskData: TaskCreate, investmentId: number) => {
        try {
            await InvestmentsService.createTaskApiInvestmentsInvestmentIdTasksPost({
                investmentId: investmentId,
                requestBody: taskData,
            });
            await fetchTasks();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create task", err);
            setError("Failed to create the task. Please try again.");
        }
    };

    const handleInvestmentClick = (e: React.MouseEvent, investmentId: number) => {
        e.stopPropagation();
        const investment = investmentsMap.get(investmentId);
        if (investment) {
            navigate(getInvestmentPath(investment));
        }
    };

    const handleTaskClick = (taskId: number) => {
        navigate(`/tasks/${taskId}`);
    };

    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
        if (error) return <div className="text-center py-20 text-red-500"><AlertTriangle className="mx-auto h-10 w-10" /><h3 className="mt-2">Failed to load tasks</h3><p>{error}</p></div>;
        if (tasks.length === 0) return <div className="text-center py-20"><ListTodo className="mx-auto h-10 w-10" /><h3>No Tasks Assigned to You</h3></div>;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedTasks.map(task => {
                    const investment = investmentsMap.get(task.investment_id);
                    return (
                        <div
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className="p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between cursor-pointer"
                            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
                        >
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-4">
                                    <h3 className="text-lg font-semibold line-clamp-2">{task.name}</h3>
                                    <StatusBadge status={task.status} />
                                </div>
                                <div
                                    onClick={(e) => handleInvestmentClick(e, task.investment_id)}
                                    className="flex items-center gap-2 text-sm font-medium mb-2 hover:underline cursor-pointer"
                                    style={{ color: 'var(--accent-color)' }}
                                >
                                    {getInvestmentIcon(investment?.type)}
                                    <span>{investment?.name || `Investment #${task.investment_id}`}</span>
                                </div>
                                <p className="text-sm line-clamp-3 mb-4">{task.description || 'No description provided.'}</p>
                            </div>
                            <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                                    <User size={14} />
                                    <span>
                                        Owner: {task.owner_id === currentUser?.id
                                            ? currentUser?.username
                                            : (task.owner_id ? `User #${task.owner_id}` : 'Unassigned')}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <DateDisplay label="Created" date={task.created_at} icon={Info} />
                                    <DateDisplay label="Starts" date={task.start_date} icon={Calendar} />
                                    <DateDisplay label="Due" date={task.end_date} icon={Calendar} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <>
            <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
                <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <select
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as SortKey)}
                                className="p-2 rounded-lg text-sm"
                                style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}
                            >
                                <option value="created_at">Sort by Created Date</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                                <option value="investment_type">Sort by Investment Type</option>
                                <option value="start_date">Sort by Start Date</option>
                                <option value="end_date">Sort by End Date</option>
                            </select>
                            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}>
                                <ArrowUpDown size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-primary)' }}
                        >
                            <Plus size={16} /> New Task
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </div>
            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateTask}
                investments={investments}
                currentUser={currentUser} users={[]} />
        </>
    );
}
