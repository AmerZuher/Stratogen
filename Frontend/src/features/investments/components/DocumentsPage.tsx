import React from 'react';
import { FileText, Upload, Download, Trash2, Loader2, AlertTriangle, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DocumentsService, DocumentResponse, OpenAPI } from '@/api';
import { useAuth } from '@/providers/AuthContext';

// Define props for the component
interface DocumentsPageProps {
    investmentId: number;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ investmentId }) => {
    // We'll assume the user object from useAuth has an is_superuser property.
    const { user: currentUser, token } = useAuth() as { user: { id: number; is_superuser: boolean; } | null, token: string | null };
    const [documents, setDocuments] = React.useState<DocumentResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Fetch documents when the component mounts
    const fetchDocuments = React.useCallback(async () => {
        if (!investmentId || isNaN(investmentId)) {
            setError("Investment ID is missing or invalid.");
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const docs = await DocumentsService.getInvestmentDocumentsApiDocumentsInvestmentIdDocumentsGet({ investmentId });
            setDocuments(docs);
        } catch (err: any) {
            setError(err.message || "Failed to fetch documents.");
        } finally {
            setIsLoading(false);
        }
    }, [investmentId]);

    React.useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Generic function to handle the upload of a single file
    const uploadFile = async (file: File) => {
        try {
            setIsUploading(true);
            setError(null);
            await DocumentsService.uploadDocumentApiDocumentsInvestmentIdUploadPost({
                investmentId,
                formData: { file },
            });
            await fetchDocuments(); // Refresh the list after upload
        } catch (err: any) {
            setError(err.message || "File upload failed.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Handle file selection from the input element
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    // Handle document download using a manual fetch
    const handleDownload = async (doc: DocumentResponse) => {
        if (!token) {
            alert("Authentication token not found. Please log in again.");
            return;
        }
        try {
            const response = await fetch(`${OpenAPI.BASE}/api/documents/document/${doc.id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Download failed with status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Download error:", err);
            alert("Failed to download file. See console for details.");
        }
    };

    // Handle document deletion
    const handleDelete = async (documentId: number) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            await DocumentsService.deleteDocumentApiDocumentsDocumentDocumentIdDelete({ documentId });
            await fetchDocuments(); // Refresh list
        } catch (err: any) {
            alert("Failed to delete document.");
        }
    };

    // Drag and drop event handlers
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };


    const triggerFileInput = () => fileInputRef.current?.click();

    if (!investmentId || isNaN(investmentId)) {
        return (
            <div className="p-6 rounded-2xl shadow-sm border text-center" style={{ backgroundColor: 'var(--card)' }}>
                <AlertTriangle className="mx-auto h-10 w-10" style={{ color: 'var(--destructive)' }} />
                <h3 className="mt-2 text-lg font-semibold">Unable to Load Documents</h3>
                <p style={{ color: 'var(--text-primary)' }}>
                    The Investment ID was not provided correctly. Please navigate back and try again.
                </p>
            </div>
        );
    }

    return (
        <div
            className={`p-6 rounded-2xl shadow-sm border transition-colors duration-200 ${isDragging ? 'border-dashed border-2' : ''}`}
            style={{ backgroundColor: isDragging ? 'var(--primary)' : 'var(--card)', borderColor: isDragging ? 'var(--primary)' : 'var(--border)' }}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Attached Documents</h3>
                <button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={16} />}
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {error && (
                <div className="text-center py-4 rounded-lg mb-4" style={{ color: 'var(--destructive-foreground)', backgroundColor: 'var(--destructive)' }}>
                    <AlertTriangle className="mx-auto h-6 w-6" />
                    <p className="text-sm mt-1">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : documents.length === 0 ? (
                <div
                    onClick={triggerFileInput}
                    className="text-center py-10 border-2 border-dashed rounded-lg cursor-pointer"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                    <Upload className="mx-auto h-10 w-10" />
                    <p className="mt-2 font-semibold">
                        {isDragging ? 'Drop file to upload' : 'Drag & drop document here'}
                    </p>
                    <p className="text-sm">or click to browse</p>
                </div>
            ) : (
                <>
                    <div className="text-center p-3 rounded-lg text-sm mb-4" style={{  color: 'var(--accent-foreground)', borderColor: 'var(--border)' }}>
                        <strong>Pro Tip:</strong> You can also drag and drop files directly onto this area to upload!
                    </div>
                    <div className="space-y-3">
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                className="p-3 rounded-lg border flex justify-between items-center"
                                style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={20} />
                                    <div>
                                        <h4 className="font-semibold">{doc.name}</h4>
                                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                                            <User size={12} />
                                            <span>
                                                Uploaded by {currentUser?.id === doc.uploaded_by_id ? 'You' : `User #${doc.uploaded_by_id}`}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {format(parseISO(doc.uploaded_at), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-md hover:bg-[var(--accent)]" title="Download" onClick={() => handleDownload(doc)}>
                                        <Download size={18} />
                                    </button>
                                    {currentUser?.is_superuser && (
                                        <button className="p-2 rounded-md hover:bg-[var(--destructive)]" style={{ color: 'var(--destructive-foreground)' }} title="Delete" onClick={() => handleDelete(doc.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

};

