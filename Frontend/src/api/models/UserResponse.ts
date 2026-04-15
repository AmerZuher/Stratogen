/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * User response schema
 */
export type UserResponse = {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    department?: (string | null);
    roles?: Array<string>;
};

