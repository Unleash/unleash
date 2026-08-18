import type { IUnleashConfig } from '../../types/index.js';
import type { AccessService } from '../../services/access-service.js';
import type {
    IUserAccessLogParams,
    IUserAccessLogReadModel,
} from './user-access-log-read-model-type.js';

export interface IUserAccessLogPerformedBy {
    id: number | null;
    name: string | null;
    imageUrl: string | null;
}

export interface IUserAccessLogEntry {
    id: number;
    name: string | null;
    username: string | null;
    email: string | null;
    imageUrl: string | null;
    status: 'added' | 'removed';
    createdAt: Date | null;
    removedAt: Date | null;
    roleName: string | null;
    performedBy: IUserAccessLogPerformedBy | null;
}

export interface IUserAccessLogPage {
    items: IUserAccessLogEntry[];
    total: number;
}

export class UserAccessLogService {
    private readModel: IUserAccessLogReadModel;

    private accessService: AccessService;

    constructor(
        {
            userAccessLogReadModel,
        }: { userAccessLogReadModel: IUserAccessLogReadModel },
        _config: Pick<IUnleashConfig, 'getLogger'>,
        { accessService }: { accessService: AccessService },
    ) {
        this.readModel = userAccessLogReadModel;
        this.accessService = accessService;
    }

    async getAccessLog(
        params: IUserAccessLogParams,
    ): Promise<IUserAccessLogPage> {
        const { rows, total } = await this.readModel.getAccessLog(params);

        const [rootRoles, userRoles] = await Promise.all([
            this.accessService.getRootRoles(),
            this.accessService.getRootRoleForAllUsers(),
        ]);

        const roleNameById = new Map<number, string>(
            rootRoles.map((role) => [role.id, role.name]),
        );
        const currentRoleIdByUserId = new Map<number, number>(
            userRoles.map((userRole) => [userRole.userId, userRole.roleId]),
        );

        const items: IUserAccessLogEntry[] = rows.map((row) => {
            const roleId = row.removed
                ? row.deletedRoleId
                : (currentRoleIdByUserId.get(row.userId) ?? null);
            const roleName =
                roleId !== null ? (roleNameById.get(roleId) ?? null) : null;

            const performedBy =
                row.performedById !== null
                    ? {
                          id: row.performedById,
                          name: row.performedByName,
                          imageUrl: row.performedByImageUrl,
                      }
                    : null;

            return {
                id: row.userId,
                name: row.name,
                username: row.username,
                email: row.email,
                imageUrl: row.imageUrl,
                status: row.removed ? 'removed' : 'added',
                createdAt: row.createdAt,
                removedAt: row.removedAt,
                roleName,
                performedBy,
            };
        });

        return { items, total };
    }
}
