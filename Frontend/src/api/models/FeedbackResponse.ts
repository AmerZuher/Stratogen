/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Feedback response schema
 */
export type FeedbackResponse = {
    rating?: (number | null);
    comment?: (string | null);
    id: number;
    user_id?: (number | null);
    message_id?: (number | null);
    conversation_id?: (number | null);
    created_at: string;
};

