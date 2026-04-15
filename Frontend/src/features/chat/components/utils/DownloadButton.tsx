import { Download } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import { OpenAPI } from '@/api';

interface DownloadButtonProps {
    filePath?: string;
    isReportSummary?: boolean;
    reportLink?: string;
}

export default function DownloadButton({ filePath, isReportSummary, reportLink }: DownloadButtonProps) {
    const { token } = useAuth();

    const handleDownload = async () => {
        if (!token) {
            console.error("Authentication token not found.");
            return;
        }

        let downloadUrl = '';
        let filename = 'download';

        if (isReportSummary && reportLink) {
            downloadUrl = `${OpenAPI.BASE}/api${reportLink}`;
            filename = reportLink.split('/').pop() || 'ai-generated-report.pdf';
        } else if (filePath) {
            downloadUrl = `/api/download/${filePath}`;
            filename = filePath.split('/').pop() || 'report.pdf';
        }

        if (!downloadUrl) {
            console.error("No file path or report link provided.");
            return;
        }

        try {
            const response = await fetch(downloadUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Download failed: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Download error:", err);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-color)] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-colors self-start mt-2 no-underline"
        >
            <Download size={16} />
            Download Full Report
        </button>
    );
}
