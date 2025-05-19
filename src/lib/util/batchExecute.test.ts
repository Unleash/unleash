import { type Mock, vi } from 'vitest';
import { batchExecute } from './batchExecute.js';

vi.useFakeTimers();

describe('batchExecute', () => {
    let mockExecuteFn: Mock;

    beforeEach(() => {
        mockExecuteFn = vi.fn();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.clearAllMocks();
    });

    it('should process each item in batches of the specified size', async () => {
        const items = Array.from({ length: 25 }, (_, i) => i);
        const batchSize = 10;
        const delayMs = 1000;

        batchExecute(items, batchSize, delayMs, mockExecuteFn);

        for (let i = 0; i < 2; i++) {
            vi.advanceTimersByTime(delayMs);
            await Promise.resolve();
        }

        expect(mockExecuteFn).toHaveBeenCalledTimes(items.length);
        items.forEach((item, index) => {
            expect(mockExecuteFn).toHaveBeenNthCalledWith(index + 1, item);
        });
    });

    it('should delay between each batch', async () => {
        const items = Array.from({ length: 15 }, (_, i) => i);
        const batchSize = 5;
        const delayMs = 1000;

        batchExecute(items, batchSize, delayMs, mockExecuteFn);

        expect(mockExecuteFn).toHaveBeenCalledTimes(5);

        vi.advanceTimersByTime(delayMs);
        await Promise.resolve();
        expect(mockExecuteFn).toHaveBeenCalledTimes(10);

        vi.advanceTimersByTime(delayMs);
        await Promise.resolve();
        expect(mockExecuteFn).toHaveBeenCalledTimes(15);
    });

    it('should handle empty items array without calling executeFn', async () => {
        const items: number[] = [];
        const batchSize = 10;
        const delayMs = 1000;

        await batchExecute(items, batchSize, delayMs, mockExecuteFn);

        expect(mockExecuteFn).not.toHaveBeenCalled();
    });

    it('should handle a batch size larger than the number of items', async () => {
        const items = [1, 2, 3];
        const batchSize = 10;
        const delayMs = 1000;

        batchExecute(items, batchSize, delayMs, mockExecuteFn);

        expect(mockExecuteFn).toHaveBeenCalledTimes(items.length);
        items.forEach((item, index) => {
            expect(mockExecuteFn).toHaveBeenNthCalledWith(index + 1, item);
        });
    });
});
