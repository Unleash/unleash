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
import { emptyResponse } from '../../openapi/util/standard-responses';

const version = 1;

class TagController extends Controller {
    private logger: Logger;

    private tagService: TagService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            tagService,
            openApiService,
        }: Pick<IUnleashServices, 'tagService' | 'openApiService'>,
    ) {
        super(config);
        this.tagService = tagService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/tag.js');

        this.route({
            method: 'get',
            path: '',
            handler: this.getTags,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTags',
                    responses: { 200: createResponseSchema('tagsSchema') },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createTag,
            permission: UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'createTag',
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'tagWithVersionSchema',
                        ),
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
                    responses: {
                        200: createResponseSchema('tagsSchema'),
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
                    responses: {
                        200: createResponseSchema('tagWithVersionSchema'),
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
        const tag = await this.tagService.createTag(req.body, userName);
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
        await this.tagService.deleteTag({ type, value }, userName);
        res.status(200).end();
    }
}
export default TagController;
