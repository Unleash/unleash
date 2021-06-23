/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { FeatureConfigurationClient, IFeatureStrategy } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import { IFeatureToggle, IFeatureToggleQuery, IProjectOverview, IStrategyConfig } from '../types/model';
import ProjectStore from '../db/project-store';
import BadDataError from '../error/bad-data-error';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import NameExistsError from '../error/name-exists-error';
import { featureSchema, nameSchema } from '../schema/feature-schema';
import EventStore from '../db/event-store';
import { FEATURE_ARCHIVED, FEATURE_CREATED, FEATURE_STALE_OFF, FEATURE_STALE_ON, FEATURE_UPDATED } from '../types/events';
import FeatureTagStore from '../db/feature-tag-store';
import EnvironmentStore from '../db/environment-store';

// TODO: move to types
const GLOBAL_ENV = ':global:';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getFeature(featureName: string): Promise<any> {
        return this.featureStrategiesStore.getFeatureToggleAdmin(featureName);
    }

    async getClientFeatures(): Promise<FeatureConfigurationClient[]> {
        return this.featureStrategiesStore.getFeatureTogglesClient();
    }

    /**
     * Used to retrieve metadata of all feature toggles defined in Unleash.
     * @param query - Allow you to limit search based on criteria such as project, tags, namePrefix. See @IFeatureToggleQuery
     * @returns
     */
    async getFeatureToggles(query: IFeatureToggleQuery): Promise<IFeatureToggle[]> {
        return this.featureStrategiesStore.getFeatures(query);
    }

    async getFeatureToggle(featureName: string): Promise<IFeatureToggle> {
        return this.featureToggleStore.getFeature(featureName);
    }


    // We might be able to reuse getClientFeatures instead?
    async getAllStrategiesForEnvironmentOld(environment: string = GLOBAL_ENV): Promise<Map<string, IStrategyConfig[]>> {
        const featureStrategiesRaw = await this.featureStrategiesStore.getStrategiesForEnv(environment);
        const featureStrategies = new Map<string,  IStrategyConfig[]>();

        featureStrategiesRaw.forEach(value => {
            if(featureStrategies.has(value.featureName)) {
                featureStrategies.get(value.featureName).push({
                    id: value.id,
                    name: value.strategyName,
                    parameters: value.parameters,
                    constraints: value.constraints || []
                })
            } else {
                featureStrategies.set(value.featureName, [{
                    id: value.id,
                    name: value.strategyName,
                    parameters: value.parameters,
                    constraints: value.constraints || []
                }])
            }
        });

        return featureStrategies;
    }

    // TODO: add event etc.
    async createFeatureToggle(value: IFeatureToggle, userName: string): Promise<IFeatureToggle> {
        this.logger.info(`${userName} creates feature toggle ${value.name}`);
        await this.validateName(value.name);
        const featureData = await featureSchema.validateAsync(value);
        const createdToggle = await this.featureToggleStore.createFeature(featureData);
        await this.environmentStore.connectFeatureToEnvironmentsForProject(value.name, value.project || 'default');
        await this.eventStore.store({
            type: FEATURE_CREATED,
            createdBy: userName,
            data: featureData,
        });

        return createdToggle;
    }

    async updateFeatureToggle(updatedFeature: IFeatureToggle, userName: string): Promise<IFeatureToggle> {
        this.logger.info(`${userName} updates feature toggle ${updatedFeature.name}`);

        await this.featureToggleStore.getFeature(updatedFeature.name);
        const value = await featureSchema.validateAsync(updatedFeature);
        await this.featureToggleStore.updateFeature(value);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(
                updatedFeature.name,
            )) || [];
        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy: userName,
            data: value,
            tags,
        });
        return value;
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
        const feature = await this.featureToggleStore.getFeature(featureName);
        feature.stale = isStale;
        await this.featureToggleStore.updateFeature(feature);
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
        await this.featureToggleStore.getFeature(name);
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


    // @deprecated
    async toggle(featureName: string, userName: string): Promise<any> {
        const feature = await this.featureToggleStore.getFeature(featureName);
        const toggle = !feature.enabled;
        return this.updateField(feature.name, 'enabled', toggle, userName);
    }

    // @deprecated
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateField(featureName: string, field: string, value: any, userName: string): Promise<any> {
        const feature = await this.featureToggleStore.getFeature(featureName);
        feature[field] = value;
        await this.featureToggleStore.updateFeature(feature);
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
