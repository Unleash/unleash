import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type TagService from '../../services/tag-service.js';

import Controller from '../controller.js';

import {
    DELETE_TAG_TYPE,
    NONE,
    UPDATE_FEATURE,
    UPDATE_TAG_TYPE,
} from '../../types/permissions.js';
import { extractUsername } from '../../util/extract-user.js';
import type { IAuthRequest } from '../unleash-types.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema.js';
import { tagsSchema, type TagsSchema } from '../../openapi/spec/tags-schema.js';
import type { TagSchema } from '../../openapi/spec/tag-schema.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    tagWithVersionSchema,
    type TagWithVersionSchema,
} from '../../openapi/spec/tag-with-version-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { IFlagResolver } from '../../types/index.js';
import type { WithTransactional } from '../../db/transaction.js';
import type { CreateTagSchema, RenameTagSchema } from '../../openapi/index.js';
import { requireFeatureEnabled } from '../../middleware/conditional-middleware.js';

const version = 1;

class TagController extends Controller {
    private tagService: WithTransactional<TagService>;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            transactionalTagService,
            openApiService,
        }: Pick<IUnleashServices, 'transactionalTagService' | 'openApiService'>,
    ) {
        super(config);
        this.tagService = transactionalTagService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getTags,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    release: { stable: '4.14.0' },
                    operationId: 'getTags',
                    summary: 'List all tags.',
                    description: 'List all tags available in Unleash.',
                    responses: {
                        200: createResponseSchema('tagsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createTag,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    release: { stable: '4.14.0' },
                    operationId: 'createTag',
                    summary: 'Create a new tag.',
                    description: 'Create a new tag with the specified data.',
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'tagWithVersionSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                    requestBody: createRequestSchema('createTagSchema'),
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:type',
            handler: this.getTagsByType,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    release: { stable: '4.14.0' },
                    operationId: 'getTagsByType',
                    summary: 'List all tags of a given type.',
                    description:
                        'List all tags of a given type. If the tag type does not exist it returns an empty list.',
                    responses: {
                        200: createResponseSchema('tagsSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:type/:value',
            handler: this.getTag,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    release: { stable: '4.14.0' },
                    operationId: 'getTag',
                    summary: 'Get a tag by type and value.',
                    description:
                        'Get a tag by type and value. Can be used to check whether a given tag already exists in Unleash or not.',
                    responses: {
                        200: createResponseSchema('tagWithVersionSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:type/:value/rename',
            handler: this.renameTag,
            // Stricter than delete: renaming into an existing value merges the
            // tags, which assigns a tag to flags the caller may not be allowed
            // to edit. Deleting can only remove a tag from them.
            permission: UPDATE_TAG_TYPE,
            middleware: [
                requireFeatureEnabled(
                    config.flagResolver,
                    'tagManagementViaUi',
                ),
                openApiService.validPath({
                    tags: ['Tags'],
                    release: { alpha: true },
                    operationId: 'renameTag',
                    summary: 'Rename a tag.',
                    description:
                        'Change the value of a tag. Every feature flag that has the tag gets the new value. If a tag with the new value already exists, the two are merged.',
                    requestBody: createRequestSchema('renameTagSchema'),
                    responses: {
                        200: createResponseSchema('tagWithVersionSchema'),
                        ...getStandardResponses(400, 401, 403, 404, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:type/:value',
            handler: this.deleteTag,
            acceptAnyContentType: true,
            permission: [UPDATE_FEATURE, DELETE_TAG_TYPE],
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    release: { stable: '4.14.0' },
                    operationId: 'deleteTag',
                    summary: 'Delete a tag.',
                    description:
                        'Delete a tag by type and value. When a tag is deleted all references to the tag are removed.',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });
    }

    async getTags(_req: Request, res: Response<TagsSchema>): Promise<void> {
        const tags = await this.tagService.getTags();
        this.openApiService.respondWithValidation<TagsSchema>(
            200,
            res,
            tagsSchema.$id,
            { version, tags },
        );
    }

    async getTagsByType(
        req: Request,
        res: Response<TagsSchema>,
    ): Promise<void> {
        const tags = await this.tagService.getTagsByType(req.params.type);
        this.openApiService.respondWithValidation<TagsSchema>(
            200,
            res,
            tagsSchema.$id,
            { version, tags },
        );
    }

    async getTag(
        req: Request<TagSchema>,
        res: Response<TagWithVersionSchema>,
    ): Promise<void> {
        const { type, value } = req.params;
        const tag = await this.tagService.getTag({ type, value });
        this.openApiService.respondWithValidation<TagWithVersionSchema>(
            200,
            res,
            tagWithVersionSchema.$id,
            { version, tag },
        );
    }

    async createTag(
        req: IAuthRequest<unknown, unknown, CreateTagSchema>,
        res: Response<TagWithVersionSchema>,
    ): Promise<void> {
        const _userName = extractUsername(req);
        const tag = await this.tagService.createTag(req.body, req.audit);
        res.status(201)
            .header('location', `tags/${tag.type}/${tag.value}`)
            .json({ version, tag })
            .end();
    }

    async renameTag(
        req: IAuthRequest<TagSchema, unknown, RenameTagSchema>,
        res: Response<TagWithVersionSchema>,
    ): Promise<void> {
        const { type, value } = req.params;
        const tag = await this.tagService.transactional((service) =>
            service.renameTag({ type, value }, req.body.value, req.audit),
        );
        res.status(200).json({ version, tag }).end();
    }

    async deleteTag(
        req: IAuthRequest<TagSchema>,
        res: Response,
    ): Promise<void> {
        const { type, value } = req.params;
        const _userName = extractUsername(req);
        await this.tagService.deleteTag({ type, value }, req.audit);
        res.status(200).end();
    }
}
export default TagController;
