const defaultBatchSize = 4;

export type BatchDataOptions<T, TBatched> = {
    merge: (accumulated: TBatched, next: T) => TBatched;
    map: (item: T) => TBatched;
    batchSize?: number;
};

const nullOrUndefined = (value: any): value is null | undefined =>
    value === null || value === undefined;

export const batchData =
    <T, TBatched>({
        merge,
        map,
        batchSize = defaultBatchSize,
    }: BatchDataOptions<T, TBatched>) =>
    (xs: (T | null)[]): (TBatched | null)[] =>
        xs.reduce(
            (acc, curr, index) => {
                const currentAggregatedIndex = Math.floor(index / batchSize);
                const data = acc[currentAggregatedIndex];

                const hasData = !nullOrUndefined(data);
                const hasCurr = curr !== null;

                if (!hasData && !hasCurr) {
                    acc[currentAggregatedIndex] = null;
                } else if (hasData && hasCurr) {
                    acc[currentAggregatedIndex] = merge(data, curr);
                } else if (!hasData && hasCurr) {
                    acc[currentAggregatedIndex] = map(curr);
                }

                return acc;
            },
            [] as (TBatched | null)[],
        );
