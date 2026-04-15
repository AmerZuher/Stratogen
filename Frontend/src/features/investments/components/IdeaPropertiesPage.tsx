import React from 'react';
import { User, Calendar, Tag, FileText, ClipboardList, Hash, Clock, UserCircle, Zap, Building, Check, Shield, Star } from 'lucide-react';
import type { DisplayableIdeaType } from '@/features/investments/types';

interface IdeaPropertiesPageProps {
    idea: DisplayableIdeaType;
    onChange: (field: keyof DisplayableIdeaType, value: any) => void;
}

// A utility to format dates for input fields.
const formatDateForInput = (
    dateString: string | null | undefined | Date,
): string => {
    if (!dateString) return '';
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
    } catch (error) {
        console.error('Invalid date format:', dateString);
        return '';
    }
};

// A reusable card component for consistent section styling.
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div
        className="p-6 rounded-2xl shadow-sm border space-y-6"
        style={{ backgroundColor: 'var(--card)' }}
    >
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
    </div>
);

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input' | 'checkbox';
    label: string;
    icon: React.ElementType;
};

type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
    label: string;
    icon: React.ElementType;
};

// NEW: Props for the Select/Dropdown component
type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    as: 'select';
    label: string;
    icon: React.ElementType;
    children: React.ReactNode; // To pass <option> elements
};


type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

// A reusable FormField with an icon next to the label.
const FormField: React.FC<FormFieldProps> = ({ label, icon: Icon, as = 'input', ...props }) => {
    const commonStyles = {
        backgroundColor: 'var(--muted)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
    };

    if (as === 'checkbox') {
        return (
            <div className="flex items-center gap-3 mt-2">
                <input
                    type="checkbox"
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    className="h-5 w-5 rounded accent-primary"
                    style={{ backgroundColor: 'var(--muted)' }}
                />
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <label className="text-sm font-medium">{label}</label>
                </div>
            </div>
        );
    }

    const InputComponent = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input';

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <label className="text-sm font-medium">{label}</label>
            </div>
            <InputComponent
                {...(props as any)}
                className={`w-full text-base p-3 rounded-xl ${props.className || ''}`}
                style={commonStyles}
            />
        </div>
    );
};

// A small, reusable component for metadata items.
const MetadataItem: React.FC<{ icon: React.ElementType; label: string; value: any }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
        </div>
    </div>
);

