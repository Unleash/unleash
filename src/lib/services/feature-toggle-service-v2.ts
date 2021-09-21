import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import BadDataError from '../error/bad-data-error';
import NameExistsError from '../error/name-exists-error';
import InvalidOperationError from '../error/invalid-operation-error';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import { featureMetadataSchema, nameSchema } from '../schema/feature-schema';
import {
    FEATURE_ARCHIVED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FEATURE_METADATA_UPDATED,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_UPDATED,
} from '../types/events';
import NotFoundError from '../error/notfound-error';
import {
    FeatureConfigurationClient,
    IFeatureStrategiesStore,
} from '../types/stores/feature-strategies-store';
import { IEventStore } from '../types/stores/event-store';
import { IProjectStore } from '../types/stores/project-store';
import { IFeatureTagStore } from '../types/stores/feature-tag-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import {
    FeatureToggle,
    FeatureToggleDTO,
    FeatureToggleWithEnvironment,
    FeatureToggleWithEnvironmentLegacy,
    IFeatureEnvironmentInfo,
    IFeatureOverview,
    IFeatureStrategy,
    IFeatureToggleQuery,
    IStrategyConfig,
} from '../types/model';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IFeatureToggleClientStore } from '../types/stores/feature-toggle-client-store';
import { DEFAULT_ENV } from '../util/constants';

class FeatureToggleServiceV2 {
    private logger: Logger;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureToggleClientStore: IFeatureToggleClientStore;

    private featureTagStore: IFeatureTagStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private projectStore: IProjectStore;

