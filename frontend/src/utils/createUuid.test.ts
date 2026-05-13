import { expect, test } from 'vitest';
import { createUuid } from 'utils/createUuid';

test('createUuid creates a v4 UUID when crypto.randomUUID is unavailable', () => {
    const originalRandomUuid = globalThis.crypto.randomUUID;

    Object.defineProperty(globalThis.crypto, 'randomUUID', {
        configurable: true,
        value: undefined,
    });

    try {
        expect(createUuid()).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
    } finally {
        Object.defineProperty(globalThis.crypto, 'randomUUID', {
            configurable: true,
            value: originalRandomUuid,
        });
    }
});
