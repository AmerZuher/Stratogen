import { constants } from 'buffer';
import { AlertTriangle, ArrowUpDown, Lightbulb, Loader2, Plus } from 'lucide-react';
import React, { useState, useMemo } from 'react';


type SortKey = 'last_modified' | 'name' | 'status' | 'created_by_id';
type KPI = {
    id: number;
    name: string;
    description: string;
    status: 'New' | 'In Progress' | 'Completed';
    created_by_id: string;
    last_modified: string;
};

// Main Component
function KpiPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>('last_modified');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const length = 0


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--text-primary)' }} />
                </div>
            );
        }

        if (error) {
            return (
                <div
                    className="text-center py-20 rounded-lg"
                    style={{ color: 'var(--destructive-foreground)', backgroundColor: 'var(--destructive)' }}
                >
                    <AlertTriangle className="mx-auto h-10 w-10" />
                    <h3 className="mt-2 text-lg font-semibold">Failed to load KPIs</h3>
                    <p className="text-sm">{error}</p>
                </div>
            );
        }

        if (length === 0) {
            return (
                <div className="text-center py-20" style={{ color: 'var(--text-primary)' }}>
                    <Lightbulb className="mx-auto h-10 w-10" />
                    <h3 className="mt-2 text-lg font-semibold">No KPIs Yet</h3>
                    <p className="text-sm">THIS Page IS NOT LINKED with KPI api endpoint</p>
                </div>
            );
        }

        return (
            <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
                <div
                    className="rounded-xl shadow-sm border p-6"
                    style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
                >
                    {/* Render KPI content here */}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
                <div
                    className="rounded-xl shadow-sm border p-6"
                    style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <select
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as SortKey)}
                                className="p-2 rounded-lg text-sm"
                                style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="last_modified">Sort by Last Updated</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                                <option value="created_by_id">Sort by Created By</option>
                            </select>
                            <button
                                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                                <ArrowUpDown size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-primary)' }}
                        >
                            <Plus size={16} /> New KPI
                        </button>
                    </div>
                    {renderContent()}
                </div>
            </div>
        </>
    );
}// Default export of the main App component
export default function App() {
    return <KpiPage />;
}
