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
}

export interface IChangeRequestFeature {
    name: string;
    conflict?: string;
    changes: IChangeRequestEvent[];
}

export interface IChangeRequestBase {
    id?: number;
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
};

export type ChangeRequestAction =
    | 'updateEnabled'
    | 'addStrategy'
    | 'updateStrategy'
    | 'deleteStrategy';
