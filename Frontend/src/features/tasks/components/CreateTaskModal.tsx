import React, { useEffect, useRef, useState } from 'react';
import { X, Lightbulb, FolderKanban, Building2, FileText, TrendingUp, Briefcase } from 'lucide-react';
import Select, { components } from 'react-select';
import { TaskCreate, InvestmentResponse, UserResponse } from '@/api';
import '@/styles/index.css'

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (taskData: TaskCreate, investmentId: number) => Promise<void>;
    investments: InvestmentResponse[];
    users: UserResponse[];
    currentUser: UserResponse | null;
}

// ---- Investment Type Icon Helper ----
const getInvestmentIcon = (type: string | undefined) => {
    const iconProps = { className: 'mr-2 h-4 w-4 flex-shrink-0', 'aria-hidden': true };
    switch (type) {
        case 'IDEA': return <Lightbulb {...iconProps} />;
        case 'PROJECT': return <FolderKanban {...iconProps} />;
        case 'SME': return <Building2 {...iconProps} />;
        case 'RFP': return <FileText {...iconProps} />;
        case 'KPI': return <TrendingUp {...iconProps} />;
        default: return <Briefcase {...iconProps} />;
    }
};

// ---- Custom React-Select Components ----
const { Option } = components;
const IconOption = (props: any) => (
    <Option {...props}>
        <div className="flex items-center">
            {getInvestmentIcon(props.data.type)}
            <span>{props.data.label}</span>
        </div>
    </Option>
);

const customSelectStyles = {
    control: (provided: any, state: { isFocused: any }) => ({
        ...provided,
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: state.isFocused ? 'var(--accent-color)' : 'var(--border)',
        color: 'var(--text-primary)',
        boxShadow: state.isFocused ? '0 0 0 1px var(--accent-color)' : 'none',
        '&:hover': {
            borderColor: 'var(--accent-color)',
        },
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: 'var(--sidebar-bg)',
        zIndex: 9999,
    }),
    menuList: (provided: any) => ({
        ...provided,
        // hide scrollbar but keep scroll functionality
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
        '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari
        },
    }),
    option: (provided: any, state: { isSelected: any; isFocused: any }) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? 'var(--accent-color)'
            : state.isFocused
                ? 'var(--sidebar-bg-hover)'
                : 'var(--sidebar-bg)',
        color: 'var(--text-primary)',
        '&:active': {
            backgroundColor: 'var(--accent-color)',
        },
    }),
    singleValue: (provided: any, data: any) => ({
        ...provided,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'var(--text-primary)',
    }),
};

// Custom SingleValue component to show icon in the control
const SingleValueWithIcon = ({ children, ...props }: any) => (
    <components.SingleValue {...props}>
        <div className="flex items-center">
            {getInvestmentIcon(props.data.type)}
            {children}
        </div>
    </components.SingleValue>
);


export default function CreateTaskModal({ isOpen, onClose, onCreate, investments, currentUser }: CreateTaskModalProps) {
    const [taskName, setTaskName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | ''>('');
    const [ownerId, setOwnerId] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const investmentOptions = investments.map(inv => ({ 
        value: inv.id, 
        label: inv.name,
        type: inv.type, // Include type for the icon
    }));

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setTaskName('');
            setDescription('');
            setStartDate('');
            setEndDate('');
            setSelectedInvestmentId(investments[0]?.id || '');

            // Set owner based on user role
            if (currentUser?.is_superuser) {
                setOwnerId(''); // Superuser can select
            } else {
                setOwnerId(currentUser?.id || ''); // Default to current user
            }

            const firstInput = modalRef.current?.querySelector('input');
            setTimeout(() => firstInput?.focus(), 100);

            const handleEscKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleEscKey);
            return () => document.removeEventListener('keydown', handleEscKey);
        }
    }, [isOpen, onClose, investments, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (taskName.trim() && selectedInvestmentId) {
            setLoading(true);
            try {
                const taskData: TaskCreate = {
                    name: taskName.trim(),
                    description: description || null,
                    start_date: startDate || null,
                    end_date: endDate || null,
                    owner_id: ownerId ? Number(ownerId) : currentUser?.id, 
                };
                await onCreate(taskData, selectedInvestmentId);
                onClose();
            } catch (error) {
                console.error("Failed to create task:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity">
            <div
                ref={modalRef}
                className="p-6 rounded-lg shadow-xl max-w-lg w-full"
                style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Create New Task
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="investment-select" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                Investment
                            </label>
                            <Select
                                id="investment-select"
                                options={investmentOptions}
                                value={investmentOptions.find(option => option.value === selectedInvestmentId)}
                                onChange={(option) => setSelectedInvestmentId(option?.value || '')}
                                styles={customSelectStyles}
                                placeholder="Search or select an investment"
                                isDisabled={loading}
                                isClearable
                                components={{ Option: IconOption, SingleValue: SingleValueWithIcon }}
                            />
                        </div>
                        <div>
                            <label htmlFor="new-task-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                Task Name
                            </label>
                            <input
                                type="text"
                                id="new-task-name"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                placeholder="Enter task name..."
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="task-description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                Description
                            </label>
                            <textarea
                                id="task-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                placeholder="Enter task description..."
                                rows={3}
                                disabled={loading}
                            />
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    End Date (Due)
                                </label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-500/10" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--accent-color)' }} disabled={loading || !taskName.trim() || !selectedInvestmentId}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
