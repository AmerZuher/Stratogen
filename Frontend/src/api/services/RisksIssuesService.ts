/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskIssue } from '../models/RiskIssue';
import type { RiskIssueCreate } from '../models/RiskIssueCreate';
import type { RiskIssueUpdate } from '../models/RiskIssueUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RisksIssuesService {
    /**
     * Create Risk or Issue for Investment
     * @returns RiskIssue Successful Response
     * @throws ApiError
     */
    public static createRiskIssueForInvestmentApiRisksIssuesInvestmentsInvestmentIdPost({
        investmentId,
        requestBody,
    }: {
        investmentId: number,
        requestBody: RiskIssueCreate,
    }): CancelablePromise<RiskIssue> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/risks_issues/investments/{investment_id}',
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
     * Get All Risks & Issues for an Investment
     * Retrieve all risks and issues associated with a specific investment, with pagination.
     * @returns RiskIssue Successful Response
     * @throws ApiError
     */
    public static readRisksIssuesForInvestmentApiRisksIssuesInvestmentsInvestmentIdGet({
        investmentId,
        skip,
        limit = 100,
    }: {
        investmentId: number,
        skip?: number,
        limit?: number,
    }): CancelablePromise<Array<RiskIssue>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/risks_issues/investments/{investment_id}',
            path: {
                'investment_id': investmentId,
            },
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get a Specific Risk or Issue
     * Retrieve a specific risk or issue by its unique ID.
     * @returns RiskIssue Successful Response
     * @throws ApiError
     */
    public static readRiskIssueApiRisksIssuesRiskIssueIdGet({
        riskIssueId,
    }: {
        riskIssueId: number,
    }): CancelablePromise<RiskIssue> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/risks_issues/{risk_issue_id}',
            path: {
                'risk_issue_id': riskIssueId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update a Risk or Issue
     * Update the details of a specific risk or issue.
     * @returns RiskIssue Successful Response
     * @throws ApiError
     */
    public static updateRiskIssueApiRisksIssuesRiskIssueIdPut({
        riskIssueId,
        requestBody,
    }: {
        riskIssueId: number,
        requestBody: RiskIssueUpdate,
    }): CancelablePromise<RiskIssue> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/risks_issues/{risk_issue_id}',
            path: {
                'risk_issue_id': riskIssueId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete a Risk or Issue
     * Delete a specific risk or issue from the database.
     * @returns void
     * @throws ApiError
     */
    public static deleteRiskIssueApiRisksIssuesRiskIssueIdDelete({
        riskIssueId,
    }: {
        riskIssueId: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/risks_issues/{risk_issue_id}',
            path: {
                'risk_issue_id': riskIssueId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
