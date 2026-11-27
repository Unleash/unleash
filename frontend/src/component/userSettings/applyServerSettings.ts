import type { UserSettingSchema } from 'openapi';
import { removeLocalStorageItem, setLocalStorageItem } from 'utils/storage';
import type { ServerBackedKey } from './serverBackedKeys.ts';
import type { UserSettings } from './userSettingsClient.ts';

const timeToLiveUntil = (expiresAt: string | undefined) =>
    expiresAt === undefined ? undefined : Date.parse(expiresAt) - Date.now();

const applyServerSetting = (
    key: ServerBackedKey,
    setting: UserSettingSchema | undefined,
) => {
    if (setting === undefined) {
        return;
    }
    if (setting.value === null) {
        removeLocalStorageItem(key.localStorageName);
        return;
    }
    const timeToLive = timeToLiveUntil(setting.expiresAt);
    if (Number.isNaN(timeToLive)) {
        return;
    }
    setLocalStorageItem(key.localStorageName, setting.value, timeToLive);
};

export const applyServerSettings = (
    settings: UserSettings,
    keys: ServerBackedKey[],
) => {
    for (const key of keys) {
        applyServerSetting(key, settings[key.key]);
    }
};
