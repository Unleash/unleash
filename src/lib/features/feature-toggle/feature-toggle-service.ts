import {
    CREATE_FEATURE_STRATEGY,
    EnvironmentVariantEvent,
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
    FeatureToggle,
    FeatureToggleDTO,
    FeatureToggleLegacy,
    FeatureToggleWithDependencies,
    FeatureToggleWithEnvironment,
    FeatureVariantEvent,
    IConstraint,
    IDependency,
    IFeatureEnvironmentInfo,
    IFeatureEnvironmentStore,
    IFeatureNaming,
    IFeatureOverview,
    IFeatureStrategy,
    IFeatureTagStore,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    IFeatureToggleStore,
    IFeatureTypeCount,
    IFlagResolver,
    IProjectStore,
    ISegment,
    IStrategyConfig,
    IStrategyStore,
    IUnleashConfig,
    IUnleashStores,
    IVariant,
    PotentiallyStaleOnEvent,
    Saved,
    SKIP_CHANGE_REQUEST,
    StrategiesOrderChangedEvent,
    StrategyIds,
    SYSTEM_USER_ID,
    Unsaved,
    WeightType,
} from '../../types';
import { Logger } from '../../logger';
import {
    ForbiddenError,
    FOREIGN_KEY_VIOLATION,
    OperationDeniedError,
    PatternError,
    PermissionError,
} from '../../error';
import BadDataError from '../../error/bad-data-error';
import NameExistsError from '../../error/name-exists-error';
import InvalidOperationError from '../../error/invalid-operation-error';
import {
    constraintSchema,
    featureMetadataSchema,
    nameSchema,
    variantsArraySchema,
} from '../../schema/feature-schema';
import NotFoundError from '../../error/notfound-error';
import {
    FeatureConfigurationClient,
    IFeatureStrategiesStore,
} from './types/feature-toggle-strategies-store-type';
import {
    DATE_OPERATORS,
    DEFAULT_ENV,
    extractUsernameFromUser,
    NUM_OPERATORS,
    SEMVER_OPERATORS,
    STRING_OPERATORS,
} from '../../util';
import { applyPatch, deepClone, Operation } from 'fast-json-patch';
import {
    validateDate,
    validateLegalValues,
    validateNumber,
    validateSemver,
    validateString,
} from '../../util/validators/constraint-types';
import { IContextFieldStore } from '../../types/stores/context-field-store';
import { SetStrategySortOrderSchema } from '../../openapi/spec/set-strategy-sort-order-schema';
import {
    getDefaultStrategy,
    getProjectDefaultStrategy,
} from '../playground/feature-evaluator/helpers';
import { AccessService } from '../../services/access-service';
import { IUser } from '../../server-impl';
import { IFeatureProjectUserParams } from './feature-toggle-controller';
import { unique } from '../../util/unique';
import { ISegmentService } from '../segment/segment-service-interface';
import { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model';
import { checkFeatureFlagNamesAgainstPattern } from '../feature-naming-pattern/feature-naming-validation';
import { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import { IDependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model-type';
import EventService from '../events/event-service';
import { DependentFeaturesService } from '../dependent-features/dependent-features-service';
import { FeatureToggleInsert } from './feature-toggle-store';
import ArchivedFeatureError from '../../error/archivedfeature-error';
import { FEATURES_CREATED_BY_PROCESSED } from '../../metric-events';
import { EventEmitter } from 'stream';

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

export type FeatureNameCheckResultWithFeaturePattern =
    | {
          state: 'valid';
      }
    | {
          state: 'invalid';
          invalidNames: Set<string>;
          featureNaming: IFeatureNaming;
      };

const oneOf = (values: string[], match: string) => {
    return values.some((value) => value === match);
};

class FeatureToggleService {
    private logger: Logger;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private strategyStore: IStrategyStore;

    private featureToggleStore: IFeatureToggleStore;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private tagStore: IFeatureTagStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private projectStore: IProjectStore;

    private contextFieldStore: IContextFieldStore;

    private segmentService: ISegmentService;

    private accessService: AccessService;

    private eventService: EventService;

    private flagResolver: IFlagResolver;

    private changeRequestAccessReadModel: IChangeRequestAccessReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    private dependentFeaturesService: DependentFeaturesService;

    private eventBus: EventEmitter;

    constructor(
        {
            featureStrategiesStore,
            featureToggleStore,
            clientFeatureToggleStore,
            projectStore,
            featureTagStore,
            featureEnvironmentStore,
            contextFieldStore,
            strategyStore,
        }: Pick<
            IUnleashStores,
            | 'featureStrategiesStore'
            | 'featureToggleStore'
            | 'clientFeatureToggleStore'
            | 'projectStore'
            | 'featureTagStore'
            | 'featureEnvironmentStore'
            | 'contextFieldStore'
            | 'strategyStore'
        >,
        {
            getLogger,
            flagResolver,
            eventBus,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
        segmentService: ISegmentService,
        accessService: AccessService,
        eventService: EventService,
        changeRequestAccessReadModel: IChangeRequestAccessReadModel,
        privateProjectChecker: IPrivateProjectChecker,
        dependentFeaturesReadModel: IDependentFeaturesReadModel,
        dependentFeaturesService: DependentFeaturesService,
    ) {
        this.logger = getLogger('services/feature-toggle-service.ts');
        this.featureStrategiesStore = featureStrategiesStore;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
        this.tagStore = featureTagStore;
        this.projectStore = projectStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.contextFieldStore = contextFieldStore;
        this.segmentService = segmentService;
        this.accessService = accessService;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
        this.privateProjectChecker = privateProjectChecker;
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.dependentFeaturesService = dependentFeaturesService;
        this.eventBus = eventBus;
    }

    async validateFeaturesContext(
        featureNames: string[],
        projectId: string,
    ): Promise<void> {
        const features =
            await this.featureToggleStore.getAllByNames(featureNames);

        const invalidProjects = unique(
            features
                .map((feature) => feature.project)
                .filter((project) => project !== projectId),
        );
        if (invalidProjects.length > 0) {
            throw new InvalidOperationError(
                `The operation could not be completed. The features exist, but the provided project ids ("${invalidProjects.join(
                    ',',
                )}") does not match the project provided in request URL ("${projectId}").`,
            );
        }
    }

    async validateFeatureBelongsToProject({
        featureName,
        projectId,
    }: IFeatureContext): Promise<void> {
        const id = await this.featureToggleStore.getProjectId(featureName);

        if (id !== projectId) {
            throw new NotFoundError(
                `There's no feature named "${featureName}" in project "${projectId}"${
                    id === undefined
                        ? '.'
                        : `, but there's a feature with that name in project "${id}"`
                }`,
            );
        }
    }

    async validateFeatureIsNotArchived(
        featureName: string,
        project: string,
    ): Promise<void> {
        const toggle = await this.featureToggleStore.get(featureName);

        if (toggle.archived || Boolean(toggle.archivedAt)) {
            throw new ArchivedFeatureError();
        }
    }

    async validateNoChildren(featureName: string): Promise<void> {
        const children = await this.dependentFeaturesReadModel.getChildren([
            featureName,
        ]);
        if (children.length > 0) {
            throw new InvalidOperationError(
                'You can not archive/delete this feature since other features depend on it.',
            );
        }
    }

    async validateNoOrphanParents(featureNames: string[]): Promise<void> {
        if (featureNames.length === 0) return;
        const parents =
            await this.dependentFeaturesReadModel.getOrphanParents(
                featureNames,
            );
        if (parents.length > 0) {
            throw new InvalidOperationError(
                featureNames.length > 1
                    ? `You can not archive/delete those features since other features depend on them.`
                    : `You can not archive/delete this feature since other features depend on it.`,
            );
        }
    }

    validateUpdatedProperties(
        { featureName, projectId }: IFeatureContext,
        existingStrategy: IFeatureStrategy,
    ): void {
        if (existingStrategy.projectId !== projectId) {
            throw new InvalidOperationError(
                'You can not change the projectId for an activation strategy.',
            );
        }

        if (existingStrategy.featureName !== featureName) {
            throw new InvalidOperationError(
                'You can not change the featureName for an activation strategy.',
            );
        }

        if (
            existingStrategy.parameters &&
            'stickiness' in existingStrategy.parameters &&
            existingStrategy.parameters.stickiness === ''
        ) {
            throw new InvalidOperationError(
                'You can not have an empty string for stickiness.',
            );
        }
    }

    async validateProjectCanAccessSegments(
        projectId: string,
        segmentIds?: number[],
    ): Promise<void> {
        if (segmentIds && segmentIds.length > 0) {
            await Promise.all(
                segmentIds.map((segmentId) =>
                    this.segmentService.get(segmentId),
                ),
            ).then((segments) =>
                segments.map((segment) => {
                    if (segment.project && segment.project !== projectId) {
                        throw new BadDataError(
                            `The segment "${segment.name}" with id ${segment.id} does not belong to project "${projectId}".`,
                        );
                    }
                }),
            );
        }
    }

    async validateStrategyType(
        strategyName: string | undefined,
    ): Promise<void> {
        if (strategyName !== undefined) {
            const exists = await this.strategyStore.exists(strategyName);
            if (!exists) {
                throw new BadDataError(
                    `Could not find strategy type with name ${strategyName}`,
                );
            }
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
            contextDefinition?.legalValues &&
            contextDefinition.legalValues.length > 0
        ) {
            const valuesToValidate = oneOf(
                [...DATE_OPERATORS, ...SEMVER_OPERATORS, ...NUM_OPERATORS],
                operator,
            )
                ? constraint.value
                : constraint.values;
            validateLegalValues(
                contextDefinition.legalValues,
                valuesToValidate,
            );
        }

        return constraint;
    }

    async patchFeature(
        project: string,
        featureName: string,
        createdBy: string,
        operations: Operation[],
        createdByUserId: number,
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
            createdByUserId,
        );

        if (featureToggle.stale !== newDocument.stale) {
            await this.eventService.storeEvent(
                new FeatureStaleEvent({
                    stale: newDocument.stale,
                    project,
                    featureName,
                    createdBy,
                    createdByUserId,
                }),
            );
        }

        return updated;
    }

    featureStrategyToPublic(
        featureStrategy: IFeatureStrategy,
        segments: ISegment[] = [],
    ): Saved<IStrategyConfig> {
        const result: Saved<IStrategyConfig> = {
            id: featureStrategy.id,
            name: featureStrategy.strategyName,
            title: featureStrategy.title,
            disabled: featureStrategy.disabled,
            constraints: featureStrategy.constraints || [],
            parameters: featureStrategy.parameters,
            variants: featureStrategy.variants || [],
            sortOrder: featureStrategy.sortOrder,
            segments: segments.map((segment) => segment.id) ?? [],
        };

        return result;
    }

    async updateStrategiesSortOrder(
        context: IFeatureStrategyContext,
        sortOrders: SetStrategySortOrderSchema,
        createdBy: string,
        user?: IUser,
    ): Promise<Saved<any>> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );

        return this.unprotectedUpdateStrategiesSortOrder(
            context,
            sortOrders,
            createdBy,
            user?.id || SYSTEM_USER_ID,
        );
    }

    async unprotectedUpdateStrategiesSortOrder(
        context: IFeatureStrategyContext,
        sortOrders: SetStrategySortOrderSchema,
        createdBy: string,
        createdByUserId: number,
    ): Promise<Saved<any>> {
        const { featureName, environment, projectId: project } = context;
        const existingOrder = (
            await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            )
        )
            .sort((strategy1, strategy2) => {
                if (
                    typeof strategy1.sortOrder === 'number' &&
                    typeof strategy2.sortOrder === 'number'
                ) {
                    return strategy1.sortOrder - strategy2.sortOrder;
                }
                return 0;
            })
            .map((strategy) => strategy.id);

        const eventPreData: StrategyIds = { strategyIds: existingOrder };

        await Promise.all(
            sortOrders.map(async ({ id, sortOrder }) => {
                await this.featureStrategiesStore.updateSortOrder(
                    id,
                    sortOrder,
                );
            }),
        );
        const newOrder = (
            await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            )
        )
            .sort((strategy1, strategy2) => {
                if (
                    typeof strategy1.sortOrder === 'number' &&
                    typeof strategy2.sortOrder === 'number'
                ) {
                    return strategy1.sortOrder - strategy2.sortOrder;
                }
                return 0;
            })
            .map((strategy) => strategy.id);

        const eventData: StrategyIds = { strategyIds: newOrder };

        const event = new StrategiesOrderChangedEvent({
            featureName,
            environment,
            project,
            createdBy,
            preData: eventPreData,
            data: eventData,
            createdByUserId,
        });
        await this.eventService.storeEvent(event);
    }

    async createStrategy(
        strategyConfig: Unsaved<IStrategyConfig>,
        context: IFeatureStrategyContext,
        createdBy: string,
        user?: IUser,
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
            user?.id || SYSTEM_USER_ID,
        );
    }

    async unprotectedCreateStrategy(
        strategyConfig: Unsaved<IStrategyConfig>,
        context: IFeatureStrategyContext,
        createdBy: string,
        createdByUserId: number,
    ): Promise<Saved<IStrategyConfig>> {
        const { featureName, projectId, environment } = context;
        await this.validateFeatureBelongsToProject(context);

        await this.validateStrategyType(strategyConfig.name);
        await this.validateProjectCanAccessSegments(
            projectId,
            strategyConfig.segments,
        );

        if (
            strategyConfig.constraints &&
            strategyConfig.constraints.length > 0
        ) {
            strategyConfig.constraints = await this.validateConstraints(
                strategyConfig.constraints,
            );
        }

        if (
            strategyConfig.parameters &&
            'stickiness' in strategyConfig.parameters &&
            strategyConfig.parameters.stickiness === ''
        ) {
            strategyConfig.parameters.stickiness = 'default';
        }

        if (strategyConfig.variants && strategyConfig.variants.length > 0) {
            await variantsArraySchema.validateAsync(strategyConfig.variants);
            const fixedVariants = this.fixVariantWeights(
                strategyConfig.variants,
            );
            strategyConfig.variants = fixedVariants;
        }

        try {
            const newFeatureStrategy =
                await this.featureStrategiesStore.createStrategyFeatureEnv({
                    strategyName: strategyConfig.name,
                    title: strategyConfig.title,
                    disabled: strategyConfig.disabled,
                    constraints: strategyConfig.constraints || [],
                    variants: strategyConfig.variants || [],
                    parameters: strategyConfig.parameters || {},
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

            const segments = await this.segmentService.getByStrategy(
                newFeatureStrategy.id,
            );

            const strategy = this.featureStrategyToPublic(
                newFeatureStrategy,
                segments,
            );

            await this.eventService.storeEvent(
                new FeatureStrategyAddEvent({
                    project: projectId,
                    featureName,
                    createdBy,
                    environment,
                    data: strategy,
                    createdByUserId,
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
     * @param user - Optional User object performing the action
     */
    async updateStrategy(
        id: string,
        updates: Partial<IStrategyConfig>,
        context: IFeatureStrategyContext,
        userName: string,
        user?: IUser,
    ): Promise<Saved<IStrategyConfig>> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );
        return this.unprotectedUpdateStrategy(
            id,
            updates,
            context,
            userName,
            user,
        );
    }

    async optionallyDisableFeature(
        featureName: string,
        environment: string,
        projectId: string,
        userName: string,
        user?: IUser,
    ): Promise<void> {
        const feature = await this.getFeature({ featureName });

        const env = feature.environments.find((e) => e.name === environment);
        const hasOnlyDisabledStrategies = env?.strategies.every(
            (strategy) => strategy.disabled,
        );
        if (hasOnlyDisabledStrategies) {
            await this.unprotectedUpdateEnabled(
                projectId,
                featureName,
                environment,
                false,
                userName,
                user,
            );
        }
    }

    async unprotectedUpdateStrategy(
        id: string,
        updates: Partial<IStrategyConfig>,
        context: IFeatureStrategyContext,
        userName: string,
        user?: IUser,
    ): Promise<Saved<IStrategyConfig>> {
        const { projectId, environment, featureName } = context;
        const existingStrategy = await this.featureStrategiesStore.get(id);

        this.validateUpdatedProperties(context, existingStrategy);
        await this.validateStrategyType(updates.name);
        await this.validateProjectCanAccessSegments(
            projectId,
            updates.segments,
        );
        const existingSegments = await this.segmentService.getByStrategy(id);

        if (existingStrategy.id === id) {
            if (updates.constraints && updates.constraints.length > 0) {
                updates.constraints = await this.validateConstraints(
                    updates.constraints,
                );
            }

            if (updates.variants && updates.variants.length > 0) {
                await variantsArraySchema.validateAsync(updates.variants);
                const fixedVariants = this.fixVariantWeights(updates.variants);
                updates.variants = fixedVariants;
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
            const data = this.featureStrategyToPublic(strategy, segments);
            const preData = this.featureStrategyToPublic(
                existingStrategy,
                existingSegments,
            );
            await this.eventService.storeEvent(
                new FeatureStrategyUpdateEvent({
                    project: projectId,
                    featureName,
                    environment,
                    createdBy: userName,
                    data,
                    preData,
                    createdByUserId: user?.id || SYSTEM_USER_ID,
                }),
            );
            await this.optionallyDisableFeature(
                featureName,
                environment,
                projectId,
                userName,
                user,
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
        createdByUserId: number,
    ): Promise<Saved<IStrategyConfig>> {
        const { projectId, environment, featureName } = context;

        const existingStrategy = await this.featureStrategiesStore.get(id);
        this.validateUpdatedProperties(context, existingStrategy);

        if (existingStrategy.id === id) {
            existingStrategy.parameters[name] = String(value);
            const existingSegments =
                await this.segmentService.getByStrategy(id);
            const strategy = await this.featureStrategiesStore.updateStrategy(
                id,
                existingStrategy,
            );
            const segments = await this.segmentService.getByStrategy(
                strategy.id,
            );
            const data = this.featureStrategyToPublic(strategy, segments);
            const preData = this.featureStrategyToPublic(
                existingStrategy,
                existingSegments,
            );
            await this.eventService.storeEvent(
                new FeatureStrategyUpdateEvent({
                    featureName,
                    project: projectId,
                    environment,
                    createdBy: userName,
                    data,
                    preData,
                    createdByUserId,
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
     * @param user
     */
    async deleteStrategy(
        id: string,
        context: IFeatureStrategyContext,
        createdBy: string,
        user?: IUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );
        return this.unprotectedDeleteStrategy(id, context, createdBy, user);
    }

    async unprotectedDeleteStrategy(
        id: string,
        context: IFeatureStrategyContext,
        createdBy: string,
        createdByUser?: IUser,
    ): Promise<void> {
        const existingStrategy = await this.featureStrategiesStore.get(id);
        const { featureName, projectId, environment } = context;
        this.validateUpdatedProperties(context, existingStrategy);

        await this.featureStrategiesStore.delete(id);

        const featureStrategies =
            await this.featureStrategiesStore.getStrategiesForFeatureEnv(
                projectId,
                featureName,
                environment,
            );

        const hasOnlyDisabledStrategies = featureStrategies.every(
            (strategy) => strategy.disabled,
        );

        if (hasOnlyDisabledStrategies) {
            // Disable the feature in the environment if it only has disabled strategies
            await this.unprotectedUpdateEnabled(
                projectId,
                featureName,
                environment,
                false,
                createdBy,
                createdByUser,
            );
        }

        const preData = this.featureStrategyToPublic(existingStrategy);

        await this.eventService.storeEvent(
            new FeatureStrategyRemoveEvent({
                featureName,
                project: projectId,
                environment,
                createdBy,
                createdByUserId: createdByUser?.id || SYSTEM_USER_ID,
                preData,
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
            const result: Saved<IStrategyConfig>[] = [];
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
                    variants: strat.variants,
                    title: strat.title,
                    disabled: strat.disabled,
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
     * @param userId
     */
    async getFeature({
        featureName,
        archived,
        projectId,
        environmentVariants,
        userId,
    }: IGetFeatureParams): Promise<FeatureToggleWithDependencies> {
        if (projectId) {
            await this.validateFeatureBelongsToProject({
                featureName,
                projectId,
            });
        }

        let dependencies: IDependency[] = [];
        let children: string[] = [];
        [dependencies, children] = await Promise.all([
            this.dependentFeaturesReadModel.getParents(featureName),
            this.dependentFeaturesReadModel.getChildren([featureName]),
        ]);

        if (environmentVariants) {
            const result =
                await this.featureStrategiesStore.getFeatureToggleWithVariantEnvs(
                    featureName,
                    userId,
                    archived,
                );
            return {
                ...result,
                dependencies,
                children,
            };
        } else {
            const result =
                await this.featureStrategiesStore.getFeatureToggleWithEnvs(
                    featureName,
                    userId,
                    archived,
                );
            return {
                ...result,
                dependencies,
                children,
            };
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
    ): Promise<FeatureConfigurationClient[]> {
        const result = await this.clientFeatureToggleStore.getClient(
            query || {},
        );
        return result.map(
            ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }) => ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }),
        );
    }

    async getPlaygroundFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const features =
            await this.featureToggleStore.getPlaygroundFeatures(query);

        return features as FeatureConfigurationClient[];
    }

    /**
     * @deprecated Legacy!
     *
     * Used to retrieve metadata of all feature toggles defined in Unleash.
     * @param query - Allow you to limit search based on criteria such as project, tags, namePrefix. See @IFeatureToggleQuery
     * @param userId - Used to find / mark features as favorite based on users preferences
     * @param archived - Return archived or active toggles
     * @returns
     */
    async getFeatureToggles(
        query?: IFeatureToggleQuery,
        userId?: number,
        archived: boolean = false,
    ): Promise<FeatureToggle[]> {
        // Remove with with feature flag
        const features = await this.featureToggleStore.getFeatureToggleList(
            query,
            userId,
            archived,
        );

        if (userId) {
            const projectAccess =
                await this.privateProjectChecker.getUserAccessibleProjects(
                    userId,
                );
            return projectAccess.mode === 'all'
                ? features
                : features.filter((f) =>
                      projectAccess.projects.includes(f.project),
                  );
        }
        return features;
    }

    async getFeatureOverview(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureOverview[]> {
        return this.featureStrategiesStore.getFeatureOverview(params);
    }

    async getFeatureTypeCounts(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureTypeCount[]> {
        return this.featureToggleStore.getFeatureTypeCounts(params);
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
        createdByUserId: number,
        isValidated: boolean = false,
    ): Promise<FeatureToggle> {
        this.logger.info(`${createdBy} creates feature toggle ${value.name}`);
        await this.validateName(value.name);
        await this.validateFeatureFlagNameAgainstPattern(value.name, projectId);

        const exists = await this.projectStore.hasProject(projectId);

        if (await this.projectStore.isFeatureLimitReached(projectId)) {
            throw new InvalidOperationError(
                'You have reached the maximum number of feature toggles for this project.',
            );
        }
        if (exists) {
            let featureData: FeatureToggleInsert;
            if (isValidated) {
                featureData = { createdByUserId, ...value };
            } else {
                const validated =
                    await featureMetadataSchema.validateAsync(value);
                featureData = {
                    createdByUserId,
                    ...validated,
                };
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

            await this.eventService.storeEvent(
                new FeatureCreatedEvent({
                    featureName,
                    createdBy,
                    project: projectId,
                    data: createdToggle,
                    createdByUserId,
                }),
            );

            return createdToggle;
        }
        throw new NotFoundError(`Project with id ${projectId} does not exist`);
    }

    async checkFeatureFlagNamesAgainstProjectPattern(
        projectId: string,
        featureNames: string[],
    ): Promise<FeatureNameCheckResultWithFeaturePattern> {
        try {
            const project = await this.projectStore.get(projectId);

            const patternData = project.featureNaming;
            const namingPattern = patternData?.pattern;

            if (namingPattern) {
                const result = checkFeatureFlagNamesAgainstPattern(
                    featureNames,
                    namingPattern,
                );

                if (result.state === 'invalid') {
                    return {
                        ...result,
                        featureNaming: patternData,
                    };
                }
            }
        } catch (error) {
            // the project doesn't exist, so there's nothing to
            // validate against
            this.logger.info(
                "Got an error when trying to validate flag naming patterns. It is probably because the target project doesn't exist. Here's the error:",
                error.message,
            );

            return { state: 'valid' };
        }

        return { state: 'valid' };
    }

    async validateFeatureFlagNameAgainstPattern(
        featureName: string,
        projectId?: string,
    ): Promise<void> {
        if (projectId) {
            const result =
                await this.checkFeatureFlagNamesAgainstProjectPattern(
                    projectId,
                    [featureName],
                );

            if (result.state === 'invalid') {
                const namingPattern = result.featureNaming.pattern;
                const namingExample = result.featureNaming.example;
                const namingDescription = result.featureNaming.description;

                const error = `The feature flag name "${featureName}" does not match the project's naming pattern: "${namingPattern}".`;
                const example = namingExample
                    ? ` Here's an example of a name that does match the pattern: "${namingExample}"."`
                    : '';
                const description = namingDescription
                    ? ` The pattern's description is: "${namingDescription}"`
                    : '';
                throw new PatternError(`${error}${example}${description}`, [
                    `The flag name does not match the pattern.`,
                ]);
            }
        }
    }

    async cloneFeatureToggle(
        featureName: string,
        projectId: string,
        newFeatureName: string,
        userName: string,
        userId: number,
        replaceGroupId: boolean = true,
    ): Promise<FeatureToggle> {
        const changeRequestEnabled =
            await this.changeRequestAccessReadModel.isChangeRequestsEnabledForProject(
                projectId,
            );
        if (changeRequestEnabled) {
            throw new ForbiddenError(
                `Cloning not allowed. Project ${projectId} has change requests enabled.`,
            );
        }
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
            createdAt: undefined,
        };
        const created = await this.createFeatureToggle(
            projectId,
            newToggle,
            userName,
            userId,
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
                if (
                    replaceGroupId &&
                    s.parameters &&
                    s.parameters.hasOwnProperty('groupId')
                ) {
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

        const cloneDependencies =
            this.dependentFeaturesService.cloneDependencies(
                {
                    featureName,
                    newFeatureName,
                    projectId,
                },
                userName,
                userId,
            );

        await Promise.all([
            ...strategyTasks,
            ...variantTasks,
            cloneDependencies,
        ]);

        return created;
    }

    async updateFeatureToggle(
        projectId: string,
        updatedFeature: FeatureToggleDTO,
        userName: string,
        featureName: string,
        userId: number,
    ): Promise<FeatureToggle> {
        await this.validateFeatureBelongsToProject({
            featureName,
            projectId,
        });

        this.logger.info(`${userName} updates feature toggle ${featureName}`);

        const featureData =
            await featureMetadataSchema.validateAsync(updatedFeature);

        const preData = await this.featureToggleStore.get(featureName);

        const featureToggle = await this.featureToggleStore.update(projectId, {
            ...featureData,
            name: featureName,
        });

        await this.eventService.storeEvent(
            new FeatureMetadataUpdateEvent({
                createdBy: userName,
                createdByUserId: userId,
                data: featureToggle,
                preData,
                featureName,
                project: projectId,
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
        const strategy =
            await this.featureStrategiesStore.getStrategyById(strategyId);

        const segments = await this.segmentService.getByStrategy(strategyId);
        let result: Saved<IStrategyConfig> = {
            id: strategy.id,
            name: strategy.strategyName,
            constraints: strategy.constraints || [],
            parameters: strategy.parameters,
            variants: strategy.variants || [],
            segments: [],
            title: strategy.title,
            disabled: strategy.disabled,
            sortOrder: strategy.sortOrder,
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
        const defaultStrategy = await this.projectStore.getDefaultStrategy(
            project,
            environment,
        );
        return {
            name: featureName,
            environment,
            enabled: envMetadata.enabled,
            strategies,
            defaultStrategy,
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
        createdByUserId: number,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);
        const { project } = feature;
        feature.stale = isStale;
        await this.featureToggleStore.update(project, feature);

        await this.eventService.storeEvent(
            new FeatureStaleEvent({
                stale: isStale,
                project,
                featureName,
                createdBy,
                createdByUserId,
            }),
        );

        return feature;
    }

    async archiveToggle(
        featureName: string,
        user: IUser,
        projectId?: string,
    ): Promise<void> {
        if (projectId) {
            await this.stopWhenChangeRequestsEnabled(
                projectId,
                undefined,
                user,
            );
        }
        await this.unprotectedArchiveToggle(
            featureName,
            extractUsernameFromUser(user),
            user.id,
            projectId,
        );
    }

    async unprotectedArchiveToggle(
        featureName: string,
        createdBy: string,
        createdByUserId: number,
        projectId?: string,
    ): Promise<void> {
        const feature = await this.featureToggleStore.get(featureName);

        if (projectId) {
            await this.validateFeatureBelongsToProject({
                featureName,
                projectId,
            });
            await this.validateNoOrphanParents([featureName]);
        }

        await this.validateNoChildren(featureName);

        await this.featureToggleStore.archive(featureName);
        if (projectId) {
            await this.dependentFeaturesService.unprotectedDeleteFeaturesDependencies(
                [featureName],
                projectId,
                createdBy,
                createdByUserId,
            );
        }

        await this.eventService.storeEvent(
            new FeatureArchivedEvent({
                featureName,
                createdBy,
                createdByUserId,
                project: feature.project,
            }),
        );
    }

    async archiveToggles(
        featureNames: string[],
        user: IUser,
        projectId: string,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, undefined, user);
        await this.unprotectedArchiveToggles(
            featureNames,
            extractUsernameFromUser(user),
            projectId,
            user.id,
        );
    }

    async validateArchiveToggles(featureNames: string[]): Promise<{
        hasDeletedDependencies: boolean;
        parentsWithChildFeatures: string[];
    }> {
        const hasDeletedDependencies =
            await this.dependentFeaturesReadModel.haveDependencies(
                featureNames,
            );
        const parentsWithChildFeatures =
            await this.dependentFeaturesReadModel.getOrphanParents(
                featureNames,
            );
        return {
            hasDeletedDependencies,
            parentsWithChildFeatures,
        };
    }

    async unprotectedArchiveToggles(
        featureNames: string[],
        createdBy: string,
        projectId: string,
        createdByUserId: number,
    ): Promise<void> {
        await Promise.all([
            this.validateFeaturesContext(featureNames, projectId),
            this.validateNoOrphanParents(featureNames),
        ]);

        const features =
            await this.featureToggleStore.getAllByNames(featureNames);
        await this.featureToggleStore.batchArchive(featureNames);
        await this.dependentFeaturesService.unprotectedDeleteFeaturesDependencies(
            featureNames,
            projectId,
            createdBy,
            createdByUserId,
        );

        await this.eventService.storeEvents(
            features.map(
                (feature) =>
                    new FeatureArchivedEvent({
                        featureName: feature.name,
                        createdBy,
                        createdByUserId,
                        project: feature.project,
                    }),
            ),
        );
    }

    async setToggleStaleness(
        featureNames: string[],
        stale: boolean,
        createdBy: string,
        projectId: string,
        createdByUserId: number,
    ): Promise<void> {
        await this.validateFeaturesContext(featureNames, projectId);

        const features =
            await this.featureToggleStore.getAllByNames(featureNames);
        const relevantFeatures = features.filter(
            (feature) => feature.stale !== stale,
        );
        const relevantFeatureNames = relevantFeatures.map(
            (feature) => feature.name,
        );
        await this.featureToggleStore.batchStale(relevantFeatureNames, stale);

        await this.eventService.storeEvents(
            relevantFeatures.map(
                (feature) =>
                    new FeatureStaleEvent({
                        stale: stale,
                        project: projectId,
                        featureName: feature.name,
                        createdBy,
                        createdByUserId,
                    }),
            ),
        );
    }

    async bulkUpdateEnabled(
        project: string,
        featureNames: string[],
        environment: string,
        enabled: boolean,
        createdBy: string,
        user?: IUser,
        shouldActivateDisabledStrategies = false,
    ): Promise<void> {
        await Promise.all(
            featureNames.map((featureName) =>
                this.updateEnabled(
                    project,
                    featureName,
                    environment,
                    enabled,
                    createdBy,
                    user,
                    shouldActivateDisabledStrategies,
                ),
            ),
        );
    }

    async updateEnabled(
        project: string,
        featureName: string,
        environment: string,
        enabled: boolean,
        createdBy: string,
        user?: IUser,
        shouldActivateDisabledStrategies = false,
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
            user,
            shouldActivateDisabledStrategies,
        );
    }

    async unprotectedUpdateEnabled(
        project: string,
        featureName: string,
        environment: string,
        enabled: boolean,
        createdBy: string,
        user?: IUser,
        shouldActivateDisabledStrategies = false,
    ): Promise<FeatureToggle> {
        await this.validateFeatureBelongsToProject({
            featureName,
            projectId: project,
        });
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

        await this.validateFeatureIsNotArchived(featureName, project);

        if (enabled) {
            const strategies = await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            );
            const hasDisabledStrategies = strategies.some(
                (strategy) => strategy.disabled,
            );

            if (hasDisabledStrategies && shouldActivateDisabledStrategies) {
                await Promise.all(
                    strategies.map((strategy) =>
                        this.updateStrategy(
                            strategy.id,
                            { disabled: false },
                            {
                                environment,
                                projectId: project,
                                featureName,
                            },
                            createdBy,
                            user,
                        ),
                    ),
                );
            }

            const hasOnlyDisabledStrategies = strategies.every(
                (strategy) => strategy.disabled,
            );

            const shouldCreate =
                hasOnlyDisabledStrategies && !shouldActivateDisabledStrategies;

            if (strategies.length === 0 || shouldCreate) {
                const projectEnvironmentDefaultStrategy =
                    await this.projectStore.getDefaultStrategy(
                        project,
                        environment,
                    );
                const strategy =
                    projectEnvironmentDefaultStrategy != null
                        ? getProjectDefaultStrategy(
                              projectEnvironmentDefaultStrategy,
                              featureName,
                          )
                        : getDefaultStrategy(featureName);

                await this.unprotectedCreateStrategy(
                    strategy,
                    {
                        environment,
                        projectId: project,
                        featureName,
                    },
                    createdBy,
                    user?.id || SYSTEM_USER_ID,
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
            await this.eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled,
                    project,
                    featureName,
                    environment,
                    createdBy,
                    createdByUserId: user?.id || SYSTEM_USER_ID,
                }),
            );
        }
        return feature;
    }

    // @deprecated
    async storeFeatureUpdatedEventLegacy(
        featureName: string,
        createdBy: string,
        createdByUserId: number,
    ): Promise<FeatureToggleLegacy> {
        const feature = await this.getFeatureToggleLegacy(featureName);

        // Legacy event. Will not be used from v4.3.
        // We do not include 'preData' on purpose.
        await this.eventService.storeEvent({
            type: FEATURE_UPDATED,
            createdBy,
            createdByUserId,
            featureName,
            data: feature,
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
        return {
            ...legacyFeature,
            enabled,
            strategies,
        };
    }

    async changeProject(
        featureName: string,
        newProject: string,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const changeRequestEnabled =
            await this.changeRequestAccessReadModel.isChangeRequestsEnabledForProject(
                newProject,
            );
        if (changeRequestEnabled) {
            throw new ForbiddenError(
                `Changing project not allowed. Project ${newProject} has change requests enabled.`,
            );
        }
        if (
            await this.dependentFeaturesReadModel.haveDependencies([
                featureName,
            ])
        ) {
            throw new ForbiddenError(
                'Changing project not allowed. Feature has dependencies.',
            );
        }
        const feature = await this.featureToggleStore.get(featureName);
        const oldProject = feature.project;
        feature.project = newProject;
        await this.featureToggleStore.update(newProject, feature);

        await this.eventService.storeEvent(
            new FeatureChangeProjectEvent({
                createdBy,
                createdByUserId,
                oldProject,
                newProject,
                featureName,
            }),
        );
    }

    async getArchivedFeatures(): Promise<FeatureToggle[]> {
        return this.getFeatureToggles({}, undefined, true);
    }

    // TODO: add project id.
    async deleteFeature(
        featureName: string,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        await this.validateNoChildren(featureName);
        const toggle = await this.featureToggleStore.get(featureName);
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.featureToggleStore.delete(featureName);

        await this.eventService.storeEvent(
            new FeatureDeletedEvent({
                featureName,
                project: toggle.project,
                createdBy,
                createdByUserId,
                preData: toggle,
                tags,
            }),
        );
    }

    async deleteFeatures(
        featureNames: string[],
        projectId: string,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        await this.validateFeaturesContext(featureNames, projectId);
        await this.validateNoOrphanParents(featureNames);

        const features =
            await this.featureToggleStore.getAllByNames(featureNames);
        const eligibleFeatures = features.filter(
            (toggle) => toggle.archivedAt !== null,
        );
        const eligibleFeatureNames = eligibleFeatures.map(
            (toggle) => toggle.name,
        );
        const tags = await this.tagStore.getAllByFeatures(eligibleFeatureNames);
        await this.featureToggleStore.batchDelete(eligibleFeatureNames);

        await this.eventService.storeEvents(
            eligibleFeatures.map(
                (feature) =>
                    new FeatureDeletedEvent({
                        featureName: feature.name,
                        createdBy,
                        createdByUserId,
                        project: feature.project,
                        preData: feature,
                        tags: tags
                            .filter((tag) => tag.featureName === feature.name)
                            .map((tag) => ({
                                value: tag.tagValue,
                                type: tag.tagType,
                            })),
                    }),
            ),
        );
    }

    async reviveFeatures(
        featureNames: string[],
        projectId: string,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        await this.validateFeaturesContext(featureNames, projectId);

        const features =
            await this.featureToggleStore.getAllByNames(featureNames);
        const eligibleFeatures = features.filter(
            (toggle) => toggle.archivedAt !== null,
        );
        const eligibleFeatureNames = eligibleFeatures.map(
            (toggle) => toggle.name,
        );
        await this.featureToggleStore.batchRevive(eligibleFeatureNames);

        await this.featureToggleStore.disableAllEnvironmentsForFeatures(
            eligibleFeatureNames,
        );

        await this.eventService.storeEvents(
            eligibleFeatures.map(
                (feature) =>
                    new FeatureRevivedEvent({
                        featureName: feature.name,
                        createdBy,
                        createdByUserId,
                        project: feature.project,
                    }),
            ),
        );
    }

    // TODO: add project id.
    async reviveFeature(
        featureName: string,
        createdBy: string,
        createdByUserId: number,
    ): Promise<void> {
        const toggle = await this.featureToggleStore.revive(featureName);
        await this.featureToggleStore.disableAllEnvironmentsForFeatures([
            featureName,
        ]);
        await this.eventService.storeEvent(
            new FeatureRevivedEvent({
                createdBy,
                createdByUserId,
                featureName,
                project: toggle.project,
            }),
        );
    }

    async getAllArchivedFeatures(
        archived: boolean,
        userId: number,
    ): Promise<FeatureToggle[]> {
        const features = await this.featureToggleStore.getArchivedFeatures();

        const projectAccess =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (projectAccess.mode === 'all') {
            return features;
        } else {
            return features.filter((f) =>
                projectAccess.projects.includes(f.project),
            );
        }
    }

    async getArchivedFeaturesByProjectId(
        archived: boolean,
        project: string,
    ): Promise<FeatureToggle[]> {
        return this.featureToggleStore.getArchivedFeatures(project);
    }

    async getProjectId(name: string): Promise<string | undefined> {
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
        user: IUser,
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
                user,
            ).then((resultingVariants) => {
                env.variants = resultingVariants;
            }),
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
        user: IUser,
    ): Promise<IVariant[]> {
        const oldVariants = await this.getVariantsForEnv(
            featureName,
            environment,
        );
        const { newDocument } = await applyPatch(
            deepClone(oldVariants),
            newVariants,
        );
        return this.crProtectedSaveVariantsOnEnv(
            project,
            featureName,
            environment,
            newDocument,
            user,
            oldVariants,
        );
    }

    async saveVariants(
        featureName: string,
        project: string,
        newVariants: IVariant[],
        createdBy: string,
        createdByUserId: number,
    ): Promise<FeatureToggle> {
        await variantsArraySchema.validateAsync(newVariants);
        const fixedVariants = this.fixVariantWeights(newVariants);
        const oldVariants =
            await this.featureToggleStore.getVariants(featureName);
        const featureToggle = await this.featureToggleStore.saveVariants(
            project,
            featureName,
            fixedVariants,
        );

        await this.eventService.storeEvent(
            new FeatureVariantEvent({
                project,
                featureName,
                createdBy,
                createdByUserId,
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
        user: IUser,
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
            ).variants ||
            [];

        await this.eventService.storeEvent(
            new EnvironmentVariantEvent({
                featureName,
                environment,
                createdByUserId: user.id,
                project: projectId,
                createdBy: user,
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

    async crProtectedSaveVariantsOnEnv(
        projectId: string,
        featureName: string,
        environment: string,
        newVariants: IVariant[],
        user: IUser,
        oldVariants?: IVariant[],
    ): Promise<IVariant[]> {
        await this.stopWhenChangeRequestsEnabled(projectId, environment, user);
        return this.saveVariantsOnEnv(
            projectId,
            featureName,
            environment,
            newVariants,
            user,
            oldVariants,
        );
    }

    async crProtectedSetVariantsOnEnvs(
        projectId: string,
        featureName: string,
        environments: string[],
        newVariants: IVariant[],
        user: IUser,
    ): Promise<IVariant[]> {
        for (const env of environments) {
            await this.stopWhenChangeRequestsEnabled(projectId, env);
        }
        return this.setVariantsOnEnvs(
            projectId,
            featureName,
            environments,
            newVariants,
            user,
        );
    }

    async setVariantsOnEnvs(
        projectId: string,
        featureName: string,
        environments: string[],
        newVariants: IVariant[],
        user: IUser,
    ): Promise<IVariant[]> {
        await variantsArraySchema.validateAsync(newVariants);
        const fixedVariants = this.fixVariantWeights(newVariants);
        const oldVariants: {
            [env: string]: IVariant[];
        } = {};
        for (const env of environments) {
            const featureEnv = await this.featureEnvironmentStore.get({
                featureName,
                environment: env,
            });
            oldVariants[env] = featureEnv.variants || [];
        }

        await this.eventService.storeEvents(
            environments.map(
                (environment) =>
                    new EnvironmentVariantEvent({
                        featureName,
                        environment,
                        project: projectId,
                        createdBy: user,
                        oldVariants: oldVariants[environment],
                        newVariants: fixedVariants,
                        createdByUserId: user.id,
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

        const fixedVariants = variants.filter((x) => {
            return x.weightType === WeightType.FIX;
        });

        const fixedWeights = fixedVariants.reduce((a, v) => a + v.weight, 0);

        if (fixedWeights > 1000) {
            throw new BadDataError(
                'The traffic distribution total must equal 100%',
            );
        }

        const averageWeight = Math.floor(
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
        environment?: string,
        user?: IUser,
    ) {
        const canBypass = environment
            ? await this.changeRequestAccessReadModel.canBypassChangeRequest(
                  project,
                  environment,
                  user,
              )
            : await this.changeRequestAccessReadModel.canBypassChangeRequestForProject(
                  project,
                  user,
              );
        if (!canBypass) {
            throw new PermissionError(SKIP_CHANGE_REQUEST);
        }
    }

    private async stopWhenCannotCreateStrategies(
        project: string,
        environment: string,
        featureName: string,
        user?: IUser,
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
                    throw new PermissionError(CREATE_FEATURE_STRATEGY);
                }
            }
        }
    }

    async updatePotentiallyStaleFeatures(): Promise<void> {
        const potentiallyStaleFeatures =
            await this.featureToggleStore.updatePotentiallyStaleFeatures();

        if (potentiallyStaleFeatures.length > 0) {
            return this.eventService.storeEvents(
                potentiallyStaleFeatures
                    .filter((feature) => feature.potentiallyStale)
                    .map(
                        ({ name, project }) =>
                            new PotentiallyStaleOnEvent({
                                featureName: name,
                                createdByUserId: SYSTEM_USER_ID,
                                project,
                            }),
                    ),
            );
        }
    }

    async setFeatureCreatedByUserIdFromEvents(): Promise<void> {
        const updated = await this.featureToggleStore.setCreatedByUserId(100);
        if (updated !== undefined) {
            this.eventBus.emit(FEATURES_CREATED_BY_PROCESSED, {
                updated,
            });
        }
    }
}

export default FeatureToggleService;
