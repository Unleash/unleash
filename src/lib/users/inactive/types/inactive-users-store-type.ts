export interface IInactiveUserRow {
    id: number;
    name?: string;
    username?: string;
    email: string;
    seen_at?: Date;
    pat_seen_at?: Date;
    created_at: Date;
    total_inactive_users: number;
}

export interface IInactiveUsersStore {
    getInactiveUsers(
        daysInactive: number,
        offset: number,
        limit: number,
    ): Promise<IInactiveUserRow[]>;
}