export const IdeaPropertiesPage: React.FC<IdeaPropertiesPageProps> = ({ idea, onChange }) => {
    return (
        <div className="grid grid-cols-1 gap-8">
            {/* Metadata Section */}
            <div
                className="p-4 rounded-2xl shadow-sm border"
                style={{ backgroundColor: 'var(--card)' }}
            >
                <div className="flex flex-wrap items-center justify-around gap-y-4 gap-x-6">
                    <MetadataItem icon={Hash} label="Idea ID" value={idea.id} />
                    <MetadataItem icon={UserCircle} label="Created By" value={idea.created_by_id ?? '—'} />
                    <MetadataItem icon={Calendar} label="Created Date" value={formatDateForInput(idea.created_date) || '—'} />
                    <MetadataItem icon={Clock} label="Last Modified" value={formatDateForInput(idea.last_modified) || '—'} />
                </div>
            </div>

            {/* General Information */}
            <SectionCard title="General Information">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Idea Name"
                            icon={FileText}
                            type="text"
                            value={idea.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            placeholder="Enter the idea name..."
                        />
                        <FormField
                            as="select"
                            label="Status"
                            icon={Shield}
                            value={idea.status || ''}
                            onChange={(e) => onChange('status', e.target.value)}
                        >
                            <option value="DMNDSBMSN">Demand Submission</option>
                            <option value="LINEMNGAPPR">Line Manager Approval</option>
                            <option value="ASSESMENT">Assessment</option>
                            <option value="PROJMNGAPR">Project Manager Approval</option>
                            <option value="REVISION">Revision</option>
                            <option value="CONVERTEDRFP">Converted to RFP</option>
                            <option value="CONVERTEDPRJ">Converted to Project</option>
                            <option value="CONVERTEDSME">Converted to SME</option>
                            <option value="CANCELLED">Cancelled</option>
                        </FormField>
                        <FormField
                            label="Start Date"
                            icon={Calendar}
                            type="date"
                            value={formatDateForInput(idea.start_date)}
                            onChange={(e) => onChange('start_date', e.target.value)}
                        />
                        <FormField
                            label="Finish Date"
                            icon={Calendar}
                            type="date"
                            value={formatDateForInput(idea.end_date)}
                            onChange={(e) => onChange('end_date', e.target.value)}
                        />
                    </div>
                    <FormField
                        as="textarea"
                        label="Description"
                        icon={ClipboardList}
                        rows={4}
                        value={idea.description || ''}
                        onChange={(e) => onChange('description', e.target.value)}
                        placeholder="Describe the idea..."
                        className="w-full resize-none text-base p-3 rounded-xl"
                    />
                </div>
            </SectionCard>

            {/* Assessment Section */}
            <SectionCard title="Assessment">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            as="select"
                            label="Demand Type"
                            icon={Tag}
                            value={idea.demand_type || ''}
                            onChange={(e) => onChange('demand_type', e.target.value)}
                        >
                            <option value="">Select Demand Type</option>
                            <option value="SME">SME</option>
                            <option value="RFP">RFP</option>
                            <option value="PROJECT">Project</option>
                        </FormField>
                        <FormField
                            label="Business Priority"
                            icon={Star}
                            type="text"
                            // value={idea.business_priority || ''}
                            // onChange={(e) => onChange('business_priority', e.target.value)}
                            placeholder="e.g., High, Medium, Low"
                        />
                        <FormField
                            as="select"
                            label="Fast Track"
                            icon={Zap}
                            value={idea.fast_track ? 'Yes' : 'No'}
                            onChange={(e) => onChange('fast_track', e.target.value === 'Yes')}
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </FormField>
                        {idea.fast_track && (
                            <FormField
                                as="textarea"
                                label="Fast Track Reason"
                                icon={ClipboardList}
                                rows={1}
                                value={idea.fast_track_reason || ''}
                                onChange={(e) => onChange('fast_track_reason', e.target.value)}
                                placeholder="Explain why this idea should be fast-tracked..."
                                className="md:col-span-2"
                            />
                        )}
                    </div>
                    <FormField
                        as="textarea"
                        label="Assessment Notes"
                        icon={ClipboardList}
                        rows={4}
                        value={idea.assessment_notes || ''}
                        onChange={(e) => onChange('assessment_notes', e.target.value)}
                        placeholder="Add assessment notes here..."
                        className="w-full resize-none text-base p-3 rounded-xl"
                    />
                </div>
            </SectionCard>

            {/* Organization Section */}
            <SectionCard title="Organization">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Owner Department"
                        icon={Building}
                        type="text"
                        value={idea.owner_department || ''}
                        onChange={(e) => onChange('owner_department', e.target.value)}
                        placeholder="e.g., Finance"
                    />
                    <FormField
                        label="Responsible Unit"
                        icon={User}
                        type="text"
                        value={idea.responsible_unit || ''}
                        onChange={(e) => onChange('responsible_unit', e.target.value)}
                        placeholder="e.g., IT Department"
                    />
                    <FormField
                        label="Line Manager"
                        icon={UserCircle}
                        type="text"
                        // value={idea.line_manager || ''}
                        // onChange={(e) => onChange('line_manager', e.target.value)}
                        placeholder="Name of the line manager"
                    />
                    <FormField
                        label="Project Manager"
                        icon={UserCircle}
                        type="text"
                        // value={idea.project_manager || ''}
                        // onChange={(e) => onChange('project_manager', e.target.value)}
                        placeholder="Name of the project manager"
                    />
                </div>
            </SectionCard>
        </div>
    );
};
