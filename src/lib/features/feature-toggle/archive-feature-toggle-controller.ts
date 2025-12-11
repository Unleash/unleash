import type { Response } from 'express';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import Controller from '../../routes/controller.js';
import { extractUsername } from '../../util/extract-user.js';
import { DELETE_FEATURE, UPDATE_FEATURE } from '../../types/permissions.js';
import type { FeatureToggleService } from './feature-toggle-service.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { WithTransactional } from '../../db/transaction.js';

export default class ArchiveController extends Controller {
    private featureService: FeatureToggleService;
    private transactionalFeatureToggleService: WithTransactional<FeatureToggleService>;
    private openApiService: OpenApiService;

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
        this.featureService = featureToggleService;
        this.openApiService = openApiService;
        this.transactionalFeatureToggleService =
            transactionalFeatureToggleService;

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

    async deleteFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName } = req.params;
        const _user = extractUsername(req);
        await this.featureService.deleteFeature(featureName, req.audit);
        res.status(200).end();
    }

    async reviveFeature(
        req: IAuthRequest<{ featureName: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName } = req.params;

        await this.transactionalFeatureToggleService.transactional((service) =>
            service.reviveFeature(featureName, req.audit),
        );
        res.status(200).end();
    }
}
