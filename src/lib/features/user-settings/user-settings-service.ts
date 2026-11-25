import type { UserSettingsSchema } from '../../openapi/spec/user-settings-schema.js';
import type { IUser } from '../../types/user.js';
import type {
    IUserSettingsStore,
    UserSettingRow,
} from './user-settings-store-type.js';

type SettingsUser = Pick<IUser, 'id' | 'isAPI'>;

const hasUserRow = ({ id, isAPI }: SettingsUser) => !isAPI && id > 0;

const toRows = (settings: UserSettingsSchema['settings']): UserSettingRow[] =>
    Object.entries(settings).map(([key, { value, expiresAt }]) => ({
        key,
        value,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
    }));

const toSettings = (rows: UserSettingRow[]): UserSettingsSchema['settings'] =>
    Object.fromEntries(
        rows.map(({ key, value, expiresAt }) => [
            key,
            expiresAt
                ? { value, expiresAt: expiresAt.toISOString() }
                : { value },
        ]),
    );

export class UserSettingsService {
    private userSettingsStore: IUserSettingsStore;

    constructor(userSettingsStore: IUserSettingsStore) {
        this.userSettingsStore = userSettingsStore;
    }

    async saveSettings(
        user: SettingsUser,
        settings: UserSettingsSchema['settings'],
    ): Promise<void> {
        if (!hasUserRow(user)) {
            return;
        }
        await this.userSettingsStore.upsert(user.id, toRows(settings));
    }

    async getSettings(
        user: SettingsUser,
    ): Promise<UserSettingsSchema['settings']> {
        if (!hasUserRow(user)) {
            return {};
        }
        return toSettings(
            await this.userSettingsStore.getActiveSettingsForUser(user.id),
        );
    }
}
