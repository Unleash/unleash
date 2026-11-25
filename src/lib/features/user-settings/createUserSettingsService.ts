import type { Db } from '../../db/db.js';
import { FakeUserSettingsStore } from './fake-user-settings-store.js';
import { UserSettingsService } from './user-settings-service.js';
import { UserSettingsStore } from './user-settings-store.js';

export const createUserSettingsService = (db: Db) =>
    new UserSettingsService(new UserSettingsStore(db, () => new Date()));

export const createFakeUserSettingsService = () =>
    new UserSettingsService(new FakeUserSettingsStore());
