import { FakeUserSettingsStore } from './fake-user-settings-store.js';
import { UserSettingsService } from './user-settings-service.js';

export const createUserSettingsService = () =>
    new UserSettingsService(new FakeUserSettingsStore());
