import type { Store } from './store.js';
import type { PublicSignupTokenSchema } from '../../openapi/spec/public-signup-token-schema.js';
import type { IPublicSignupTokenCreate } from '../models/public-signup-token.js';

export interface IPublicSignupTokenStore
    extends Store<PublicSignupTokenSchema, string> {
    insert(
        newToken: IPublicSignupTokenCreate,
    ): Promise<PublicSignupTokenSchema>;
    addTokenUser(secret: string, userId: number): Promise<void>;
    isValid(secret): Promise<boolean>;
    update(
        secret: string,
        value: { expiresAt?: Date; enabled?: boolean },
    ): Promise<PublicSignupTokenSchema>;
    delete(secret: string): Promise<void>;
    count(): Promise<number>;
}
