import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types';
import Controller from '../../routes/controller';
import {
    extractUserIdFromUser,
    extractUsername,
} from '../../util/extract-user';
import { DELETE_FEATURE, NONE, UPDATE_FEATURE } from '../../types/permissions';
import type FeatureToggleService from './feature-toggle-service';
import type { IAuthRequest } from '../../routes/unleash-types';
import { serializeDates } from '../../types/serialize-dates';
import type { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import type {
    TransactionCreator,
    UnleashTransaction,
} from '../../db/transaction';
import {
    archivedFeaturesSchema,
    type ArchivedFeaturesSchema,
} from '../../openapi';

export default class ArchiveController extends Controller {
    private featureService: FeatureToggleService;
    private transactionalFeatureToggleService: (
        db: UnleashTransaction,
    ) => FeatureToggleService;
    private readonly startTransaction: TransactionCreator<UnleashTransaction>;
    private openApiService: OpenApiService;

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
        this.featureService = featureToggleServiceV2;
        this.openApiService = openApiService;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;
        this.startTransaction = startTransaction;

        this.route({
            method: 'get',
            path: '/features',
            handler: this.getArchivedFeatures,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    summary: 'Get archived features',
                    description:
                        'Retrieve a list of all [archived feature flags](https://docs.getunleash.io/reference/archived-toggles).',
                    operationId: 'getArchivedFeatures',
                    responses: {
                        200: createResponseSchema('archivedFeaturesSchema'),
                        ...getStandardResponses(401, 403),
                    },

                    deprecated: true,
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/features/:projectId',
            handler: this.getArchivedFeaturesByProjectId,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    operationId: 'getArchivedFeaturesByProjectId',
                    summary: 'Get archived features in project',
                    description:
                        'Retrieves a list of archived features that belong to the provided project.',
                    responses: {
                        200: createResponseSchema('archivedFeaturesSchema'),
                        ...getStandardResponses(401, 403),
                    },

                    deprecated: true,
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:featureName',
            acceptAnyContentType: true,
            handler: this.deleteFeature,
            permission: DELETE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    description:
                        'This endpoint archives the specified feature.',
                    summary: 'Archives a feature',
                    operationId: 'deleteFeature',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/revive/:featureName',
            acceptAnyContentType: true,
            handler: this.reviveFeature,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Archive'],
                    description:
                        'This endpoint revives the specified feature from archive.',
                    summary: 'Revives a feature',
                    operationId: 'reviveFeature',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
    }

    async getArchivedFeatures(
        req: IAuthRequest,
        res: Response<ArchivedFeaturesSchema>,
    ): Promise<void> {
        const { user } = req;
        const features = await this.featureService.getAllArchivedFeatures(
            true,
            extractUserIdFromUser(user),
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            archivedFeaturesSchema.$id,
            { version: 2, features: serializeDates(features) },
        );
    }

    async getArchivedFeaturesByProjectId(
        req: Request<{ projectId: string }, any, any, any>,
        res: Response<ArchivedFeaturesSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const features =
            await this.featureService.getArchivedFeaturesByProjectId(
                true,
                projectId,
            );
        this.openApiService.respondWithValidation(
            200,
            res,
            archivedFeaturesSchema.$id,
            { version: 2, features: serializeDates(features) },
        );
    }

    async deleteFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName } = req.params;
        const user = extractUsername(req);
        await this.featureService.deleteFeature(featureName, req.audit);
        res.status(200).end();
    }

    async reviveFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName } = req.params;

        await this.startTransaction(async (tx) =>
            this.transactionalFeatureToggleService(tx).reviveFeature(
                featureName,
                req.audit,
            ),
        );
        res.status(200).end();
    }
}

module.exports = ArchiveController;
