import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IFlagResolver,
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import {
    createResponseSchema,
    getStandardResponses,
    userRecentFlagsSchema,
    type UserRecentFlagsSchema,
} from '../../openapi/index.js';
import {
    type UserRecentFlagsQueryParameters,
    userRecentFlagsQueryParameters,
} from '../../openapi/spec/user-recent-flags-query-parameters.js';
import { normalizeQueryParams } from '../feature-search/search-utils.js';
import { maybeAnonymiseEventLog } from '../feature-search/anonymise-event-log.js';
import { ForbiddenError } from '../../error/index.js';
import type { UserRecentFlagsService } from './user-recent-flags-service.js';

const USER_RECENT_FLAGS_LIMIT = 100;

export default class UserRecentFlagsController extends Controller {
    private userRecentFlagsService: UserRecentFlagsService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            userRecentFlagsService,
            openApiService,
        }: Pick<IUnleashServices, 'userRecentFlagsService' | 'openApiService'>,
    ) {
        super(config);
        this.userRecentFlagsService = userRecentFlagsService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getUserRecentFlags,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    release: { beta: '8.5.0', stable: '9.0.0' },
                    operationId: 'getUserRecentFlags',
                    summary:
                        'Get the flags the current user worked on most recently',
                    description:
                        'Flags the current user interacted with, most recent first. Archived flags and flags in projects the user can not access are left out. Which interactions count is not part of the contract and may change.',
                    parameters: [...userRecentFlagsQueryParameters],
                    responses: {
                        200: createResponseSchema('userRecentFlagsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getUserRecentFlags(
        req: IAuthRequest<any, any, any, UserRecentFlagsQueryParameters>,
        res: Response<UserRecentFlagsSchema>,
    ): Promise<void> {
        // Admin tokens have no user id, and extractUserId would map them to a
        // shared id that every admin token's events are stored under.
        const userId = req.user.id;
        if (!userId) {
            throw new ForbiddenError(
                'This endpoint requires an authenticated user.',
            );
        }

        const { normalizedLimit, normalizedOffset } = normalizeQueryParams(
            req.query,
            {
                limitDefault: USER_RECENT_FLAGS_LIMIT,
                maxLimit: USER_RECENT_FLAGS_LIMIT,
            },
        );
        const flags = await this.userRecentFlagsService.getUserRecentFlags(
            userId,
            {
                limit: normalizedLimit,
                offset: normalizedOffset,
            },
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            userRecentFlagsSchema.$id,
            serializeDates({
                flags: maybeAnonymiseEventLog(this.flagResolver, flags),
                limit: normalizedLimit,
                offset: normalizedOffset,
            }),
        );
    }
}
