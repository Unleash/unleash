import type { Db } from '../../db/db.js';
import { USER_CREATED, USER_DELETED } from '../../events/index.js';
import type {
    IUserAccessLogParams,
    IUserAccessLogReadModel,
    IUserAccessLogResult,
    IUserAccessLogRow,
    UserAccessLogSortBy,
} from './user-access-log-read-model-type.js';

/**
 * Whitelist mapping the API-facing sortBy value to the underlying SQL column.
 * User input MUST NOT be interpolated directly into the query; only values
 * present in this map are ever placed into the ORDER BY clause.
 */
const SORT_COLUMNS: Record<UserAccessLogSortBy, string> = {
    createdAt: 'created_at',
    removedAt: 'removed_at',
    name: 'name',
    status: 'removed',
};

const CTES = `
    WITH created AS (
        SELECT DISTINCT ON ((data->>'id')::int)
            (data->>'id')::int AS user_id,
            created_at,
            created_by_user_id,
            data->>'name' AS name,
            data->>'email' AS email,
            data->>'username' AS username
        FROM events
        WHERE type = :userCreated AND data->>'id' IS NOT NULL
        ORDER BY (data->>'id')::int, created_at DESC
    ),
    deleted AS (
        SELECT DISTINCT ON ((pre_data->>'id')::int)
            (pre_data->>'id')::int AS user_id,
            created_at AS removed_at,
            created_by_user_id AS removed_by_user_id,
            pre_data->>'name' AS name,
            pre_data->>'email' AS email,
            pre_data->>'username' AS username,
            NULLIF(pre_data->>'rootRole', '')::int AS role_id
        FROM events
        WHERE type = :userDeleted AND pre_data->>'id' IS NOT NULL
        ORDER BY (pre_data->>'id')::int, created_at DESC
    ),
    combined AS (
        SELECT
            COALESCE(c.user_id, d.user_id) AS user_id,
            COALESCE(c.name, d.name) AS name,
            COALESCE(c.email, d.email) AS email,
            COALESCE(c.username, d.username) AS username,
            c.created_at AS created_at,
            d.removed_at AS removed_at,
            (d.user_id IS NOT NULL) AS removed,
            d.role_id AS deleted_role_id,
            CASE
                WHEN d.user_id IS NOT NULL THEN d.removed_by_user_id
                ELSE c.created_by_user_id
            END AS performed_by_id
        FROM created c
        FULL OUTER JOIN deleted d ON c.user_id = d.user_id
    )
`;

export class UserAccessLogReadModel implements IUserAccessLogReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getAccessLog(
        params: IUserAccessLogParams,
    ): Promise<IUserAccessLogResult> {
        const { offset, limit, sortBy, sortOrder } = params;

        const sortColumn = SORT_COLUMNS[sortBy] ?? SORT_COLUMNS.createdAt;
        const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';

        const bindings = {
            userCreated: USER_CREATED,
            userDeleted: USER_DELETED,
            limit,
            offset,
        };

        const itemsQuery = `
            ${CTES}
            SELECT
                combined.user_id AS user_id,
                combined.name AS name,
                combined.email AS email,
                combined.username AS username,
                combined.created_at AS created_at,
                combined.removed_at AS removed_at,
                combined.removed AS removed,
                combined.deleted_role_id AS deleted_role_id,
                combined.performed_by_id AS performed_by_id,
                su.image_url AS image_url,
                pu.name AS performed_by_name,
                pu.image_url AS performed_by_image_url
            FROM combined
            LEFT JOIN users su ON su.id = combined.user_id
            LEFT JOIN users pu ON pu.id = combined.performed_by_id
            ORDER BY ${sortColumn} ${direction} NULLS LAST, combined.user_id ASC
            LIMIT :limit OFFSET :offset
        `;

        const countQuery = `
            ${CTES}
            SELECT count(*)::int AS total FROM combined
        `;

        const [itemsResult, countResult] = await Promise.all([
            this.db.raw(itemsQuery, bindings),
            this.db.raw(countQuery, {
                userCreated: USER_CREATED,
                userDeleted: USER_DELETED,
            }),
        ]);

        const rows: IUserAccessLogRow[] = itemsResult.rows.map((row) => ({
            userId: Number(row.user_id),
            name: row.name ?? null,
            username: row.username ?? null,
            email: row.email ?? null,
            imageUrl: row.image_url ?? null,
            removed: Boolean(row.removed),
            createdAt: row.created_at ?? null,
            removedAt: row.removed_at ?? null,
            deletedRoleId:
                row.deleted_role_id !== null &&
                row.deleted_role_id !== undefined
                    ? Number(row.deleted_role_id)
                    : null,
            performedById:
                row.performed_by_id !== null &&
                row.performed_by_id !== undefined
                    ? Number(row.performed_by_id)
                    : null,
            performedByName: row.performed_by_name ?? null,
            performedByImageUrl: row.performed_by_image_url ?? null,
        }));

        const total = countResult.rows[0]?.total ?? 0;

        return { rows, total: Number(total) };
    }
}
