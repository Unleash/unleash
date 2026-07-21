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
}

export interface ApiTokenV2WithSecret extends ApiTokenV2 {
    secret: string;
}

export interface IApiTokenV2Store {
    create(
        token: CreateApiTokenV2,
        selector: string,
        verifier: string,
    ): Promise<ApiTokenV2>;
    getBySelector(
        selector: string,
    ): Promise<(ApiTokenV2 & { verifier: string }) | undefined>;
    getUserDefinedTokens(): Promise<ApiTokenV2[]>;
    setExpiry(
        selector: string,
        expiresAt: Date,
    ): Promise<ApiTokenV2 | undefined>;
    delete(selector: string): Promise<void>;
    markSeenAt(selector: string): Promise<void>;
    count(): Promise<number>;
}
