import { Request, Response } from 'express';
import Controller from '../controller';

import { UPDATE_FEATURE } from '../../types/permissions';
import { handleErrors } from '../util';
import extractUsername from '../../extract-user';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import TagTypeService from '../../services/tag-type-service';
import { Logger } from '../../logger';

const version = 1;

class TagTypeController extends Controller {
    private logger: Logger;

    private tagTypeService: TagTypeService;

    constructor(
        config: IUnleashConfig,
        { tagTypeService }: Pick<IUnleashServices, 'tagTypeService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/tag-type.js');
        this.tagTypeService = tagTypeService;
        this.get('/', this.getTagTypes);
        this.post('/', this.createTagType, UPDATE_FEATURE);
        this.post('/validate', this.validate);
        this.get('/:name', this.getTagType);
        this.put('/:name', this.updateTagType, UPDATE_FEATURE);
        this.delete('/:name', this.deleteTagType, UPDATE_FEATURE);
    }

    async getTagTypes(req: Request, res: Response): Promise<void> {
        try {
            const tagTypes = await this.tagTypeService.getAll();
            res.json({ version, tagTypes });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async validate(req: Request, res: Response): Promise<void> {
        try {
            await this.tagTypeService.validate(req.body);
            res.status(200).json({ valid: true, tagType: req.body });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createTagType(req: Request, res: Response): Promise<void> {
        const userName = extractUsername(req);
        try {
            const tagType = await this.tagTypeService.createTagType(
                req.body,
                userName,
            );
            res.status(201).json(tagType);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateTagType(req: Request, res: Response): Promise<void> {
        const { description, icon } = req.body;
        const { name } = req.params;
        const userName = extractUsername(req);
        try {
            await this.tagTypeService.updateTagType(
                { name, description, icon },
                userName,
            );
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async getTagType(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        try {
            const tagType = await this.tagTypeService.getTagType(name);
            res.json({ version, tagType });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteTagType(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const userName = extractUsername(req);
        try {
            await this.tagTypeService.deleteTagType(name, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}
export default TagTypeController;
module.exports = TagTypeController;
