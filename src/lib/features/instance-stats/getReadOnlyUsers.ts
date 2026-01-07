import type { Db } from '../../types/index.js';
import {
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    PROJECT_FAVORITED,
    PROJECT_UNFAVORITED,
} from '../../events/index.js';
import { RoleName } from '../../types/model.js';
import { ROOT_ROLE_TYPE } from '../../util/constants.js';

const READONLY_EVENTS = [
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    PROJECT_FAVORITED,
    PROJECT_UNFAVORITED,
];

export type GetReadOnlyUsers = () => Promise<number>;

export const createGetReadOnlyUsers =
    (db: Db): GetReadOnlyUsers =>
    async () => {
        const result = await db('users')
            .countDistinct('users.id as readOnlyCount')
            .join('role_user', 'role_user.user_id', 'users.id')
            .join('roles', 'roles.id', 'role_user.role_id')
            // Ensure valid user
            .whereNull('users.deleted_at')
            .where('users.is_system', false)
            .where('users.is_service', false)
            // Ensure Viewer root role
            .where('roles.name', RoleName.VIEWER)
            .where('roles.type', ROOT_ROLE_TYPE)
            // Ensure no permissions across all roles and groups
            .whereNotExists(function () {
                // Ensure no permissions across root and project roles
                this.select(1)
                    .from('role_permission as rp')
                    .join('role_user as ur', 'ur.role_id', 'rp.role_id')
                    .whereRaw('ur.user_id = users.id')
                    // Ensure no permissions from group project roles
                    .union(function () {
                        this.select(db.raw('1'))
                            .from('group_user as gu')
                            .join('groups as g', 'g.id', 'gu.group_id')
                            .join(
                                'group_role as gr',
                                'gr.group_id',
                                'gu.group_id',
                            )
                            .join(
                                'role_permission as rp',
                                'rp.role_id',
                                'gr.role_id',
                            )
                            .whereRaw('gu.user_id = users.id');
                    })
                    // Ensure no permissions from group root roles
                    .union(function () {
                        this.select(db.raw('1'))
                            .from('group_user as gu')
                            .join('groups as g', 'g.id', 'gu.group_id')
                            .join(
                                'role_permission as rp',
                                'rp.role_id',
                                'g.root_role_id',
                            )
                            .whereNotNull('g.root_role_id')
                            .whereRaw('gu.user_id = users.id');
                    });
            })
            // Ensure no write events
            .whereNotExists(function () {
                this.select(1)
                    .from('events')
                    .whereRaw('events.created_by_user_id = users.id')
                    .whereNotIn('events.type', READONLY_EVENTS);
            })
            .first();

        return Number(result?.readOnlyCount ?? 0);
    };

export const createFakeGetReadOnlyUsers =
    (
        readOnlyUsers: Awaited<ReturnType<GetReadOnlyUsers>> = 0,
    ): GetReadOnlyUsers =>
    () =>
        Promise.resolve(readOnlyUsers);
