const defaultBatchSize = 4;

export type BatchDataOptions<T, TBatched> = {
    merge: (accumulated: TBatched, next: T) => TBatched;
    map: (item: T) => TBatched;
    batchSize?: number;
};

export const batchData =
    <T, TBatched>({
        merge,
        map,
        batchSize = defaultBatchSize,
    }: BatchDataOptions<T, TBatched>) =>
    (xs: T[]): TBatched[] =>
        xs.reduce((acc, curr, index) => {
            const currentAggregatedIndex = Math.floor(index / batchSize);
            const data = acc[currentAggregatedIndex];

            if (data) {
                acc[currentAggregatedIndex] = merge(data, curr);
            } else {
                acc[currentAggregatedIndex] = map(curr);
            }

            return acc;
        }, [] as TBatched[]);
