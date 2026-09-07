const compareByKeys = (
    a: Record<string, unknown>,
    b: Record<string, unknown>,
    keys: string[],
): number => {
    for (const key of keys) {
        const left = a[key] === undefined || a[key] === null ? '' : `${a[key]}`;
        const right =
            b[key] === undefined || b[key] === null ? '' : `${b[key]}`;
        if (left < right) {
            return -1;
        }
        if (left > right) {
            return 1;
        }
    }
    return 0;
};

/**
 * A bulk `INSERT ... ON CONFLICT DO UPDATE` takes a row lock on every
 * conflicting row, in the order the rows appear in the VALUES list, and holds
 * those locks until the statement commits. When several Unleash instances
 * flush overlapping batches at the same time (client registrations, metrics),
 * a differing row order makes them take the same locks in different orders.
 * That shows up as sustained `wait_event='transactionid'` waits and, in the
 * worst case, deadlocks that abort a whole batch.
 *
 * Ordering every batch by its conflict key gives all writers the same lock
 * order, so concurrent batches queue up predictably instead of blocking each
 * other in a cycle.
 */
export const orderByConflictKey = <T extends object>(
    rows: T[],
    keys: string[],
): T[] =>
    [...rows].sort((a, b) =>
        compareByKeys(
            a as Record<string, unknown>,
            b as Record<string, unknown>,
            keys,
        ),
    );

/**
 * Splits a batch into smaller statements. A single statement keeps its row
 * locks until it commits, so an unbounded batch blocks every other writer for
 * as long as the whole batch takes. Chunking bounds that window and lets
 * concurrent writers interleave.
 */
export const chunkRows = <T>(rows: T[], size: number): T[][] => {
    if (size <= 0) {
        return rows.length > 0 ? [rows] : [];
    }
    const chunks: T[][] = [];
    for (let i = 0; i < rows.length; i += size) {
        chunks.push(rows.slice(i, i + size));
    }
    return chunks;
};

export const BULK_UPSERT_CHUNK_SIZE = 500;
