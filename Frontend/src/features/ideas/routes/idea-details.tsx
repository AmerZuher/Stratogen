import { useState, useEffect, ElementType, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  CheckSquare,
  AlertTriangle,
  FileText,
  ChevronDown,
} from 'lucide-react';

import {
  InvestmentsService,
  InvestmentUpdate,
  IdeaUpdate,
  UserResponse,
  AuthenticationService,
} from '@/api';

// Import shared components and types
import { IdeaPropertiesPage } from '@/features/investments/components/IdeaPropertiesPage';
import { TasksPage } from '@/features/investments/components/TasksPage';
import { DocumentsPage } from '@/features/investments/components/DocumentsPage';
import { RisksAndIssuesPage } from '@/features/investments/components/Risks-Issues';
import { DisplayableIdeaType } from '@/features/investments/types';


export default function IdeaDetail() {
  const [activePage, setActivePage] = useState('Properties');
  const [ideaData, setIdeaData] = useState<DisplayableIdeaType | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isInitialMount = useRef(true);

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setError(null);
        const userData = await AuthenticationService.readUsersMeApiAuthMeGet();
        setCurrentUser(userData);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching data.');
      }
    };
    initialLoad();
  }, []);

  const handleSaveChanges = useCallback(async () => {
    const investmentId = Number(id);
    if (!ideaData || !id || isNaN(investmentId)) return;

    setIsSaving(true);
    try {
      const investmentUpdateData: InvestmentUpdate = {
        name: ideaData.name,
        type: ideaData.type,
      };

      const ideaUpdateData: IdeaUpdate = {
        description: ideaData.description,
        status: ideaData.status,
        demand_type: ideaData.demand_type,
        fast_track: ideaData.fast_track,
        fast_track_reason: ideaData.fast_track_reason,
        start_date: ideaData.start_date,
        end_date: ideaData.end_date,
        responsible_unit: ideaData.responsible_unit,
        assessment_notes: ideaData.assessment_notes,
        owner_department: ideaData.owner_department,
      };

      await Promise.all([
        InvestmentsService.updateInvestmentApiInvestmentsInvestmentIdPut({
          investmentId,
          requestBody: investmentUpdateData,
        }),
        InvestmentsService.updateIdeaApiInvestmentsInvestmentIdIdeaPut({
          investmentId,
          requestBody: ideaUpdateData,
        }),
      ]);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [ideaData, id]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      handleSaveChanges();
    }
  }, [ideaData, handleSaveChanges]);

  useEffect(() => {
    const fetchIdeaData = async () => {
      const investmentId = Number(id);
      if (!id || isNaN(investmentId)) {
        setError('Invalid Idea ID.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [investmentDetails, ideaDetails] = await Promise.all([
          InvestmentsService.getInvestmentApiInvestmentsInvestmentIdGet({ investmentId }),
          InvestmentsService.getIdeaApiInvestmentsInvestmentIdIdeaGet({ investmentId }),
        ]);
        const displayData: DisplayableIdeaType = {
          ...investmentDetails,
          ...ideaDetails,
          owner_department: ideaDetails.owner_department ?? null,
          start_date: ideaDetails.start_date ?? null,
          end_date: ideaDetails.end_date ?? null,
        };
        setIdeaData(displayData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch idea data:', err);
        setError('Failed to load idea. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdeaData();
  }, [id]);

  const handleDataChange = (field: keyof DisplayableIdeaType, value: any) => {
    setIdeaData((prevData) => (prevData ? { ...prevData, [field]: value } : null));
  };


  const renderContent = () => {
    if (loading) return <p>Loading idea details...</p>;
    if (error) return <p style={{ color: 'var(--destructive)' }}>{error}</p>;
    if (!ideaData) return <p>No idea data found.</p>;

    switch (activePage) {
      case 'Properties':
        return <IdeaPropertiesPage idea={ideaData} onChange={handleDataChange} />;
      case 'Tasks':
        return <TasksPage investmentId={ideaData.id} />;
      case 'Risks And Issues':
        return <RisksAndIssuesPage investmentId={ideaData.id} />;
      case 'Documents':
        return <DocumentsPage investmentId={ideaData.id} />;
      default:
        return <IdeaPropertiesPage idea={ideaData} onChange={handleDataChange} />;
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
    if (!ideaData) return;
    navigate('/chat', {
      state: {
        actionToPerform: action,
        investmentData: {
          id: ideaData.id,
          name: ideaData.name,
          type: ideaData.type,
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
            onClick={() => navigate('/ideas')}
            className="p-3 rounded-lg shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ backgroundColor: 'var(--sidebar-bg)' }}
            aria-label="Go back to ideas"
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
        <div
          className="flex items-center border rounded-lg p-1"
          style={{ backgroundColor: 'var(--card)' }}
        >
          <NavButton pageName="Properties" icon={Briefcase} />
          <NavButton pageName="Tasks" icon={CheckSquare} />
          <NavButton pageName="Risks And Issues" icon={AlertTriangle} />
          <NavButton pageName="Documents" icon={FileText} />
        </div>

      </div>

      <div className="space-y-8">{renderContent()}</div>
    </div>
  );
}
