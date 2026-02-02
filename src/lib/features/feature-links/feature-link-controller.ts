import type { Response } from 'express';
import Controller from '../../routes/controller.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { WithTransactional } from '../../db/transaction.js';
import type FeatureLinkService from './feature-link-service.js';
import { UPDATE_FEATURE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import type { IFeatureLink } from './feature-link-store-type.js';
import type { IFlagResolver } from '../../types/index.js';

interface FeatureLinkServices {
    transactionalFeatureLinkService: WithTransactional<FeatureLinkService>;
    openApiService: OpenApiService;
}

const PATH = '/:projectId/features/:featureName/link';
const PATH_LINK = '/:projectId/features/:featureName/link/:linkId';

export default class FeatureLinkController extends Controller {
    private transactionalFeatureLinkService: WithTransactional<FeatureLinkService>;
    private openApiService: OpenApiService;
    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            transactionalFeatureLinkService,
            openApiService,
        }: FeatureLinkServices,
    ) {
        super(config);
        this.transactionalFeatureLinkService = transactionalFeatureLinkService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'post',
            path: PATH,
            handler: this.createFeatureLink,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    release: { beta: '7', stable: '8' },
                    operationId: 'createFeatureLink',
                    summary: 'Create a feature link',
                    description: 'Create a new link for a feature.',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                    requestBody: createRequestSchema('featureLinkSchema'),
                }),
            ],
        });

        this.route({
            method: 'put',
            path: PATH_LINK,
            handler: this.updateFeatureLink,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    release: { beta: '7', stable: '8' },
                    operationId: 'updateFeatureLink',
                    summary: 'Update a feature link',
                    description: 'Update an existing feature link.',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                    requestBody: createRequestSchema('featureLinkSchema'),
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: PATH_LINK,
            handler: this.deleteFeatureLink,
            acceptAnyContentType: true,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    release: { beta: '7', stable: '8' },
                    operationId: 'deleteFeatureLink',
                    summary: 'Delete a feature link',
                    description: 'Delete a feature link by id.',
                    responses: {
                        204: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async createFeatureLink(
        req: IAuthRequest<
            { projectId: string; featureName: string },
            unknown,
            Omit<IFeatureLink, 'id' | 'createdAt'>
        >,
        res: Response,
    ): Promise<void> {
        const { projectId, featureName } = req.params;

        await this.transactionalFeatureLinkService.transactional((service) =>
            service.createLink(
                projectId,
                { ...req.body, featureName },
                req.audit,
            ),
        );

        res.status(204).end();
    }

    async updateFeatureLink(
        req: IAuthRequest<
            { projectId: string; linkId: string; featureName: string },
            unknown,
            Omit<IFeatureLink, 'id'>
        >,
        res: Response,
    ): Promise<void> {
        const { projectId, linkId, featureName } = req.params;

        await this.transactionalFeatureLinkService.transactional((service) =>
            service.updateLink(
                { projectId, linkId },
                { ...req.body, featureName },
                req.audit,
            ),
        );

        res.status(204).end();
    }

    async deleteFeatureLink(
        req: IAuthRequest<
            { projectId: string; linkId: string },
            unknown,
            Omit<IFeatureLink, 'id'>
        >,
        res: Response,
    ): Promise<void> {
        const { projectId, linkId } = req.params;

        await this.transactionalFeatureLinkService.transactional((service) =>
            service.deleteLink({ projectId, linkId }, req.audit),
        );

        res.status(204).end();
    }
}
