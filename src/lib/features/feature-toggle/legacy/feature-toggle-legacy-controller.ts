/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { Request, Response } from 'express';
import Controller from '../../../routes/controller.js';
import { NONE, UPDATE_FEATURE } from '../../../types/permissions.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { FeatureToggleService } from '../feature-toggle-service.js';
import { querySchema } from '../../../schema/feature-schema.js';
import type { IFeatureToggleQuery } from '../../../types/model.js';
import type FeatureTagService from '../../../services/feature-tag-service.js';
import type { IAuthRequest } from '../../../routes/unleash-types.js';
import type { TagSchema } from '../../../openapi/spec/tag-schema.js';
import type { TagsSchema } from '../../../openapi/spec/tags-schema.js';
import type { IUnleashServices } from '../../../services/index.js';
import { createRequestSchema } from '../../../openapi/util/create-request-schema.js';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../../openapi/util/create-response-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses.js';
import type { UpdateTagsSchema } from '../../../openapi/spec/update-tags-schema.js';
import type { ValidateFeatureSchema } from '../../../openapi/spec/validate-feature-schema.js';

const version = 1;

class FeatureController extends Controller {
    private tagService: FeatureTagService;

    private service: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureTagService,
            featureToggleService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'featureTagService' | 'featureToggleService' | 'openApiService'
        >,
    ) {
        super(config);
        this.tagService = featureTagService;
        this.service = featureToggleService;

        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validate,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'validateFeature',
                    summary: 'Validate a feature flag name.',
                    requestBody: createRequestSchema('validateFeatureSchema'),
                    description:
                        'Validates a feature flag name: checks whether the name is URL-friendly and whether a feature with the given name already exists. Returns 200 if the feature name is compliant and unused.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 409, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:featureName/tags',
            handler: this.listTags,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all tags for a feature.',
                    description:
                        'Retrieves all the tags for a feature name. If the feature does not exist it returns an empty list.',
                    tags: ['Features'],
                    operationId: 'listTags',
                    responses: {
                        200: createResponseSchema('tagsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:featureName/tags',
            permission: UPDATE_FEATURE,
            handler: this.addTag,
            middleware: [
                openApiService.validPath({
                    summary: 'Adds a tag to a feature.',
                    description:
                        'Adds a tag to a feature if the feature and tag type exist in the system. The operation is idempotent, so adding an existing tag will result in a successful response.',
                    tags: ['Features'],
                    operationId: 'addTag',
                    requestBody: createRequestSchema('tagSchema'),
                    responses: {
                        201: resourceCreatedResponseSchema('tagSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:featureName/tags',
            permission: UPDATE_FEATURE,
            handler: this.updateTags,
            middleware: [
                openApiService.validPath({
                    summary: 'Updates multiple tags for a feature.',
                    description:
                        'Receives a list of tags to add and a list of tags to remove that are mandatory but can be empty. All tags under addedTags are first added to the feature and then all tags under removedTags are removed from the feature.',
                    tags: ['Features'],
                    operationId: 'updateTags',
                    requestBody: createRequestSchema('updateTagsSchema'),
                    responses: {
                        200: resourceCreatedResponseSchema('tagsSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:featureName/tags/:type/:value',
            permission: UPDATE_FEATURE,
            acceptAnyContentType: true,
            handler: this.removeTag,
            middleware: [
                openApiService.validPath({
                    summary: 'Removes a tag from a feature.',
                    description:
                        'Removes a tag from a feature. If the feature exists but the tag does not, it returns a successful response.',
                    tags: ['Features'],
                    operationId: 'removeTag',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    paramToArray(param: any) {
        if (!param) {
            return param;
        }
        return Array.isArray(param) ? param : [param];
    }

    async prepQuery({
        tag,
        project,
        namePrefix,
    }: any): Promise<IFeatureToggleQuery> {
        if (!tag && !project && !namePrefix) {
            return {};
        }
        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
        });
        if (query.tag) {
            query.tag = query.tag.map((q) => q.split(':'));
        }
        return query;
    }

    async listTags(
        req: Request<{ featureName: string }, any, any, any>,
        res: Response<TagsSchema>,
    ): Promise<void> {
        const tags = await this.tagService.listTags(req.params.featureName);
        res.json({ version, tags });
    }

    async addTag(
        req: IAuthRequest<
            { featureName: string },
            Response<TagSchema>,
            TagSchema,
            any
        >,
        res: Response<TagSchema>,
    ): Promise<void> {
        const { featureName } = req.params;
        const tag = await this.tagService.addTag(
            featureName,
            req.body,
            req.audit,
        );
        res.status(201).header('location', `${featureName}/tags`).json(tag);
    }

    async updateTags(
        req: IAuthRequest<
            { featureName: string },
            Response<TagsSchema>,
            UpdateTagsSchema,
            any
        >,
        res: Response<TagsSchema>,
    ): Promise<void> {
        const { featureName } = req.params;
        const { addedTags, removedTags } = req.body;

        await Promise.all(
            addedTags.map((addedTag) =>
                this.tagService.addTag(featureName, addedTag, req.audit),
            ),
        );

        await Promise.all(
            removedTags.map((removedTag) =>
                this.tagService.removeTag(featureName, removedTag, req.audit),
            ),
        );

        const tags = await this.tagService.listTags(featureName);
        res.json({ version, tags });
    }

    // TODO
    async removeTag(
        req: IAuthRequest<{ featureName: string; type: string; value: string }>,
        res: Response<void>,
    ): Promise<void> {
        const { featureName, type, value } = req.params;
        await this.tagService.removeTag(
            featureName,
            { type, value },
            req.audit,
        );
        res.status(200).end();
    }

    async validate(
        req: Request<any, any, ValidateFeatureSchema, any>,
        res: Response<void>,
    ): Promise<void> {
        const { name, projectId } = req.body;

        await this.service.validateName(name);
        await this.service.validateFeatureFlagNameAgainstPattern(
            name,
            projectId ?? undefined,
        );
        res.status(200).end();
    }
}
export default FeatureController;
