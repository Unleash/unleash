import { Request, Response } from 'express';

import Controller from '../controller';

import { handleErrors } from './util';
import extractUser from '../../extract-user';
import {
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_FEATURE,
} from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import FeatureToggleService from '../../services/feature-toggle-service';

const version = 1;
const fields = [
    'name',
    'description',
    'type',
    'project',
    'enabled',
    'stale',
    'strategies',
    'variants',
    'createdAt',
    'lastSeenAt',
];

class FeatureController extends Controller {
    private logger: Logger;

    private featureService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService'>,
    ) {
        super(config);
        this.featureService = featureToggleService;
        this.logger = config.getLogger('/admin-api/feature.ts');

        this.get('/', this.getAllToggles);
        this.post('/', this.createToggle, CREATE_FEATURE);
        this.get('/:featureName', this.getToggle);
        this.put('/:featureName', this.updateToggle, UPDATE_FEATURE);
        this.delete('/:featureName', this.archiveToggle, DELETE_FEATURE);
        this.post('/validate', this.validate);
        this.post('/:featureName/toggle', this.toggle, UPDATE_FEATURE);
        this.post('/:featureName/toggle/on', this.toggleOn, UPDATE_FEATURE);
        this.post('/:featureName/toggle/off', this.toggleOff, UPDATE_FEATURE);
        this.post('/:featureName/stale/on', this.staleOn, UPDATE_FEATURE);
        this.post('/:featureName/stale/off', this.staleOff, UPDATE_FEATURE);
        this.get('/:featureName/tags', this.listTags);
        this.post('/:featureName/tags', this.addTag, UPDATE_FEATURE);
        this.delete(
            '/:featureName/tags/:type/:value',
            this.removeTag,
            UPDATE_FEATURE,
        );
    }

    async getAllToggles(req: Request, res: Response): Promise<void> {
        try {
            const features = await this.featureService.getFeatures(
                req.query,
                fields,
            );
            res.json({ version, features });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getToggle(req: Request, res: Response): Promise<void> {
        try {
            const name = req.params.featureName;
            const feature = await this.featureService.getFeature(name);
            res.json(feature).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }

    async listTags(req: Request, res: Response): Promise<void> {
        try {
            const tags = await this.featureService.listTags(
                req.params.featureName,
            );
            res.json({ version, tags });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async addTag(req: Request, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUser(req);
        try {
            const tag = await this.featureService.addTag(
                featureName,
                req.body,
                userName,
            );
            res.status(201).json(tag);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async removeTag(req: Request, res: Response): Promise<void> {
        const { featureName, type, value } = req.params;
        const userName = extractUser(req);
        try {
            await this.featureService.removeTag(
                featureName,
                { type, value },
                userName,
            );
            res.status(200).end();
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async validate(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        try {
            await this.featureService.validateName({ name });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createToggle(req: Request, res: Response): Promise<void> {
        const userName = extractUser(req);

        try {
            const createdFeature = await this.featureService.createFeatureToggle(
                req.body,
                userName,
            );
            res.status(201).json(createdFeature);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateToggle(req: Request, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        try {
            await this.featureService.updateToggle(updatedFeature, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // Kept to keep backward compatibility
    async toggle(req: Request, res: Response): Promise<void> {
        const userName = extractUser(req);
        try {
            const name = req.params.featureName;
            const feature = await this.featureService.toggle(name, userName);
            res.status(200).json(feature);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async toggleOn(req: Request, res: Response): Promise<void> {
        await this._updateField('enabled', true, req, res);
    }

    async toggleOff(req: Request, res: Response): Promise<void> {
        await this._updateField('enabled', false, req, res);
    }

    async staleOn(req: Request, res: Response): Promise<void> {
        try {
            const { featureName } = req.params;
            const userName = extractUser(req);
            const feature = await this.featureService.updateStale(
                featureName,
                true,
                userName,
            );
            res.json(feature).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async staleOff(req: Request, res: Response): Promise<void> {
        try {
            const { featureName } = req.params;
            const userName = extractUser(req);
            const feature = await this.featureService.updateStale(
                featureName,
                false,
                userName,
            );
            res.json(feature).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async _updateField(field, value, req, res) {
        const { featureName } = req.params;
        const userName = extractUser(req);

        try {
            const feature = await this.featureService.updateField(
                featureName,
                field,
                value,
                userName,
            );
            res.json(feature).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async archiveToggle(req: Request, res: Response): Promise<void> {
        const { featureName } = req.params;

        try {
            await this.featureService.archiveToggle(featureName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}
export default FeatureController;
module.exports = FeatureController;
