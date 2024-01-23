import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import TagService from '../../services/tag-service';
import { Logger } from '../../logger';

import Controller from '../controller';

import { NONE, UPDATE_FEATURE } from '../../types/permissions';
import { extractUsername } from '../../util/extract-user';
import { IAuthRequest } from '../unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import { tagsSchema, TagsSchema } from '../../openapi/spec/tags-schema';
import { TagSchema } from '../../openapi/spec/tag-schema';
import { OpenApiService } from '../../services/openapi-service';
import {
    tagWithVersionSchema,
    TagWithVersionSchema,
} from '../../openapi/spec/tag-with-version-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import FeatureTagService from '../../services/feature-tag-service';
import { IFlagResolver } from '../../types';

const version = 1;

class TagController extends Controller {
    private logger: Logger;

    private tagService: TagService;

    private featureTagService: FeatureTagService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    constructor(
        config: IUnleashConfig,
        {
            tagService,
            openApiService,
            featureTagService,
        }: Pick<
            IUnleashServices,
            'tagService' | 'openApiService' | 'featureTagService'
        >,
    ) {
        super(config);
        this.tagService = tagService;
        this.openApiService = openApiService;
        this.featureTagService = featureTagService;
        this.logger = config.getLogger('/admin-api/tag.js');
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getTags,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
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
                    operationId: 'createTag',
                    summary: 'Create a new tag.',
                    description: 'Create a new tag with the specified data.',
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'tagWithVersionSchema',
                        ),
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                    requestBody: createRequestSchema('tagSchema'),
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
            method: 'delete',
            path: '/:type/:value',
            handler: this.deleteTag,
            acceptAnyContentType: true,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
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

    async getTags(req: Request, res: Response<TagsSchema>): Promise<void> {
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
        req: IAuthRequest<unknown, unknown, TagSchema>,
        res: Response<TagWithVersionSchema>,
    ): Promise<void> {
        const userName = extractUsername(req);
        const tag = await this.tagService.createTag(
            req.body,
            userName,
            req.user.id,
        );
        res.status(201)
            .header('location', `tags/${tag.type}/${tag.value}`)
            .json({ version, tag })
            .end();
    }

    async deleteTag(
        req: IAuthRequest<TagSchema>,
        res: Response,
    ): Promise<void> {
        const { type, value } = req.params;
        const userName = extractUsername(req);
        await this.tagService.deleteTag({ type, value }, userName, req.user.id);
        res.status(200).end();
    }
}
export default TagController;
