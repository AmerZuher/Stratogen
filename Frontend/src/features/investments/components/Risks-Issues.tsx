import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskIssue, RisksIssuesService, RiskIssueType, RiskIssueCreate, PriorityLevel } from '@/api';
import { Plus, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';

// Define the props interface for the component
interface RisksAndIssuesPageProps {
    investmentId: number;
}

type SortKey = 'name' | 'type' | 'priority' | 'impact' | 'score' | 'created_at';
type SortOrder = 'asc' | 'desc';

export const RisksAndIssuesPage: React.FC<RisksAndIssuesPageProps> = ({ investmentId }) => {
    const { user: currentUser, token } = useAuth() as { user: { id: number; is_superuser: boolean; } | null, token: string | null };

    const [items, setItems] = useState<RiskIssue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for sorting
    const [sortKey, setSortKey] = useState<SortKey>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // State for the create item modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItemData, setNewItemData] = useState<RiskIssueCreate>({
        name: '',
        type: RiskIssueType.ISSUE,
        category: '', // Added category
        priority: PriorityLevel.MEDIUM,
        impact: 3,
        score: 0,
    });

    const navigate = useNavigate();

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await RisksIssuesService.readRisksIssuesForInvestmentApiRisksIssuesInvestmentsInvestmentIdGet({
                investmentId: investmentId,
            });
            setItems(response);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch items:", err);
            setError("Failed to load risks and issues. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [investmentId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Memoized sorting logic
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            // Handle null or undefined values, sorting them to the bottom
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [items, sortKey, sortOrder]);


    const handleRowClick = (itemId: number) => {
        navigate(``);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewItemData(prev => ({ ...prev, [name]: name === 'impact' || name === 'score' ? parseInt(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await RisksIssuesService.createRiskIssueForInvestmentApiRisksIssuesInvestmentsInvestmentIdPost({
                investmentId,
                requestBody: newItemData,
            });
            setIsModalOpen(false);
            fetchItems();
        } catch (err) {
            console.error("Failed to create item:", err);
            setError("Failed to create item. Please check the details and try again.");
        }
    };

    if (loading) return <div>Loading items...</div>;
    if (error) return <div style={{ color: 'var(--destructive)' }}>{error}</div>;

    return (
        <div className="p-6 rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', border: '1px solid var(--border)' }}

                    >
                        <option value="created_at">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="type">Sort by Type</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="impact">Sort by Impact</option>
                        <option value="score">Sort by Score</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                        <ArrowUpDown size={20} />
                    </button>
                </div>
                {currentUser && currentUser.is_superuser && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                        <Plus size={16} />
                        Create New
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full rounded-lg" style={{ backgroundColor: 'var(--card)' }}>
                    <thead style={{ backgroundColor: 'var(--muted)' }}>
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold">Name</th>
                            <th className="p-4 text-left text-sm font-semibold">Type</th>
                            <th className="p-4 text-left text-sm font-semibold">Category</th>
                            <th className="p-4 text-left text-sm font-semibold">Priority</th>
                            <th className="p-4 text-left text-sm font-semibold">Impact</th>
                            <th className="p-4 text-left text-sm font-semibold">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.length > 0 ? sortedItems.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b cursor-pointer"
                                style={{ borderColor: 'var(--border)' }}
                                onClick={() => handleRowClick(item.id)}
                            >
                                <td className="p-4">{item.name}</td>
                                <td className="p-4">{item.type}</td>
                                <td className="p-4">{item.category || 'N/A'}</td>
                                <td className="p-4">{item.priority || 'N/A'}</td>
                                <td className="p-4">{item.impact || 'N/A'}</td>
                                <td className="p-4 font-bold">{item.score ?? 'N/A'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="p-4 text-center">No risks or issues found for this project.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                        <h3 className="text-lg font-bold mb-4">Create New Risk or Issue</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <input type="text" name="name" placeholder="Item Name" value={newItemData.name} onChange={handleInputChange} className="mt-1 w-full p-2 rounded" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }} required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <select name="type" value={newItemData.type} onChange={handleInputChange} className="mt-1 w-full p-2 rounded" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}>
                                        <option value={RiskIssueType.RISK}>Risk</option>
                                        <option value={RiskIssueType.ISSUE}>Issue</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <input type="text" name="category" placeholder="Category (optional)" value={newItemData.category || ''} onChange={handleInputChange} className="mt-1 w-full p-2 rounded" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Priority</label>
                                    <select name="priority" value={newItemData.priority || ''} onChange={handleInputChange} className="mt-1 w-full p-2 rounded" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}>
                                        <option value={PriorityLevel.HIGH}>High</option>
                                        <option value={PriorityLevel.MEDIUM}>Medium</option>
                                        <option value={PriorityLevel.LOW}>Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Impact (1-5)</label>
                                    <input type="number" name="impact" placeholder="Impact" min="1" max="5" value={newItemData.impact || ''} onChange={handleInputChange} className="mt-1 w-full p-2 rounded" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Score</label>
                                    <input type="number" name="score" placeholder="Score" min="0" value={newItemData.score || ''} onChange={handleInputChange} className="mt-1 w-full p-2 rounded" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
