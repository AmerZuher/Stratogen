/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notification } from '../models/Notification';
import type { NotificationCreate } from '../models/NotificationCreate';
import type { NotificationTarget } from '../models/NotificationTarget';
import type { NotificationUpdate } from '../models/NotificationUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Create Notification
     * Create a new notification.
     * @returns Notification Successful Response
     * @throws ApiError
     */
    public static createNotificationApiNotificationsPost({
        requestBody,
    }: {
        requestBody: NotificationCreate,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notifications/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read User Notifications
     * Retrieve notifications for a specific user.
     * @returns Notification Successful Response
     * @throws ApiError
     */
    public static readUserNotificationsApiNotificationsUserUserIdGet({
        userId,
        skip,
        limit = 100,
    }: {
        userId: number,
        skip?: number,
        limit?: number,
    }): CancelablePromise<Array<Notification>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notifications/user/{user_id}',
            path: {
                'user_id': userId,
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
     * Read Notification
     * Retrieve a single notification by its ID.
     * @returns Notification Successful Response
     * @throws ApiError
     */
    public static readNotificationApiNotificationsNotificationIdGet({
        notificationId,
    }: {
        notificationId: number,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Notification
     * Delete a notification.
     * @returns void
     * @throws ApiError
     */
    public static deleteNotificationApiNotificationsNotificationIdDelete({
        notificationId,
    }: {
        notificationId: number,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Notification Status
     * Update the status of a notification (e.g., to READ or ARCHIVED).
     * @returns Notification Successful Response
     * @throws ApiError
     */
    public static updateNotificationStatusApiNotificationsNotificationIdStatusPatch({
        notificationId,
        requestBody,
    }: {
        notificationId: number,
        requestBody: NotificationUpdate,
    }): CancelablePromise<Notification> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/notifications/{notification_id}/status',
            path: {
                'notification_id': notificationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mark Notification Target As Read
     * Mark a specific notification target as read.
     * @returns NotificationTarget Successful Response
     * @throws ApiError
     */
    public static markNotificationTargetAsReadApiNotificationsTargetTargetIdReadPatch({
        targetId,
    }: {
        targetId: number,
    }): CancelablePromise<NotificationTarget> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/notifications/target/{target_id}/read',
            path: {
                'target_id': targetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
