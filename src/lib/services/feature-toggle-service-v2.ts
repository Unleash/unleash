/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { FeatureConfigurationClient, IFeatureStrategy } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import {
    FeatureToggle, FeatureToggleDTO, FeatureToggleWithEnvironment,
    IFeatureToggleQuery,
    IProjectOverview,
    IStrategyConfig
} from '../types/model';
import ProjectStore from '../db/project-store';
import BadDataError from '../error/bad-data-error';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import NameExistsError from '../error/name-exists-error';
import { featureMetadataSchema, featureSchema, nameSchema } from '../schema/feature-schema';
import EventStore from '../db/event-store';
import { FEATURE_ARCHIVED, FEATURE_CREATED, FEATURE_STALE_OFF, FEATURE_STALE_ON, FEATURE_UPDATED } from '../types/events';
import FeatureTagStore from '../db/feature-tag-store';
import EnvironmentStore from '../db/environment-store';
import { GLOBAL_ENV } from '../types/environment';

class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: FeatureStrategiesStore;

    private featureToggleStore: FeatureToggleStore;

    private featureTagStore: FeatureTagStore;

    private projectStore: ProjectStore;

    private environmentStore: EnvironmentStore;

    private eventStore: EventStore;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            projectStore,
            eventStore,
            featureTagStore,
            environmentStore
        }: Pick<IUnleashStores, 'featureStrategiesStore' | 'featureToggleStore' | 'projectStore' | 'eventStore' | 'featureTagStore' | 'environmentStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>
    ) {
        this.logger = getLogger('services/feature-toggle-service-v2.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTagStore = featureTagStore;
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.environmentStore = environmentStore;
    }

    async createStrategy(strategyConfig: Omit<IStrategyConfig, 'id'>, projectName: string, featureName: string, environment: string = GLOBAL_ENV): Promise<IStrategyConfig> {
        try {
            const newFeatureStrategy = await this.featureStrategiesStore.createStrategyConfig({
                strategyName: strategyConfig.name,
                constraints: strategyConfig.constraints,
                parameters: strategyConfig.parameters,
                projectName,
                featureName,
                environment
            });
            return {
                id: newFeatureStrategy.id,
                name: newFeatureStrategy.strategyName,
                constraints: newFeatureStrategy.constraints,
                parameters: newFeatureStrategy.parameters
            };
        } catch (e) {
            if (e.code === FOREIGN_KEY_VIOLATION) {
                throw new BadDataError("You have not added the current environment to the project");
            }
            throw e;
        }
    }

    /**
     * PUT /api/admin/projects/:projectName/features/:featureName/strategies/:strategyId ?
     * {
     *
     * }
     * @param id
     * @param updates
     */
    async updateStrategy(id: string, updates: Partial<IFeatureStrategy>): Promise<IFeatureStrategy> {
        return this.featureStrategiesStore.updateStrategy(id, updates);
    }

    async getStrategiesForEnvironment(projectName: string, featureName: string, environment: string = GLOBAL_ENV): Promise<IStrategyConfig[]> {
        const featureStrategies = await this.featureStrategiesStore.getStrategiesForFeature(projectName, featureName, environment);
        return featureStrategies.map(strat => ({
            id: strat.id,
            name: strat.strategyName,
            constraints: strat.constraints,
            parameters: strat.parameters
        }));
    }

    /**
     * GET /api/admin/projects/:projectName/features/:featureName
     * @param featureName
     */
    async getFeature(featureName: string): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleAdmin(featureName);
    }

    async getClientFeatures(query?: IFeatureToggleQuery): Promise<FeatureConfigurationClient[]> {
        return this.featureStrategiesStore.getFeatures(query);
    }

    /**
     * Used to retrieve metadata of all feature toggles defined in Unleash.
     * @param query - Allow you to limit search based on criteria such as project, tags, namePrefix. See @IFeatureToggleQuery
     * @returns
     */
    async getFeatureToggles(query?: IFeatureToggleQuery): Promise<FeatureToggle[]> {
        return this.featureStrategiesStore.getFeatures(query);
    }

    async getFeatureToggle(featureName: string): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleAdmin(featureName);
    }


    async createFeatureToggle(projectId: string, value: FeatureToggleDTO, userName: string): Promise<FeatureToggle> {
        this.logger.info(`${userName} creates feature toggle ${value.name}`);
        await this.validateName(value.name);
        const featureData = await featureMetadataSchema.validateAsync(value);
        const createdToggle = await this.featureToggleStore.createFeature(projectId, featureData);
        await this.environmentStore.connectFeatureToEnvironmentsForProject(featureData.name, projectId);
        await this.eventStore.store({
            type: FEATURE_CREATED,
            createdBy: userName,
            data: featureData,
        });

        return createdToggle;
    }

    /**
     * @deprecated
     * @param featureName 
     * @returns 
     */
    async getProjectId(featureName: string): Promise<string> {
        return this.featureToggleStore.getProjectId(featureName);
    }

    async updateFeatureToggle(projectId: string, updatedFeature: FeatureToggleDTO, userName: string): Promise<FeatureToggle> {
        this.logger.info(`${userName} updates feature toggle ${updatedFeature.name}`);

        await this.featureToggleStore.hasFeature(updatedFeature.name);
        
        const featureToggle = await this.featureToggleStore.updateFeature(projectId, updatedFeature);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(
                updatedFeature.name,
            )) || [];
        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy: userName,
            data: featureToggle,
            tags,
        });
        return featureToggle;
    }

    async removeAllStrategiesForEnv(toggleName: string, environment: string = GLOBAL_ENV): Promise<void> {
        await this.featureStrategiesStore.removeAllStrategiesForEnv(toggleName, environment);
    }

    async getStrategy(strategyId: string): Promise<IStrategyConfig> {
        const strategy = await this.featureStrategiesStore.getStrategyById(strategyId);
        return {
            id: strategy.id,
            name: strategy.strategyName,
            constraints: strategy.constraints || [],
            parameters: strategy.parameters
        };
    }

    async getProjectOverview(projectId: string): Promise<IProjectOverview> {
        const project = await this.projectStore.get(projectId);
        const features = await this.featureStrategiesStore.getProjectOverview(projectId);
        const members = await this.featureStrategiesStore.getMembers(projectId);
        return {
            name: project.name,
            description: project.description,
            features,
            members,
            version: 1
        }
    }

    async getEnvironmentInfo(environment: string, featureName: string): Promise<any> {
        return this.featureStrategiesStore.getStrategiesAndMetadataForEnvironment(environment, featureName);
    }

    async deleteEnvironment(projectId: string, environment: string): Promise<void> {
        await this.featureStrategiesStore.deleteConfigurationsForProjectAndEnvironment(projectId, environment);
        await this.projectStore.deleteEnvironment(projectId, environment);
    }

    /** Validations  */
    async validateName(name: string): Promise<string> {
        await nameSchema.validateAsync({ name });
        await this.validateUniqueFeatureName(name);
        return name;
    }

    async validateUniqueFeatureName(name: string): Promise<void> {
        let msg;
        try {
            const feature = await this.featureToggleStore.hasFeature(name);
            msg = feature.archived
                ? 'An archived toggle with that name already exists'
                : 'A toggle with that name already exists';
        } catch (error) {
            return;
        }
        throw new NameExistsError(msg);
    }

    async updateStale(featureName: string, isStale: boolean, userName: string): Promise<any> {
        const feature = await this.featureToggleStore.getFeatureMetadata(featureName);
        feature.stale = isStale;
        await this.featureToggleStore.updateFeature(feature.project, feature);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(featureName)) ||
            [];

        await this.eventStore.store({
            type: isStale ? FEATURE_STALE_ON : FEATURE_STALE_OFF,
            createdBy: userName,
            data: feature,
            tags,
        });
        return feature;
    }

    async archiveToggle(name: string, userName: string): Promise<void> {
        await this.featureToggleStore.hasFeature(name);
        await this.featureToggleStore.archiveFeature(name);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(name)) || [];
        await this.eventStore.store({
            type: FEATURE_ARCHIVED,
            createdBy: userName,
            data: { name },
            tags,
        });
    }

    async updateEnabled(featureName: string, environment: string, enabled: boolean, userName: string): Promise<FeatureToggle> {
        const newEnabled = await this.featureStrategiesStore.toggleEnvironmentEnabledStatus(environment, featureName, enabled);
        const feature = await this.featureToggleStore.getFeatureMetadata(featureName);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(featureName)) ||
            [];
        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy: userName,
            data: {...feature, enabled: newEnabled },
            tags
        });
        return feature;

    }

    // @deprecated
    async toggle(featureName: string, environment: string, userName: string): Promise<FeatureToggle> {
        await this.featureToggleStore.hasFeature(featureName);
        const isEnabled = await this.featureStrategiesStore.isEnvironmentEnabled(featureName, environment);
        return this.updateEnabled(featureName, environment, !isEnabled, userName);
    }

    // @deprecated
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateField(featureName: string, field: string, value: any, userName: string): Promise<any> {
        const feature = await this.featureToggleStore.getFeatureMetadata(featureName);
        feature[field] = value;
        await this.featureToggleStore.updateFeature(feature.project, feature);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(featureName)) ||
            [];

        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy: userName,
            data: feature,
            tags,
        });
        return feature;
    }

}



module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;
