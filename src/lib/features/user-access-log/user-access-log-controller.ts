import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import { ADMIN, type IUnleashConfig } from '../../types/index.js';
import { serializeDates } from '../../types/serialize-dates.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { UserAccessLogService } from './user-access-log-service.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import {
    type UserAccessLogSchema,
    userAccessLogSchema,
} from '../../openapi/spec/user-access-log-schema.js';
import {
    type UserAccessLogQueryParameters,
    userAccessLogQueryParameters,
} from '../../openapi/spec/user-access-log-query-parameters.js';
import { normalizeQueryParams } from '../feature-search/search-utils.js';
import type { UserAccessLogSortBy } from './user-access-log-read-model-type.js';

const SORT_BY_VALUES: UserAccessLogSortBy[] = [
    'createdAt',
    'removedAt',
    'name',
    'status',
];

export class UserAccessLogController extends Controller {
    private userAccessLogService: UserAccessLogService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            userAccessLogService,
            openApiService,
        }: Pick<IUnleashServices, 'userAccessLogService' | 'openApiService'>,
    ) {
        super(config);
        this.userAccessLogService = userAccessLogService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getAccessLog,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    release: { beta: '8.1.0' },
                    operationId: 'getUserAccessLog',
                    summary: 'Gets the user access log',
                    description:
                        'Returns a paginated log of when users were added to and/or removed from the instance, derived from audit events.',
                    tags: ['Users'],
                    parameters: [...userAccessLogQueryParameters],
                    responses: {
                        200: createResponseSchema('userAccessLogSchema'),
                    },
                }),
            ],
        });
    }

    async getAccessLog(
        req: IAuthRequest<
            unknown,
            unknown,
            unknown,
            UserAccessLogQueryParameters
        >,
        res: Response<UserAccessLogSchema>,
    ): Promise<void> {
        const { normalizedLimit, normalizedOffset, normalizedSortOrder } =
            normalizeQueryParams(req.query, {
                limitDefault: 25,
                maxLimit: 100,
            });

        const sortBy: UserAccessLogSortBy = SORT_BY_VALUES.includes(
            req.query.sortBy as UserAccessLogSortBy,
        )
            ? (req.query.sortBy as UserAccessLogSortBy)
            : 'createdAt';

        // normalizeQueryParams defaults sortOrder to 'asc'; this endpoint
        // defaults to 'desc' when the caller did not specify a valid order.
        const sortOrder =
            req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                ? normalizedSortOrder
                : 'desc';

        const { items, total } = await this.userAccessLogService.getAccessLog({
            offset: normalizedOffset,
            limit: normalizedLimit,
            sortBy,
            sortOrder,
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            userAccessLogSchema.$id,
            serializeDates({ items: serializeDates(items), total }),
        );
    }
}
