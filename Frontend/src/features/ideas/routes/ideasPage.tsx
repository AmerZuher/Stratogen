import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, CheckCircle, Clock, XCircle, Plus, Loader2, AlertTriangle, UserX, Link as LinkIcon, FileText, Zap, ArrowUpDown } from 'lucide-react';
import CreateIdeaModal from '../components/CreateIdeaModal';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import {
    InvestmentsService,
    AuthenticationService,
    InvestmentResponse,
    UserResponse,
    InvestmentCreate,
} from '@/api';

// Define the types for sorting
type SortKey = 'name' | 'status' | 'created_by_id' | 'last_modified';
type SortOrder = 'asc' | 'desc';


// ---- Helper: Truncate description text ----
const truncateDescription = (description: string | null | undefined, maxLength: number = 80): string => {
    if (!description) {
        return 'No description available.';
    }
    if (description.length <= maxLength) {
        return description;
    }
    return `${description.substring(0, maxLength)}...`;
};


// ---- Status Badge Component for Ideas ----
const StatusBadge = ({ status }: { status: string | null | undefined }) => {
    let colorClass, Icon;
    switch (status) {
        case 'DMNDSBMSN': colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'; Icon = Lightbulb; break;
        case 'ASSESMENT': colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; Icon = Clock; break;
        case 'CONVERTEDPRJ': colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; Icon = Zap; break;
        case 'CONVERTEDRFP': colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'; Icon = FileText; break;
        case 'COMPLETED': colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; Icon = CheckCircle; break;
        case 'CANCELLED': colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; Icon = UserX; break;
        default: colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'; Icon = XCircle;
    }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colorClass}`}>
            <Icon size={12} />
            {status || 'Unknown'}
        </span>
    );
};

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<InvestmentResponse[]>([]);
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for sorting
    const [sortKey, setSortKey] = useState<SortKey>('last_modified');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const navigate = useNavigate();

    const fetchAllIdeas = async () => {
        const investmentsList = await InvestmentsService.getInvestmentsApiInvestmentsGet({ investmentType: 'IDEA' });
        const ideasWithDetails = await Promise.all(
            investmentsList.map(async (investment) => {
                try {
                    const ideaDetails = await InvestmentsService.getIdeaApiInvestmentsInvestmentIdIdeaGet({ investmentId: investment.id });
                    return { ...investment, idea: ideaDetails };
                } catch (ideaError) {
                    console.error(`Failed to fetch details for idea ${investment.id}`, ideaError);
                    return investment;
                }
            })
        );
        setIdeas(ideasWithDetails);
    };

    useEffect(() => {
        const initialLoad = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const userData = await AuthenticationService.readUsersMeApiAuthMeGet();
                setCurrentUser(userData);
                await fetchAllIdeas();
            } catch (err: any) {
                console.error("Failed to load initial data:", err);
                setError(err.message || 'An unexpected error occurred while fetching data.');
            } finally {
                setIsLoading(false);
            }
        };
        initialLoad();
    }, []);

    // Memoized sorting logic
    const sortedIdeas = useMemo(() => {
        return [...ideas].sort((a, b) => {
            let aValue, bValue;

            if (sortKey === 'status') {
                aValue = a.idea?.status;
                bValue = b.idea?.status;
            } else {
                aValue = a[sortKey];
                bValue = b[sortKey];
            }

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (sortKey === 'last_modified') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                comparison = dateA - dateB;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [ideas, sortKey, sortOrder]);

    const handleCreateIdea = async (name: string) => {
        if (!currentUser) {
            setError("Your user session could not be verified. Please refresh and try again.");
            return;
        }
        try {
            const newIdeaRequest: InvestmentCreate = { name, type: 'IDEA' };
            await InvestmentsService.createInvestmentApiInvestmentsPost({ requestBody: newIdeaRequest });
            await fetchAllIdeas();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create idea", err);
            setError("Failed to create the idea. Please try again.");
        }
    };

    const handleRowClick = (id: number) => {
        navigate(`/ideas/${id}`);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--text-primary)' }} /></div>;
        }
        if (error) {
            return (
                <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="mx-auto h-10 w-10" />
                    <h3 className="mt-2 text-lg font-semibold">Failed to load ideas</h3>
                    <p className="text-sm">{error}</p>
                </div>
            );
        }
        if (ideas.length === 0) {
            return (
                <div className="text-center py-20" style={{ color: 'var(--text-prim)' }}>
                    <Lightbulb className="mx-auto h-10 w-10" />
                    <h3 className="mt-2 text-lg font-semibold">No Ideas Yet</h3>
                    <p className="text-sm">Click "New Idea" to get started.</p>
                </div>
            );
        }
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[25%]">Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedIdeas.map(investment => (
                        <TableRow
                            key={investment.id}
                            onClick={() => handleRowClick(investment.id)}
                            className="cursor-pointer"
                        >
                            <TableCell className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {investment.name}
                            </TableCell>
                            <TableCell
                                className="max-w-sm"
                                style={{ color: 'var(--text-primary)' }}
                                title={investment.idea?.description || 'No description available.'}
                            >
                                {truncateDescription(investment.idea?.description)}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={investment.idea?.status} />
                            </TableCell>
                            <TableCell style={{ color: 'var(--text-primary)' }}>
                                {currentUser?.id === investment.created_by_id ? currentUser.username : `User #${investment.created_by_id}`}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    to={`/ideas/${investment.id}`}
                                    className="font-medium hover:underline flex items-center gap-1 justify-end"
                                    style={{ color: '#4f46e5' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View Details
                                    <LinkIcon size={14} />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
                                <option value="last_modified">Sort by Last Updated</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                                <option value="created_by_id">Sort by Created By</option>
                            </select>
                            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}>
                                <ArrowUpDown size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-secondary)' }}
                        >
                            <Plus size={16} /> New Idea
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </div>
            <CreateIdeaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateIdea} />
        </>
    );
}
