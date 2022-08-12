import { Request, Response } from 'express';
import FeatureToggleService from '../../services/feature-toggle-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { IConstraint } from '../../types/model';
import { NONE } from '../../types/permissions';
import Controller from '../controller';
import { Logger } from '../../logger';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';

export default class ConstraintController extends Controller {
    private featureService: FeatureToggleService;

    private openApiService: OpenApiService;

    private readonly logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleServiceV2,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'openApiService'>,
    ) {
        super(config);
        this.featureService = featureToggleServiceV2;
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
                    responses: {
                        204: { description: 'validConstraint' },
                        400: { description: 'invalidConstraint' },
                    },
                }),
            ],
        });
    }

    async validateConstraint(
        req: Request<void, void, IConstraint>,
        res: Response,
    ): Promise<void> {
        await this.featureService.validateConstraint(req.body);
        res.status(204).send();
    }
}
