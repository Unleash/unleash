import type { Response } from 'express';
import Controller from '../../../routes/controller.js';
import type { IFlagResolver, IUnleashConfig } from '../../../types/index.js';
import { querySchema } from '../../../schema/feature-schema.js';
import type { IFeatureToggleQuery } from '../../../types/model.js';
import NotFoundError from '../../../error/notfound-error.js';
import type { IAuthRequest } from '../../../routes/unleash-types.js';
import ApiUser from '../../../types/api-user.js';
import { ALL, isAllProjects } from '../../../types/models/api-token.js';
import type { ClientSpecService } from '../../../services/client-spec-service.js';
import type { OpenApiService } from '../../../services/openapi-service.js';
import { NONE } from '../../../types/permissions.js';
import { createResponseSchema } from '../../../openapi/util/create-response-schema.js';
import type { ClientFeatureToggleService } from '../client-feature-toggle-service.js';
import {
    clientFeaturesDeltaSchema,
    type ClientFeaturesDeltaSchema,
} from '../../../openapi/index.js';
import type { QueryOverride } from '../client-feature-toggle.controller.js';
import type { IUnleashServices } from '../../../services/index.js';

const parseRevisionId = (
    etagHeader: string | string[] | undefined,
): number | undefined => {
    if (etagHeader === undefined) {
        return undefined;
    }

    const rawValue = Array.isArray(etagHeader) ? etagHeader[0] : etagHeader;
    const normalized = rawValue.replace(/^W\//, '').replace(/^"|"$/g, '');

    if (!/^\d+$/.test(normalized)) {
        return undefined;
    }

    return Number.parseInt(normalized, 10);
};

export default class ClientFeatureToggleDeltaController extends Controller {
    private clientFeatureToggleService: ClientFeatureToggleService;

    private clientSpecService: ClientSpecService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        {
            clientFeatureToggleService,
            clientSpecService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'clientFeatureToggleService'
            | 'clientSpecService'
            | 'openApiService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        this.clientFeatureToggleService = clientFeatureToggleService;
        this.clientSpecService = clientSpecService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getDelta,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get partial updates (SDK)',
                    description:
                        'Initially returns the full set of feature flags available to the provided API key. When called again with the returned etag, only returns the flags that have changed.',
                    operationId: 'getDelta',
                    tags: ['Client'],
                    responses: {
                        200: createResponseSchema('clientFeaturesDeltaSchema'),
                    },
                }),
            ],
        });
    }

    async getDelta(
        req: IAuthRequest,
        res: Response<ClientFeaturesDeltaSchema>,
    ): Promise<void> {
        if (!this.flagResolver.isEnabled('deltaApi')) {
            throw new NotFoundError();
        }

        const query = await this.resolveQuery(req);
        const currentSdkRevisionId = parseRevisionId(
            req.headers['if-none-match'],
        );
        const delta = await this.clientFeatureToggleService.getClientDelta(
            currentSdkRevisionId,
            query,
        );

        if (!delta) {
            res.status(304);
            res.getHeaderNames().forEach((header) => {
                res.removeHeader(header);
            });
            res.end();
            return;
        }

        const revisionId = delta.events.at(-1)?.eventId ?? 0;
        res.setHeader('ETag', `"${revisionId}"`);

        this.openApiService.respondWithValidation(
            200,
            res,
            clientFeaturesDeltaSchema.$id,
            delta,
        );
    }

    private async resolveQuery(
        req: IAuthRequest,
    ): Promise<IFeatureToggleQuery> {
        const { user, query } = req;

        const override: QueryOverride = {};
        if (user instanceof ApiUser) {
            if (!isAllProjects(user.projects)) {
                override.project = user.projects;
            }
            if (user.environment !== ALL) {
                override.environment = user.environment;
            }
        }

        const inlineSegmentConstraints =
            !this.clientSpecService.requestSupportsSpec(req, 'segments');

        return this.prepQuery({
            ...query,
            ...override,
            inlineSegmentConstraints,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private paramToArray(param: any) {
        if (!param) {
            return param;
        }
        return Array.isArray(param) ? param : [param];
    }

    private async prepQuery({
        tag,
        project,
        namePrefix,
        environment,
        inlineSegmentConstraints,
    }: IFeatureToggleQuery): Promise<IFeatureToggleQuery> {
        if (
            !tag &&
            !project &&
            !namePrefix &&
            !environment &&
            !inlineSegmentConstraints
        ) {
            return {};
        }

        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
            environment,
            inlineSegmentConstraints,
        });

        if (query.tag) {
            query.tag = query.tag.map((q) => q.split(':'));
        }

        return query;
    }
}
