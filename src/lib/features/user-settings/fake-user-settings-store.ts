import type {
    IUserSettingsStore,
    UserSettingRow,
} from './user-settings-store-type.js';

export class FakeUserSettingsStore implements IUserSettingsStore {
    private rowsByUser = new Map<number, Map<string, UserSettingRow>>();

    async upsert(userId: number, rows: UserSettingRow[]): Promise<void> {
        const userRows =
            this.rowsByUser.get(userId) ?? new Map<string, UserSettingRow>();
        for (const row of rows) {
            userRows.set(row.key, row);
        }
        this.rowsByUser.set(userId, userRows);
    }

    getRows(userId: number): UserSettingRow[] {
        return [...(this.rowsByUser.get(userId)?.values() ?? [])];
    }
}
