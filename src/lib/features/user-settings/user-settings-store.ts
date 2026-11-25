import type { Db } from '../../db/db.js';
import type {
    IUserSettingsStore,
    UserSettingRow,
} from './user-settings-store-type.js';

const TABLE = 'user_settings';

export class UserSettingsStore implements IUserSettingsStore {
    private db: Db;

    private now: () => Date;

    constructor(db: Db, now: () => Date) {
        this.db = db;
        this.now = now;
    }

    async upsert(userId: number, rows: UserSettingRow[]): Promise<void> {
        if (rows.length === 0) {
            return;
        }
        const now = this.now();
        await this.db(TABLE)
            .insert(
                rows.map(({ key, value, expiresAt }) => ({
                    user_id: userId,
                    key,
                    // hand knex one json literal so arrays and null are stored as jsonb, not as pg arrays or SQL null
                    value: JSON.stringify(value),
                    expires_at: expiresAt,
                    created_at: now,
                    updated_at: now,
                })),
            )
            .onConflict(['user_id', 'key'])
            .merge(['value', 'expires_at', 'updated_at']);
    }

    async getActiveSettingsForUser(userId: number): Promise<UserSettingRow[]> {
        const rows = await this.db(TABLE)
            .select('key', 'value', 'expires_at')
            .where({ user_id: userId })
            .andWhere((notExpired) =>
                notExpired
                    .whereNull('expires_at')
                    .orWhere('expires_at', '>', this.now()),
            );
        return rows.map(({ key, value, expires_at }) => ({
            key,
            value,
            expiresAt: expires_at,
        }));
    }
}
