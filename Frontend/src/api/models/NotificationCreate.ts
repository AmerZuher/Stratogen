/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationStatus } from './NotificationStatus';
import type { NotificationTargetCreate } from './NotificationTargetCreate';
import type { NotificationType } from './NotificationType';
export type NotificationCreate = {
    title: string;
    message: string;
    notification_type: NotificationType;
    investment_id?: (number | null);
    related_type?: (string | null);
    related_id?: (number | null);
    status?: (NotificationStatus | null);
    targets?: Array<NotificationTargetCreate>;
};

