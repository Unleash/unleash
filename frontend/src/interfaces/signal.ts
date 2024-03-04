export interface ISignalEndpoint {
    id: number;
    enabled: boolean;
    name: string;
    createdAt: string;
    createdByUserId: number;
    description: string;
    tokens: ISignalEndpointToken[];
}

export interface ISignalEndpointToken {
    id: number;
    name: string;
    signalEndpointId: number;
    createdAt: string;
    createdByUserId: number;
}

export type SignalSource = 'signal-endpoint';

export interface ISignal {
    id: number;
    source: SignalSource;
    sourceId: number;
    createdAt: string;
    createdBySourceTokenId: number;
    payload: Record<string, unknown>;
}

export interface ISignalEndpointSignal
    extends Omit<ISignal, 'createdBySourceTokenId'> {
    tokenName: string;
}
