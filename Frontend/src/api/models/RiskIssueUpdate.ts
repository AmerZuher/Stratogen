/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PriorityLevel } from './PriorityLevel';
import type { RiskIssueType } from './RiskIssueType';
export type RiskIssueUpdate = {
    type?: (RiskIssueType | null);
    name?: (string | null);
    category?: (string | null);
    priority?: (PriorityLevel | null);
    impact?: (number | null);
    score?: (number | null);
};

