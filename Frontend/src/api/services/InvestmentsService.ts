/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IdeaResponse } from '../models/IdeaResponse';
import type { IdeaUpdate } from '../models/IdeaUpdate';
import type { InvestmentCreate } from '../models/InvestmentCreate';
import type { InvestmentResponse } from '../models/InvestmentResponse';
import type { InvestmentUpdate } from '../models/InvestmentUpdate';
import type { KPIResponse } from '../models/KPIResponse';
import type { KPIUpdate } from '../models/KPIUpdate';
import type { ProjectResponse } from '../models/ProjectResponse';
import type { ProjectUpdate } from '../models/ProjectUpdate';
import type { TaskCreate } from '../models/TaskCreate';
import type { TaskResponse } from '../models/TaskResponse';
import type { TaskUpdate } from '../models/TaskUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvestmentsService {
    /**
     * Create Investment
     * Create a new investment
     * @returns InvestmentResponse Successful Response
     * @throws ApiError
     */
    public static createInvestmentApiInvestmentsPost({
        requestBody,
    }: {
        requestBody: InvestmentCreate,
    }): CancelablePromise<InvestmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/investments/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Investments
     * Get investments with filtering and pagination
     * @returns InvestmentResponse Successful Response
     * @throws ApiError
     */
    public static getInvestmentsApiInvestmentsGet({
        skip,
        limit = 100,
        investmentType,
    }: {
        skip?: number,
        limit?: number,
        investmentType?: (string | null),
    }): CancelablePromise<Array<InvestmentResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/',
            query: {
                'skip': skip,
                'limit': limit,
                'investment_type': investmentType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Investment
     * Get investment by ID
     * @returns InvestmentResponse Successful Response
     * @throws ApiError
     */
    public static getInvestmentApiInvestmentsInvestmentIdGet({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<InvestmentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/{investment_id}',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Investment
     * Update investment
     * @returns InvestmentResponse Successful Response
     * @throws ApiError
     */
    public static updateInvestmentApiInvestmentsInvestmentIdPut({
        investmentId,
        requestBody,
    }: {
        investmentId: number,
        requestBody: InvestmentUpdate,
    }): CancelablePromise<InvestmentResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/investments/{investment_id}',
            path: {
                'investment_id': investmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Investment
     * Delete investment (superuser only)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteInvestmentApiInvestmentsInvestmentIdDelete({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/investments/{investment_id}',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Idea
     * Get idea details
     * @returns IdeaResponse Successful Response
     * @throws ApiError
     */
    public static getIdeaApiInvestmentsInvestmentIdIdeaGet({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<IdeaResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/{investment_id}/idea',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Idea
     * Update idea
     * @returns IdeaResponse Successful Response
     * @throws ApiError
     */
    public static updateIdeaApiInvestmentsInvestmentIdIdeaPut({
        investmentId,
        requestBody,
    }: {
        investmentId: number,
        requestBody: IdeaUpdate,
    }): CancelablePromise<IdeaResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/investments/{investment_id}/idea',
            path: {
                'investment_id': investmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Project
     * Get project details
     * @returns ProjectResponse Successful Response
     * @throws ApiError
     */
    public static getProjectApiInvestmentsInvestmentIdProjectGet({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<ProjectResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/{investment_id}/project',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Project
     * Update project
     * @returns ProjectResponse Successful Response
     * @throws ApiError
     */
    public static updateProjectApiInvestmentsInvestmentIdProjectPut({
        investmentId,
        requestBody,
    }: {
        investmentId: number,
        requestBody: ProjectUpdate,
    }): CancelablePromise<ProjectResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/investments/{investment_id}/project',
            path: {
                'investment_id': investmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Kpi
     * Get KPI details
     * @returns KPIResponse Successful Response
     * @throws ApiError
     */
    public static getKpiApiInvestmentsInvestmentIdKpiGet({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<KPIResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/{investment_id}/kpi',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Kpi
     * Update KPI
     * @returns KPIResponse Successful Response
     * @throws ApiError
     */
    public static updateKpiApiInvestmentsInvestmentIdKpiPut({
        investmentId,
        requestBody,
    }: {
        investmentId: number,
        requestBody: KPIUpdate,
    }): CancelablePromise<KPIResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/investments/{investment_id}/kpi',
            path: {
                'investment_id': investmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Task
     * Create a new task
     * @returns TaskResponse Successful Response
     * @throws ApiError
     */
    public static createTaskApiInvestmentsInvestmentIdTasksPost({
        investmentId,
        requestBody,
    }: {
        investmentId: number,
        requestBody: TaskCreate,
    }): CancelablePromise<TaskResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/investments/{investment_id}/tasks',
            path: {
                'investment_id': investmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Investment Tasks
     * Get tasks for an investment
     * @returns TaskResponse Successful Response
     * @throws ApiError
     */
    public static getInvestmentTasksApiInvestmentsInvestmentIdTasksGet({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<Array<TaskResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/{investment_id}/tasks',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get My Tasks
     * Get current user's assigned tasks
     * @returns TaskResponse Successful Response
     * @throws ApiError
     */
    public static getMyTasksApiInvestmentsTasksMyTasksGet(): CancelablePromise<Array<TaskResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/tasks/my-tasks',
        });
    }
    /**
     * Get Task
     * Get task by ID
     * @returns TaskResponse Successful Response
     * @throws ApiError
     */
    public static getTaskApiInvestmentsTasksTaskIdGet({
        taskId,
    }: {
        taskId: number,
    }): CancelablePromise<TaskResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/investments/tasks/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Task
     * Update task
     * @returns TaskResponse Successful Response
     * @throws ApiError
     */
    public static updateTaskApiInvestmentsTasksTaskIdPut({
        taskId,
        requestBody,
    }: {
        taskId: number,
        requestBody: TaskUpdate,
    }): CancelablePromise<TaskResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/investments/tasks/{task_id}',
            path: {
                'task_id': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Task
     * Delete task
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteTaskApiInvestmentsTasksTaskIdDelete({
        taskId,
    }: {
        taskId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/investments/tasks/{task_id}',
            path: {
                'task_id': taskId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
