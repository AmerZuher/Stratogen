/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkflowActionInfo } from './WorkflowActionInfo';
/**
 * Workflow step information
 */
export type WorkflowStepInfo = {
    id: number;
    name: string;
    status?: (string | null);
    is_terminal?: boolean;
    available_actions?: Array<WorkflowActionInfo>;
};

