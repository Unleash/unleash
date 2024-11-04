export type UnsubscribeEntry = {
    userId: number;
    subscription: string;
    createdAt?: Date;
};

export interface IUserUnsubscribeStore {
    insert(item: UnsubscribeEntry): Promise<Partial<UnsubscribeEntry>>;
    delete(item: UnsubscribeEntry): Promise<void>;
}
