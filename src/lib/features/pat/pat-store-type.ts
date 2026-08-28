import type { Store } from '../../types/stores/store.js';
import type { CreatePatSchema, PatSchema } from '../../openapi/index.js';

export type PersistedAccountTokenCredential =
    | { secret: string; selector?: never; verifier?: never }
    | { secret?: never; selector: string; verifier: string };

type PatForAudit = Omit<PatSchema, 'secret'> &
    Pick<
        PatSchema,
        | 'id'
        | 'description'
        | 'expiresAt'
        | 'createdAt'
        | 'seenAt'
        | 'userId'
        | 'expiryWarning'
    >;

export type SecureAccountToken = PatForAudit & {
    secure: true;
    selector: string;
};

export type LegacyAccountToken = PatForAudit & {
    secure: false;
    selector?: never;
};

export type AccountTokenForAudit = SecureAccountToken | LegacyAccountToken;

export interface IPatStore extends Store<PatSchema, number> {
    create(
        pat: CreatePatSchema,
        credential: PersistedAccountTokenCredential,
        userId: number,
    ): Promise<PatSchema>;
    getAllByUser(userId: number): Promise<PatSchema[]>;
    deleteForUser(
        id: number,
        userId: number,
    ): Promise<AccountTokenForAudit | undefined>;
    existsWithDescriptionByUser(
        description: string,
        userId: number,
    ): Promise<boolean>;
    countByUser(userId: number): Promise<number>;
}
