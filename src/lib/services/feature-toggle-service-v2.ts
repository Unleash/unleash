/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import FeatureStrategiesStore, { FeatureConfigurationClient, IFeatureStrategy } from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import { IFeatureToggle, IProjectOverview, IStrategyConfig } from '../types/model';
import ProjectStore from '../db/project-store';
import BadDataError from '../error/bad-data-error';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import NameExistsError from '../error/name-exists-error';
import { featureSchema, nameSchema } from '../schema/feature-schema';
import EventStore from '../db/event-store';
import { FEATURE_CREATED, FEATURE_UPDATED } from '../types/events';

// TODO: move to types
const GLOBAL_ENV = ':global:';

class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: FeatureStrategiesStore;

    private featureToggleStore: FeatureToggleStore;

    private projectStore: ProjectStore;

    private eventStore: EventStore;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            projectStore,
            eventStore,
        }: Pick<IUnleashStores, 'featureStrategiesStore' | 'featureToggleStore' | 'projectStore' | 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>
    ) {
        this.logger = getLogger('services/feature-toggle-service-v2.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
        this.projectStore = projectStore;
        this.eventStore = eventStore;
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

    async getStrategiesForEnvironment(projectName: string, featureName: string, environment: string): Promise<IStrategyConfig[]> {
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
    async getFeature(featureName: string): Promise<any> {
        return Promise.resolve();
        //        return this.featureStrategiesStore.getFeatureToggleAdmin(featureName);
    }

    async getClientFeatures(): Promise<FeatureConfigurationClient[]> {
        return this.featureStrategiesStore.getFeatureTogglesClient();
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
        await this.validateName(value);
        const featureData = await featureSchema.validateAsync(value);
        const createdToggle = this.featureToggleStore.createFeature(featureData);
        
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
            (await this.featureToggleStore.getAllTagsForFeature(
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
    async validateName({ name }: IFeatureToggle): Promise<string> {
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

}



module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;
