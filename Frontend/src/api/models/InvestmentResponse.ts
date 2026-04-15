/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentResponse } from './DocumentResponse';
import type { IdeaResponse } from './IdeaResponse';
import type { KPIResponse } from './KPIResponse';
import type { ProjectResponse } from './ProjectResponse';
import type { TaskResponse } from './TaskResponse';
/**
 * Investment response schema
 */
export type InvestmentResponse = {
    name: string;
    type: string;
    id: number;
    created_by_id: number;
    created_date?: (string | null);
    last_modified?: (string | null);
    idea?: (IdeaResponse | null);
    project?: (ProjectResponse | null);
    kpi?: (KPIResponse | null);
    tasks?: Array<TaskResponse>;
    documents?: Array<DocumentResponse>;
};

