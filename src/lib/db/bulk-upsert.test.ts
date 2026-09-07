import { describe, expect, test } from 'vitest';
import { chunkRows, orderByConflictKey } from './bulk-upsert.js';

describe('orderByConflictKey', () => {
    test('orders rows by a single key', () => {
        const rows = [{ app_name: 'c' }, { app_name: 'a' }, { app_name: 'b' }];

        expect(orderByConflictKey(rows, ['app_name'])).toEqual([
            { app_name: 'a' },
            { app_name: 'b' },
            { app_name: 'c' },
        ]);
    });

    test('orders rows by composite keys in the order they are given', () => {
        const rows = [
            { app_name: 'a', environment: 'prod', instance_id: '2' },
            { app_name: 'a', environment: 'dev', instance_id: '9' },
            { app_name: 'a', environment: 'prod', instance_id: '1' },
        ];

        expect(
            orderByConflictKey(rows, [
                'app_name',
                'environment',
                'instance_id',
            ]),
        ).toEqual([
            { app_name: 'a', environment: 'dev', instance_id: '9' },
            { app_name: 'a', environment: 'prod', instance_id: '1' },
            { app_name: 'a', environment: 'prod', instance_id: '2' },
        ]);
    });

    test('produces the same order regardless of input order', () => {
        const rows = [
            { app_name: 'b', project: 'x' },
            { app_name: 'a', project: 'y' },
            { app_name: 'a', project: 'x' },
        ];
        const reversed = [...rows].reverse();

        expect(orderByConflictKey(rows, ['app_name', 'project'])).toEqual(
            orderByConflictKey(reversed, ['app_name', 'project']),
        );
    });

    test('does not mutate the input', () => {
        const rows = [{ app_name: 'b' }, { app_name: 'a' }];

        orderByConflictKey(rows, ['app_name']);

        expect(rows).toEqual([{ app_name: 'b' }, { app_name: 'a' }]);
    });

    test('treats missing values as empty so ordering stays total', () => {
        const rows = [
            { app_name: 'a', environment: 'prod' },
            { app_name: 'a' },
            { app_name: 'a', environment: undefined },
        ];

        const ordered = orderByConflictKey(rows, ['app_name', 'environment']);

        expect(ordered[ordered.length - 1]).toEqual({
            app_name: 'a',
            environment: 'prod',
        });
    });
});

describe('chunkRows', () => {
    test('splits rows into chunks of the given size', () => {
        expect(chunkRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('returns a single chunk when the batch fits', () => {
        expect(chunkRows([1, 2], 5)).toEqual([[1, 2]]);
    });

    test('returns no chunks for an empty batch', () => {
        expect(chunkRows([], 5)).toEqual([]);
    });

    test('keeps every row exactly once', () => {
        const rows = Array.from({ length: 1234 }, (_, i) => i);

        expect(chunkRows(rows, 500).flat()).toEqual(rows);
    });
});
