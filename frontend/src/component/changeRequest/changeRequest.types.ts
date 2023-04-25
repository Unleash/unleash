import { IFeatureVariant } from 'interfaces/featureToggle';
import { IFeatureStrategy } from '../../interfaces/strategy';
import { IUser } from '../../interfaces/user';

export interface IChangeRequest {
    id: number;
    state: ChangeRequestState;
    title: string;
    project: string;
    environment: string;
    minApprovals: number;
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
    changes: IChange[];
    defaultChange?: IChangeRequestAddStrategy | IChangeRequestEnabled;
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
    | ChangeRequestDeleteStrategy
    | ChangeRequestVariantPatch;

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

export interface IChangeRequestPatchVariant extends IChangeRequestBase {
    action: 'patchVariant';
    payload: ChangeRequestVariantPatch;
}

export type IChange =
    | IChangeRequestAddStrategy
    | IChangeRequestDeleteStrategy
    | IChangeRequestUpdateStrategy
    | IChangeRequestEnabled
    | IChangeRequestPatchVariant;

type ChangeRequestVariantPatch = {
    variants: IFeatureVariant[];
};

type ChangeRequestEnabled = { enabled: boolean };

type ChangeRequestAddStrategy = Pick<
    IFeatureStrategy,
    'parameters' | 'constraints' | 'segments' | 'title' | 'disabled'
> & { name: string };

type ChangeRequestEditStrategy = ChangeRequestAddStrategy & { id: string };

type ChangeRequestDeleteStrategy = {
    id: string;
    name: string;
    title?: string;
    disabled?: boolean;
};

export type ChangeRequestAction =
    | 'updateEnabled'
    | 'addStrategy'
    | 'updateStrategy'
    | 'deleteStrategy'
    | 'patchVariant';
