import type {
    IUserSettingsStore,
    UserSettingRow,
} from './user-settings-store-type.js';

export class FakeUserSettingsStore implements IUserSettingsStore {
    private rowsByUser = new Map<number, Map<string, UserSettingRow>>();

    private now: () => Date;

    constructor(now: () => Date) {
        this.now = now;
    }

    async upsert(userId: number, rows: UserSettingRow[]): Promise<void> {
        const userRows =
            this.rowsByUser.get(userId) ?? new Map<string, UserSettingRow>();
        for (const row of rows) {
            userRows.set(row.key, row);
        }
        this.rowsByUser.set(userId, userRows);
    }

    async getActiveSettingsForUser(userId: number): Promise<UserSettingRow[]> {
        const now = this.now();
        return this.getRows(userId).filter(
            ({ expiresAt }) => expiresAt === null || expiresAt > now,
        );
    }

    getRows(userId: number): UserSettingRow[] {
        return [...(this.rowsByUser.get(userId)?.values() ?? [])];
    }
}
