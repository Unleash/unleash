/* eslint-disable prettier/prettier */
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import BadDataError from '../error/bad-data-error';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import NameExistsError from '../error/name-exists-error';
import { featureMetadataSchema, nameSchema } from '../schema/feature-schema';
import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_UPDATED,
    FEATURE_METADATA_UPDATED,
} from '../types/events';
import { GLOBAL_ENV } from '../types/environment';
import NotFoundError from '../error/notfound-error';
import {
    FeatureConfigurationClient,
    IFeatureStrategiesStore,
} from '../types/stores/feature-strategies-store';
import { IFeatureTypeStore } from '../types/stores/feature-type-store';
import { IEventStore } from '../types/stores/event-store';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IProjectStore } from '../types/stores/project-store';
import { IFeatureTagStore } from '../types/stores/feature-tag-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import {
    FeatureToggle,
    FeatureToggleDTO,
    FeatureToggleWithEnvironment,
    FeatureToggleWithEnvironmentLegacy,
    IFeatureEnvironmentInfo,
    IFeatureStrategy,
    IFeatureToggleQuery,
    IStrategyConfig,
} from '../types/model';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';

class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTagStore: IFeatureTagStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private projectStore: IProjectStore;

    private environmentStore: IEnvironmentStore;

    private eventStore: IEventStore;

    private featureTypeStore: IFeatureTypeStore;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            projectStore,
            eventStore,
            featureTagStore,
            environmentStore,
            featureTypeStore,
            featureEnvironmentStore,
        }: Pick<
            IUnleashStores,
            | 'featureStrategiesStore'
            | 'featureToggleStore'
            | 'projectStore'
            | 'eventStore'
            | 'featureTagStore'
            | 'environmentStore'
            | 'featureTypeStore'
            | 'featureEnvironmentStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/feature-toggle-service-v2.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTagStore = featureTagStore;
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.environmentStore = environmentStore;
        this.featureTypeStore = featureTypeStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
    }

    /*
    TODO after 4.1.0 release:
    - add FEATURE_STRATEGY_ADD event
    - add FEATURE_STRATEGY_REMOVE event
    - add FEATURE_STRATEGY_UPDATE event
    */
    async createStrategy(
        strategyConfig: Omit<IStrategyConfig, 'id'>,
        projectName: string,
        featureName: string,
        environment: string = GLOBAL_ENV,
    ): Promise<IStrategyConfig> {
        try {
            const newFeatureStrategy =
                await this.featureStrategiesStore.createStrategyConfig({
                    strategyName: strategyConfig.name,
                    constraints: strategyConfig.constraints,
                    parameters: strategyConfig.parameters,
                    projectName,
                    featureName,
                    environment,
                });
            return {
                id: newFeatureStrategy.id,
                name: newFeatureStrategy.strategyName,
                constraints: newFeatureStrategy.constraints,
                parameters: newFeatureStrategy.parameters,
            };
        } catch (e) {
            if (e.code === FOREIGN_KEY_VIOLATION) {
                throw new BadDataError(
                    'You have not added the current environment to the project',
                );
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
    async updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IFeatureStrategy> {
        const exists = await this.featureStrategiesStore.exists(id);
        if (exists) {
            return this.featureStrategiesStore.updateStrategy(id, updates);
        }
        throw new NotFoundError(`Could not find strategy with id ${id}`);
    }

    async getStrategiesForEnvironment(
        projectName: string,
        featureName: string,
        environment: string = GLOBAL_ENV,
    ): Promise<IStrategyConfig[]> {
        const hasEnv = await this.featureEnvironmentStore.featureHasEnvironment(
            environment,
            featureName,
        );
        if (hasEnv) {
            const featureStrategies =
                await this.featureStrategiesStore.getStrategiesForFeature(
                    projectName,
                    featureName,
                    environment,
                );
            return featureStrategies.map((strat) => ({
                id: strat.id,
                name: strat.strategyName,
                constraints: strat.constraints,
                parameters: strat.parameters,
            }));
        }
        throw new NotFoundError(
            `Feature ${featureName} does not have environment ${environment}`,
        );
    }

    /**
     * GET /api/admin/projects/:projectName/features/:featureName
     * @param featureName
     * @param archived - return archived or non archived toggles
     */
    async getFeature(
        featureName: string,
        archived: boolean = false,
    ): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleAdmin(
            featureName,
            archived,
        );
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<FeatureConfigurationClient[]> {
        return this.featureStrategiesStore.getFeatures(query, archived, false);
    }

    /**
     * Used to retrieve metadata of all feature toggles defined in Unleash.
     * @param query - Allow you to limit search based on criteria such as project, tags, namePrefix. See @IFeatureToggleQuery
     * @param archived - Return archived or active toggles
     * @param includeStrategyId - Include id for strategies
     * @returns
     */
    async getFeatureToggles(
        query?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<FeatureToggle[]> {
        return this.featureStrategiesStore.getFeatures(query, archived, true);
    }

    async getFeatureToggle(
        featureName: string,
    ): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleAdmin(
            featureName,
            false,
        );
    }

    async createFeatureToggle(
        projectId: string,
        value: FeatureToggleDTO,
        userName: string,
    ): Promise<FeatureToggle> {
        this.logger.info(`${userName} creates feature toggle ${value.name}`);
        await this.validateName(value.name);
        const exists = await this.projectStore.hasProject(projectId);
        if (exists) {
            const featureData = await featureMetadataSchema.validateAsync(
                value,
            );
            const createdToggle = await this.featureToggleStore.createFeature(
                projectId,
                featureData,
            );
            await this.environmentStore.connectFeatureToEnvironmentsForProject(
                featureData.name,
                projectId,
            );

            const data = { ...featureData, projectId };

            await this.eventStore.store({
                type: FEATURE_CREATED,
                createdBy: userName,
                data,
            });

            return createdToggle;
        }
        throw new NotFoundError(`Project with id ${projectId} does not exist`);
    }

    async updateFeatureToggle(
        projectId: string,
        updatedFeature: FeatureToggleDTO,
        userName: string,
    ): Promise<FeatureToggle> {
        const featureName = updatedFeature.name;
        this.logger.info(
            `${userName} updates feature toggle ${featureName}`,
        );

        const featureToggle = await this.featureToggleStore.updateFeature(
            projectId,
            updatedFeature,
        );
        const tags = await this.featureTagStore.getAllTagsForFeature(featureName);

        await this.eventStore.store({
            type: FEATURE_METADATA_UPDATED,
            createdBy: userName,
            data: featureToggle,
            tags,
        });
        return featureToggle;
    }

    async getFeatureCountForProject(projectId: string): Promise<number> {
        return this.featureToggleStore.count({
            archived: false,
            project: projectId,
        });
    }

    async removeAllStrategiesForEnv(
        toggleName: string,
        environment: string = GLOBAL_ENV,
    ): Promise<void> {
        await this.featureStrategiesStore.removeAllStrategiesForEnv(
            toggleName,
            environment,
        );
    }

    async getStrategy(strategyId: string): Promise<IStrategyConfig> {
        const strategy = await this.featureStrategiesStore.getStrategyById(
            strategyId,
        );
        return {
            id: strategy.id,
            name: strategy.strategyName,
            constraints: strategy.constraints || [],
            parameters: strategy.parameters,
        };
    }

    async getEnvironmentInfo(
        project: string,
        environment: string,
        featureName: string,
    ): Promise<IFeatureEnvironmentInfo> {
        const envMetadata =
            await this.featureEnvironmentStore.getEnvironmentMetaData(
                environment,
                featureName,
            );
        const strategies =
            await this.featureStrategiesStore.getStrategiesForFeature(
                project,
                featureName,
                environment,
            );
        return {
            name: featureName,
            environment,
            enabled: envMetadata.enabled,
            strategies,
        };
    }

    async deleteEnvironment(
        projectId: string,
        environment: string,
    ): Promise<void> {
        await this.featureStrategiesStore.deleteConfigurationsForProjectAndEnvironment(
            projectId,
            environment,
        );
        await this.projectStore.deleteEnvironmentForProject(
            projectId,
            environment,
        );
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

    async hasFeature(name: string): Promise<boolean> {
        return this.featureToggleStore.exists(name);
    }

    async updateStale(
        featureName: string,
        isStale: boolean,
        userName: string,
    ): Promise<any> {
        const feature = await this.featureToggleStore.getFeatureMetadata(
            featureName,
        );
        feature.stale = isStale;
        await this.featureToggleStore.updateFeature(feature.project, feature);
        const tags = await this.featureTagStore.getAllTagsForFeature(featureName);
        const data = await this.getFeatureToggleLegacy(featureName);

        await this.eventStore.store({
            type: isStale ? FEATURE_STALE_ON : FEATURE_STALE_OFF,
            createdBy: userName,
            data,
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

    async updateEnabled(
        featureName: string,
        environment: string,
        enabled: boolean,
        userName: string,
    ): Promise<FeatureToggle> {
        const hasEnvironment =
            await this.featureEnvironmentStore.featureHasEnvironment(
                environment,
                featureName,
            );
        if (hasEnvironment) {
            await this.featureEnvironmentStore.toggleEnvironmentEnabledStatus(
                    environment,
                    featureName,
                    enabled,
                );
            const feature = await this.featureToggleStore.getFeatureMetadata(
                featureName,
            );
            const tags = await this.featureTagStore.getAllTagsForFeature(featureName);
            const data = await this.getFeatureToggleLegacy(featureName);

            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data,
                tags,
            });
            return feature;
        }
        throw new NotFoundError(
            `Could not find environment ${environment} for feature: ${featureName}`,
        );
    }

    // @deprecated
    async toggle(
        featureName: string,
        environment: string,
        userName: string,
    ): Promise<FeatureToggle> {
        await this.featureToggleStore.hasFeature(featureName);
        const isEnabled =
            await this.featureEnvironmentStore.isEnvironmentEnabled(
                featureName,
                environment,
            );
        return this.updateEnabled(
            featureName,
            environment,
            !isEnabled,
            userName,
        );
    }

    async getFeatureToggleLegacy(featureName: string): Promise<FeatureToggleWithEnvironmentLegacy> {
        const feature = await this.featureStrategiesStore.getFeatureToggleAdmin(featureName);
        const globalEnv = feature.environments.find(e => e.name === GLOBAL_ENV);
        const strategies = globalEnv?.strategies || [];
        const enabled = globalEnv?.enabled || false;

        return {...feature, enabled, strategies };
    }

    // @deprecated
    async updateField(
        featureName: string,
        field: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        value: any,
        userName: string,
        event?: string,
    ): Promise<any> {
        const feature = await this.featureToggleStore.getFeatureMetadata(
            featureName,
        );
        feature[field] = value;
        await this.featureToggleStore.updateFeature(feature.project, feature);
        const tags = await this.featureTagStore.getAllTagsForFeature(featureName);

        
        // Workaround to support pre 4.1 format
        const data = await this.getFeatureToggleLegacy(featureName);

        await this.eventStore.store({
            type: event || FEATURE_UPDATED,
            createdBy: userName,
            data,
            tags,
        });
        return feature;
    }

    async getArchivedFeatures(): Promise<FeatureToggle[]> {
        return this.getFeatureToggles({}, true);
    }

    async deleteFeature(featureName: string, userName: string): Promise<void> {
        await this.featureToggleStore.delete(featureName);
        await this.eventStore.store({
            type: FEATURE_DELETED,
            createdBy: userName,
            data: {
                featureName,
            },
        });
    }

    async reviveToggle(featureName: string, userName: string): Promise<void> {
        const data = await this.featureToggleStore.reviveFeature(featureName);
        const tags = await this.featureTagStore.getAllTagsForFeature(
            featureName,
        );
        await this.eventStore.store({
            type: FEATURE_REVIVED,
            createdBy: userName,
            data,
            tags,
        });
    }

    async getMetadataForAllFeatures(
        archived: boolean,
    ): Promise<FeatureToggle[]> {
        return this.featureToggleStore.getFeatures(archived);
    }

    async getProjectId(name: string): Promise<string> {
        const { project } = await this.featureToggleStore.getFeatureMetadata(
            name,
        );
        return project;
    }
}

module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;
