import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { UserSettingsStore } from './user-settings-store.js';

let db: ITestDb;
let store: UserSettingsStore;
let userId: number;
let currentTime: Date;

const firstSaveTime = new Date('2026-11-01T10:00:00.000Z');
const secondSaveTime = new Date('2026-11-02T10:00:00.000Z');

beforeAll(async () => {
    db = await dbInit('user_settings_store', getLogger);
    store = new UserSettingsStore(db.rawDatabase, () => currentTime);
});

beforeEach(async () => {
    const user = await db.stores.userStore.insert({
        email: `settings-${Date.now()}-${Math.random()}@getunleash.io`,
    });
    userId = user.id;
    currentTime = firstSaveTime;
});

afterAll(async () => {
    await db.destroy();
});

const getRows = (ownerId = userId) =>
    db
        .rawDatabase('user_settings')
        .where('user_id', ownerId)
        .orderBy('key')
        .select('key', 'value', 'expires_at as expiresAt');

const getTimestamps = () =>
    db
        .rawDatabase('user_settings')
        .where('user_id', userId)
        .orderBy('key')
        .select('key', 'created_at as createdAt', 'updated_at as updatedAt');

test('replaces an existing key and keeps when it was first saved', async () => {
    await store.upsert(userId, [
        {
            key: 'unleash-theme',
            value: 'dark',
            expiresAt: new Date('2026-12-01T12:00:00.000Z'),
        },
    ]);

    currentTime = secondSaveTime;
    await store.upsert(userId, [
        { key: 'unleash-theme', value: ['light'], expiresAt: null },
    ]);

    expect(await getRows()).toEqual([
        { key: 'unleash-theme', value: ['light'], expiresAt: null },
    ]);
    expect(await getTimestamps()).toEqual([
        {
            key: 'unleash-theme',
            createdAt: firstSaveTime,
            updatedAt: secondSaveTime,
        },
    ]);
});

test('keeps the row of a key whose value is null', async () => {
    await store.upsert(userId, [
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);

    await store.upsert(userId, [
        { key: 'unleash-theme', value: null, expiresAt: null },
    ]);

    expect(await getRows()).toEqual([
        { key: 'unleash-theme', value: null, expiresAt: null },
    ]);
});

test('round-trips an expiry', async () => {
    const expiresAt = new Date('2026-12-01T12:00:00.000Z');

    await store.upsert(userId, [
        { key: 'feedback-module-survey-grace:v1', value: true, expiresAt },
    ]);

    expect(await getRows()).toEqual([
        { key: 'feedback-module-survey-grace:v1', value: true, expiresAt },
    ]);
    expect(await store.getActiveSettingsForUser(userId)).toEqual([
        { key: 'feedback-module-survey-grace:v1', value: true, expiresAt },
    ]);
});

test('leaves keys it is not given untouched', async () => {
    await store.upsert(userId, [
        { key: 'navigation-mode:v1', value: 'compact', expiresAt: null },
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);

    currentTime = secondSaveTime;
    await store.upsert(userId, [
        { key: 'unleash-theme', value: 'light', expiresAt: null },
    ]);

    expect(await getRows()).toEqual([
        { key: 'navigation-mode:v1', value: 'compact', expiresAt: null },
        { key: 'unleash-theme', value: 'light', expiresAt: null },
    ]);
    expect(await getTimestamps()).toEqual([
        {
            key: 'navigation-mode:v1',
            createdAt: firstSaveTime,
            updatedAt: firstSaveTime,
        },
        {
            key: 'unleash-theme',
            createdAt: firstSaveTime,
            updatedAt: secondSaveTime,
        },
    ]);
});

test('leaves the settings of other users untouched', async () => {
    const otherUser = await db.stores.userStore.insert({
        email: `other-${Date.now()}@getunleash.io`,
    });
    await store.upsert(otherUser.id, [
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);

    await store.upsert(userId, [
        { key: 'unleash-theme', value: 'light', expiresAt: null },
    ]);

    expect(await getRows(otherUser.id)).toEqual([
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);
});

test('changes nothing when given no settings', async () => {
    await store.upsert(userId, [
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);

    await store.upsert(userId, []);

    expect(await getRows()).toEqual([
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);
});

test.each([
    ['a string', 'dark'],
    ['a number', 1767225600000],
    ['a boolean', false],
    ['null', null],
    ['an array', ['production', 'development']],
    ['an object', { 'my-flag': 1767225600000, nested: { list: [1, 'a'] } }],
])('round-trips %s as it was given', async (_, value) => {
    await store.upsert(userId, [{ key: 'setting', value, expiresAt: null }]);

    expect(await getRows()).toEqual([
        { key: 'setting', value, expiresAt: null },
    ]);
    expect(await store.getActiveSettingsForUser(userId)).toEqual([
        { key: 'setting', value, expiresAt: null },
    ]);
});

test('reads only the settings of the given user', async () => {
    const otherUser = await db.stores.userStore.insert({
        email: `other-${Date.now()}-${Math.random()}@getunleash.io`,
    });
    await store.upsert(otherUser.id, [
        { key: 'navigation-mode:v1', value: 'compact', expiresAt: null },
    ]);
    await store.upsert(userId, [
        { key: 'unleash-theme', value: 'light', expiresAt: null },
    ]);

    expect(await store.getActiveSettingsForUser(userId)).toEqual([
        { key: 'unleash-theme', value: 'light', expiresAt: null },
    ]);
});

test('leaves out an entry that expires now or earlier', async () => {
    const aMillisecondEarlier = new Date(firstSaveTime.getTime() - 1);
    const aMillisecondLater = new Date(firstSaveTime.getTime() + 1);
    await store.upsert(userId, [
        {
            key: 'feedback-module-survey-grace:v1',
            value: true,
            expiresAt: aMillisecondEarlier,
        },
        { key: 'flag-reminders:v1', value: true, expiresAt: firstSaveTime },
        {
            key: 'onboarding-tour:v1',
            value: true,
            expiresAt: aMillisecondLater,
        },
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);

    const rows = await store.getActiveSettingsForUser(userId);

    expect(rows.toSorted((a, b) => a.key.localeCompare(b.key))).toEqual([
        {
            key: 'onboarding-tour:v1',
            value: true,
            expiresAt: aMillisecondLater,
        },
        { key: 'unleash-theme', value: 'dark', expiresAt: null },
    ]);
});
