import FeatureToggleService from '../../../services/feature-toggle-service';
import { Logger } from '../../../logger';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types';
import { Request, Response } from 'express';
import { Operation } from 'fast-json-patch';
import { NONE, UPDATE_FEATURE_VARIANTS } from '../../../types/permissions';
import { IVariant } from '../../../types/model';
import { extractUsername } from '../../../util/extract-user';
import { IAuthRequest } from '../../unleash-types';
import { FeatureVariantsSchema } from '../../../openapi/spec/feature-variants-schema';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';

const PREFIX = '/:projectId/features/:featureName/variants';

interface FeatureParams extends ProjectParam {
    featureName: string;
}

interface ProjectParam {
    projectId: string;
}
export default class VariantsController extends Controller {
    private logger: Logger;

    private featureService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
            openApiService,
        }: Pick<IUnleashServices, 'featureToggleService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('admin-api/project/variants.ts');
        this.featureService = featureToggleService;
        this.route({
            method: 'get',
            path: PREFIX,
            permission: NONE,
            handler: this.getVariants,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'getFeatureVariants',
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'patch',
            path: PREFIX,
            permission: UPDATE_FEATURE_VARIANTS,
            handler: this.patchVariants,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'patchFeatureVariants',
                    requestBody: createRequestSchema('patchesSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: PREFIX,
            permission: UPDATE_FEATURE_VARIANTS,
            handler: this.overwriteVariants,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'overwriteFeatureVariants',
                    requestBody: createRequestSchema('variantsSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                    },
                }),
            ],
        });
    }

    async getVariants(
        req: Request<FeatureParams, any, any, any>,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { featureName } = req.params;
        const variants = await this.featureService.getVariants(featureName);
        res.status(200).json({ version: 1, variants: variants || [] });
    }

    async patchVariants(
        req: IAuthRequest<FeatureParams, any, Operation[]>,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const userName = extractUsername(req);

        const updatedFeature = await this.featureService.updateVariants(
            featureName,
            projectId,
            req.body,
            userName,
        );
        res.status(200).json({
            version: 1,
            variants: updatedFeature.variants,
        });
    }

    async overwriteVariants(
        req: IAuthRequest<FeatureParams, any, IVariant[], any>,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const userName = extractUsername(req);
        const updatedFeature = await this.featureService.saveVariants(
            featureName,
            projectId,
            req.body,
            userName,
        );
        res.status(200).json({
            version: 1,
            variants: updatedFeature.variants,
        });
    }
}
