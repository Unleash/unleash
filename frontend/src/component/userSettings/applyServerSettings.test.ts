import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { toLocalStorageName } from 'utils/localStorageName';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage';
import { applyServerSettings } from './applyServerSettings.ts';
import { createServerBackedKeys } from './serverBackedKeys.ts';

const NOW = new Date('2026-11-26T12:00:00.000Z');
const EXPIRES_AT = new Date('2026-12-01T12:00:00.000Z');
const ONE_SECOND = 1_000;
const ONE_YEAR_LATER = new Date('2027-11-26T12:00:00.000Z');

const keys = createServerBackedKeys(['hidden-environments:v1']);

const [hiddenEnvironments] = keys;
const LOCAL_ONLY_NAME = toLocalStorageName('local-only');

const storedHiddenEnvironments = () =>
    getLocalStorageItem(hiddenEnvironments.localStorageName);

const applyExpiringServerValue = () =>
    applyServerSettings(
        {
            'hidden-environments:v1': {
                value: ['server'],
                expiresAt: EXPIRES_AT.toISOString(),
            },
        },
        keys,
    );

describe('applyServerSettings', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW);
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('replaces the local value with the server value', () => {
        setLocalStorageItem(hiddenEnvironments.localStorageName, ['local']);

        applyServerSettings(
            { 'hidden-environments:v1': { value: ['server'] } },
            keys,
        );

        expect(storedHiddenEnvironments()).toEqual(['server']);
    });

    test('keeps a server value without expiry indefinitely', () => {
        applyServerSettings(
            { 'hidden-environments:v1': { value: ['server'] } },
            keys,
        );

        vi.setSystemTime(ONE_YEAR_LATER);

        expect(storedHiddenEnvironments()).toEqual(['server']);
    });

    test('keeps a server value with expiry until the row expires', () => {
        applyExpiringServerValue();

        vi.setSystemTime(EXPIRES_AT.getTime() - ONE_SECOND);

        expect(storedHiddenEnvironments()).toEqual(['server']);
    });

    test('drops a local value with expiry once the server row expires', () => {
        applyExpiringServerValue();

        vi.setSystemTime(EXPIRES_AT.getTime() + ONE_SECOND);

        expect(storedHiddenEnvironments()).toBeUndefined();
    });

    test('keeps the local value when the server expiry is not a date', () => {
        setLocalStorageItem(hiddenEnvironments.localStorageName, ['local']);

        applyServerSettings(
            {
                'hidden-environments:v1': {
                    value: ['server'],
                    expiresAt: 'not a date',
                },
            },
            keys,
        );

        expect(storedHiddenEnvironments()).toEqual(['local']);
    });

    test('removes the local value when the server row is null', () => {
        setLocalStorageItem(hiddenEnvironments.localStorageName, ['local']);

        applyServerSettings(
            { 'hidden-environments:v1': { value: null } },
            keys,
        );

        expect(
            window.localStorage.getItem(hiddenEnvironments.localStorageName),
        ).toBeNull();
    });

    test('keeps the local value when the server has no row for the key', () => {
        setLocalStorageItem(hiddenEnvironments.localStorageName, ['local']);

        applyServerSettings({}, keys);

        expect(storedHiddenEnvironments()).toEqual(['local']);
    });

    test('leaves local-only keys untouched', () => {
        setLocalStorageItem(LOCAL_ONLY_NAME, 'local');

        applyServerSettings({ 'local-only': { value: null } }, keys);

        expect(getLocalStorageItem(LOCAL_ONLY_NAME)).toBe('local');
    });
});
