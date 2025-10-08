export type ChartDataState =
    | { status: 'Loading' }
    | { status: 'Not Enough Data' }
    | { status: 'Weekly' }
    | { status: 'Batched'; batchSize: number };
