import type { IApiToken, IEdgeTokenStore } from '../../types/index.js';
import type { EdgeClient } from '../../types/stores/edge-store.js';

export class FakeEdgeTokenStore implements IEdgeTokenStore {
    registerNonce(
        clientId: string,
        nonce: string,
        expiresAt: Date,
    ): Promise<void> {
        return Promise.resolve(undefined);
    }

    getToken(
        clientId: string,
        environment: string,
        projects: string[],
    ): Promise<IApiToken | undefined> {
        return Promise.resolve(undefined);
    }

    loadClient(clientId: string): Promise<EdgeClient | undefined> {
        return Promise.resolve(undefined);
    }

    saveToken(clientId: string, token: IApiToken): Promise<void> {
        return Promise.resolve(undefined);
    }

    saveClient(clientId: string, secretEnc: Buffer): Promise<void> {
        return Promise.resolve(undefined);
    }
}
