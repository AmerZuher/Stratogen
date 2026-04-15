import { InvestmentResponse, IdeaResponse, ProjectResponse } from '@/api';

// Type for the Project Details Page
export type DisplayableProjectType = Omit<InvestmentResponse & ProjectResponse, 'progress' | 'start_date' | 'end_date'> & {
  owner: string;
  progress?: number;
  start_date: string | null;
  end_date: string | null;
};

// Type for the Idea Details Page
export type DisplayableIdeaType = Omit<InvestmentResponse & IdeaResponse, 'start_date' | 'end_date'> & {
  owner_department: string | null;
  start_date: string | null;
  end_date: string | null;
};