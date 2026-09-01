import type { ApiTokenType } from '../../types/model.js';

export interface ApiTokenV2 {
    selector: string;
    tokenName: string;
    type: ApiTokenType;
    projects: string[];
    environment: string;
    expiresAt?: Date;
    createdAt: Date;
    seenAt?: Date;
    secure: boolean;
}

export interface CreateApiTokenV2 {
    tokenName: string;
    type: ApiTokenType;
    projects: string[];
    environment: string;
    expiresAt?: Date;
    userCreated: boolean;
}

export interface ApiTokenV2WithSecret extends ApiTokenV2 {
    secret: string;
}

export interface ApiTokenV2WithVerifier extends ApiTokenV2 {
    verifier: string;
}

export interface IApiTokenV2Store {
    create(
        token: CreateApiTokenV2,
        selector: string,
        verifier: string,
    ): Promise<ApiTokenV2>;
    getBySelector(
        selector: string,
    ): Promise<ApiTokenV2WithVerifier | undefined>;
    getAllActive(): Promise<ApiTokenV2WithVerifier[]>;
    getUserDefinedTokens(): Promise<ApiTokenV2[]>;
    setExpiry(
        selector: string,
        expiresAt: Date,
    ): Promise<ApiTokenV2 | undefined>;
    delete(selector: string): Promise<void>;
    deleteByEnvironment(environment: string): Promise<ApiTokenV2[]>;
    markSeenAt(selector: string): Promise<void>;
    countUserCreatedTokens(): Promise<number>;
    deleteSystemCreatedTokensNotSeen(
        minutesSinceLastSeen: number,
    ): Promise<Omit<ApiTokenV2, 'projects'>[]>;
}
