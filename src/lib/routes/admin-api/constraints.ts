import type { Request, Response } from 'express';
import type { FeatureToggleService } from '../../features/feature-toggle/feature-toggle-service.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import { NONE } from '../../types/permissions.js';
import Controller from '../controller.js';
import type { Logger } from '../../logger.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import {
    type ConstraintSchema,
    getStandardResponses,
} from '../../openapi/index.js';

export default class ConstraintController extends Controller {
    private featureService: FeatureToggleService;

    private openApiService: OpenApiService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleService' | 'openApiService'>,
    ) {
        super(config);
        this.featureService = featureToggleService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/validation.ts');

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateConstraint,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'validateConstraint',
                    requestBody: createRequestSchema('constraintSchema'),
                    summary: 'Validate constraint',
                    description:
                        'Validates a constraint definition. Checks whether the context field exists and whether the applied configuration is valid. Additional properties are not allowed on data objects that you send to this endpoint.',
                    responses: {
                        204: { description: 'The constraint is valid' },
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                }),
            ],
        });
    }

    async validateConstraint(
        req: Request<void, void, ConstraintSchema>,
        res: Response,
    ): Promise<void> {
        await this.featureService.validateConstraint(req.body);
        res.status(204).send();
    }
}
