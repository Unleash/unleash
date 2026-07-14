import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import {
    type IUnleashConfig,
    NONE,
    serializeDates,
} from '../../types/index.js';
import type { IFlagResolver } from '../../types/experimental.js';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import {
    createResponseSchema,
    getStandardResponses,
} from '../../openapi/index.js';
import {
    flagCreatorsSchema,
    type FlagCreatorsSchema,
} from '../../openapi/spec/flag-creators-schema.js';
import {
    type FlagCreatorsQueryParameters,
    flagCreatorsQueryParameters,
} from '../../openapi/spec/flag-creators-query-parameters.js';
import { normalizeQueryParams } from '../feature-search/search-utils.js';
import { NotFoundError } from '../../error/index.js';
import { extractUserId } from '../../util/index.js';
import type ProjectService from './project-service.js';

export default class FlagCreatorsController extends Controller {
    private projectService: ProjectService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        { projectService, openApiService }: IUnleashServices,
    ) {
        super(config);
        this.projectService = projectService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getFlagCreators,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    release: { alpha: true },
                    operationId: 'getFlagCreators',
                    summary:
                        'List users who have created flags in accessible projects.',
                    description:
                        'Returns a paginated list of distinct users who have created flags in projects the caller can access. Supports search via `query` against user name, username, or email.',
                    parameters: [...flagCreatorsQueryParameters],
                    responses: {
                        200: createResponseSchema('flagCreatorsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getFlagCreators(
        req: IAuthRequest<any, any, any, FlagCreatorsQueryParameters>,
        res: Response<FlagCreatorsSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('flagListCreatedByFilter')) {
            throw new NotFoundError();
        }

        const { q } = req.query;
        const query = typeof q === 'string' ? q.trim() || undefined : undefined;

        const { normalizedLimit, normalizedOffset } = normalizeQueryParams(
            req.query,
            { limitDefault: 50, maxLimit: 100_000 },
        );

        const result = await this.projectService.getFlagCreatorsAcrossProjects(
            extractUserId(req),
            {
                query,
                limit: normalizedLimit,
                offset: normalizedOffset,
            },
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            flagCreatorsSchema.$id,
            serializeDates(result),
        );
    }
}
