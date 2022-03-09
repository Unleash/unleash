/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';
import {
    UPDATE_FEATURE,
    DELETE_FEATURE,
    CREATE_FEATURE,
    NONE,
} from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import FeatureToggleService from '../../services/feature-toggle-service';
import { featureSchema, querySchema } from '../../schema/feature-schema';
import { IFeatureToggleQuery } from '../../types/model';
import FeatureTagService from '../../services/feature-tag-service';
import { IAuthRequest } from '../unleash-types';
import { DEFAULT_ENV } from '../../util/constants';

const version = 1;

class FeatureController extends Controller {
    private tagService: FeatureTagService;

    private service: FeatureToggleService;

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
        this.tagService = featureTagService;
        this.service = featureToggleServiceV2;

        if (!config.disableLegacyFeaturesApi) {
            this.post('/', this.createToggle, CREATE_FEATURE);
            this.get('/:featureName', this.getToggle);
            this.put('/:featureName', this.updateToggle, UPDATE_FEATURE);
            this.delete('/:featureName', this.archiveToggle, DELETE_FEATURE);
            this.post('/:featureName/toggle', this.toggle, UPDATE_FEATURE);
            this.post('/:featureName/toggle/on', this.toggleOn, UPDATE_FEATURE);
            this.post(
                '/:featureName/toggle/off',
                this.toggleOff,
                UPDATE_FEATURE,
            );

            this.post('/:featureName/stale/on', this.staleOn, UPDATE_FEATURE);
            this.post('/:featureName/stale/off', this.staleOff, UPDATE_FEATURE);
        }

        this.get('/', this.getAllToggles);
        this.post('/validate', this.validate, NONE);
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
        const features = await this.service.getFeatureToggles(query);

        res.json({ version, features });
    }

    async getToggle(
        req: Request<{ featureName: string }, any, any, any>,
        res: Response,
    ): Promise<void> {
        const name = req.params.featureName;
        const feature = await this.service.getFeatureToggleLegacy(name);
        res.json(feature).end();
    }

    async listTags(req: Request, res: Response): Promise<void> {
        const tags = await this.tagService.listTags(req.params.featureName);
        res.json({ version, tags });
    }

    async addTag(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const tag = await this.tagService.addTag(
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
        await this.tagService.removeTag(featureName, { type, value }, userName);
        res.status(200).end();
    }

    async validate(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        await this.service.validateName(name);
        res.status(200).end();
    }

    async createToggle(req: IAuthRequest, res: Response): Promise<void> {
        const userName = extractUsername(req);
        const toggle = req.body;

        const validatedToggle = await featureSchema.validateAsync(toggle);
        const { enabled, project, name, variants = [] } = validatedToggle;
        const createdFeature = await this.service.createFeatureToggle(
            project,
            validatedToggle,
            userName,
            true,
        );
        const strategies = await Promise.all(
            (toggle.strategies ?? []).map(async (s) =>
                this.service.createStrategy(
                    s,
                    {
                        projectId: project,
                        featureName: name,
                        environment: DEFAULT_ENV,
                    },
                    userName,
                ),
            ),
        );
        await this.service.updateEnabled(
            project,
            name,
            DEFAULT_ENV,
            enabled,
            userName,
        );
        await this.service.saveVariants(name, project, variants, userName);

        res.status(201).json({
            ...createdFeature,
            variants,
            enabled,
            strategies,
        });
    }

    async updateToggle(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const updatedFeature = req.body;

        updatedFeature.name = featureName;

        const projectId = await this.service.getProjectId(featureName);
        const value = await featureSchema.validateAsync(updatedFeature);

        await this.service.updateFeatureToggle(
            projectId,
            value,
            userName,
            featureName,
        );

        await this.service.removeAllStrategiesForEnv(featureName);

        if (updatedFeature.strategies) {
            await Promise.all(
                updatedFeature.strategies.map(async (s) =>
                    this.service.createStrategy(
                        s,
                        { projectId, featureName, environment: DEFAULT_ENV },
                        userName,
                    ),
                ),
            );
        }
        await this.service.updateEnabled(
            projectId,
            featureName,
            DEFAULT_ENV,
            updatedFeature.enabled,
            userName,
        );
        await this.service.saveVariants(
            featureName,
            projectId,
            value.variants || [],
            userName,
        );

        const feature = await this.service.storeFeatureUpdatedEventLegacy(
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
        const projectId = await this.service.getProjectId(featureName);
        const feature = await this.service.toggle(
            projectId,
            featureName,
            DEFAULT_ENV,
            userName,
        );
        await this.service.storeFeatureUpdatedEventLegacy(
            featureName,
            userName,
        );
        res.status(200).json(feature);
    }

    async toggleOn(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const projectId = await this.service.getProjectId(featureName);
        const feature = await this.service.updateEnabled(
            projectId,
            featureName,
            DEFAULT_ENV,
            true,
            userName,
        );
        await this.service.storeFeatureUpdatedEventLegacy(
            featureName,
            userName,
        );
        res.json(feature);
    }

    async toggleOff(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        const projectId = await this.service.getProjectId(featureName);
        const feature = await this.service.updateEnabled(
            projectId,
            featureName,
            DEFAULT_ENV,
            false,
            userName,
        );
        await this.service.storeFeatureUpdatedEventLegacy(
            featureName,
            userName,
        );
        res.json(feature);
    }

    async staleOn(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        await this.service.updateStale(featureName, true, userName);
        const feature = await this.service.getFeatureToggleLegacy(featureName);
        res.json(feature);
    }

    async staleOff(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);
        await this.service.updateStale(featureName, false, userName);
        const feature = await this.service.getFeatureToggleLegacy(featureName);
        res.json(feature);
    }

    async archiveToggle(req: IAuthRequest, res: Response): Promise<void> {
        const { featureName } = req.params;
        const userName = extractUsername(req);

        await this.service.archiveToggle(featureName, userName);
        res.status(200).end();
    }
}
export default FeatureController;
