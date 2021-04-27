'use strict';

import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import TagService from '../../services/tag-service';
import { Logger } from '../../logger';

import Controller from '../controller';

import { UPDATE_FEATURE } from '../../permissions';
import { handleErrors } from './util';
import extractUsername from '../../extract-user';

const version = 1;

class TagController extends Controller {
    private logger: Logger;

    private tagService: TagService;

    constructor(
        config: IUnleashConfig,
        { tagService }: Pick<IUnleashServices, 'tagService'>,
    ) {
        super(config);
        this.tagService = tagService;
        this.logger = config.getLogger('/admin-api/tag.js');

        this.get('/', this.getTags);
        this.post('/', this.createTag, UPDATE_FEATURE);
        this.get('/:type', this.getTagsByType);
        this.get('/:type/:value', this.getTag);
        this.delete('/:type/:value', this.deleteTag, UPDATE_FEATURE);
    }

    async getTags(req: Request, res: Response): Promise<void> {
        try {
            const tags = await this.tagService.getTags();
            res.json({ version, tags });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getTagsByType(req: Request, res: Response): Promise<void> {
        try {
            const tags = await this.tagService.getTagsByType(req.params.type);
            res.json({ version, tags });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getTag(req: Request, res: Response): Promise<void> {
        const { type, value } = req.params;
        try {
            const tag = await this.tagService.getTag({ type, value });
            res.json({ version, tag });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async createTag(req: Request, res: Response): Promise<void> {
        const userName = extractUsername(req);
        try {
            await this.tagService.createTag(req.body, userName);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteTag(req: Request, res: Response): Promise<void> {
        const { type, value } = req.params;
        const userName = extractUsername(req);
        try {
            await this.tagService.deleteTag({ type, value }, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}
export default TagController;
module.exports = TagController;
