export type UniqueConnections = {
    hll: Buffer;
    id: 'current' | 'previous';
};

export type TimedUniqueConnections = UniqueConnections & {
    updatedAt: Date;
};

// id, hll, updated_at
export interface IUniqueConnectionStore {
    insert(uniqueConnections: UniqueConnections): Promise<void>;
    get(id: 'current' | 'previous'): Promise<TimedUniqueConnections | null>;
    deleteAll(): Promise<void>;
}
