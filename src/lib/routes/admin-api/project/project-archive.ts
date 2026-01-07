import type { Response } from 'express';
import type { IUnleashConfig } from '../../../types/option.js';
import {
    type IFlagResolver,
    type IProjectParam,
    UPDATE_FEATURE,
} from '../../../types/index.js';
import type { Logger } from '../../../logger.js';
import { DELETE_FEATURE } from '../../../types/permissions.js';
import type { FeatureToggleService } from '../../../features/feature-toggle/feature-toggle-service.js';
import type { IAuthRequest } from '../../unleash-types.js';
import type { OpenApiService } from '../../../services/openapi-service.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses.js';
import {
    type BatchFeaturesSchema,
    createRequestSchema,
    createResponseSchema,
} from '../../../openapi/index.js';
import Controller from '../../controller.js';
import type { IUnleashServices } from '../../../services/index.js';
import type { WithTransactional } from '../../../db/transaction.js';

const PATH = '/:projectId';
const PATH_ARCHIVE = `${PATH}/archive`;
const PATH_VALIDATE_ARCHIVE = `${PATH}/archive/validate`;
const PATH_DELETE = `${PATH}/delete`;
const PATH_REVIVE = `${PATH}/revive`;

export default class ProjectArchiveController extends Controller {
    private readonly logger: Logger;

    private featureService: FeatureToggleService;

    private transactionalFeatureToggleService: WithTransactional<FeatureToggleService>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            transactionalFeatureToggleService,
            featureToggleService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'transactionalFeatureToggleService'
            | 'featureToggleService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;

        this.route({
            method: 'post',
            path: PATH_DELETE,
            acceptAnyContentType: true,
            handler: this.deleteFeatures,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'deleteFeatures',
                    description:
                        'This endpoint deletes the specified features, that are in archive.',
                    summary: 'Deletes a list of features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_REVIVE,
            acceptAnyContentType: true,
            handler: this.reviveFeatures,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'reviveFeatures',
                    description:
                        'This endpoint revives the specified features.',
                    summary: 'Revives a list of features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_VALIDATE_ARCHIVE,
            handler: this.validateArchiveFeatures,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'validateArchiveFeatures',
                    description:
                        'This endpoint return info about the archive features impact.',
                    summary: 'Validates archive features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        200: createResponseSchema(
                            'validateArchiveFeaturesSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: PATH_ARCHIVE,
            handler: this.archiveFeatures,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'archiveFeatures',
                    description:
                        "This endpoint archives the specified features. Any features that are already archived or that don't exist are ignored. All existing features (whether already archived or not) that are provided must belong to the specified project.",
                    summary: 'Archives a list of features',
                    requestBody: createRequestSchema('batchFeaturesSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }

    async deleteFeatures(
        req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { features } = req.body;
        await this.featureService.deleteFeatures(
            features,
            projectId,
            req.audit,
        );
        res.status(200).end();
    }

    async reviveFeatures(
        req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { features } = req.body;
        await this.transactionalFeatureToggleService.transactional((service) =>
            service.reviveFeatures(features, projectId, req.audit),
        );
        res.status(200).end();
    }

    async archiveFeatures(
        req: IAuthRequest<IProjectParam, void, BatchFeaturesSchema>,
        res: Response,
    ): Promise<void> {
        const { features } = req.body;
        const { projectId } = req.params;

        await this.transactionalFeatureToggleService.transactional((service) =>
            service.archiveToggles(features, req.user, req.audit, projectId),
        );

        res.status(202).end();
    }

    async validateArchiveFeatures(
        req: IAuthRequest<IProjectParam, void, BatchFeaturesSchema>,
        res: Response,
    ): Promise<void> {
        const { features } = req.body;

        const { parentsWithChildFeatures, hasDeletedDependencies } =
            await this.featureService.validateArchiveToggles(features);

        res.send({ parentsWithChildFeatures, hasDeletedDependencies });
    }
}
