import { useState, useEffect, ElementType, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  CheckSquare,
  Shield,
  AlertTriangle,
  FileText,
  ChevronDown,
} from 'lucide-react';

import {
  InvestmentsService,
  InvestmentResponse,
  ProjectResponse,
  InvestmentUpdate,
  ProjectUpdate,
  UserResponse,
  UserSummary,
  AuthenticationService,
  AiServicesService,
} from '@/api';


import { PropertiesPage } from '@/features/investments/components/ProjectPropertiesPage';
import { TasksPage } from '@/features/investments/components/TasksPage';
import { DocumentsPage } from '@/features/investments/components/DocumentsPage';
import { RisksAndIssuesPage } from '@/features/investments/components/Risks-Issues';
import { StatusPage } from '@/features/investments/components/StatusPage';
import { DisplayableProjectType } from '@/features/investments/types';




export default function ProjectDetail() {
  const [activePage, setActivePage] = useState('Properties');
  const [projectData, setProjectData] = useState<DisplayableProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [open, setOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);


  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isInitialMount = useRef(true);



  // Memoized function to save changes, now with a check for superuser status
  const handleSaveChanges = useCallback(async () => {
    // Prevent saving if the user is not a superuser
    if (!isSuperUser) return;

    const investmentId = Number(id);
    if (!projectData || !id || isNaN(investmentId)) return;

    setIsSaving(true);
    try {
      const investmentUpdateData: InvestmentUpdate = {
        name: projectData.name,
        type: projectData.type,
      };

      const projectUpdateData: ProjectUpdate = {
        objective: projectData.objective,
        status: projectData.status,
        baseline_start: projectData.start_date ?? null,
        baseline_finish: projectData.end_date ?? null,
        manager_id: Number(projectData.owner) || null,
        progress: projectData.progress ?? null,
      };

      await Promise.all([
        InvestmentsService.updateInvestmentApiInvestmentsInvestmentIdPut({
          investmentId,
          requestBody: investmentUpdateData,
        }),
        InvestmentsService.updateProjectApiInvestmentsInvestmentIdProjectPut({
          investmentId,
          requestBody: projectUpdateData,
        }),
      ]);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [projectData, id, isSuperUser]); // Added isSuperUser to dependencies

  // useEffect for auto-saving when projectData changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      handleSaveChanges();
    }
  }, [projectData, handleSaveChanges]);

  // Initial data fetch for both project and user
  useEffect(() => {
    const fetchInitialData = async () => {
      const investmentId = Number(id);
      if (!id || isNaN(investmentId)) {
        setError('Invalid Project ID.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch project details and current user permissions simultaneously
        const [investmentDetails, projectDetails, currentUser] = await Promise.all([
          InvestmentsService.getInvestmentApiInvestmentsInvestmentIdGet({ investmentId }),
          InvestmentsService.getProjectApiInvestmentsInvestmentIdProjectGet({ investmentId }),
          // Assumes an API endpoint exists to get the current user's details
          AuthenticationService.readUsersMeApiAuthMeGet(),
        ]);

        // Set user permission state
        setIsSuperUser(currentUser.is_superuser);

        const displayData: DisplayableProjectType = {
          ...investmentDetails,
          ...projectDetails,
          owner: projectDetails.manager_id?.toString() ?? 'N/A',
          progress: projectDetails.progress ?? undefined,
          start_date: projectDetails.baseline_start ?? null,
          end_date: projectDetails.baseline_finish ?? null,
        };
        setProjectData(displayData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch project data:', err);
        setError('Failed to load project data or user permissions. Please try again.');
        setIsSuperUser(false); // Fail safely to read-only mode
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const handleDataChange = (field: keyof DisplayableProjectType, value: any) => {
    // Only allow changes if the user is a superuser
    if (!isSuperUser) return;
    setProjectData((prevData) => (prevData ? { ...prevData, [field]: value } : null));
  };


  const renderContent = () => {
    if (loading) return <p>Loading project details...</p>;
    if (error) return <p style={{ color: 'var(--destructive)' }}>{error}</p>;
    if (!projectData) return <p>No project data found.</p>;

    switch (activePage) {
      case 'Properties':
        // Pass the isSuperUser flag to the PropertiesPage
        return <PropertiesPage project={projectData} onChange={handleDataChange} isSuperUser={isSuperUser} />;
      case 'Tasks':
        return <TasksPage investmentId={projectData.id} />;
      case 'Status':
        return <StatusPage project={projectData} onChange={handleDataChange} />;
      case 'Risks And Issues':
        return <RisksAndIssuesPage investmentId={projectData.id} />;
      case 'Documents':
        return <DocumentsPage investmentId={projectData.id} />;
      default:
        return <PropertiesPage project={projectData} onChange={handleDataChange} isSuperUser={isSuperUser} />;
    }
  };

  interface NavButtonProps {
    pageName: string;
    icon: ElementType;
  }

  const NavButton = ({ pageName, icon: Icon }: NavButtonProps) => (
    <button
      onClick={() => setActivePage(pageName)}
      className={`flex items-center gap-3 px-5 py-3 text-base font-semibold rounded-lg transition-colors ${activePage === pageName ? 'text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      style={{
        backgroundColor: activePage === pageName ? 'var(--primary)' : 'transparent',
        color: activePage === pageName ? 'var(--primary-foreground)' : 'var(--text-primary)',
      }}
    >
      <Icon size={18} />
      {pageName}
    </button>
  );

  const handleAction = (action: string) => {
    setOpen(false);
    if (!projectData) return;
    navigate('/chat', {
      state: {
        actionToPerform: action,
        investmentData: {
          id: projectData.id,
          name: projectData.name,
          type: projectData.type,
        },
      },
    });
  };

  return (
    <div className="max-w-8xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-6">

        {/* Left group: Back + Actions Dropdown */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/projects')}
            className="p-3 rounded-lg shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ backgroundColor: 'var(--sidebar-bg)' }}
            aria-label="Go back to projects"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-5 py-3 w-50 text-base font-semibold rounded-lg transition-colors hover:bg-[var(--accent)]"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              disabled={actionInProgress}
            >
              {actionInProgress ? 'Processing...' : 'Available Actions'} <ChevronDown size={16} />
            </button>

            {open && (
              <div
                className="absolute mt-2 w-50 border rounded-lg shadow-lg z-10"
                style={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => handleAction("report")}
                  className="w-full text-left px-4 py-2 transition-colors hover:bg-[var(--muted)]"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => handleAction("analyze")}
                  className="w-full text-left px-4 py-2 transition-colors hover:bg-[var(--muted)]"
                >
                  Analyze
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right group: Subpages */}
        <div className="flex items-center border rounded-lg p-1" style={{ backgroundColor: 'var(--card)' }}>
          <NavButton pageName="Properties" icon={Briefcase} />
          <NavButton pageName="Tasks" icon={CheckSquare} />
          <NavButton pageName="Status" icon={Shield} />
          <NavButton pageName="Risks And Issues" icon={AlertTriangle} />
          <NavButton pageName="Documents" icon={FileText} />
        </div>
      </div>

      <div className="space-y-8">{renderContent()}</div>

    </div>
  );
}

