/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkflowActionRequest } from '../models/WorkflowActionRequest';
import type { WorkflowActionResponse } from '../models/WorkflowActionResponse';
import type { WorkflowHistoryResponse } from '../models/WorkflowHistoryResponse';
import type { WorkflowStateResponse } from '../models/WorkflowStateResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkflowsService {
    /**
     * Get Idea Workflow State
     * Get current workflow state for an idea
     * Returns current step, allowed actions, responsible roles/teams
     * @returns WorkflowStateResponse Successful Response
     * @throws ApiError
     */
    public static getIdeaWorkflowStateApiWorkflowIdeaIdeaIdGet({
        ideaId,
    }: {
        ideaId: number,
    }): CancelablePromise<WorkflowStateResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflow/idea/{idea_id}',
            path: {
                'idea_id': ideaId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Perform Idea Workflow Action
     * Perform a workflow action on an idea
     * Validates permissions, updates idea status, workflow instance, and logs history
     * @returns WorkflowActionResponse Successful Response
     * @throws ApiError
     */
    public static performIdeaWorkflowActionApiWorkflowIdeaIdeaIdActionPost({
        ideaId,
        requestBody,
    }: {
        ideaId: number,
        requestBody: WorkflowActionRequest,
    }): CancelablePromise<WorkflowActionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflow/idea/{idea_id}/action',
            path: {
                'idea_id': ideaId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Idea Workflow History
     * Get workflow history for an idea
     * @returns WorkflowHistoryResponse Successful Response
     * @throws ApiError
     */
    public static getIdeaWorkflowHistoryApiWorkflowIdeaIdeaIdHistoryGet({
        ideaId,
    }: {
        ideaId: number,
    }): CancelablePromise<Array<WorkflowHistoryResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflow/idea/{idea_id}/history',
            path: {
                'idea_id': ideaId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Available Workflow Actions
     * Get available workflow actions for a user on a specific entity
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAvailableWorkflowActionsApiWorkflowAvailableActionsEntityTypeEntityIdGet({
        entityType,
        entityId,
    }: {
        entityType: string,
        entityId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflow/available-actions/{entity_type}/{entity_id}',
            path: {
                'entity_type': entityType,
                'entity_id': entityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Workflow Tasks For User
     * Get workflow tasks assigned to the current user
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkflowTasksForUserApiWorkflowMyTasksGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflow/my-tasks',
        });
    }
}
