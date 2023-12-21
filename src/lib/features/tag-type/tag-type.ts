import { Request, Response } from 'express';
import Controller from '../../routes/controller';

import {
    CREATE_TAG_TYPE,
    DELETE_TAG_TYPE,
    NONE,
    UPDATE_TAG_TYPE,
} from '../../types/permissions';
import { extractUsername } from '../../util/extract-user';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import TagTypeService from './tag-type-service';
import { Logger } from '../../logger';
import { IAuthRequest } from '../../routes/unleash-types';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema';
import { TagTypesSchema } from '../../openapi/spec/tag-types-schema';
import {
    validateTagTypeSchema,
    ValidateTagTypeSchema,
} from '../../openapi/spec/validate-tag-type-schema';
import { TagTypeSchema } from '../../openapi/spec/tag-type-schema';
import { UpdateTagTypeSchema } from '../../openapi/spec/update-tag-type-schema';
import { OpenApiService } from '../../services/openapi-service';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';
import { WithTransactional } from '../../db/transaction';

const version = 1;

class TagTypeController extends Controller {
    private logger: Logger;

    private tagTypeService: WithTransactional<TagTypeService>;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            transactionalTagTypeService,
            openApiService,
        }: Pick<
            IUnleashServices,
            'transactionalTagTypeService' | 'openApiService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/tag-type.js');
        this.tagTypeService = transactionalTagTypeService;
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getTagTypes,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTagTypes',
                    summary: 'Get all tag types',
                    description: 'Get a list of all available tag types.',
                    responses: {
                        200: createResponseSchema('tagTypesSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createTagType,
            permission: CREATE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'createTagType',
                    summary: 'Create a tag type',
                    description: 'Create a new tag type.',
                    responses: {
                        201: resourceCreatedResponseSchema('tagTypeSchema'),
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                    requestBody: createRequestSchema('tagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateTagType,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'validateTagType',
                    summary: 'Validate a tag type',
                    description:
                        'Validates whether if the body of the request is a valid tag and whether the a tag type with that name already exists or not. If a tag type with the same name exists, this operation will return a 409 status code.',
                    responses: {
                        200: createResponseSchema('validateTagTypeSchema'),
                        ...getStandardResponses(400, 401, 403, 409, 415),
                    },
                    requestBody: createRequestSchema('tagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getTagType,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTagType',
                    summary: 'Get a tag type',
                    description: 'Get a tag type by name.',
                    responses: {
                        200: createResponseSchema('tagTypeSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:name',
            handler: this.updateTagType,
            permission: UPDATE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'updateTagType',
                    summary: 'Update a tag type',
                    description:
                        'Update the configuration for the specified tag type.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403, 415),
                    },
                    requestBody: createRequestSchema('updateTagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:name',
            handler: this.deleteTagType,
            acceptAnyContentType: true,
            permission: DELETE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'deleteTagType',
                    summary: 'Delete a tag type',
                    description:
                        'Deletes a tag type. If any features have tags of this type, those tags will be deleted.',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getTagTypes(
        req: Request,
        res: Response<TagTypesSchema>,
    ): Promise<void> {
        const tagTypes = await this.tagTypeService.getAll();
        res.json({ version, tagTypes });
    }

    async validateTagType(
        req: Request<unknown, unknown, TagTypeSchema>,
        res: Response<ValidateTagTypeSchema>,
    ): Promise<void> {
        await this.tagTypeService.validate(req.body);

        this.openApiService.respondWithValidation(
            200,
            res,
            validateTagTypeSchema.$id,
            {
                valid: true,
                tagType: req.body,
            },
        );
    }

    async createTagType(
        req: IAuthRequest<unknown, unknown, TagTypeSchema>,
        res: Response,
    ): Promise<void> {
        const userName = extractUsername(req);
        const tagType = await this.tagTypeService.transactional((service) =>
            service.createTagType(req.body, userName, req.user.id),
        );
        res.status(201)
            .header('location', `tag-types/${tagType.name}`)
            .json(tagType);
    }

    async updateTagType(
        req: IAuthRequest<{ name: string }, unknown, UpdateTagTypeSchema>,
        res: Response,
    ): Promise<void> {
        const { description, icon } = req.body;
        const { name } = req.params;
        const userName = extractUsername(req);

        await this.tagTypeService.transactional((service) =>
            service.updateTagType(
                { name, description, icon },
                userName,
                req.user.id,
            ),
        );
        res.status(200).end();
    }

    async getTagType(req: Request, res: Response): Promise<void> {
        const { name } = req.params;

        const tagType = await this.tagTypeService.getTagType(name);
        res.json({ version, tagType });
    }

    async deleteTagType(req: IAuthRequest, res: Response): Promise<void> {
        const { name } = req.params;
        const userName = extractUsername(req);
        await this.tagTypeService.transactional((service) =>
            service.deleteTagType(name, userName, req.user.id),
        );
        res.status(200).end();
    }
}

export default TagTypeController;
module.exports = TagTypeController;
