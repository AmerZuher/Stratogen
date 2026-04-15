import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { InvestmentCreate } from '@/api'; 
// The component's props are now more specific about the data it handles.
// It expects an object with a 'name' property for the `onCreate` function.
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: Omit<InvestmentCreate, 'type'>) => Promise<void>;
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Effect to handle focus and escape key
    useEffect(() => {
        if (isOpen) {
            setProjectName(''); // Reset name on open
            // Focus the input field for better UX
            const firstInput = modalRef.current?.querySelector('input');
            setTimeout(() => firstInput?.focus(), 100);

            const handleEscKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleEscKey);
            return () => document.removeEventListener('keydown', handleEscKey);
        }
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectName.trim()) {
            setLoading(true);
            try {
                // Pass the name inside an object, matching the new `onCreate` prop type
                await onCreate({ name: projectName.trim() });
                onClose(); // Close modal on successful creation
            } catch (error) {
                console.error("Failed to create project:", error);
                // Optionally, you could show an error message to the user here
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
                className="p-6 rounded-lg shadow-xl max-w-sm w-full"
                style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
                // Prevents clicks inside the modal from closing it
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Create New Project
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="new-project-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            Project Name
                        </label>
                        <input
                            type="text"
                            id="new-project-name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            placeholder="Enter project name..."
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-500/10 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center" style={{ backgroundColor: 'var(--accent-color)' }} disabled={loading || !projectName.trim()}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
