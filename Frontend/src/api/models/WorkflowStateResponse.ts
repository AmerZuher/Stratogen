/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkflowActionInfo } from './WorkflowActionInfo';
import type { WorkflowResponsibleInfo } from './WorkflowResponsibleInfo';
import type { WorkflowStepInfo } from './WorkflowStepInfo';
/**
 * Workflow state response
 */
export type WorkflowStateResponse = {
    entity_id: number;
    entity_type: string;
    current_step?: (WorkflowStepInfo | null);
    status: string;
    available_actions?: Array<WorkflowActionInfo>;
    responsible?: Array<WorkflowResponsibleInfo>;
    can_user_act?: boolean;
};

