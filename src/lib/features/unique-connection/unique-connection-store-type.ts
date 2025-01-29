export type UniqueConnections = {
    hll: Buffer;
    id: BucketId;
};

export type TimedUniqueConnections = UniqueConnections & {
    updatedAt: Date;
};

export type BucketId =
    | 'current'
    | 'previous'
    | 'currentBackend'
    | 'previousBackend'
    | 'currentFrontend'
    | 'previousFrontend';

export interface IUniqueConnectionStore {
    insert(uniqueConnections: UniqueConnections): Promise<void>;
    get(id: BucketId): Promise<TimedUniqueConnections | null>;
    deleteAll(): Promise<void>;
}
