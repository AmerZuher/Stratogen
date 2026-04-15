/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from './MessageResponse';
/**
 * Chat response schema
 */
export type ChatResponse = {
    user_message: MessageResponse;
    assistant_message: MessageResponse;
    conversation_id: number;
    processing_time_ms?: (number | null);
    model_used?: (string | null);
};

