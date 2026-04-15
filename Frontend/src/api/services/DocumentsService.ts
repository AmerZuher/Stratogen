/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_bulk_upload_documents_api_documents_bulk_upload__investment_id__post } from '../models/Body_bulk_upload_documents_api_documents_bulk_upload__investment_id__post';
import type { Body_upload_document_api_documents__investment_id__upload_post } from '../models/Body_upload_document_api_documents__investment_id__upload_post';
import type { DocumentResponse } from '../models/DocumentResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
    /**
     * Upload Document
     * Upload a document to an investment
     * @returns DocumentResponse Successful Response
     * @throws ApiError
     */
    public static uploadDocumentApiDocumentsInvestmentIdUploadPost({
        investmentId,
        formData,
        name,
    }: {
        investmentId: number,
        formData: Body_upload_document_api_documents__investment_id__upload_post,
        name?: (string | null),
    }): CancelablePromise<DocumentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/documents/{investment_id}/upload',
            path: {
                'investment_id': investmentId,
            },
            query: {
                'name': name,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Investment Documents
     * Get all documents for an investment
     * @returns DocumentResponse Successful Response
     * @throws ApiError
     */
    public static getInvestmentDocumentsApiDocumentsInvestmentIdDocumentsGet({
        investmentId,
    }: {
        investmentId: number,
    }): CancelablePromise<Array<DocumentResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/{investment_id}/documents',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Document Info
     * Get document information
     * @returns DocumentResponse Successful Response
     * @throws ApiError
     */
    public static getDocumentInfoApiDocumentsDocumentDocumentIdGet({
        documentId,
    }: {
        documentId: number,
    }): CancelablePromise<DocumentResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/document/{document_id}',
            path: {
                'document_id': documentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Document
     * Delete a document
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDocumentApiDocumentsDocumentDocumentIdDelete({
        documentId,
    }: {
        documentId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/documents/document/{document_id}',
            path: {
                'document_id': documentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Download Document
     * Download a document
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadDocumentApiDocumentsDocumentDocumentIdDownloadGet({
        documentId,
    }: {
        documentId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/document/{document_id}/download',
            path: {
                'document_id': documentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get My Documents
     * Get documents uploaded by the current user
     * @returns DocumentResponse Successful Response
     * @throws ApiError
     */
    public static getMyDocumentsApiDocumentsMyDocumentsGet({
        skip,
        limit = 100,
    }: {
        skip?: number,
        limit?: number,
    }): CancelablePromise<Array<DocumentResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/my-documents',
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
     * Get Storage Stats
     * Get storage statistics for user's documents
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getStorageStatsApiDocumentsStatsStorageGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/documents/stats/storage',
        });
    }
    /**
     * Bulk Upload Documents
     * Upload multiple documents to an investment
     * @returns any Successful Response
     * @throws ApiError
     */
    public static bulkUploadDocumentsApiDocumentsBulkUploadInvestmentIdPost({
        investmentId,
        formData,
    }: {
        investmentId: number,
        formData: Body_bulk_upload_documents_api_documents_bulk_upload__investment_id__post,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/documents/bulk-upload/{investment_id}',
            path: {
                'investment_id': investmentId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
