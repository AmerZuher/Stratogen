import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

// Props interface remains the same, as it's generic enough.
interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateIdeaModal({ isOpen, onClose, onCreate }: CreateIdeaModalProps) {
    const [ideaName, setIdeaName] = useState('');
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // This effect handles focus and the Escape key, no changes needed.
    useEffect(() => {
        if (isOpen) {
            setIdeaName('');
            const firstInput = modalRef.current?.querySelector('input');
            setTimeout(() => firstInput?.focus(), 100);

            const handleEscKey = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleEscKey);
            return () => document.removeEventListener('keydown', handleEscKey);
        }
    }, [isOpen, onClose]);

    // The submit handler calls the passed-in onCreate function.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (ideaName.trim()) {
            setLoading(true);
            try {
                await onCreate(ideaName.trim());
                onClose(); // Close modal on successful creation
            } catch (error) {
                console.error("Failed to create idea:", error);
                // Optionally, you could add state to show an error message in the modal
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div
                ref={modalRef}
                className="p-6 rounded-lg max-w-sm w-full"
                style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
            >
                <div className="flex justify-between items-center mb-4">
                    {/* --- TEXT CHANGE --- */}
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Create New Idea
                    </h3>
                    <button onClick={onClose} className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        {/* --- TEXT CHANGE --- */}
                        <label htmlFor="new-idea-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            Idea Name
                        </label>
                        <input
                            type="text"
                            id="new-idea-name"
                            value={ideaName}
                            onChange={(e) => setIdeaName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
                            placeholder="Enter idea name..."
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} disabled={loading}>
                            Cancel
                        </button>
                        {/* --- TEXT CHANGE --- */}
                        <button type="submit" className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: 'var(--accent-color)' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Idea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
