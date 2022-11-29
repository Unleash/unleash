import { IFeatureStrategy } from '../../interfaces/strategy';
import { IUser } from '../../interfaces/user';

export interface IChangeRequest {
    id: number;
    state: ChangeRequestState;
    project: string;
    environment: string;
    createdBy: Pick<IUser, 'id' | 'username' | 'imageUrl'>;
    createdAt: Date;
    features: IChangeRequestFeature[];
    approvals: IChangeRequestApproval[];
    comments: IChangeRequestComment[];
    conflict?: string;
}

export interface IChangeRequestEnvironmentConfig {
    environment: string;
    type: string;
    changeRequestEnabled: boolean;
    requiredApprovals: number;
}

export interface IChangeRequestFeature {
    name: string;
    conflict?: string;
    changes: IChangeRequestEvent[];
}

export interface IChangeRequestApproval {
    createdBy: Pick<IUser, 'id' | 'username' | 'imageUrl'>;
    createdAt: Date;
}

export interface IChangeRequestComment {
    text: string;
    createdBy: Pick<IUser, 'username' | 'imageUrl'>;
    createdAt: Date;
    id: string;
}

export interface IChangeRequestBase {
    id: number;
    action: ChangeRequestAction;
    payload: ChangeRequestPayload;
    conflict?: string;
    createdBy?: Pick<IUser, 'id' | 'username' | 'imageUrl'>;
    createdAt?: Date;
}

export type ChangeRequestState =
    | 'Draft'
    | 'Approved'
    | 'In review'
    | 'Applied'
    | 'Cancelled';

type ChangeRequestPayload =
    | ChangeRequestEnabled
    | ChangeRequestAddStrategy
    | ChangeRequestEditStrategy
    | ChangeRequestDeleteStrategy;

export interface IChangeRequestAddStrategy extends IChangeRequestBase {
    action: 'addStrategy';
    payload: ChangeRequestAddStrategy;
}

export interface IChangeRequestDeleteStrategy extends IChangeRequestBase {
    action: 'deleteStrategy';
    payload: ChangeRequestDeleteStrategy;
}

export interface IChangeRequestUpdateStrategy extends IChangeRequestBase {
    action: 'updateStrategy';
    payload: ChangeRequestEditStrategy;
}

export interface IChangeRequestEnabled extends IChangeRequestBase {
    action: 'updateEnabled';
    payload: ChangeRequestEnabled;
}

export type IChangeRequestEvent =
    | IChangeRequestAddStrategy
    | IChangeRequestDeleteStrategy
    | IChangeRequestUpdateStrategy
    | IChangeRequestEnabled;

type ChangeRequestEnabled = { enabled: boolean };

type ChangeRequestAddStrategy = Pick<
    IFeatureStrategy,
    'parameters' | 'constraints'
> & { name: string };

type ChangeRequestEditStrategy = ChangeRequestAddStrategy & { id: string };

type ChangeRequestDeleteStrategy = {
    id: string;
    name: string;
};

export type ChangeRequestAction =
    | 'updateEnabled'
    | 'addStrategy'
    | 'updateStrategy'
    | 'deleteStrategy';

export const hasNameField = (payload: unknown): payload is { name: string } =>
    typeof payload === 'object' && payload !== null && 'name' in payload;
