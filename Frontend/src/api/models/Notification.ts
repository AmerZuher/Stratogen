/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationStatus } from './NotificationStatus';
import type { NotificationTarget } from './NotificationTarget';
import type { NotificationType } from './NotificationType';
export type Notification = {
    title: string;
    message: string;
    notification_type: NotificationType;
    investment_id?: (number | null);
    related_type?: (string | null);
    related_id?: (number | null);
    id: number;
    status: NotificationStatus;
    created_at: string;
    targets?: Array<NotificationTarget>;
};

