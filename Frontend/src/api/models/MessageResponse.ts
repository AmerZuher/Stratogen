/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeedbackResponse } from './FeedbackResponse';
/**
 * Message response schema
 */
export type MessageResponse = {
    content: string;
    role: string;
    id: number;
    conversation_id: number;
    created_at: string;
    feedback?: Array<FeedbackResponse>;
};

