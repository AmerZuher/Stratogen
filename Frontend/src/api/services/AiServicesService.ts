/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatRequest } from '../models/ChatRequest';
import type { ChatResponse } from '../models/ChatResponse';
import type { ConversationCreate } from '../models/ConversationCreate';
import type { ConversationResponse } from '../models/ConversationResponse';
import type { ConversationUpdate } from '../models/ConversationUpdate';
import type { FeedbackCreate } from '../models/FeedbackCreate';
import type { FeedbackResponse } from '../models/FeedbackResponse';
import type { FeedbackUpdate } from '../models/FeedbackUpdate';
import type { MessageResponse } from '../models/MessageResponse';
import type { ReportGenerationRequest } from '../models/ReportGenerationRequest';
import type { ReportGenerationResponse } from '../models/ReportGenerationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiServicesService {
    /**
     * Create Conversation
     * Create a new conversation
     * @returns ConversationResponse Successful Response
     * @throws ApiError
     */
    public static createConversationApiAiServicesPost({
        requestBody,
    }: {
        requestBody: ConversationCreate,
    }): CancelablePromise<ConversationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai_services/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversations
     * Get user's conversations with pagination
     * @returns ConversationResponse Successful Response
     * @throws ApiError
     */
    public static getConversationsApiAiServicesGet({
        skip,
        limit = 50,
    }: {
        skip?: number,
        limit?: number,
    }): CancelablePromise<Array<ConversationResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai_services/',
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
     * Get Conversation
     * Get conversation by ID
     * @returns ConversationResponse Successful Response
     * @throws ApiError
     */
    public static getConversationApiAiServicesConversationIdGet({
        conversationId,
    }: {
        conversationId: number,
    }): CancelablePromise<ConversationResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai_services/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Conversation Title
     * Update conversation title
     * @returns ConversationResponse Successful Response
     * @throws ApiError
     */
    public static updateConversationTitleApiAiServicesConversationIdPut({
        conversationId,
        requestBody,
    }: {
        conversationId: number,
        requestBody: ConversationUpdate,
    }): CancelablePromise<ConversationResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/ai_services/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Conversation
     * Delete conversation
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteConversationApiAiServicesConversationIdDelete({
        conversationId,
    }: {
        conversationId: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/ai_services/{conversation_id}',
            path: {
                'conversation_id': conversationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversation Messages
     * Get messages for a conversation
     * @returns MessageResponse Successful Response
     * @throws ApiError
     */
    public static getConversationMessagesApiAiServicesConversationIdMessagesGet({
        conversationId,
        skip,
        limit = 100,
    }: {
        conversationId: number,
        skip?: number,
        limit?: number,
    }): CancelablePromise<Array<MessageResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai_services/{conversation_id}/messages',
            path: {
                'conversation_id': conversationId,
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
     * Chat
     * Send a message and get AI response
     * @returns ChatResponse Successful Response
     * @throws ApiError
     */
    public static chatApiAiServicesConversationIdChatPost({
        conversationId,
        requestBody,
    }: {
        conversationId: number,
        requestBody: ChatRequest,
    }): CancelablePromise<ChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai_services/{conversation_id}/chat',
            path: {
                'conversation_id': conversationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Report Endpoint
     * Triggers the generation of a report for a given investment.
     * @returns ReportGenerationResponse Successful Response
     * @throws ApiError
     */
    public static generateReportEndpointApiAiServicesReportsGeneratePost({
        requestBody,
    }: {
        requestBody: ReportGenerationRequest,
    }): CancelablePromise<ReportGenerationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai_services/reports/generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Message Feedback
     * Create feedback for a message
     * @returns FeedbackResponse Successful Response
     * @throws ApiError
     */
    public static createMessageFeedbackApiAiServicesMessagesMessageIdFeedbackPost({
        messageId,
        requestBody,
    }: {
        messageId: number,
        requestBody: FeedbackCreate,
    }): CancelablePromise<FeedbackResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai_services/messages/{message_id}/feedback',
            path: {
                'message_id': messageId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Message Feedback
     * Get feedback for a message
     * @returns FeedbackResponse Successful Response
     * @throws ApiError
     */
    public static getMessageFeedbackApiAiServicesMessagesMessageIdFeedbackGet({
        messageId,
    }: {
        messageId: number,
    }): CancelablePromise<Array<FeedbackResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai_services/messages/{message_id}/feedback',
            path: {
                'message_id': messageId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Feedback
     * Update feedback
     * @returns FeedbackResponse Successful Response
     * @throws ApiError
     */
    public static updateFeedbackApiAiServicesFeedbackFeedbackIdPut({
        feedbackId,
        requestBody,
    }: {
        feedbackId: number,
        requestBody: FeedbackUpdate,
    }): CancelablePromise<FeedbackResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/ai_services/feedback/{feedback_id}',
            path: {
                'feedback_id': feedbackId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Conversation Stats
     * Get conversation statistics for the user
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getConversationStatsApiAiServicesStatsSummaryGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai_services/stats/summary',
        });
    }
}
