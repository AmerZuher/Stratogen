/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from './MessageResponse';
/**
 * Conversation response schema
 */
export type ConversationResponse = {
    title?: (string | null);
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    messages?: Array<MessageResponse>;
};

