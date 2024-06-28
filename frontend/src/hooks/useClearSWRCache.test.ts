import { clearCacheEntries } from './useClearSWRCache';

describe('manageCacheEntries', () => {
    it('should clear old cache entries and keep the current one when SWR_CACHE_SIZE is not provided', () => {
        const cacheMock = new Map();
        cacheMock.set('prefix-1', {});
        cacheMock.set('prefix-2', {});
        cacheMock.set('prefix-3', {});

        clearCacheEntries(cacheMock, 'prefix-3', 'prefix-');

        expect(cacheMock.has('prefix-1')).toBe(false);
        expect(cacheMock.has('prefix-2')).toBe(false);
        expect(cacheMock.has('prefix-3')).toBe(true);
    });

    it('should keep the SWR_CACHE_SIZE entries and delete the rest', () => {
        const cacheMock = new Map();
        cacheMock.set('prefix-1', {});
        cacheMock.set('prefix-2', {});
        cacheMock.set('prefix-3', {});
        cacheMock.set('prefix-4', {});

        clearCacheEntries(cacheMock, 'prefix-4', 'prefix-', 2);

        expect(cacheMock.has('prefix-4')).toBe(true);
        expect([...cacheMock.keys()].length).toBe(2);
    });

    it('should handle case when SWR_CACHE_SIZE is larger than number of entries', () => {
        const cacheMock = new Map();
        cacheMock.set('prefix-1', {});
        cacheMock.set('prefix-2', {});

        clearCacheEntries(cacheMock, 'prefix-2', 'prefix-', 5);

        expect(cacheMock.has('prefix-1')).toBe(true);
        expect(cacheMock.has('prefix-2')).toBe(true);
    });

    it('should not delete entries that do not match the prefix', () => {
        const cacheMock = new Map();
        cacheMock.set('prefix-1', {});
        cacheMock.set('other-2', {});
        cacheMock.set('prefix-3', {});

        clearCacheEntries(cacheMock, 'prefix-3', 'prefix-', 2);

        expect(cacheMock.has('prefix-1')).toBe(true);
        expect(cacheMock.has('other-2')).toBe(true);
        expect(cacheMock.has('prefix-3')).toBe(true);
    });
});
