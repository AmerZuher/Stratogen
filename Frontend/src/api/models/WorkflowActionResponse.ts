/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Workflow action response
 */
export type WorkflowActionResponse = {
    success: boolean;
    message: string;
    new_status?: (string | null);
    new_step?: (string | null);
    is_terminal?: boolean;
};

