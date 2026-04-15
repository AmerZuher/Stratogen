/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PriorityLevel } from './PriorityLevel';
import type { RiskIssueType } from './RiskIssueType';
export type RiskIssueCreate = {
    type: RiskIssueType;
    name: string;
    category?: (string | null);
    priority?: (PriorityLevel | null);
    impact?: (number | null);
    score?: (number | null);
};

