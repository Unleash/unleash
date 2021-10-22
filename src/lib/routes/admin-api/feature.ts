/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';
import {
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_FEATURE,
} from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import FeatureToggleServiceV2 from '../../services/feature-toggle-service-v2';
import { featureSchema, querySchema } from '../../schema/feature-schema';
import { IFeatureToggleQuery } from '../../types/model';
import FeatureTagService from '../../services/feature-tag-service';
import { IAuthRequest } from '../unleash-types';
import { DEFAULT_ENV } from '../../util/constants';

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
            query.tag = query.tag.map((q) => q.split(':'));
        }
        return query;
    }

    async getAllToggles(req: Request, res: Response): Promise<void> {
        const query = await this.prepQuery(req.query);
        const features = await this.featureService2.getFeatureToggles(query);

        res.json({ version, features });
    }

    async getToggle(
        req: Request<{ featureName: string }, any, any, any>,
        res: Response,
    ): Promise<void> {
        const name = req.params.featureName;
        const feature = await this.featureService2.getFeatureToggleLegacy(name);
        res.json(feature).end();
    }

    async listTags(req: Request, res: Response): Promise<void> {
        const tags = await this.featureTagService.listTags(
            req.params.featureName,
        );
        res.json({ version, tags });
    }

    async addTag(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const tag = await this.featureTagService.addTag(
            featureName,
            req.body,
            userName,
        );
        res.status(201).json(tag);
    }

    // TODO
    async removeTag(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName, type, value } = req.params;
        const userName = extractUsername(req);
        await this.featureTagService.removeTag(
            featureName,
            { type, value },
            userName,
        );
        res.status(200).end();
    }

    async validate(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        await this.featureService2.validateName(name);
        res.status(200).end();
    }

    async createToggle(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const toggle = req.body;

        const validatedToggle = await featureSchema.validateAsync(toggle);
        const { enabled } = validatedToggle;
        const createdFeature = await this.featureService2.createFeatureToggle(
            validatedToggle.project,
            validatedToggle,
            userName,
        );
        const strategies = await Promise.all(
            toggle.strategies.map(async (s) =>
                this.featureService2.createStrategy(
                    s,
                    createdFeature.project,
                    createdFeature.name,
                    userName,
                ),
            ),
        );
        await this.featureService2.updateEnabled(
            createdFeature.project,
            createdFeature.name,
            DEFAULT_ENV,
            enabled,
            userName,
        );

        res.status(201).json({
            ...createdFeature,
            enabled,
            strategies,
        });
    }

    async updateToggle(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        const projectId = await this.featureService2.getProjectId(
            updatedFeature.name,
        );
        const value = await featureSchema.validateAsync(updatedFeature);

        await this.featureService2.updateFeatureToggle(
            projectId,
            value,
            userName,
        );

        await this.featureService2.removeAllStrategiesForEnv(featureName);

        if (updatedFeature.strategies) {
            await Promise.all(
                updatedFeature.strategies.map(async (s) =>
                    this.featureService2.createStrategy(
                        s,
                        projectId,
                        featureName,
                        userName,
                    ),
                ),
            );
        }
        await this.featureService2.updateEnabled(
            projectId,
            updatedFeature.name,
            DEFAULT_ENV,
            updatedFeature.enabled,
            userName,
        );

        const feature =
            await this.featureService2.storeFeatureUpdatedEventLegacy(
                featureName,
                userName,
            );

        res.status(200).json(feature);
    }

    // TODO: remove?
    // Kept to keep backward compatibility
    async toggle(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const { featureName } = req.params;
        const projectId = await this.featureService2.getProjectId(featureName);
        const feature = await this.featureService2.toggle(
            projectId,
            featureName,
            DEFAULT_ENV,
            userName,
        );
        await this.featureService2.storeFeatureUpdatedEventLegacy(
            featureName,
            userName,
        );
        res.status(200).json(feature);
    }

    async toggleOn(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const projectId = await this.featureService2.getProjectId(featureName);
        const feature = await this.featureService2.updateEnabled(
            projectId,
            featureName,
            DEFAULT_ENV,
            true,
            userName,
        );
        await this.featureService2.storeFeatureUpdatedEventLegacy(
            featureName,
            userName,
        );
        res.json(feature);
    }

    async toggleOff(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const projectId = await this.featureService2.getProjectId(featureName);
        const feature = await this.featureService2.updateEnabled(
            projectId,
            featureName,
            DEFAULT_ENV,
            false,
            userName,
        );
        await this.featureService2.storeFeatureUpdatedEventLegacy(
            featureName,
            userName,
        );
        res.json(feature);
    }

    async staleOn(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        await this.featureService2.updateStale(featureName, true, userName);
        const feature =
            await this.featureService2.storeFeatureUpdatedEventLegacy(
                featureName,
                userName,
            );
        res.json(feature).end();
    }

    async staleOff(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        await this.featureService2.updateStale(featureName, false, userName);
        const feature =
            await this.featureService2.storeFeatureUpdatedEventLegacy(
                featureName,
                userName,
            );
        res.json(feature).end();
    }

    async archiveToggle(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);

        await this.featureService2.archiveToggle(featureName, userName);
        res.status(200).end();
    }
}
export default FeatureController;
