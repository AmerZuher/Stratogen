/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PriorityLevel } from './PriorityLevel';
import type { RiskIssueType } from './RiskIssueType';
export type RiskIssue = {
    type: RiskIssueType;
    name: string;
    category?: (string | null);
    priority?: (PriorityLevel | null);
    impact?: (number | null);
    score?: (number | null);
    id: number;
    investment_id: number;
    created_at: string;
};

