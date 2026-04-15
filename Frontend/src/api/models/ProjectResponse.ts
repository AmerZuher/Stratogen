/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Project response schema
 */
export type ProjectResponse = {
    start_date: string;
    end_date?: (string | null);
    objective?: (string | null);
    planned_cost?: (string | null);
    actual_cost?: (string | null);
    planned_effort?: (string | null);
    actual_effort?: (string | null);
    baseline_start?: (string | null);
    baseline_finish?: (string | null);
    progress?: (number | null);
    id: number;
    manager_id: number;
    status?: (string | null);
};

