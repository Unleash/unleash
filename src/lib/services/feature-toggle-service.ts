import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types';
import { Logger } from '../logger';
import BadDataError from '../error/bad-data-error';
import NameExistsError from '../error/name-exists-error';
import InvalidOperationError from '../error/invalid-operation-error';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import {
    constraintSchema,
    featureMetadataSchema,
    nameSchema,
    variantsArraySchema,
} from '../schema/feature-schema';
import {
    FEATURE_UPDATED,
    FeatureArchivedEvent,
    FeatureChangeProjectEvent,
    FeatureCreatedEvent,
    FeatureDeletedEvent,
    FeatureEnvironmentEvent,
    FeatureMetadataUpdateEvent,
    FeatureRevivedEvent,
    FeatureStaleEvent,
    FeatureStrategyAddEvent,
    FeatureStrategyRemoveEvent,
    FeatureStrategyUpdateEvent,
    FeatureVariantEvent,
    EnvironmentVariantEvent,
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
    FeatureToggleLegacy,
    FeatureToggleWithEnvironment,
    IConstraint,
    IFeatureEnvironmentInfo,
    IFeatureOverview,
    IFeatureStrategy,
    IFeatureToggleQuery,
    ISegment,
    IStrategyConfig,
    IVariant,
    WeightType,
} from '../types/model';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IFeatureToggleClientStore } from '../types/stores/feature-toggle-client-store';
import {
    DATE_OPERATORS,
    DEFAULT_ENV,
    NUM_OPERATORS,
    SEMVER_OPERATORS,
    STRING_OPERATORS,
} from '../util/constants';
import { applyPatch, deepClone, Operation } from 'fast-json-patch';
import { OperationDeniedError } from '../error/operation-denied-error';
import {
    validateDate,
    validateLegalValues,
    validateNumber,
    validateSemver,
    validateString,
} from '../util/validators/constraint-types';
import { IContextFieldStore } from 'lib/types/stores/context-field-store';
import { Saved, Unsaved } from '../types/saved';
import { SegmentService } from './segment-service';
import { SetStrategySortOrderSchema } from 'lib/openapi/spec/set-strategy-sort-order-schema';
import { getDefaultStrategy } from '../util/feature-evaluator/helpers';
import { AccessService } from './access-service';
import { User } from '../server-impl';
import {
    CREATE_FEATURE_STRATEGY,
    SKIP_CHANGE_REQUEST,
} from '../types/permissions';
import NoAccessError from '../error/no-access-error';
import { IFeatureProjectUserParams } from '../routes/admin-api/project/features';

interface IFeatureContext {
    featureName: string;
    projectId: string;
}

interface IFeatureStrategyContext extends IFeatureContext {
    environment: string;
}

export interface IGetFeatureParams {
    featureName: string;
    archived?: boolean;
    projectId?: string;
    environmentVariants?: boolean;
    userId?: number;
}

const oneOf = (values: string[], match: string) => {
    return values.some((value) => value === match);
};

class FeatureToggleService {
    private logger: Logger;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureToggleClientStore: IFeatureToggleClientStore;

    private tagStore: IFeatureTagStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private projectStore: IProjectStore;

    private eventStore: IEventStore;

    private contextFieldStore: IContextFieldStore;

    private segmentService: SegmentService;

