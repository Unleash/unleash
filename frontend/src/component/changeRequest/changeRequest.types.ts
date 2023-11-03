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
    rejections: IChangeRequestApproval[];
    comments: IChangeRequestComment[];
    conflict?: string;
    schedule?: IChangeRequestSchedule;
}

export interface IChangeRequestSchedule {
    scheduledAt: string;
    status: 'pending' | 'failed';
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
    | 'Scheduled'
    | 'Cancelled'
    | 'Rejected';

type ChangeRequestPayload =
    | ChangeRequestEnabled
    | ChangeRequestAddStrategy
    | ChangeRequestEditStrategy
    | ChangeRequestDeleteStrategy
    | ChangeRequestVariantPatch
    | IChangeRequestUpdateSegment
    | IChangeRequestDeleteSegment
    | SetStrategySortOrderSchema
    | IChangeRequestArchiveFeature
    | ChangeRequestAddDependency;

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

export interface IChangeRequestArchiveFeature extends IChangeRequestChangeBase {
    action: 'archiveFeature';
}

export interface IChangeRequestAddDependency extends IChangeRequestChangeBase {
    action: 'addDependency';
    payload: ChangeRequestAddDependency;
}

export interface IChangeRequestDeleteDependency
    extends IChangeRequestChangeBase {
    action: 'deleteDependency';
}

export interface IChangeRequestReorderStrategy
    extends IChangeRequestChangeBase {
    action: 'reorderStrategy';
    payload: SetStrategySortOrderSchema;
}

export interface IChangeRequestUpdateSegment {
    id: number;
    action: 'updateSegment';
    conflict?: string;
    name: string;
    payload: {
        id: number;
        name: string;
        description?: string;
        project?: string;
        constraints: IFeatureStrategy['constraints'];
    };
}

export interface IChangeRequestDeleteSegment {
    id: number;
    action: 'deleteSegment';
    conflict?: string;
    name: string;
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
    | IChangeRequestReorderStrategy
    | IChangeRequestArchiveFeature
    | IChangeRequestAddDependency
    | IChangeRequestDeleteDependency;

export type ISegmentChange =
    | IChangeRequestUpdateSegment
    | IChangeRequestDeleteSegment;

type ChangeRequestVariantPatch = {
    variants: IFeatureVariant[];
};

type ChangeRequestEnabled = { enabled: boolean };

type ChangeRequestAddDependency = { feature: string };

type ChangeRequestAddStrategy = Pick<
    IFeatureStrategy,
    | 'parameters'
    | 'constraints'
    | 'segments'
    | 'title'
    | 'disabled'
    | 'variants'
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
    | 'deleteSegment'
    | 'archiveFeature'
    | 'addDependency'
    | 'deleteDependency';
