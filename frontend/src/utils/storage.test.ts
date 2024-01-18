import { setLocalStorageItem, getLocalStorageItem } from './storage';
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

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Test suite
describe('localStorage with TTL', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    test('item should be retrievable before TTL expires', () => {
        setLocalStorageItem('testKey', 'testValue', 600000);
        expect(getLocalStorageItem('testKey')).toBe('testValue');
    });

    test('item should not be retrievable after TTL expires', () => {
        setLocalStorageItem('testKey', 'testValue', 500000);

        // Fast-forward time by 10 minutes
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

    test('object should not be retrievable after TTL expires', () => {
        const testObject = { name: 'Test', number: 123 };
        setLocalStorageItem('testObjectKey', testObject, 500000);

        // Fast-forward time by 10 minutes
        vi.advanceTimersByTime(600000);

        const retrievedObject = getLocalStorageItem<{
            name: string;
            number: number;
        }>('testObjectKey');
        expect(retrievedObject).toBeUndefined();
    });
});
