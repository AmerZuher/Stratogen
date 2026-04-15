import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, XCircle, Plus, Loader2, AlertTriangle, UserX, Link as LinkIcon, ArrowUpDown } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import { useAuth } from '@/providers/AuthContext';
import {
  InvestmentsService,
  InvestmentResponse,
  InvestmentCreate
} from '@/api';

// Define the types for sorting
type SortKey = 'name' | 'status' | 'last_modified' | 'created_date' | 'progress';
type SortOrder = 'asc' | 'desc';

// ---- Status Badge Component ----
const StatusBadge = ({ status }: { status: string | null | undefined }) => {
  let colorClass, Icon;
  switch (status) {
    case 'Active': colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'; Icon = Briefcase; break;
    case 'On Hold': colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; Icon = Clock; break;
    case 'Completed': colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; Icon = CheckCircle; break;
    case 'Cancelled': colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; Icon = UserX; break;
    default: colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'; Icon = XCircle;
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
      <Icon size={12} />
      {status || 'Unknown'}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number | null | undefined }) => {
  const progressValue = progress ?? 0;
  const progressColor = progressValue < 30 ? 'bg-red-500' : progressValue < 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Progress</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{progressValue}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${progressValue}%` }}></div>
      </div>
    </div>
  );
};

export default function Projects() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [projects, setProjects] = useState<InvestmentResponse[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // ... rest of the state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for sorting
  const [sortKey, setSortKey] = useState<SortKey>('last_modified');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const navigate = useNavigate();

  const fetchAllProjects = async () => {
    const investmentsList = await InvestmentsService.getInvestmentsApiInvestmentsGet({ investmentType: 'PROJECT' });
    const projectsWithDetails = await Promise.all(
      investmentsList.map(async (investment) => {
        try {
          const projectDetails = await InvestmentsService.getProjectApiInvestmentsInvestmentIdProjectGet({ investmentId: investment.id });
          return { ...investment, project: projectDetails };
        } catch (projectError) {
          console.error(`Failed to fetch details for project ${investment.id}`, projectError);
          return investment;
        }
      })
    );
    setProjects(projectsWithDetails);
  };

  useEffect(() => {
    // This function will run only when we have a valid user from the context.
    const loadProjects = async () => {
      try {
        setIsProjectsLoading(true); // Use project-specific loading state
        setError(null);
        await fetchAllProjects();
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching data.');
      } finally {
        setIsProjectsLoading(false);
      }
    };

    // Check if authentication is complete AND we have a user.
    if (!isAuthLoading && currentUser) {
      loadProjects();
    }
  }, [currentUser, isAuthLoading]); 

  // Memoized sorting logic
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let aValue, bValue;

      if (sortKey === 'status') {
        aValue = a.project?.status;
        bValue = b.project?.status;
      } else if (sortKey === 'progress') {
        aValue = a.project?.progress;
        bValue = b.project?.progress;
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
      } else if (sortKey === 'last_modified' || sortKey === 'created_date') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [projects, sortKey, sortOrder]);

  const handleCreateProject = async (projectData: Omit<InvestmentCreate, "type">) => {
    if (!currentUser) {
      setError("Your user session could not be verified. Please refresh and try again.");
      return;
    }
    try {
      const newProjectRequest: InvestmentCreate = { ...projectData, type: 'PROJECT' };
      await InvestmentsService.createInvestmentApiInvestmentsPost({ requestBody: newProjectRequest });
      await fetchAllProjects();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create project", err);
      setError("Failed to create the project. Please try again.");
    }
  };

  const handleRowClick = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const renderContent = () => {
    if (isAuthLoading || isProjectsLoading) {
      return <div className="flex justify-center items-center py-20"><Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--text-primary)' }} /></div>;
    }
    if (error) {
      return (
        <div className="text-center py-20 text-red-500 bg-red-500/10 rounded-lg">
          <AlertTriangle className="mx-auto h-10 w-10" />
          <h3 className="mt-2 text-lg font-semibold">Failed to load projects</h3>
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (projects.length === 0) {
      return (
        <div className="text-center py-20" style={{ color: 'var(--text-primary)' }}>
          <Briefcase className="mx-auto h-10 w-10" />
          <h3 className="mt-2 text-lg font-semibold">No Projects Yet</h3>
          <p className="text-sm">Click "New Project" to get started.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProjects.map(investment => (
          <div
            key={investment.id}
            onClick={() => handleRowClick(investment.id)}
            className="p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col h-80 cursor-pointer"
            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
          >
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-xl font-semibold line-clamp-3 break-words min-w-0" style={{ color: 'var(--text-primary)' }}>
                {investment.name}
              </h3>
              <StatusBadge status={investment.project?.status} />
            </div>
            <p className="mt-4 text-sm flex-grow line-clamp-4" style={{ color: 'var(--text-primary)' }}>
              {investment.project?.objective || 'No objective available.'}
            </p>
            <div className="mt-4">
              <ProgressBar progress={investment.project?.progress} />
            </div>
            <div className="mt-6 border-t pt-4 flex justify-between items-center text-sm" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-primary)' }}>
                Created by: {currentUser?.id === investment.created_by_id ? currentUser.username : `User #${investment.created_by_id}`}
              </span>
              <div className="font-medium hover:underline flex items-center gap-1" style={{ color: '#4f46e5' }}>
                View Details
                <LinkIcon size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="max-w-screen-x2 mx-auto p-4 sm:p-6">
        <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div className="flex items-center gap-4">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="p-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}
              >
                <option value="last_modified">Sort by Last Updated</option>
                <option value="created_date">Sort by Create Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="progress">Sort by Progress</option>
              </select>
              <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)' }}>
                <ArrowUpDown size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && currentUser.is_superuser && (

                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isAuthLoading || isProjectsLoading}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-primary)' }}
                >
                  <Plus size={16} /> New Project
                </button>
              )}
            </div>

          </div>

          {renderContent()}
        </div>
      </div>
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateProject} />
    </>
  );
}
