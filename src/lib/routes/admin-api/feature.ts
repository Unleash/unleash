/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import { querySchema } from '../../schema/feature-schema';
import { IFeatureToggleQuery } from '../../types/model';
import FeatureTagService from '../../services/feature-tag-service';

const version = 1;

class FeatureController extends Controller {
    private logger: Logger;

    private featureTagService: FeatureTagService;

    private featureService2: FeatureToggleServiceV2;

    constructor(
        config: IUnleashConfig,
        {
            featureTagService,
            featureToggleServiceV2,
        }: Pick<
        IUnleashServices,
        'featureTagService' | 'featureToggleServiceV2'
        >,
    ) {
        super(config);
        this.featureTagService = featureTagService;
        this.featureService2 = featureToggleServiceV2;
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
            return null;
        }
        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
        });
        if (query.tag) {
            query.tag = query.tag.map(q => q.split(':'));
        }
        return query;
    }

    async getAllToggles(req: Request, res: Response): Promise<void> {
        const query = await this.prepQuery(req.query);
        try {
            const features = await this.featureService2.getFeatureToggles(
                query,
            );

            res.json({ version, features });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getToggle(req: Request, res: Response): Promise<void> {
        try {
            const name = req.params.featureName;
            const feature = await this.featureService2.getFeature(name);
            res.json(feature).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find feature' });
        }
    }

    // TODO
    async listTags(req: Request, res: Response): Promise<void> {
        try {
            const tags = await this.featureTagService.listTags(
                req.params.featureName,
            );
            res.json({ version, tags });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    // TODO
    async addTag(req: Request, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUser(req);
        try {
            const tag = await this.featureTagService.addTag(
                featureName,
                req.body,
                userName,
            );
            res.status(201).json(tag);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    // TODO
    async removeTag(req: Request, res: Response): Promise<void> {
        const { featureName, type, value } = req.params;
        const userName = extractUser(req);
        try {
            await this.featureTagService.removeTag(
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
            await this.featureService2.validateName(name);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createToggle(req: Request, res: Response): Promise<void> {
        const userName = extractUser(req);
        const toggle = req.body;

        try {
            const createdFeature = await this.featureService2.createFeatureToggle(
                toggle,
                userName,
            );
            await Promise.all(
                toggle.strategies.map(async s => {
                    await this.featureService2.createStrategy(
                        s,
                        createdFeature.project,
                        createdFeature.name,
                    );
                }),
            );

            res.status(201).json(createdFeature);
        } catch (error) {
            this.logger.warn(error);
            console.log(error);
            handleErrors(res, this.logger, error);
        }
    }

    async updateToggle(req: Request, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUser(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        try {
            const toggle = await this.featureService2.updateFeatureToggle(
                updatedFeature,
                userName,
            );

            await this.featureService2.removeAllStrategiesForEnv(featureName);

            // TODO: remove all strategies then add them.
            await Promise.all(
                updatedFeature.strategies.map(async s => {
                    await this.featureService2.createStrategy(
                        s,
                        toggle.project,
                        featureName,
                    );
                }),
            );
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    // TODO: remove?
    // Kept to keep backward compatibility
    async toggle(req: Request, res: Response): Promise<void> {
        const userName = extractUser(req);
        try {
            const name = req.params.featureName;
            const feature = await this.featureService2.toggle(name, userName);
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
            const feature = await this.featureService2.updateStale(
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
            const feature = await this.featureService2.updateStale(
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
            const feature = await this.featureService2.updateField(
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
        const userName = extractUser(req);

        try {
            await this.featureService2.archiveToggle(featureName, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}
export default FeatureController;
module.exports = FeatureController;