    private accessService: AccessService;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            featureToggleClientStore,
            projectStore,
            eventStore,
            featureTagStore,
            featureEnvironmentStore,
            contextFieldStore,
        }: Pick<
            IUnleashStores,
            | 'featureStrategiesStore'
            | 'featureToggleStore'
            | 'featureToggleClientStore'
            | 'projectStore'
            | 'eventStore'
            | 'featureTagStore'
            | 'featureEnvironmentStore'
            | 'contextFieldStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        segmentService: SegmentService,
        accessService: AccessService,
    ) {
        this.logger = getLogger('services/feature-toggle-service.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureToggleStore = featureToggleStore;
        this.featureToggleClientStore = featureToggleClientStore;
        this.tagStore = featureTagStore;
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.contextFieldStore = contextFieldStore;
        this.segmentService = segmentService;
        this.accessService = accessService;
    }

    async validateFeatureContext({
        featureName,
        projectId,
    }: IFeatureContext): Promise<void> {
        const id = await this.featureToggleStore.getProjectId(featureName);

        if (id !== projectId) {
            throw new InvalidOperationError(
                `The operation could not be completed. The feature exists, but the provided project id ("${projectId}") does not match the project that the feature belongs to ("${id}"). Try using "${id}" in the request URL instead of "${projectId}".`,
            );
        }
    }

    validateFeatureStrategyContext(
        strategy: IFeatureStrategy,
        { featureName, projectId }: IFeatureStrategyContext,
    ): void {
        if (strategy.projectId !== projectId) {
            throw new InvalidOperationError(
                'You can not change the projectId for an activation strategy.',
            );
        }

        if (strategy.featureName !== featureName) {
            throw new InvalidOperationError(
                'You can not change the featureName for an activation strategy.',
            );
        }
    }

    async validateConstraints(
        constraints: IConstraint[],
    ): Promise<IConstraint[]> {
        const validations = constraints.map((constraint) => {
            return this.validateConstraint(constraint);
        });

        return Promise.all(validations);
    }

    async validateConstraint(input: IConstraint): Promise<IConstraint> {
        const constraint = await constraintSchema.validateAsync(input);
        const { operator } = constraint;
        const contextDefinition = await this.contextFieldStore.get(
            constraint.contextName,
        );

        if (oneOf(NUM_OPERATORS, operator)) {
            await validateNumber(constraint.value);
        }

        if (oneOf(STRING_OPERATORS, operator)) {
            await validateString(constraint.values);
        }

        if (oneOf(SEMVER_OPERATORS, operator)) {
            // Semver library is not asynchronous, so we do not
            // need to await here.
            validateSemver(constraint.value);
        }

        if (oneOf(DATE_OPERATORS, operator)) {
            await validateDate(constraint.value);
        }

        if (
            oneOf(
                [...DATE_OPERATORS, ...SEMVER_OPERATORS, ...NUM_OPERATORS],
                operator,
            )
        ) {
            if (contextDefinition?.legalValues?.length > 0) {
                validateLegalValues(
                    contextDefinition.legalValues,
                    constraint.value,
                );
            }
        } else {
            if (contextDefinition?.legalValues?.length > 0) {
                validateLegalValues(
                    contextDefinition.legalValues,
                    constraint.values,
                );
            }
        }

        return constraint;
    }

    async patchFeature(
        project: string,
        featureName: string,
        createdBy: string,
        operations: Operation[],
    ): Promise<FeatureToggle> {
        const featureToggle = await this.getFeatureMetadata(featureName);

        if (operations.some((op) => op.path.indexOf('/variants') >= 0)) {
            throw new OperationDeniedError(
                `Changing variants is done via PATCH operation to /api/admin/projects/:project/features/:feature/variants`,
            );
        }
        const { newDocument } = applyPatch(
            deepClone(featureToggle),
            operations,
        );

        const updated = await this.updateFeatureToggle(
            project,
            newDocument,
            createdBy,
            featureName,
        );

        if (featureToggle.stale !== newDocument.stale) {
            const tags = await this.tagStore.getAllTagsForFeature(featureName);

            await this.eventStore.store(
                new FeatureStaleEvent({
                    stale: newDocument.stale,
                    project,
                    featureName,
                    createdBy,
                    tags,
                }),
            );
        }

        return updated;
    }

    featureStrategyToPublic(
        featureStrategy: IFeatureStrategy,
        segments: ISegment[] = [],
    ): Saved<IStrategyConfig> {
        return {
            id: featureStrategy.id,
            name: featureStrategy.strategyName,
            constraints: featureStrategy.constraints || [],
            parameters: featureStrategy.parameters,
            segments: segments.map((segment) => segment.id) ?? [],
        };
    }

    async updateStrategiesSortOrder(
        featureName: string,
        sortOrders: SetStrategySortOrderSchema,
    ): Promise<Saved<any>> {
        await Promise.all(
            sortOrders.map(async ({ id, sortOrder }) =>
                this.featureStrategiesStore.updateSortOrder(id, sortOrder),
            ),
        );
    }

    async createStrategy(
        strategyConfig: Unsaved<IStrategyConfig>,
        context: IFeatureStrategyContext,
        createdBy: string,
        user?: User,
    ): Promise<Saved<IStrategyConfig>> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );
        return this.unprotectedCreateStrategy(
            strategyConfig,
            context,
            createdBy,
        );
    }

    async unprotectedCreateStrategy(
        strategyConfig: Unsaved<IStrategyConfig>,
        context: IFeatureStrategyContext,
        createdBy: string,
    ): Promise<Saved<IStrategyConfig>> {
        const { featureName, projectId, environment } = context;
        await this.validateFeatureContext(context);

        if (strategyConfig.constraints?.length > 0) {
            strategyConfig.constraints = await this.validateConstraints(
                strategyConfig.constraints,
            );
        }

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

            if (
                strategyConfig.segments &&
                Array.isArray(strategyConfig.segments)
            ) {
                await this.segmentService.updateStrategySegments(
                    newFeatureStrategy.id,
                    strategyConfig.segments,
                );
            }

            const tags = await this.tagStore.getAllTagsForFeature(featureName);
            const segments = await this.segmentService.getByStrategy(
                newFeatureStrategy.id,
            );
            const strategy = this.featureStrategyToPublic(
                newFeatureStrategy,
                segments,
            );
            await this.eventStore.store(
                new FeatureStrategyAddEvent({
                    project: projectId,
                    featureName,
                    createdBy,
                    environment,
                    data: strategy,
                    tags,
                }),
            );
            return strategy;
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
     * PUT /api/admin/projects/:projectId/features/:featureName/strategies/:strategyId ?
     * {
     *
     * }
     * @param id
     * @param updates
     * @param context - Which context does this strategy live in (projectId, featureName, environment)
     * @param userName - Human readable id of the user performing the update
     */
    async updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
        context: IFeatureStrategyContext,
        userName: string,
        user?: User,
    ): Promise<Saved<IStrategyConfig>> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );
        return this.unprotectedUpdateStrategy(id, updates, context, userName);
    }

    async unprotectedUpdateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
        context: IFeatureStrategyContext,
        userName: string,
    ): Promise<Saved<IStrategyConfig>> {
        const { projectId, environment, featureName } = context;
        const existingStrategy = await this.featureStrategiesStore.get(id);
        this.validateFeatureStrategyContext(existingStrategy, context);

        if (existingStrategy.id === id) {
            if (updates.constraints?.length > 0) {
                updates.constraints = await this.validateConstraints(
                    updates.constraints,
                );
            }

            const strategy = await this.featureStrategiesStore.updateStrategy(
                id,
                updates,
            );

            if (updates.segments && Array.isArray(updates.segments)) {
                await this.segmentService.updateStrategySegments(
                    strategy.id,
                    updates.segments,
                );
            }

            const segments = await this.segmentService.getByStrategy(
                strategy.id,
            );

            // Store event!
            const tags = await this.tagStore.getAllTagsForFeature(featureName);
            const data = this.featureStrategyToPublic(strategy, segments);
            const preData = this.featureStrategyToPublic(
                existingStrategy,
                segments,
            );
            await this.eventStore.store(
                new FeatureStrategyUpdateEvent({
                    project: projectId,
                    featureName,
                    environment,
                    createdBy: userName,
                    data,
                    preData,
                    tags,
                }),
            );
            return data;
        }
        throw new NotFoundError(`Could not find strategy with id ${id}`);
    }

    async updateStrategyParameter(
        id: string,
        name: string,
        value: string | number,
        context: IFeatureStrategyContext,
        userName: string,
    ): Promise<Saved<IStrategyConfig>> {
        const { projectId, environment, featureName } = context;

        const existingStrategy = await this.featureStrategiesStore.get(id);
        this.validateFeatureStrategyContext(existingStrategy, context);

        if (existingStrategy.id === id) {
            existingStrategy.parameters[name] = String(value);
            const strategy = await this.featureStrategiesStore.updateStrategy(
                id,
                existingStrategy,
            );
            const tags = await this.tagStore.getAllTagsForFeature(featureName);
            const segments = await this.segmentService.getByStrategy(
                strategy.id,
            );
            const data = this.featureStrategyToPublic(strategy, segments);
            const preData = this.featureStrategyToPublic(
                existingStrategy,
                segments,
            );
            await this.eventStore.store(
                new FeatureStrategyUpdateEvent({
                    featureName,
                    project: projectId,
                    environment,
                    createdBy: userName,
                    data,
                    preData,
                    tags,
                }),
            );
            return data;
        }
        throw new NotFoundError(`Could not find strategy with id ${id}`);
    }

    /**
     * DELETE /api/admin/projects/:projectId/features/:featureName/environments/:environmentName/strategies/:strategyId
     * {
     *
     * }
     * @param id - strategy id
     * @param context - Which context does this strategy live in (projectId, featureName, environment)
     * @param createdBy - Which user does this strategy belong to
     */
    async deleteStrategy(
        id: string,
        context: IFeatureStrategyContext,
        createdBy: string,
        user?: User,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );
        return this.unprotectedDeleteStrategy(id, context, createdBy);
    }

    async unprotectedDeleteStrategy(
        id: string,
        context: IFeatureStrategyContext,
        createdBy: string,
    ): Promise<void> {
        const existingStrategy = await this.featureStrategiesStore.get(id);
        const { featureName, projectId, environment } = context;
        this.validateFeatureStrategyContext(existingStrategy, context);

        await this.featureStrategiesStore.delete(id);

        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        const preData = this.featureStrategyToPublic(existingStrategy);

        await this.eventStore.store(
            new FeatureStrategyRemoveEvent({
                featureName,
                project: projectId,
                environment,
                createdBy,
                preData,
                tags,
            }),
        );

        // If there are no strategies left for environment disable it
        await this.featureEnvironmentStore.disableEnvironmentIfNoStrategies(
            featureName,
            environment,
        );
    }

    async getStrategiesForEnvironment(
        project: string,
        featureName: string,
        environment: string = DEFAULT_ENV,
    ): Promise<Saved<IStrategyConfig>[]> {
        this.logger.debug('getStrategiesForEnvironment');
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
            const result = [];
            for (const strat of featureStrategies) {
                const segments =
                    (await this.segmentService.getByStrategy(strat.id)).map(
                        (segment) => segment.id,
                    ) ?? [];
                result.push({
                    id: strat.id,
                    name: strat.strategyName,
                    constraints: strat.constraints,
                    parameters: strat.parameters,
                    sortOrder: strat.sortOrder,
                    segments,
                });
            }
            return result;
        }
        throw new NotFoundError(
            `Feature ${featureName} does not have environment ${environment}`,
        );
    }

    /**
     * GET /api/admin/projects/:project/features/:featureName
     * @param featureName
     * @param archived - return archived or non archived toggles
     * @param projectId - provide if you're requesting the feature in the context of a specific project.
     */
    async getFeature({
        featureName,
        archived,
        projectId,
        environmentVariants,
        userId,
    }: IGetFeatureParams): Promise<FeatureToggleWithEnvironment> {
        if (projectId) {
            await this.validateFeatureContext({ featureName, projectId });
        }

        if (environmentVariants) {
            return this.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
                featureName,
                userId,
                archived,
            );
        } else {
            return this.featureStrategiesStore.getFeatureToggleWithEnvs(
                featureName,
                userId,
                archived,
            );
        }
    }

    /**
     * GET /api/admin/projects/:project/features/:featureName/variants
     * @deprecated - Variants should be fetched from FeatureEnvironmentStore (since variants are now; since 4.18, connected to environments)
     * @param featureName
     * @return The list of variants
     */
    async getVariants(featureName: string): Promise<IVariant[]> {
        return this.featureToggleStore.getVariants(featureName);
    }

    async getVariantsForEnv(
        featureName: string,
        environment: string,
    ): Promise<IVariant[]> {
        const featureEnvironment = await this.featureEnvironmentStore.get({
            featureName,
            environment,
        });
        return featureEnvironment.variants || [];
    }

    async getFeatureMetadata(featureName: string): Promise<FeatureToggle> {
        return this.featureToggleStore.get(featureName);
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
        includeIds?: boolean,
    ): Promise<FeatureConfigurationClient[]> {
        return this.featureToggleClientStore.getClient(query, includeIds);
    }

    /**
     * @deprecated Legacy!
     *
     * Used to retrieve metadata of all feature toggles defined in Unleash.
     * @param query - Allow you to limit search based on criteria such as project, tags, namePrefix. See @IFeatureToggleQuery
     * @param archived - Return archived or active toggles
     * @returns
     */
    async getFeatureToggles(
        query?: IFeatureToggleQuery,
        userId?: number,
        archived: boolean = false,
    ): Promise<FeatureToggle[]> {
        return this.featureToggleClientStore.getAdmin({
            featureQuery: query,
            userId,
            archived,
        });
    }

    async getFeatureOverview(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureOverview[]> {
        return this.featureStrategiesStore.getFeatureOverview(params);
    }

    async getFeatureToggle(
        featureName: string,
    ): Promise<FeatureToggleWithEnvironment> {
        return this.featureStrategiesStore.getFeatureToggleWithEnvs(
            featureName,
        );
    }

    async createFeatureToggle(
        projectId: string,
        value: FeatureToggleDTO,
        createdBy: string,
        isValidated: boolean = false,
    ): Promise<FeatureToggle> {
        this.logger.info(`${createdBy} creates feature toggle ${value.name}`);
        await this.validateName(value.name);
        const exists = await this.projectStore.hasProject(projectId);
        if (exists) {
            let featureData;
            if (isValidated) {
                featureData = value;
            } else {
                featureData = await featureMetadataSchema.validateAsync(value);
            }
            const featureName = featureData.name;
            const createdToggle = await this.featureToggleStore.create(
                projectId,
                featureData,
            );
            await this.featureEnvironmentStore.connectFeatureToEnvironmentsForProject(
                featureName,
                projectId,
            );

            if (value.variants && value.variants.length > 0) {
                const environments =
                    await this.featureEnvironmentStore.getEnvironmentsForFeature(
                        featureName,
                    );

                await this.featureEnvironmentStore.setVariantsToFeatureEnvironments(
                    featureName,
                    environments.map((env) => env.environment),
                    value.variants,
                );
            }

            const tags = await this.tagStore.getAllTagsForFeature(featureName);

            await this.eventStore.store(
                new FeatureCreatedEvent({
                    featureName,
                    createdBy,
                    project: projectId,
                    data: createdToggle,
                    tags,
                }),
            );

            return createdToggle;
        }
        throw new NotFoundError(`Project with id ${projectId} does not exist`);
    }

    async cloneFeatureToggle(
        featureName: string,
        projectId: string,
        newFeatureName: string,
        replaceGroupId: boolean = true, // eslint-disable-line
        userName: string,
    ): Promise<FeatureToggle> {
        this.logger.info(
            `${userName} clones feature toggle ${featureName} to ${newFeatureName}`,
        );
        await this.validateName(newFeatureName);

        const cToggle =
            await this.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
                featureName,
            );

        const newToggle = {
            ...cToggle,
            name: newFeatureName,
            variants: undefined,
        };
        const created = await this.createFeatureToggle(
            projectId,
            newToggle,
            userName,
        );

        const variantTasks = newToggle.environments.map((e) => {
            return this.featureEnvironmentStore.addVariantsToFeatureEnvironment(
                newToggle.name,
                e.name,
                e.variants,
            );
        });

        const strategyTasks = newToggle.environments.flatMap((e) =>
            e.strategies.map((s) => {
                if (replaceGroupId && s.parameters.hasOwnProperty('groupId')) {
                    s.parameters.groupId = newFeatureName;
                }
                const context = {
                    projectId,
                    featureName: newFeatureName,
                    environment: e.name,
                };
                return this.createStrategy(s, context, userName);
            }),
        );

        await Promise.all([...strategyTasks, ...variantTasks]);
        return created;
    }

    async updateFeatureToggle(
        projectId: string,
        updatedFeature: FeatureToggleDTO,
        userName: string,
        featureName: string,
    ): Promise<FeatureToggle> {
        await this.validateFeatureContext({ featureName, projectId });

        this.logger.info(`${userName} updates feature toggle ${featureName}`);

        const featureData = await featureMetadataSchema.validateAsync(
            updatedFeature,
        );

        const preData = await this.featureToggleStore.get(featureName);

        const featureToggle = await this.featureToggleStore.update(projectId, {
            ...featureData,
            name: featureName,
        });

        const tags = await this.tagStore.getAllTagsForFeature(featureName);

        await this.eventStore.store(
            new FeatureMetadataUpdateEvent({
                createdBy: userName,
                data: featureToggle,
                preData,
                featureName,
                project: projectId,
                tags,
            }),
        );
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

    async getStrategy(strategyId: string): Promise<Saved<IStrategyConfig>> {
        const strategy = await this.featureStrategiesStore.getStrategyById(
            strategyId,
        );

        const segments = await this.segmentService.getByStrategy(strategyId);
        let result: Saved<IStrategyConfig> = {
            id: strategy.id,
            name: strategy.strategyName,
            constraints: strategy.constraints || [],
            parameters: strategy.parameters,
            segments: [],
        };

        if (segments && segments.length > 0) {
            result = {
                ...result,
                segments: segments.map((segment) => segment.id),
            };
        }
        return result;
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

    // todo: store events for this change.
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
        let msg: string;
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
        createdBy: string,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);
        const { project } = feature;
        feature.stale = isStale;
        await this.featureToggleStore.update(project, feature);
        const tags = await this.tagStore.getAllTagsForFeature(featureName);

        await this.eventStore.store(
            new FeatureStaleEvent({
                stale: isStale,
                project,
                featureName,
                createdBy,
                tags,
            }),
        );

        return feature;
    }

    async archiveToggle(
        featureName: string,
        createdBy: string,
        projectId?: string,
    ): Promise<void> {
        const feature = await this.featureToggleStore.get(featureName);

        if (projectId) {
            await this.validateFeatureContext({ featureName, projectId });
        }

        await this.featureToggleStore.archive(featureName);
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.eventStore.store(
            new FeatureArchivedEvent({
                featureName,
                createdBy,
                project: feature.project,
                tags,
            }),
        );
    }

    async updateEnabled(
        project: string,
        featureName: string,
        environment: string,
        enabled: boolean,
        createdBy: string,
        user?: User,
    ): Promise<FeatureToggle> {
        await this.stopWhenChangeRequestsEnabled(project, environment, user);
        if (enabled) {
            await this.stopWhenCannotCreateStrategies(
                project,
                environment,
                featureName,
                user,
            );
        }

        return this.unprotectedUpdateEnabled(
            project,
            featureName,
            environment,
            enabled,
            createdBy,
        );
    }

    async unprotectedUpdateEnabled(
        project: string,
        featureName: string,
        environment: string,
        enabled: boolean,
        createdBy: string,
    ): Promise<FeatureToggle> {
        const hasEnvironment =
            await this.featureEnvironmentStore.featureHasEnvironment(
                environment,
                featureName,
            );

        if (!hasEnvironment) {
            throw new NotFoundError(
                `Could not find environment ${environment} for feature: ${featureName}`,
            );
        }

        if (enabled) {
            const strategies = await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            );
            if (strategies.length === 0) {
                await this.unprotectedCreateStrategy(
                    getDefaultStrategy(featureName),
                    {
                        environment,
                        projectId: project,
                        featureName,
                    },
                    createdBy,
                );
            }
        }
        const updatedEnvironmentStatus =
            await this.featureEnvironmentStore.setEnvironmentEnabledStatus(
                environment,
                featureName,
                enabled,
            );
        const feature = await this.featureToggleStore.get(featureName);

        if (updatedEnvironmentStatus > 0) {
            const tags = await this.tagStore.getAllTagsForFeature(featureName);
            await this.eventStore.store(
                new FeatureEnvironmentEvent({
                    enabled,
                    project,
                    featureName,
                    environment,
                    createdBy,
                    tags,
                }),
            );
        }
        return feature;
    }

    // @deprecated
    async storeFeatureUpdatedEventLegacy(
        featureName: string,
        createdBy: string,
    ): Promise<FeatureToggleLegacy> {
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        const feature = await this.getFeatureToggleLegacy(featureName);

        // Legacy event. Will not be used from v4.3.
        // We do not include 'preData' on purpose.
        await this.eventStore.store({
            type: FEATURE_UPDATED,
            createdBy,
            featureName,
            data: feature,
            tags,
            project: feature.project,
        });
        return feature;
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

    // @deprecated
    async getFeatureToggleLegacy(
        featureName: string,
    ): Promise<FeatureToggleLegacy> {
        const feature =
            await this.featureStrategiesStore.getFeatureToggleWithEnvs(
                featureName,
            );
        const { environments, ...legacyFeature } = feature;
        const defaultEnv = environments.find((e) => e.name === DEFAULT_ENV);
        const strategies = defaultEnv?.strategies || [];
        const enabled = defaultEnv?.enabled || false;
        return { ...legacyFeature, enabled, strategies };
    }

    async changeProject(
        featureName: string,
        newProject: string,
        createdBy: string,
    ): Promise<void> {
        const feature = await this.featureToggleStore.get(featureName);
        const oldProject = feature.project;
        feature.project = newProject;
        await this.featureToggleStore.update(newProject, feature);

        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.eventStore.store(
            new FeatureChangeProjectEvent({
                createdBy,
                oldProject,
                newProject,
                featureName,
                tags,
            }),
        );
    }

    async getArchivedFeatures(): Promise<FeatureToggle[]> {
        return this.getFeatureToggles({}, undefined, true);
    }

    // TODO: add project id.
    async deleteFeature(featureName: string, createdBy: string): Promise<void> {
        const toggle = await this.featureToggleStore.get(featureName);
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.featureToggleStore.delete(featureName);
        await this.eventStore.store(
            new FeatureDeletedEvent({
                featureName,
                project: toggle.project,
                createdBy,
                preData: toggle,
                tags,
            }),
        );
    }

    // TODO: add project id.
    async reviveToggle(featureName: string, createdBy: string): Promise<void> {
        const toggle = await this.featureToggleStore.revive(featureName);
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.eventStore.store(
            new FeatureRevivedEvent({
                createdBy,
                featureName,
                project: toggle.project,
                tags,
            }),
        );
    }

    async getMetadataForAllFeatures(
        archived: boolean,
    ): Promise<FeatureToggle[]> {
        return this.featureToggleStore.getAll({ archived });
    }

    async getMetadataForAllFeaturesByProjectId(
        archived: boolean,
        project: string,
    ): Promise<FeatureToggle[]> {
        return this.featureToggleStore.getAll({ archived, project });
    }

    async getProjectId(name: string): Promise<string> {
        return this.featureToggleStore.getProjectId(name);
    }

    async updateFeatureStrategyProject(
        featureName: string,
        newProjectId: string,
    ): Promise<void> {
        await this.featureStrategiesStore.setProjectForStrategiesBelongingToFeature(
            featureName,
            newProjectId,
        );
    }

    async updateVariants(
        featureName: string,
        project: string,
        newVariants: Operation[],
        createdBy: string,
    ): Promise<FeatureToggle> {
        const ft =
            await this.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
                featureName,
            );
        const promises = ft.environments.map((env) =>
            this.updateVariantsOnEnv(
                featureName,
                project,
                env.name,
                newVariants,
                createdBy,
            ).then((resultingVariants) => (env.variants = resultingVariants)),
        );
        await Promise.all(promises);
        ft.variants = ft.environments[0].variants;
        return ft;
    }

    async updateVariantsOnEnv(
        featureName: string,
        project: string,
        environment: string,
        newVariants: Operation[],
        createdBy: string,
    ): Promise<IVariant[]> {
        const oldVariants = await this.getVariantsForEnv(
            featureName,
            environment,
        );
        const { newDocument } = await applyPatch(oldVariants, newVariants);
        return this.saveVariantsOnEnv(
            project,
            featureName,
            environment,
            newDocument,
            createdBy,
            oldVariants,
        );
    }

    async saveVariants(
        featureName: string,
        project: string,
        newVariants: IVariant[],
        createdBy: string,
    ): Promise<FeatureToggle> {
        await variantsArraySchema.validateAsync(newVariants);
        const fixedVariants = this.fixVariantWeights(newVariants);
        const oldVariants = await this.featureToggleStore.getVariants(
            featureName,
        );
        const featureToggle = await this.featureToggleStore.saveVariants(
            project,
            featureName,
            fixedVariants,
        );
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.eventStore.store(
            new FeatureVariantEvent({
                project,
                featureName,
                createdBy,
                tags,
                oldVariants,
                newVariants: featureToggle.variants as IVariant[],
            }),
        );
        return featureToggle;
    }

    async saveVariantsOnEnv(
        projectId: string,
        featureName: string,
        environment: string,
        newVariants: IVariant[],
        createdBy: string,
        oldVariants?: IVariant[],
    ): Promise<IVariant[]> {
        await variantsArraySchema.validateAsync(newVariants);
        const fixedVariants = this.fixVariantWeights(newVariants);
        const theOldVariants: IVariant[] =
            oldVariants ||
            (
                await this.featureEnvironmentStore.get({
                    featureName,
                    environment,
                })
            ).variants;

        await this.eventStore.store(
            new EnvironmentVariantEvent({
                featureName,
                environment,
                project: projectId,
                createdBy,
                oldVariants: theOldVariants,
                newVariants: fixedVariants,
            }),
        );
        await this.featureEnvironmentStore.setVariantsToFeatureEnvironments(
            featureName,
            [environment],
            fixedVariants,
        );
        return fixedVariants;
    }

    async setVariantsOnEnvs(
        projectId: string,
        featureName: string,
        environments: string[],
        newVariants: IVariant[],
        createdBy: string,
    ): Promise<IVariant[]> {
        await variantsArraySchema.validateAsync(newVariants);
        const fixedVariants = this.fixVariantWeights(newVariants);
        const oldVariants: { [env: string]: IVariant[] } = environments.reduce(
            async (result, environment) => {
                result[environment] = await this.featureEnvironmentStore.get({
                    featureName,
                    environment,
                });
                return result;
            },
            {},
        );

        await this.eventStore.batchStore(
            environments.map(
                (environment) =>
                    new EnvironmentVariantEvent({
                        featureName,
                        environment,
                        project: projectId,
                        createdBy,
                        oldVariants: oldVariants[environment],
                        newVariants: fixedVariants,
                    }),
            ),
        );

        await this.featureEnvironmentStore.setVariantsToFeatureEnvironments(
            featureName,
            environments,
            fixedVariants,
        );
        return fixedVariants;
    }

    fixVariantWeights(variants: IVariant[]): IVariant[] {
        let variableVariants = variants.filter((x) => {
            return x.weightType === WeightType.VARIABLE;
        });

        if (variants.length > 0 && variableVariants.length === 0) {
            throw new BadDataError(
                'There must be at least one "variable" variant',
            );
        }

        let fixedVariants = variants.filter((x) => {
            return x.weightType === WeightType.FIX;
        });

        let fixedWeights = fixedVariants.reduce((a, v) => a + v.weight, 0);

        if (fixedWeights > 1000) {
            throw new BadDataError(
                'The traffic distribution total must equal 100%',
            );
        }

        let averageWeight = Math.floor(
            (1000 - fixedWeights) / variableVariants.length,
        );
        let remainder = (1000 - fixedWeights) % variableVariants.length;

        variableVariants = variableVariants.map((x) => {
            x.weight = averageWeight;
            if (remainder > 0) {
                x.weight += 1;
                remainder--;
            }
            return x;
        });
        return variableVariants
            .concat(fixedVariants)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    private async stopWhenChangeRequestsEnabled(
        project: string,
        environment: string,
        user?: User,
    ) {
        const [canSkipChangeRequest, changeRequestEnabled] = await Promise.all([
            user
                ? this.accessService.hasPermission(
                      user,
                      SKIP_CHANGE_REQUEST,
                      project,
                      environment,
                  )
                : Promise.resolve(false),
            this.accessService.isChangeRequestsEnabled(project, environment),
        ]);
        if (changeRequestEnabled && !canSkipChangeRequest) {
            throw new NoAccessError(SKIP_CHANGE_REQUEST);
        }
    }

    private async stopWhenCannotCreateStrategies(
        project: string,
        environment: string,
        featureName: string,
        user: User,
    ) {
        const hasEnvironment =
            await this.featureEnvironmentStore.featureHasEnvironment(
                environment,
                featureName,
            );

        if (hasEnvironment) {
            const strategies = await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            );
            if (strategies.length === 0) {
                const canAddStrategies =
                    user &&
                    (await this.accessService.hasPermission(
                        user,
                        CREATE_FEATURE_STRATEGY,
                        project,
                        environment,
                    ));
                if (!canAddStrategies) {
                    throw new NoAccessError(CREATE_FEATURE_STRATEGY);
                }
            }
        }
    }
}

export default FeatureToggleService;
