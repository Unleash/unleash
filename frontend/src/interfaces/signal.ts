import { ObservableEventSource } from './action';

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

export interface ISignal {
    id: number;
    payload: Record<string, unknown>;
    createdAt: string;
    source: ObservableEventSource;
    sourceId: number;
    tokenName: string;
}
