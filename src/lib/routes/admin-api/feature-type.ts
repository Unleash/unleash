import { Request, Response } from 'express';
import { IUnleashServices } from '../../types/services';
import FeatureTypeService from '../../services/feature-type-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';

const Controller = require('../controller');

const version = 1;

export default class FeatureTypeController extends Controller {
    private featureTypeService: FeatureTypeService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        { featureTypeService }: Pick<IUnleashServices, 'featureTypeService'>,
    ) {
        super(config);
        this.featureTypeService = featureTypeService;
        this.logger = config.getLogger('/admin-api/feature-type.js');

        this.get('/', this.getAllFeatureTypes);
    }

    async getAllFeatureTypes(req: Request, res: Response): Promise<void> {
        const types = await this.featureTypeService.getAll();
        res.json({ version, types });
    }
}

module.exports = FeatureTypeController;
