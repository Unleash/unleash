import { Response } from 'express';
import { IUnleashConfig } from '../../../types/option';
import {
    IFlagResolver,
    IProjectParam,
    IUnleashServices,
    UPDATE_FEATURE,
} from '../../../types';
import { Logger } from '../../../logger';
import { extractUsername } from '../../../util/extract-user';
import { DELETE_FEATURE } from '../../../types/permissions';
import FeatureToggleService from '../../../features/feature-toggle/feature-toggle-service';
import { IAuthRequest } from '../../unleash-types';
import { OpenApiService } from '../../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses';
import {
    BatchFeaturesSchema,
    createRequestSchema,
    createResponseSchema,
} from '../../../openapi';
import Controller from '../../controller';
import {
    TransactionCreator,
    UnleashTransaction,
} from '../../../db/transaction';

const PATH = '/:projectId';
const PATH_ARCHIVE = `${PATH}/archive`;
const PATH_VALIDATE_ARCHIVE = `${PATH}/archive/validate`;
const PATH_DELETE = `${PATH}/delete`;
const PATH_REVIVE = `${PATH}/revive`;

export default class ProjectArchiveController extends Controller {
    private readonly logger: Logger;

    private featureService: FeatureToggleService;

    private transactionalFeatureToggleService: (
        db: UnleashTransaction,
    ) => FeatureToggleService;
    private readonly startTransaction: TransactionCreator<UnleashTransaction>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            transactionalFeatureToggleService,
            featureToggleServiceV2,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'transactionalFeatureToggleService'
            | 'featureToggleServiceV2'
            | 'openApiService'
        >,
        startTransaction: TransactionCreator<UnleashTransaction>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/archive.js');
        this.featureService = featureToggleServiceV2;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;
        this.startTransaction = startTransaction;

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
        const user = extractUsername(req);
        await this.featureService.deleteFeatures(
            features,
            projectId,
            user,
            req.user.id,
        );
        res.status(200).end();
    }

    async reviveFeatures(
        req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { features } = req.body;
        const user = extractUsername(req);
        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).reviveFeatures(
                features,
                projectId,
                user,
                req.user.id,
            ),
        );
        res.status(200).end();
    }

    async archiveFeatures(
        req: IAuthRequest<IProjectParam, void, BatchFeaturesSchema>,
        res: Response,
    ): Promise<void> {
        const { features } = req.body;
        const { projectId } = req.params;

        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).archiveToggles(
                features,
                req.user,
                projectId,
            ),
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

module.exports = ProjectArchiveController;
