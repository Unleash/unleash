import {
    setLocalStorageItem,
    getLocalStorageItem,
    setSessionStorageItem,
    getSessionStorageItem,
} from './storage.js';
import { vi } from 'vitest';

// Mocking the global localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        },
    };
})();

const sessionStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

describe('localStorage with TTL', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.useFakeTimers();
    });

    test('object should not be retrievable after TTL expires', () => {
        const testObject = { name: 'Test', number: 123 };
        setLocalStorageItem('testObjectKey', testObject, 500000);

        vi.advanceTimersByTime(600000);

        const retrievedObject = getLocalStorageItem<{
            name: string;
            number: number;
        }>('testObjectKey');
        expect(retrievedObject).toBeUndefined();
    });

    test('item should be retrievable before TTL expires', () => {
        setLocalStorageItem('testKey', 'testValue', 600000);
        expect(getLocalStorageItem('testKey')).toBe('testValue');
    });

    test('item should not be retrievable after TTL expires', () => {
        setLocalStorageItem('testKey', 'testValue', 500000);

        vi.advanceTimersByTime(600000);

        expect(getLocalStorageItem('testKey')).toBeUndefined();
    });
    test('object should be retrievable before TTL expires', () => {
        const testObject = { name: 'Test', number: 123 };
        setLocalStorageItem('testObjectKey', testObject, 600000);

        const retrievedObject = getLocalStorageItem<{
            name: string;
            number: number;
        }>('testObjectKey');
        expect(retrievedObject).toEqual(testObject);
    });
    test('should correctly store and retrieve a Map object', () => {
        const testMap = new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]);
        setLocalStorageItem('testMap', testMap);
        expect(getLocalStorageItem<Map<any, any>>('testMap')).toEqual(testMap);
    });

    test('should correctly store and retrieve a Set object', () => {
        const testSet = new Set(['value1', 'value2']);
        setLocalStorageItem('testSet', testSet);
        expect(getLocalStorageItem<Set<any>>('testSet')).toEqual(testSet);
    });

    test('should handle nested objects with arrays, Maps, and Sets', () => {
        const complexObject = {
            array: [1, 2, 3],
            map: new Map([['nestedKey', 'nestedValue']]),
            set: new Set([1, 2, 3]),
        };
        setLocalStorageItem('complexObject', complexObject);
        expect(
            getLocalStorageItem<typeof complexObject>('complexObject'),
        ).toEqual(complexObject);
    });

    test('sessionStorage item should expire as per TTL', () => {
        setSessionStorageItem('sessionTTL', 'expiring', 50); // 50ms TTL
        vi.advanceTimersByTime(60);
        expect(getSessionStorageItem('sessionTTL')).toBeUndefined();
    });
});
