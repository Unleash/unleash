import type { IApiToken } from '../model.js';
export type EdgeClient = {
    id: string;
    secret_enc: Buffer;
};

export interface IEdgeTokenStore {
    registerNonce(
        clientId: string,
        nonce: string,
        expiresAt: Date,
    ): Promise<void>;
    saveClient(clientId: string, secretEnc: Buffer): Promise<void>;
    loadClient(clientId: string): Promise<EdgeClient | undefined>;
    getToken(
        clientId: string,
        environment: string,
        projects: string[],
    ): Promise<IApiToken | undefined>;
    saveToken(clientId: string, token: IApiToken): Promise<void>;
    cleanExpiredNonces(): Promise<void>;
}
