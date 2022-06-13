import { Request, Response } from 'express';
import Controller from '../controller';

import {
    DELETE_TAG_TYPE,
    NONE,
    UPDATE_TAG_TYPE,
} from '../../types/permissions';
import { extractUsername } from '../../util/extract-user';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import TagTypeService from '../../services/tag-type-service';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';
import { createRequestSchema, createResponseSchema } from '../../openapi';
import { TagTypesSchema } from '../../openapi/spec/tag-types-schema';
import { emptyResponse } from '../../openapi/spec/empty-response';
import { ValidateTagTypeSchema } from '../../openapi/spec/validate-tag-type-schema';
import { TagTypeSchema } from '../../openapi/spec/tag-type-schema';
import { UpdateTagTypeSchema } from '../../openapi/spec/update-tag-type-schema';

const version = 1;

class TagTypeController extends Controller {
    private logger: Logger;

    private tagTypeService: TagTypeService;

    constructor(
        config: IUnleashConfig,
        {
            tagTypeService,
            openApiService,
        }: Pick<IUnleashServices, 'tagTypeService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/tag-type.js');
        this.tagTypeService = tagTypeService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getTagTypes,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'getTagTypes',
                    responses: { 200: createResponseSchema('tagTypesSchema') },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createTagType,
            permission: UPDATE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'createTagType',
                    responses: { 201: createResponseSchema('tagTypeSchema') },
                    requestBody: createRequestSchema('tagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateTagType,
            permission: UPDATE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'validateTagType',
                    responses: {
                        200: createResponseSchema('validateTagTypeSchema'),
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
                    tags: ['admin'],
                    operationId: 'getTagType',
                    responses: {
                        200: createResponseSchema('tagTypeSchema'),
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
                    tags: ['admin'],
                    operationId: 'updateTagType',
                    responses: {
                        200: emptyResponse,
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
                    tags: ['admin'],
                    operationId: 'deleteTagType',
                    responses: {
                        200: emptyResponse,
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
        req: Request<any, any, TagTypeSchema>,
        res: Response<ValidateTagTypeSchema>,
    ): Promise<void> {
        await this.tagTypeService.validate(req.body);
        res.status(200).json({ valid: true, tagType: req.body });
    }

    async createTagType(
        req: IAuthRequest<any, any, TagTypeSchema>,
        res: Response,
    ): Promise<void> {
        const userName = extractUsername(req);
        const tagType = await this.tagTypeService.createTagType(
            req.body,
            userName,
        );
        res.status(201).json(tagType);
    }

    async updateTagType(
        req: IAuthRequest<any, any, UpdateTagTypeSchema>,
        res: Response,
    ): Promise<void> {
        const { description, icon } = req.body;
        const { name } = req.params;
        const userName = extractUsername(req);

        await this.tagTypeService.updateTagType(
            { name, description, icon },
            userName,
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
        await this.tagTypeService.deleteTagType(name, userName);
        res.status(200).end();
    }
}
export default TagTypeController;
module.exports = TagTypeController;
