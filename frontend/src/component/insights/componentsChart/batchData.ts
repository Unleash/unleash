const batchSize = 4;

export const batchData =
    <T, TBatched>(
        merge: (accumulated: TBatched, next: T) => TBatched,
        from: (item: T) => TBatched,
    ) =>
    (xs: T[]): TBatched[] =>
        xs.reduce((acc, curr, index) => {
            const currentAggregatedIndex = Math.floor(index / batchSize);
            const data = acc[currentAggregatedIndex];

            if (data) {
                acc[currentAggregatedIndex] = merge(data, curr);
            } else {
                acc[currentAggregatedIndex] = from(curr);
            }
            return acc;
        }, [] as TBatched[]);
