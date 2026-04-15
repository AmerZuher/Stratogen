import React from 'react'
import { User, Calendar, Tag, FileText, ClipboardList, Hash, Clock, UserCircle } from 'lucide-react'
import type { DisplayableProjectType, DisplayableIdeaType } from '@/features/investments/types';
import { UserResponse } from '@/api';


interface PropertiesPageProps {
    project: DisplayableProjectType
    onChange: (field: keyof DisplayableProjectType, value: any) => void
    isSuperUser: boolean; // Prop to determine if the user has edit permissions
}

// A utility to format dates for input fields.
const formatDateForInput = (
    dateString: string | null | undefined | Date,
): string => {
    if (!dateString) return ''
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString
        return date.toISOString().split('T')[0] // Returns date in YYYY-MM-DD format
    } catch (error) {
        console.error('Invalid date format:', dateString)
        return ''
    }
}

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
    as?: 'input';
    label: string;
    icon: React.ElementType;
};

type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
    label: string;
    icon: React.ElementType;
};

type FormFieldProps = InputFieldProps | TextareaFieldProps;

// A reusable FormField with an icon next to the label.
const FormField: React.FC<FormFieldProps> = ({ label, icon: Icon, as = 'input', ...props }) => {
    const commonStyles = {
        backgroundColor: 'var(--muted)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
    };

    const InputComponent = as === 'textarea' ? 'textarea' : 'input';

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

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ project, onChange, isSuperUser }) => {
    // Determine if fields should be read-only based on the isSuperUser prop
    const isReadOnly = !isSuperUser;

    return (
        <div className="grid grid-cols-1 gap-8">
            {/* Centered metadata section at the top */}
            <div
                className="p-4 rounded-2xl shadow-sm border"
                style={{ backgroundColor: 'var(--card)' }}
            >
                <div className="flex flex-wrap items-center justify-around gap-y-4 gap-x-6">
                    <MetadataItem icon={Hash} label="Project ID" value={project.id} />
                    <MetadataItem icon={UserCircle} label="Created By" value={project.created_by_id ?? '—'} />
                    <MetadataItem icon={Clock} label="Last Modified" value={formatDateForInput(project.last_modified) || '—'} />
                </div>
            </div>

            <SectionCard title="General Details">
                <div className="space-y-6">
                    <FormField
                        label="Project Name"
                        icon={FileText}
                        type="text"
                        value={project.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="Enter the project name..."
                        disabled={isReadOnly}
                    />
                    <FormField
                        as="textarea"
                        label="Objective"
                        icon={ClipboardList}
                        rows={4}
                        value={project.objective || ''}
                        onChange={(e) => onChange('objective', e.target.value)}
                        placeholder="Describe the project's main objective..."
                        className="w-full resize-none text-base p-3 rounded-xl"
                        disabled={isReadOnly}
                    />
                </div>
            </SectionCard>

            <SectionCard title="Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        label="Manager"
                        icon={User}
                        type="text"
                        value={project.owner || ''}
                        onChange={(e) => onChange('owner', e.target.value)}
                        placeholder="Project manager's name"
                        disabled={isReadOnly}
                    />
                    <FormField
                        label="Type"
                        icon={Tag}
                        type="text"
                        value={project.type || ''}
                        onChange={(e) => onChange('type', e.target.value)}
                        placeholder="e.g., Real Estate, Tech"
                        disabled // Type is always not editable
                    />
                    <FormField
                        label="Start Date"
                        icon={Calendar}
                        type="date"
                        value={formatDateForInput(project.start_date)}
                        onChange={(e) => onChange('start_date', e.target.value)}
                        disabled={isReadOnly}
                    />
                    <FormField
                        label="Finish Date"
                        icon={Calendar}
                        type="date"
                        value={formatDateForInput(project.end_date)}
                        onChange={(e) => onChange('end_date', e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>
            </SectionCard>
        </div>
    );
};
