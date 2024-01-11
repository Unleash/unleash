import { Store } from './store';
import { PublicSignupTokenSchema } from '../../openapi/spec/public-signup-token-schema';
import { IPublicSignupTokenCreate } from '../models/public-signup-token';

export interface IPublicSignupTokenStore
    extends Store<PublicSignupTokenSchema, string> {
    getAllActive(): Promise<PublicSignupTokenSchema[]>;
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
