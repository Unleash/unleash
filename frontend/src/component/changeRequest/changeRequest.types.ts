import { IFeatureVariant } from 'interfaces/featureToggle';
import { IFeatureStrategy } from '../../interfaces/strategy';
import { IUser } from '../../interfaces/user';
import { SetStrategySortOrderSchema } from '../../openapi';

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
    segments: ISegmentChange[];
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
    changes: IFeatureChange[];
    defaultChange?: IChangeRequestAddStrategy | IChangeRequestEnabled;
}

export interface IChangeRequestSegment {
    name: string;
    conflict?: string;
    changes: IFeatureChange[];
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

export interface IChangeRequestChangeBase {
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
    | ChangeRequestVariantPatch
    | IChangeRequestUpdateSegment
    | IChangeRequestDeleteSegment
    | SetStrategySortOrderSchema;

export interface IChangeRequestAddStrategy extends IChangeRequestChangeBase {
    action: 'addStrategy';
    payload: ChangeRequestAddStrategy;
}

export interface IChangeRequestDeleteStrategy extends IChangeRequestChangeBase {
    action: 'deleteStrategy';
    payload: ChangeRequestDeleteStrategy;
}

export interface IChangeRequestUpdateStrategy extends IChangeRequestChangeBase {
    action: 'updateStrategy';
    payload: ChangeRequestEditStrategy;
}

export interface IChangeRequestEnabled extends IChangeRequestChangeBase {
    action: 'updateEnabled';
    payload: ChangeRequestEnabled;
}

export interface IChangeRequestPatchVariant extends IChangeRequestChangeBase {
    action: 'patchVariant';
    payload: ChangeRequestVariantPatch;
}

export interface IChangeRequestReorderStrategy
    extends IChangeRequestChangeBase {
    action: 'reorderStrategy';
    payload: SetStrategySortOrderSchema;
}

export interface IChangeRequestUpdateSegment {
    action: 'updateSegment';
    conflict?: string;
    name?: string;
    payload: {
        id: number;
        name: string;
        description?: string;
        project?: string;
        constraints: IFeatureStrategy['constraints'];
    };
}

export interface IChangeRequestDeleteSegment {
    action: 'deleteSegment';
    conflict?: string;
    name?: string;
    payload: {
        id: number;
        name: string;
    };
}

export type IChange = IFeatureChange | ISegmentChange;

export type IFeatureChange =
    | IChangeRequestAddStrategy
    | IChangeRequestDeleteStrategy
    | IChangeRequestUpdateStrategy
    | IChangeRequestEnabled
    | IChangeRequestPatchVariant
    | IChangeRequestReorderStrategy;

export type ISegmentChange =
    | IChangeRequestUpdateSegment
    | IChangeRequestDeleteSegment;

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
    | 'patchVariant'
    | 'reorderStrategy'
    | 'updateSegment'
    | 'deleteSegment';
