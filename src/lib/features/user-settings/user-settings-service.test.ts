import { ADMIN_TOKEN_USER, SYSTEM_USER } from '../../types/core.js';
import NoAuthUser from '../../types/no-auth-user.js';
import { FakeUserSettingsStore } from './fake-user-settings-store.js';
import { UserSettingsService } from './user-settings-service.js';

const user = { id: 7, isAPI: false };

const setup = () => {
    const userSettingsStore = new FakeUserSettingsStore();
    const userSettingsService = new UserSettingsService(userSettingsStore);
    return { userSettingsStore, userSettingsService };
};

test('saves every key it is given, with its expiry', async () => {
    const { userSettingsStore, userSettingsService } = setup();

    await userSettingsService.saveSettings(user, {
        'unleash-theme': { value: 'dark' },
        'feedback-module-survey-grace:v1': {
            value: true,
            expiresAt: '2026-12-01T12:00:00.000Z',
        },
    });

    expect(userSettingsStore.getRows(user.id)).toEqual([
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
        {
            key: 'feedback-module-survey-grace:v1',
            value: true,
            expiresAt: new Date('2026-12-01T12:00:00.000Z'),
        },
    ]);
});

test('overwrites the keys it is given and leaves the other keys untouched', async () => {
    const { userSettingsStore, userSettingsService } = setup();
    await userSettingsService.saveSettings(user, {
        'unleash-theme': { value: 'dark' },
        'navigation-mode:v1': { value: 'compact' },
    });

    await userSettingsService.saveSettings(user, {
        'unleash-theme': { value: 'light' },
    });

    expect(userSettingsStore.getRows(user.id)).toEqual([
        { key: 'unleash-theme', value: 'light', expiresAt: null },
        { key: 'navigation-mode:v1', value: 'compact', expiresAt: null },
    ]);
});

test('keeps an entry whose value is null', async () => {
    const { userSettingsStore, userSettingsService } = setup();
    await userSettingsService.saveSettings(user, {
        'unleash-theme': { value: 'dark' },
    });

    await userSettingsService.saveSettings(user, {
        'unleash-theme': { value: null },
    });

    expect(userSettingsStore.getRows(user.id)).toEqual([
        { key: 'unleash-theme', value: null, expiresAt: null },
    ]);
});

test.each([
    ['the admin token user', ADMIN_TOKEN_USER],
    ['none authentication', new NoAuthUser()],
    ['the system user', SYSTEM_USER],
    ['an API caller even if it carries a user id', { id: 7, isAPI: true }],
])('drops a save made with %s', async (_, caller) => {
    const { userSettingsStore, userSettingsService } = setup();

    await userSettingsService.saveSettings(caller, {
        'unleash-theme': { value: 'dark' },
    });

    expect(userSettingsStore.getRows(caller.id)).toEqual([]);
});