    private eventStore: IEventStore;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            featureToggleClientStore,
            projectStore,
            eventStore,
            featureTagStore,
            featureEnvironmentStore,
        }: Pick<
            IUnleashStores,
            | 'featureStrategiesStore'
            | 'featureToggleStore'
            | 'featureToggleClientStore'
            | 'projectStore'
            | 'eventStore'
            | 'featureTagStore'
            | 'featureEnvironmentStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/feature-toggle-service-v2.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
        this.featureToggleClientStore = featureToggleClientStore;
        this.featureTagStore = featureTagStore;
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
    }

    async createStrategy(
        strategyConfig: Omit<IStrategyConfig, 'id'>,
        projectId: string,
        featureName: string,
        userName: string,
        environment: string = DEFAULT_ENV,
    ): Promise<IStrategyConfig> {
        try {
            const newFeatureStrategy =
                await this.featureStrategiesStore.createStrategyFeatureEnv({
                    strategyName: strategyConfig.name,
                    constraints: strategyConfig.constraints,
                    parameters: strategyConfig.parameters,
                    sortOrder: strategyConfig.sortOrder,
                    projectId,
                    featureName,
                    environment,
                });
            const data = {
                id: newFeatureStrategy.id,
                name: newFeatureStrategy.strategyName,
                constraints: newFeatureStrategy.constraints,
                parameters: newFeatureStrategy.parameters,
            };
            await this.eventStore.store({
                type: FEATURE_STRATEGY_ADD,
                project: projectId,
                createdBy: userName,
                environment,
                data,
            });
            return data;
        } catch (e) {
            if (e.code === FOREIGN_KEY_VIOLATION) {
                throw new BadDataError(
                    'You have not added the current environment to the project',
                );
            }
            throw e;
        }
    }
    /*
    TODO after 4.1.0 release:
    - add FEATURE_STRATEGY_ADD event
    - add FEATURE_STRATEGY_REMOVE event
    - add FEATURE_STRATEGY_UPDATE event
    */

    /**
     * PUT /api/admin/projects/:projectId/features/:featureName/strategies/:strategyId ?
     * {
     *
     * }
     * @param id
     * @param updates
     */

    // TODO: verify projectId is not changed from URL!
    async updateStrategy(
        id: string,
        environment: string,
        project: string,
        userName: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IStrategyConfig> {
        const existingStrategy = await this.featureStrategiesStore.get(id);
        if (existingStrategy.id === id) {
            const strategy = await this.featureStrategiesStore.updateStrategy(
                id,
                updates,
            );
            const data = {
                id: strategy.id,
                name: strategy.strategyName,
                constraints: strategy.constraints || [],
                parameters: strategy.parameters,
            };
            await this.eventStore.store({
                type: FEATURE_STRATEGY_UPDATE,
                project,
                environment,
                createdBy: userName,
                data,
            });
            return data;
        }
        throw new NotFoundError(`Could not find strategy with id ${id}`);
    }

    // TODO: verify projectId is not changed from URL!
    async updateStrategyParameter(
        id: string,
        name: string,
        value: string | number,
        userName: string,
        project: string,
        environment: string,
    ): Promise<IStrategyConfig> {
        const existingStrategy = await this.featureStrategiesStore.get(id);
        if (existingStrategy.id === id) {
            existingStrategy.parameters[name] = value;
            const strategy = await this.featureStrategiesStore.updateStrategy(
                id,
                existingStrategy,
            );
            const data = {
                id: strategy.id,
                name: strategy.strategyName,
                constraints: strategy.constraints || [],
                parameters: strategy.parameters,
            };
            await this.eventStore.store({
                type: FEATURE_STRATEGY_UPDATE,
                project,
                environment,
                createdBy: userName,
                data,
            });
            return data;
        }
        throw new NotFoundError(`Could not find strategy with id ${id}`);
    }

    /**
     * DELETE /api/admin/projects/:projectId/features/:featureName/strategies/:strategyId ?
     * {
     *
     * }
     * @param id
     * @param updates
     */
    async deleteStrategy(
        id: string,
        userName: string,
        project: string = 'default',
        environment: string = DEFAULT_ENV,
    ): Promise<void> {
        await this.featureStrategiesStore.delete(id);
        await this.eventStore.store({
            type: FEATURE_STRATEGY_REMOVE,
            project,
            environment,
            createdBy: userName,
            data: {
                id,
            },
        });
    }

    async getStrategiesForEnvironment(
        project: string,
        featureName: string,
        environment: string = DEFAULT_ENV,
    ): Promise<IStrategyConfig[]> {
        const hasEnv = await this.featureEnvironmentStore.featureHasEnvironment(
            environment,
            featureName,
        );
        if (hasEnv) {
            const featureStrategies =
                await this.featureStrategiesStore.getStrategiesForFeatureEnv(
                    project,
                    featureName,
                    environment,
                );
            return featureStrategies.map((strat) => ({
                id: strat.id,
                name: strat.strategyName,
                constraints: strat.constraints,
                parameters: strat.parameters,
                sortOrder: strat.sortOrder,
            }));
        }
        throw new NotFoundError(
            `Feature ${featureName} does not have environment ${environment}`,
        );
    }

    /**
     * GET /api/admin/projects/:project/features/:featureName
     * @param featureName
     * @param archived - return archived or non archived toggles
     */
    async getFeature(
        featureName: string,
        archived: boolean = false,
    ): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleWithEnvs(
            featureName,
            archived,
        );
    }

    async getFeatureMetadata(featureName: string): Promise<FeatureToggle> {
        return this.featureToggleStore.get(featureName);
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        return this.featureToggleClientStore.getClient(query);
    }

    /**
     *
     * Warn: Legacy!
     *
     *
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
        return this.featureToggleClientStore.getAdmin(query, archived);
    }

    async getFeatureOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IFeatureOverview[]> {
        return this.featureStrategiesStore.getFeatureOverview(
            projectId,
            archived,
        );
    }

    async getFeatureToggle(
        featureName: string,
    ): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleWithEnvs(
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
            const createdToggle = await this.featureToggleStore.create(
                projectId,
                featureData,
            );
            await this.featureEnvironmentStore.connectFeatureToEnvironmentsForProject(
                featureData.name,
                projectId,
            );

            const data = { ...featureData, projectId };

            await this.eventStore.store({
                type: FEATURE_CREATED,
                createdBy: userName,
                project: projectId,
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
        this.logger.info(`${userName} updates feature toggle ${featureName}`);

        const featureData = await featureMetadataSchema.validateAsync(
            updatedFeature,
        );

        const featureToggle = await this.featureToggleStore.update(
            projectId,
            featureData,
        );
        const tags = await this.featureTagStore.getAllTagsForFeature(
            featureName,
        );

        await this.eventStore.store({
            type: FEATURE_METADATA_UPDATED,
            createdBy: userName,
            data: featureToggle,
            project: projectId,
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
        environment: string = DEFAULT_ENV,
    ): Promise<void> {
        await this.featureStrategiesStore.removeAllStrategiesForFeatureEnv(
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
            await this.featureStrategiesStore.getStrategiesForFeatureEnv(
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
            const feature = await this.featureToggleStore.get(name);
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
        const feature = await this.featureToggleStore.get(featureName);
        feature.stale = isStale;
        await this.featureToggleStore.update(feature.project, feature);
        const tags = await this.featureTagStore.getAllTagsForFeature(
            featureName,
        );
        const data = await this.getFeatureToggleLegacy(featureName);

        await this.eventStore.store({
            type: isStale ? FEATURE_STALE_ON : FEATURE_STALE_OFF,
            createdBy: userName,
            data,
            tags,
            project: feature.project,
        });
        return feature;
    }

    async archiveToggle(name: string, userName: string): Promise<void> {
        const feature = await this.featureToggleStore.get(name);
        await this.featureToggleStore.archive(name);
        const tags =
            (await this.featureTagStore.getAllTagsForFeature(name)) || [];
        await this.eventStore.store({
            type: FEATURE_ARCHIVED,
            createdBy: userName,
            data: { name },
            project: feature.project,
            tags,
        });
    }

    async updateEnabled(
        projectId: string,
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
            if (enabled) {
                const strategies = await this.getStrategiesForEnvironment(
                    projectId,
                    featureName,
                    environment,
                );
                if (strategies.length === 0) {
                    throw new InvalidOperationError(
                        'You can not enable the environment before it has strategies',
                    );
                }
            }
            await this.featureEnvironmentStore.setEnvironmentEnabledStatus(
                environment,
                featureName,
                enabled,
            );
            const feature = await this.featureToggleStore.get(featureName);
            const tags = await this.featureTagStore.getAllTagsForFeature(
                featureName,
            );
            const data = await this.getFeatureToggleLegacy(featureName);

            await this.eventStore.store({
                type: FEATURE_UPDATED,
                createdBy: userName,
                data,
                tags,
                project: projectId,
                environment,
            });
            return feature;
        }
        throw new NotFoundError(
            `Could not find environment ${environment} for feature: ${featureName}`,
        );
    }

    // @deprecated
    async toggle(
        projectId: string,
        featureName: string,
        environment: string,
        userName: string,
    ): Promise<FeatureToggle> {
        await this.featureToggleStore.get(featureName);
        const isEnabled =
            await this.featureEnvironmentStore.isEnvironmentEnabled(
                featureName,
                environment,
            );
        return this.updateEnabled(
            projectId,
            featureName,
            environment,
            !isEnabled,
            userName,
        );
    }

    async getFeatureToggleLegacy(
        featureName: string,
    ): Promise<FeatureToggleWithEnvironmentLegacy> {
        const feature =
            await this.featureStrategiesStore.getFeatureToggleWithEnvs(
                featureName,
            );
        const defaultEnv = feature.environments.find(
            (e) => e.name === DEFAULT_ENV,
        );
        const strategies = defaultEnv?.strategies || [];
        const enabled = defaultEnv?.enabled || false;

        return { ...feature, enabled, strategies };
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
        const feature = await this.featureToggleStore.get(featureName);
        feature[field] = value;
        await this.featureToggleStore.update(feature.project, feature);
        const tags = await this.featureTagStore.getAllTagsForFeature(
            featureName,
        );

        // Workaround to support pre 4.1 format
        const data = await this.getFeatureToggleLegacy(featureName);

        await this.eventStore.store({
            type: event || FEATURE_UPDATED,
            createdBy: userName,
            data,
            project: data.project,
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
        const data = await this.featureToggleStore.revive(featureName);
        const tags = await this.featureTagStore.getAllTagsForFeature(
            featureName,
        );
        await this.eventStore.store({
            type: FEATURE_REVIVED,
            createdBy: userName,
            data,
            project: data.project,
            tags,
        });
    }

    async getMetadataForAllFeatures(
        archived: boolean,
    ): Promise<FeatureToggle[]> {
        return this.featureToggleStore.getAll({ archived });
    }

    async getProjectId(name: string): Promise<string> {
        return this.featureToggleStore.getProjectId(name);
    }
}

module.exports = FeatureToggleServiceV2;
export default FeatureToggleServiceV2;
