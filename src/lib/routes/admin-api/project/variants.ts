import FeatureToggleService from '../../../services/feature-toggle-service';
import { Logger } from '../../../logger';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types';
import { Request, Response } from 'express';
import { Operation } from 'fast-json-patch';
import {
    NONE,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_FEATURE_VARIANTS,
} from '../../../types/permissions';
import { IVariant, WeightType } from '../../../types/model';
import { extractUsername } from '../../../util/extract-user';
import { IAuthRequest } from '../../unleash-types';
import { FeatureVariantsSchema } from '../../../openapi/spec/feature-variants-schema';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import { AccessService } from '../../../services';
import { BadDataError, NoAccessError } from '../../../../lib/error';
import { User } from 'lib/server-impl';
import { PushVariantsSchema } from 'lib/openapi/spec/push-variants-schema';

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
            path: PREFIX,
            permission: NONE,
            handler: this.getVariants,
            middleware: [
                openApiService.validPath({
                    summary: 'Retrieve variants for a feature (deprecated) ',
                    description:
                        '(deprecated from 4.21) Retrieve the variants for the specified feature. From Unleash 4.21 onwards, this endpoint will attempt to choose a [production-type environment](https://docs.getunleash.io/reference/environments) as the source of truth. If more than one production environment is found, the first one will be used.',
                    deprecated: true,
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
                    summary:
                        "Apply a patch to a feature's variants (in all environments).",
                    description: `Apply a list of patches patch to the specified feature's variants. The patch objects should conform to the [JSON-patch format (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902).
                        
                        ⚠️ **Warning**: This method is not atomic. If something fails in the middle of applying the patch, you can be left with a half-applied patch. We recommend that you instead [patch variants on a per-environment basis](/docs/reference/api/unleash/patch-environments-feature-variants.api.mdx), which **is** an atomic operation.`,
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
                    summary:
                        'Create (overwrite) variants for a feature toggle in all environments',
                    description: `This overwrites the current variants for the feature specified in the :featureName parameter in all environments.

                    The backend will validate the input for the following invariants

                    * If there are variants, there needs to be at least one variant with \`weightType: variable\`
                    * The sum of the weights of variants with \`weightType: fix\` must be strictly less than 1000 (< 1000)

                    The backend will also distribute remaining weight up to 1000 after adding the variants with \`weightType: fix\` together amongst the variants of \`weightType: variable\``,
                    tags: ['Features'],
                    operationId: 'overwriteFeatureVariants',
                    requestBody: createRequestSchema('variantsSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                    },
                }),
            ],
        });
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
                    description: `This overwrites the current variants for the feature toggle in the :featureName parameter for the :environment parameter.
                        
                        The backend will validate the input for the following invariants:
                        
                    * If there are variants, there needs to be at least one variant with \`weightType: variable\`
                    * The sum of the weights of variants with \`weightType: fix\` must be strictly less than 1000 (< 1000)

                    The backend will also distribute remaining weight up to 1000 after adding the variants with \`weightType: fix\` together amongst the variants of \`weightType: variable\``,
                    tags: ['Features'],
                    operationId: 'overwriteEnvironmentFeatureVariants',
                    requestBody: createRequestSchema('variantsSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
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
                    requestBody: createRequestSchema('pushVariantsSchema'),
                    responses: {
                        200: createResponseSchema('featureVariantsSchema'),
                    },
                }),
            ],
        });
    }

    /**
     * @deprecated - Variants should be fetched from featureService.getVariantsForEnv (since variants are now; since 4.18, connected to environments)
     * @param req
     * @param res
     */
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
        const updatedFeature = await this.featureService.updateVariants(
            featureName,
            projectId,
            req.body,
            req.user,
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

        const variantsWithDefaults = variants.map((variant) => ({
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
        );
        res.status(200).json({
            version: 1,
            variants: variantsWithDefaults,
        });
    }

    async checkAccess(
        user: User,
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
                throw new NoAccessError(
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
        const { featureName, environment } = req.params;
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
        );
        res.status(200).json({
            version: 1,
            variants: variants,
        });
    }
}
