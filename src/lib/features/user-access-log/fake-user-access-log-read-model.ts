import type {
    IUserAccessLogParams,
    IUserAccessLogReadModel,
    IUserAccessLogResult,
    IUserAccessLogRow,
    UserAccessLogSortBy,
} from './user-access-log-read-model-type.js';

const compareBy = (
    a: IUserAccessLogRow,
    b: IUserAccessLogRow,
    sortBy: UserAccessLogSortBy,
): number => {
    const nullsLast = (
        av: number | string | null,
        bv: number | string | null,
    ): number | undefined => {
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return undefined;
    };

    switch (sortBy) {
        case 'createdAt': {
            const av = a.createdAt ? a.createdAt.getTime() : null;
            const bv = b.createdAt ? b.createdAt.getTime() : null;
            return nullsLast(av, bv) ?? (av as number) - (bv as number);
        }
        case 'removedAt': {
            const av = a.removedAt ? a.removedAt.getTime() : null;
            const bv = b.removedAt ? b.removedAt.getTime() : null;
            return nullsLast(av, bv) ?? (av as number) - (bv as number);
        }
        case 'name': {
            const av = a.name;
            const bv = b.name;
            return (
                nullsLast(av, bv) ?? (av as string).localeCompare(bv as string)
            );
        }
        case 'status':
            return Number(a.removed) - Number(b.removed);
        default:
            return 0;
    }
};

export class FakeUserAccessLogReadModel implements IUserAccessLogReadModel {
    private rows: IUserAccessLogRow[];

    constructor(rows: IUserAccessLogRow[] = []) {
        this.rows = rows;
    }

    async getAccessLog(
        params: IUserAccessLogParams,
    ): Promise<IUserAccessLogResult> {
        const { offset, limit, sortBy, sortOrder } = params;
        const factor = sortOrder === 'asc' ? 1 : -1;

        const sorted = [...this.rows].sort((a, b) => {
            const primary = factor * compareBy(a, b, sortBy);
            if (primary !== 0) return primary;
            // NULLS LAST is not flipped by direction in SQL; the fake keeps
            // stable ordering by user_id for ties which is sufficient for tests.
            return a.userId - b.userId;
        });

        const page = sorted.slice(offset, offset + limit);

        return { rows: page, total: this.rows.length };
    }
}
