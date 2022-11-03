export type ChangeRequestState =
    | 'Draft'
    | 'Approved'
    | 'In review'
    | 'Applied'
    | 'Cancelled';

export interface IChangeRequest {
    id: number;
    environment: string;
    state: ChangeRequestState;
    project: string;
    createdBy: ICreatedBy;
    createdAt: string;
    features: IChangeRequestFeatures[];
}

interface ICreatedBy {
    id: number;
    username: string;
    imageUrl: string;
}

interface IChangeRequestFeatures {
    name: string;
    changes: IChangeRequestFeatureChanges[];
}

interface IChangeRequestFeatureChanges {
    id: number;
    action: string;
    payload: unknown;
    createdAt: string;
    createdBy: ICreatedBy;
    warning?: string;
}

export const hasEnabledField = (
    payload: unknown
): payload is { enabled: boolean } =>
    typeof payload === 'object' && payload !== null && 'enabled' in payload;

export const hasNameField = (payload: unknown): payload is { name: string } =>
    typeof payload === 'object' && payload !== null && 'name' in payload;
