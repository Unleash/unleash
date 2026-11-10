import type { Response } from 'express';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import Controller from '../../routes/controller.js';
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
    private transactionalFeatureToggleService: WithTransactional<FeatureToggleService>;
    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            transactionalFeatureToggleService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'transactionalFeatureToggleService' | 'openApiService'
        >,
    ) {
        super(config);
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
                        'This endpoint deletes the specified feature if it is archived. If the feature is not archived, it is left unchanged.',
                    summary: 'Deletes an archived feature',
                    release: { stable: '4.13.0' },
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
                    release: { stable: '4.13.0' },
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
        await this.transactionalFeatureToggleService.transactional(
            async (service) => {
                const projectId = await service.getProjectId(featureName);
                if (projectId) {
                    await service.deleteFeature(
                        featureName,
                        projectId,
                        req.audit,
                    );
                }
            },
        );
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
