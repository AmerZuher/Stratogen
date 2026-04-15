/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSummary } from './UserSummary';
/**
 * Token response schema
 */
export type Token = {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: UserSummary;
};

