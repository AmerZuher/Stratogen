/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * KPI response schema
 */
export type KPIResponse = {
    name: string;
    target_value: string;
    actual_value?: (string | null);
    unit?: (string | null);
    measured_at?: (string | null);
    id: number;
    status?: (string | null);
};

