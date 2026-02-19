import type { FeatureToggleService } from '../../../features/feature-toggle/feature-toggle-service.js';
import type { Logger } from '../../../logger.js';
import Controller from '../../controller.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { IUnleashServices } from '../../../services/index.js';
import type { Request, Response } from 'express';
import type { Operation } from 'fast-json-patch';
import {
    NONE,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
} from '../../../types/permissions.js';
import { type IVariant, WeightType } from '../../../types/model.js';
import type { IAuthRequest } from '../../unleash-types.js';
import type { FeatureVariantsSchema } from '../../../openapi/spec/feature-variants-schema.js';
import { createRequestSchema } from '../../../openapi/util/create-request-schema.js';
import { createResponseSchema } from '../../../openapi/util/create-response-schema.js';
import type { AccessService } from '../../../services/index.js';
import { BadDataError, PermissionError } from '../../../../lib/error/index.js';
import type { IUser } from '../../../types/index.js';
import type { PushVariantsSchema } from '../../../openapi/spec/push-variants-schema.js';
import { getStandardResponses } from '../../../openapi/index.js';

const PREFIX = '/:projectId/features/:featureName/variants';
const ENV_PREFIX =
    '/:projectId/features/:featureName/environments/:environment/variants';

interface FeatureEnvironmentParams extends FeatureParams {
    environment: string;
}

interface FeatureParams extends ProjectParam {
    featureName: string;
}

interface ProjectParam {
    projectId: string;
}
export default class VariantsController extends Controller {
    private logger: Logger;

    private featureService: FeatureToggleService;

    private accessService: AccessService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
            openApiService,
            accessService,
        }: Pick<
            IUnleashServices,
            'featureToggleService' | 'openApiService' | 'accessService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('admin-api/project/variants.ts');
        this.featureService = featureToggleService;
        this.accessService = accessService;
        this.route({
            method: 'get',
            path: ENV_PREFIX,
            permission: NONE,
            handler: this.getVariantsOnEnv,
            middleware: [
                openApiService.validPath({
                    summary: 'Get variants for a feature in an environment',
                    description: `Returns the variants for a feature in a specific environment. If the feature has no variants it will return an empty array of variants`,
                    tags: ['Features'],
                    operationId: 'getEnvironmentFeatureVariants',
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'patch',
            path: ENV_PREFIX,
            permission: UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
            handler: this.patchVariantsOnEnv,
            middleware: [
                openApiService.validPath({
                    summary: "Patch a feature's variants in an environment",
                    description: `Apply a list of patches to the features environments in the specified environment. The patch objects should conform to the [JSON-patch format (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902).`,
                    tags: ['Features'],
                    operationId: 'patchEnvironmentsFeatureVariants',
                    requestBody: createRequestSchema('patchesSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: ENV_PREFIX,
            permission: UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
            handler: this.overwriteVariantsOnEnv,
            middleware: [
                openApiService.validPath({
                    summary:
                        'Create (overwrite) variants for a feature in an environment',
                    description: `This overwrites the current variants for the feature flag in the :featureName parameter for the :environment parameter.

The backend will validate the input for the following invariants:

* If there are variants, there needs to be at least one variant with \`weightType: variable\`
* The sum of the weights of variants with \`weightType: fix\` must be strictly less than 1000 (< 1000)

The backend will also distribute remaining weight up to 1000 after adding the variants with \`weightType: fix\` together amongst the variants of \`weightType: variable\``,
                    tags: ['Features'],
                    operationId: 'overwriteEnvironmentFeatureVariants',
                    requestBody: createRequestSchema('variantsSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: `${PREFIX}-batch`,
            permission: NONE,
            handler: this.pushVariantsToEnvironments,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'overwriteFeatureVariantsOnEnvironments',
                    summary:
                        'Create (overwrite) variants for a feature flag in multiple environments',
                    description:
                        'This overwrites the current variants for the feature flag in the :featureName parameter for the :environment parameter.',
                    requestBody: createRequestSchema('pushVariantsSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
    }

    async pushVariantsToEnvironments(
        req: IAuthRequest<
            FeatureEnvironmentParams,
            any,
            PushVariantsSchema,
            any
        >,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { projectId, featureName } = req.params;
        const { environments, variants } = req.body;

        if (environments === undefined || environments.length === 0) {
            throw new BadDataError('No environments provided');
        }

        await this.checkAccess(
            req.user,
            projectId,
            environments,
            UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
        );

        const variantsWithDefaults = (variants || []).map((variant) => ({
            weightType: WeightType.VARIABLE,
            stickiness: 'default',
            ...variant,
        }));

        await this.featureService.crProtectedSetVariantsOnEnvs(
            projectId,
            featureName,
            environments,
            variantsWithDefaults,
            req.user,
            req.audit,
        );
        res.status(200).json({
            version: 1,
            variants: variantsWithDefaults,
        });
    }

    async checkAccess(
        user: IUser,
        projectId: string,
        environments: string[],
        permission: string,
    ): Promise<void> {
        for (const environment of environments) {
            if (
                !(await this.accessService.hasPermission(
                    user,
                    permission,
                    projectId,
                    environment,
                ))
            ) {
                throw new PermissionError(
                    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
                    environment,
                );
            }
        }
    }

    async getVariantsOnEnv(
        req: Request<FeatureEnvironmentParams, any, any, any>,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;
        await this.featureService.validateFeatureBelongsToProject({
            featureName,
            projectId,
        });
        const variants = await this.featureService.getVariantsForEnv(
            featureName,
            environment,
        );
        res.status(200).json({ version: 1, variants: variants || [] });
    }

    async patchVariantsOnEnv(
        req: IAuthRequest<FeatureEnvironmentParams, any, Operation[]>,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { projectId, featureName, environment } = req.params;

        const variants = await this.featureService.updateVariantsOnEnv(
            featureName,
            projectId,
            environment,
            req.body,
            req.user,
            req.audit,
        );
        res.status(200).json({
            version: 1,
            variants,
        });
    }

    async overwriteVariantsOnEnv(
        req: IAuthRequest<FeatureEnvironmentParams, any, IVariant[], any>,
        res: Response<FeatureVariantsSchema>,
    ): Promise<void> {
        const { featureName, environment, projectId } = req.params;
        const variants = await this.featureService.crProtectedSaveVariantsOnEnv(
            projectId,
            featureName,
            environment,
            req.body,
            req.user,
            req.audit,
        );
        res.status(200).json({
            version: 1,
            variants: variants,
        });
    }
}
