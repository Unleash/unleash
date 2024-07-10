import type { IApiToken, IApiTokenCreate } from '../models/api-token';
import type { Store } from './store';

export interface IApiTokenStore extends Store<IApiToken, string> {
    getAllActive(): Promise<IApiToken[]>;
    insert(newToken: IApiTokenCreate): Promise<IApiToken>;
    setExpiry(secret: string, expiresAt: Date): Promise<IApiToken>;
    markSeenAt(secrets: string[]): Promise<void>;
    count(): Promise<number>;
    countByType(): Promise<Map<string, number>>;
    countDeprecatedTokens(): Promise<{
        orphanedTokens: number;
        activeOrphanedTokens: number;
        legacyTokens: number;
        activeLegacyTokens: number;
    }>;
}
