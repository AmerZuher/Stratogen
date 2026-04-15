/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_login_for_access_token_api_auth_login_post } from '../models/Body_login_for_access_token_api_auth_login_post';
import type { Token } from '../models/Token';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Login For Access Token
     * OAuth2 compatible token login, get an access token for future requests
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginForAccessTokenApiAuthLoginPost({
        formData,
    }: {
        formData: Body_login_for_access_token_api_auth_login_post,
    }): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Refresh Token
     * Refresh access token
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static refreshTokenApiAuthRefreshPost(): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
        });
    }
    /**
     * Read Users Me
     * Get current user information
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static readUsersMeApiAuthMeGet(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
        });
    }
    /**
     * Logout
     * Logout endpoint (client should delete token)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static logoutApiAuthLogoutPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
        });
    }
    /**
     * Validate Token
     * Validate token endpoint
     * @returns any Successful Response
     * @throws ApiError
     */
    public static validateTokenApiAuthValidateGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/validate',
        });
    }
}
