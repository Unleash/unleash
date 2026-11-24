export type UserSettingRow = {
    key: string;
    value: unknown;
    expiresAt: Date | null;
};

export interface IUserSettingsStore {
    upsert(userId: number, rows: UserSettingRow[]): Promise<void>;
}
