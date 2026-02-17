import {
    CREATE_FEATURE_STRATEGY,
    EnvironmentVariantEvent,
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
    type FeatureToggle,
    type FeatureToggleDTO,
    type FeatureToggleView,
    type FeatureToggleWithEnvironment,
    type IAuditUser,
    type IConstraint,
    type IDependency,
    type IFeatureCollaboratorsReadModel,
    type IFeatureEnvironmentInfo,
    type IFeatureEnvironmentStore,
    type IFeatureLifecycleStage,
    type IFeatureLinksReadModel,
    type IFeatureNaming,
    type IFeatureOverview,
    type IFeatureStrategy,
    type IFeatureTagStore,
    type IFeatureToggleClientStore,
    type IFeatureToggleQuery,
    type IFeatureToggleStore,
    type IFeatureTypeCount,
    type IFlagResolver,
    type IProjectStore,
    type ISegment,
    type IStrategyConfig,
    type IStrategyStore,
    type IUnleashConfig,
    type IUnleashStores,
    type IVariant,
    PotentiallyStaleOnEvent,
    type Saved,
    SKIP_CHANGE_REQUEST,
    StrategiesOrderChangedEvent,
    type StrategyIds,
    SYSTEM_USER_AUDIT,
    type Unsaved,
    WeightType,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import {
    ForbiddenError,
    FOREIGN_KEY_VIOLATION,
    OperationDeniedError,
    PatternError,
    PermissionError,
    BadDataError,
    NameExistsError,
    InvalidOperationError,
} from '../../error/index.js';
import {
    constraintSchema,
    featureMetadataSchema,
    nameSchema,
    variantsArraySchema,
} from '../../schema/feature-schema.js';
import NotFoundError from '../../error/notfound-error.js';
import type {
    FeatureConfigurationClient,
    IFeatureStrategiesStore,
} from './types/feature-toggle-strategies-store-type.js';
import {
    DATE_OPERATORS,
    DEFAULT_ENV,
    NUM_OPERATORS,
    SEMVER_OPERATORS,
    STRING_OPERATORS,
} from '../../util/index.js';
import type { Operation } from 'fast-json-patch';
import fastJsonPatch from 'fast-json-patch';
const { applyPatch, deepClone } = fastJsonPatch;
import {
    validateDate,
    validateLegalValues,
    validateNumber,
    validateSemver,
    validateString,
} from '../../util/validators/constraint-types.js';
import type { IContextFieldStore } from '../context/context-field-store-type.js';
import type { SetStrategySortOrderSchema } from '../../openapi/spec/set-strategy-sort-order-schema.js';
import {
    getDefaultStrategy,
    getProjectDefaultStrategy,
} from '../playground/feature-evaluator/helpers.js';
import type { AccessService } from '../../services/access-service.js';
import type { IUser } from '../../types/index.js';
import type { IFeatureProjectUserParams } from './feature-toggle-controller.js';
import { unique } from '../../util/unique.js';
import type { ISegmentService } from '../segment/segment-service-interface.js';
import type { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model.js';
import { checkFeatureFlagNamesAgainstPattern } from '../feature-naming-pattern/feature-naming-validation.js';
import type { IDependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model-type.js';
import type EventService from '../events/event-service.js';
import type { DependentFeaturesService } from '../dependent-features/dependent-features-service.js';
import type { FeatureToggleInsert } from './feature-toggle-store.js';
import ArchivedFeatureError from '../../error/archivedfeature-error.js';
import { FEATURES_CREATED_BY_PROCESSED } from '../../metric-events.js';
import { allSettledWithRejection } from '../../util/allSettledWithRejection.js';
import type EventEmitter from 'node:events';
import type { IFeatureLifecycleReadModel } from '../feature-lifecycle/feature-lifecycle-read-model-type.js';
import { throwExceedsLimitError } from '../../error/exceeds-limit-error.js';
import type { Collaborator } from './types/feature-collaborators-read-model-type.js';
import { sortStrategies } from '../../util/sortStrategies.js';
import type FeatureLinkService from '../feature-links/feature-link-service.js';
import type { IFeatureLink } from '../feature-links/feature-links-read-model-type.js';
import type { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';
import type ProjectJsonSchemaService from '../project-json-schemas/project-json-schema-service.js';
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

export type Stores = Pick<
    IUnleashStores,
    | 'featureStrategiesStore'
    | 'featureToggleStore'
    | 'clientFeatureToggleStore'
    | 'projectStore'
    | 'featureTagStore'
    | 'featureEnvironmentStore'
    | 'contextFieldStore'
    | 'strategyStore'
>;

export type Config = Pick<
    IUnleashConfig,
    'getLogger' | 'flagResolver' | 'eventBus'
>;

export type ServicesAndReadModels = {
    segmentService: ISegmentService;
    accessService: AccessService;
    eventService: EventService;
    changeRequestAccessReadModel: IChangeRequestAccessReadModel;
    dependentFeaturesReadModel: IDependentFeaturesReadModel;
    dependentFeaturesService: DependentFeaturesService;
    featureLifecycleReadModel: IFeatureLifecycleReadModel;
    featureCollaboratorsReadModel: IFeatureCollaboratorsReadModel;
    featureLinkService: FeatureLinkService;
    featureLinksReadModel: IFeatureLinksReadModel;
    resourceLimitsService: ResourceLimitsService;
    projectJsonSchemaService?: ProjectJsonSchemaService;
};

export class FeatureToggleService {
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

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    private featureLifecycleReadModel: IFeatureLifecycleReadModel;

    private featureCollaboratorsReadModel: IFeatureCollaboratorsReadModel;

    private featureLinksReadModel: IFeatureLinksReadModel;

    private featureLinkService: FeatureLinkService;

    private dependentFeaturesService: DependentFeaturesService;

    private eventBus: EventEmitter;

    private resourceLimitsService: ResourceLimitsService;

    private projectJsonSchemaService?: ProjectJsonSchemaService;

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
        }: Stores,
        { getLogger, flagResolver, eventBus }: Config,
        {
            segmentService,
            accessService,
            eventService,
            changeRequestAccessReadModel,
            dependentFeaturesReadModel,
            dependentFeaturesService,
            featureLifecycleReadModel,
            featureCollaboratorsReadModel,
            featureLinksReadModel,
            featureLinkService,
            resourceLimitsService,
            projectJsonSchemaService,
        }: ServicesAndReadModels,
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
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.dependentFeaturesService = dependentFeaturesService;
        this.featureLifecycleReadModel = featureLifecycleReadModel;
        this.featureCollaboratorsReadModel = featureCollaboratorsReadModel;
        this.featureLinksReadModel = featureLinksReadModel;
        this.featureLinkService = featureLinkService;
        this.eventBus = eventBus;
        this.resourceLimitsService = resourceLimitsService;
        this.projectJsonSchemaService = projectJsonSchemaService;
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
        _project: string,
    ): Promise<void> {
        const toggle = await this.featureToggleStore.get(featureName);
        if (toggle === undefined) {
            throw new NotFoundError(`Could not find feature ${featureName}`);
        }
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
            ).then((segments) => {
                const mismatchedSegments = segments.filter(
                    (segment) =>
                        segment?.project && segment.project !== projectId,
                );
                if (mismatchedSegments.length > 0) {
                    throw new BadDataError(
                        `The segments ${mismatchedSegments.map((s) => `${s.name} with id ${s.id}`).join(',')} does not belong to project "${projectId}"`,
                    );
                }
            });
        }
    }

    async validateStrategyLimit(featureEnv: {
        projectId: string;
        environment: string;
        featureName: string;
    }) {
        const { featureEnvironmentStrategies: limit } =
            await this.resourceLimitsService.getResourceLimits();
        const existingCount = (
            await this.featureStrategiesStore.getStrategiesForFeatureEnv(
                featureEnv.projectId,
                featureEnv.featureName,
                featureEnv.environment,
            )
        ).length;
        if (existingCount >= limit) {
            throwExceedsLimitError(this.eventBus, {
                resource: 'strategy',
                limit,
            });
        }
    }

    private async validateConstraintsLimit(constraints: {
        updated: IConstraint[];
        existing: IConstraint[];
    }) {
        const {
            constraints: constraintsLimit,
            constraintValues: constraintValuesLimit,
        } = await this.resourceLimitsService.getResourceLimits();

        if (
            constraints.updated.length > constraintsLimit &&
            constraints.updated.length > constraints.existing.length
        ) {
            throwExceedsLimitError(this.eventBus, {
                resource: 'constraints',
                limit: constraintsLimit,
            });
        }

        const isSameLength =
            constraints.existing.length === constraints.updated.length;
        const constraintOverLimit = constraints.updated.find(
            (constraint, i) => {
                const updatedCount = constraint.values?.length ?? 0;
                const existingCount =
                    constraints.existing[i]?.values?.length ?? 0;

                const isOverLimit =
                    Array.isArray(constraint.values) &&
                    updatedCount > constraintValuesLimit;
                const allowAnyway =
                    isSameLength && existingCount >= updatedCount;

                return isOverLimit && !allowAnyway;
            },
        );

        if (constraintOverLimit) {
            throwExceedsLimitError(this.eventBus, {
                resource: `constraint values for ${constraintOverLimit.contextName}`,
                limit: constraintValuesLimit,
                resourceNameOverride: 'constraint values',
            });
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

        if (await this.contextFieldStore.exists(constraint.contextName)) {
            const contextDefinition = await this.contextFieldStore.get(
                constraint.contextName,
            );

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
        }

        return constraint;
    }

    async patchFeature(
        project: string,
        featureName: string,
        operations: Operation[],
        auditUser: IAuditUser,
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
            featureName,
            auditUser,
        );

        if (featureToggle.stale !== newDocument.stale) {
            await this.eventService.storeEvent(
                new FeatureStaleEvent({
                    stale: newDocument.stale,
                    project,
                    featureName,
                    auditUser,
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
        auditUser: IAuditUser,
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
            auditUser,
        );
    }

    async unprotectedUpdateStrategiesSortOrder(
        context: IFeatureStrategyContext,
        sortOrders: SetStrategySortOrderSchema,
        auditUser: IAuditUser,
    ): Promise<Saved<any>> {
        const { featureName, environment, projectId: project } = context;
        const existingOrder = (
            await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            )
        )
            .sort(sortStrategies)
            .map((strategy) => strategy.id);

        const eventPreData: StrategyIds = { strategyIds: existingOrder };

        await Promise.all(
            sortOrders.map(({ id, sortOrder }) =>
                this.featureStrategiesStore.updateSortOrder(id, sortOrder),
            ),
        );
        const newOrder = (
            await this.getStrategiesForEnvironment(
                project,
                featureName,
                environment,
            )
        )
            .sort(sortStrategies)
            .map((strategy) => strategy.id);

        const eventData: StrategyIds = { strategyIds: newOrder };

        const event = new StrategiesOrderChangedEvent({
            featureName,
            environment,
            project,
            preData: eventPreData,
            data: eventData,
            auditUser,
        });
        await this.eventService.storeEvent(event);
    }

    async createStrategy(
        strategyConfig: Unsaved<IStrategyConfig>,
        context: IFeatureStrategyContext,
        auditUser: IAuditUser,
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
            auditUser,
        );
    }

    private async parametersWithDefaults(
        projectId: string,
        featureName: string,
        strategyName: string,
        params: IFeatureStrategy['parameters'] | undefined,
    ) {
        if (strategyName === 'flexibleRollout') {
            const stickiness =
                !params?.stickiness || params?.stickiness === ''
                    ? await this.featureStrategiesStore.getDefaultStickiness(
                          projectId,
                      )
                    : params?.stickiness;
            return {
                ...params,
                rollout: params?.rollout ?? '100',
                stickiness,
                groupId: params?.groupId ?? featureName,
            };
        } else {
            // We don't really have good defaults for the other kinds of known strategies, so return an empty map.
            return params ?? {};
        }
    }
    private async standardizeStrategyConfig(
        projectId: string,
        featureName: string,
        strategyConfig: Unsaved<IStrategyConfig>,
        existing?: IFeatureStrategy,
    ): Promise<
        { name: string } & Pick<
            Partial<IStrategyConfig>,
            | 'title'
            | 'disabled'
            | 'variants'
            | 'sortOrder'
            | 'constraints'
            | 'parameters'
        >
    > {
        const { name, title, disabled, sortOrder } = strategyConfig;
        let { constraints, parameters, variants } = strategyConfig;
        if (constraints && constraints.length > 0) {
            await this.validateConstraintsLimit({
                updated: constraints,
                existing: existing?.constraints ?? [],
            });
            constraints = await this.validateConstraints(constraints);
        }

        parameters = await this.parametersWithDefaults(
            projectId,
            featureName,
            name,
            strategyConfig.parameters,
        );
        if (variants && variants.length > 0) {
            await variantsArraySchema.validateAsync(variants);
            const fixedVariants = this.fixVariantWeights(variants);
            variants = fixedVariants;

            if (
                this.flagResolver.isEnabled('jsonSchemaValidation') &&
                this.projectJsonSchemaService
            ) {
                for (const variant of variants) {
                    if (
                        variant.payload?.type === 'json' &&
                        variant.jsonSchemaId
                    ) {
                        await this.projectJsonSchemaService.validatePayloadAgainstSchema(
                            variant.jsonSchemaId,
                            variant.payload.value,
                        );
                    }
                }
            }
        }

        return {
            name,
            title,
            disabled,
            sortOrder,
            constraints,
            variants,
            parameters,
        };
    }
    async unprotectedCreateStrategy(
        strategyConfig: Unsaved<IStrategyConfig>,
        context: IFeatureStrategyContext,
        auditUser: IAuditUser,
    ): Promise<Saved<IStrategyConfig>> {
        const { featureName, projectId, environment } = context;
        await this.validateFeatureBelongsToProject(context);

        await this.validateStrategyType(strategyConfig.name);
        await this.validateProjectCanAccessSegments(
            projectId,
            strategyConfig.segments,
        );

        const standardizedConfig = await this.standardizeStrategyConfig(
            projectId,
            featureName,
            strategyConfig,
        );

        await this.validateStrategyLimit({
            featureName,
            projectId,
            environment,
        });

        try {
            const newFeatureStrategy =
                await this.featureStrategiesStore.createStrategyFeatureEnv({
                    ...standardizedConfig,
                    strategyName: standardizedConfig.name,
                    constraints: standardizedConfig.constraints || [],
                    variants: standardizedConfig.variants || [],
                    parameters: standardizedConfig.parameters || {},
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
                    environment,
                    data: strategy,
                    auditUser,
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
     * @param auditUser - Audit info about the user performing the update
     * @param user - Optional User object performing the action
     */
    async updateStrategy(
        id: string,
        updates: Partial<IStrategyConfig>,
        context: IFeatureStrategyContext,
        auditUser: IAuditUser,
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
            auditUser,
            user,
        );
    }

    async optionallyDisableFeature(
        featureName: string,
        environment: string,
        projectId: string,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<void> {
        const strategies =
            await this.featureStrategiesStore.getStrategiesForFeatureEnv(
                projectId,
                featureName,
                environment,
            );
        const hasOnlyDisabledStrategies = strategies.every(
            (strategy) => strategy.disabled,
        );
        if (hasOnlyDisabledStrategies) {
            await this.unprotectedUpdateEnabled(
                projectId,
                featureName,
                environment,
                false,
                auditUser,
                user,
            );
        }
    }

    async unprotectedUpdateStrategy(
        id: string,
        updates: Partial<IStrategyConfig>,
        context: IFeatureStrategyContext,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<Saved<IStrategyConfig>> {
        const { projectId, environment, featureName } = context;
        const existingStrategy = await this.featureStrategiesStore.get(id);
        if (existingStrategy === undefined) {
            throw new NotFoundError(`Could not find strategy with id ${id}`);
        }
        this.validateUpdatedProperties(context, existingStrategy);
        await this.validateStrategyType(updates.name);
        await this.validateProjectCanAccessSegments(
            projectId,
            updates.segments,
        );
        const existingSegments = await this.segmentService.getByStrategy(id);

        if (existingStrategy.id === id) {
            const standardizedUpdates = await this.standardizeStrategyConfig(
                projectId,
                featureName,
                { ...updates, name: updates.name! },
                existingStrategy,
            );
            const strategy = await this.featureStrategiesStore.updateStrategy(
                id,
                standardizedUpdates,
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
                    data,
                    preData,
                    auditUser,
                }),
            );
            await this.optionallyDisableFeature(
                featureName,
                environment,
                projectId,
                auditUser,
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
        auditUser: IAuditUser,
    ): Promise<Saved<IStrategyConfig>> {
        const { projectId, environment, featureName } = context;

        const existingStrategy = await this.featureStrategiesStore.get(id);
        if (existingStrategy === undefined) {
            throw new NotFoundError(`Could not find strategy with id ${id}`);
        }
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
                    data,
                    preData,
                    auditUser,
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
     * @param auditUser - Audit information about user performing the action (userid, username, ip)
     * @param user
     */
    async deleteStrategy(
        id: string,
        context: IFeatureStrategyContext,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );
        return this.unprotectedDeleteStrategy(id, context, auditUser);
    }

    async unprotectedDeleteStrategy(
        id: string,
        context: IFeatureStrategyContext,
        auditUser: IAuditUser,
    ): Promise<void> {
        const existingStrategy = await this.featureStrategiesStore.get(id);
        if (!existingStrategy) {
            // If the strategy doesn't exist, do nothing.
            return;
        }
        const { featureName, projectId, environment } = context;
        this.validateUpdatedProperties(context, existingStrategy);

        await this.featureStrategiesStore.delete(id);

        // Disable the feature in the environment if it only has disabled strategies
        await this.optionallyDisableFeature(
            featureName,
            environment,
            projectId,
            auditUser,
        );

        const preData = this.featureStrategyToPublic(existingStrategy);

        await this.eventService.storeEvent(
            new FeatureStrategyRemoveEvent({
                featureName,
                project: projectId,
                environment,
                auditUser,
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
                    milestoneId: strat.milestoneId,
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
    }: IGetFeatureParams): Promise<FeatureToggleView> {
        if (projectId) {
            await this.validateFeatureBelongsToProject({
                featureName,
                projectId,
            });
        }

        let dependencies: IDependency[] = [];
        let children: string[] = [];
        let lifecycle: IFeatureLifecycleStage | undefined;
        let collaborators: Collaborator[] = [];
        let links: IFeatureLink[] = [];
        [dependencies, children, lifecycle, collaborators, links] =
            await Promise.all([
                this.dependentFeaturesReadModel.getParents(featureName),
                this.dependentFeaturesReadModel.getChildren([featureName]),
                this.featureLifecycleReadModel.findCurrentStage(featureName),
                this.featureCollaboratorsReadModel.getFeatureCollaborators(
                    featureName,
                ),
                this.featureLinksReadModel.getLinks(featureName),
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
                lifecycle,
                links: links.map((link) => ({
                    id: link.id,
                    url: link.url,
                    title: link.title ?? null,
                })),
                collaborators: { users: collaborators },
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
                lifecycle,
                links,
                collaborators: { users: collaborators },
            };
        }
    }

    async getVariantsForEnv(
        featureName: string,
        environment: string,
    ): Promise<IVariant[]> {
        const featureEnvironment = await this.featureEnvironmentStore.get({
            featureName,
            environment,
        });
        return featureEnvironment?.variants || [];
    }

    async getFeatureMetadata(featureName: string): Promise<FeatureToggle> {
        const metaData = await this.featureToggleStore.get(featureName);
        if (metaData === undefined) {
            throw new NotFoundError(
                `Could find metadata for feature with name ${featureName}`,
            );
        }
        return metaData;
    }

    async getClientFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const result = await this.clientFeatureToggleStore.getFrontendApiClient(
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
                stale: stale || false,
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

    private async validateFeatureFlagLimit() {
        const currentFlagCount = await this.featureToggleStore.count();
        const { featureFlags: limit } =
            await this.resourceLimitsService.getResourceLimits();
        if (currentFlagCount >= limit) {
            throwExceedsLimitError(this.eventBus, {
                resource: 'feature flag',
                limit,
            });
        }
    }

    private async validateActiveProject(projectId: string) {
        const hasActiveProject =
            await this.projectStore.hasActiveProject(projectId);
        if (!hasActiveProject) {
            throw new NotFoundError(
                `Active project with id ${projectId} does not exist`,
            );
        }
    }

    async createFeatureToggle(
        projectId: string,
        value: FeatureToggleDTO,
        auditUser: IAuditUser,
        isValidated: boolean = false,
    ): Promise<FeatureToggle> {
        this.logger.info(
            `${auditUser.username} creates feature flag ${value.name}`,
        );
        await this.validateName(value.name);
        await this.validateFeatureFlagNameAgainstPattern(value.name, projectId);

        const projectExists =
            await this.projectStore.hasActiveProject(projectId);

        if (await this.projectStore.isFeatureLimitReached(projectId)) {
            throw new InvalidOperationError(
                'You have reached the maximum number of feature flags for this project.',
            );
        }

        await this.validateFeatureFlagLimit();

        if (projectExists) {
            let featureData: FeatureToggleInsert;
            if (isValidated) {
                featureData = { createdByUserId: auditUser.id, ...value };
            } else {
                const validated =
                    await featureMetadataSchema.validateAsync(value);
                featureData = {
                    createdByUserId: auditUser.id,
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

            if (value.tags && value.tags.length > 0) {
                const mapTagsToFeatureTagInserts = value.tags.map((tag) => ({
                    tagValue: tag.value,
                    tagType: tag.type,
                    createdByUserId: auditUser.id,
                    featureName: featureName,
                }));
                await this.tagStore.tagFeatures(mapTagsToFeatureTagInserts);
            }

            await this.eventService.storeEvent(
                new FeatureCreatedEvent({
                    featureName,
                    project: projectId,
                    data: createdToggle,
                    auditUser,
                }),
            );

            await this.addLinksFromTemplates(projectId, featureName, auditUser);

            return createdToggle;
        }
        throw new NotFoundError(
            `Active project with id ${projectId} does not exist`,
        );
    }

    async checkFeatureFlagNamesAgainstProjectPattern(
        projectId: string,
        featureNames: string[],
    ): Promise<FeatureNameCheckResultWithFeaturePattern> {
        try {
            const project = await this.projectStore.get(projectId);
            if (project === undefined) {
                throw new NotFoundError(
                    `Could not find project with id: ${projectId}`,
                );
            }
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
        auditUser: IAuditUser,
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
            `${auditUser.username} clones feature flag ${featureName} to ${newFeatureName}`,
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
            auditUser,
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
                return this.createStrategy(s, context, auditUser);
            }),
        );

        const cloneDependencies =
            this.dependentFeaturesService.cloneDependencies(
                {
                    featureName,
                    newFeatureName,
                    projectId,
                },
                auditUser,
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
        featureName: string,
        auditUser: IAuditUser,
    ): Promise<FeatureToggle> {
        await this.validateFeatureBelongsToProject({
            featureName,
            projectId,
        });

        this.logger.info(
            `${auditUser.username} updates feature flag ${featureName}`,
        );

        const featureData =
            await featureMetadataSchema.validateAsync(updatedFeature);

        const preData = await this.featureToggleStore.get(featureName);

        const featureToggle = await this.featureToggleStore.update(projectId, {
            ...featureData,
            name: featureName,
        });
        if (preData === undefined) {
            throw new NotFoundError(
                `Could find feature toggle with name ${featureName}`,
            );
        }
        await this.eventService.storeEvent(
            new FeatureMetadataUpdateEvent({
                auditUser,
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
            if (feature === undefined) {
                return;
            }
            msg = feature.archived
                ? 'An archived flag with that name already exists'
                : 'A flag with that name already exists';
        } catch (_error) {
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
        auditUser: IAuditUser,
    ): Promise<any> {
        const feature = await this.featureToggleStore.get(featureName);
        if (feature === undefined) {
            throw new NotFoundError(
                `Could not find feature with name: ${featureName}`,
            );
        }
        const { project } = feature;
        feature.stale = isStale;
        await this.featureToggleStore.update(project, feature);

        await this.eventService.storeEvent(
            new FeatureStaleEvent({
                stale: isStale,
                project,
                featureName,
                auditUser,
            }),
        );

        return feature;
    }

    async archiveToggle(
        featureName: string,
        user: IUser,
        auditUser: IAuditUser,
        projectId?: string,
    ): Promise<void> {
        if (projectId) {
            await this.stopWhenChangeRequestsEnabled(
                projectId,
                undefined,
                user,
            );
        }
        await this.unprotectedArchiveToggle(featureName, auditUser, projectId);
    }

    async unprotectedArchiveToggle(
        featureName: string,
        auditUser: IAuditUser,
        projectId?: string,
    ): Promise<void> {
        const feature = await this.featureToggleStore.get(featureName);
        if (feature === undefined) {
            throw new NotFoundError(
                `Could not find feature with name ${featureName}`,
            );
        }
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
                auditUser,
            );
        }

        await this.eventService.storeEvent(
            new FeatureArchivedEvent({
                featureName,
                auditUser,
                project: feature.project,
            }),
        );
    }

    async archiveToggles(
        featureNames: string[],
        user: IUser,
        auditUser: IAuditUser,
        projectId: string,
    ): Promise<void> {
        await this.stopWhenChangeRequestsEnabled(projectId, undefined, user);
        await this.unprotectedArchiveToggles(
            featureNames,
            projectId,
            auditUser,
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
        projectId: string,
        auditUser: IAuditUser,
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
            auditUser,
        );

        await this.eventService.storeEvents(
            features.map(
                (feature) =>
                    new FeatureArchivedEvent({
                        featureName: feature.name,
                        project: feature.project,
                        auditUser,
                    }),
            ),
        );
    }

    async setToggleStaleness(
        featureNames: string[],
        stale: boolean,
        projectId: string,
        auditUser: IAuditUser,
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
                        auditUser,
                    }),
            ),
        );
    }

    async bulkUpdateEnabled(
        project: string,
        featureNames: string[],
        environment: string,
        enabled: boolean,
        auditUser: IAuditUser,
        user?: IUser,
        shouldActivateDisabledStrategies = false,
    ): Promise<void> {
        await allSettledWithRejection(
            featureNames.map((featureName) =>
                this.updateEnabled(
                    project,
                    featureName,
                    environment,
                    enabled,
                    auditUser,
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
        auditUser: IAuditUser,
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
            auditUser,
            user,
            shouldActivateDisabledStrategies,
        );
    }

    async unprotectedUpdateEnabled(
        project: string,
        featureName: string,
        environment: string,
        enabled: boolean,
        auditUser: IAuditUser,
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
                            { ...strategy, disabled: false },
                            {
                                environment,
                                projectId: project,
                                featureName,
                            },
                            auditUser,
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
                    auditUser,
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
                    auditUser,
                }),
            );
        }
        return feature!; // If we get here we know the toggle exists
    }

    async changeProject(
        featureName: string,
        newProject: string,
        auditUser: IAuditUser,
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
        if (feature === undefined) {
            throw new NotFoundError(
                `Could not find feature with name ${featureName}`,
            );
        }
        const oldProject = feature.project;
        feature.project = newProject;
        await this.featureToggleStore.update(newProject, feature);

        await this.eventService.storeEvent(
            new FeatureChangeProjectEvent({
                auditUser,
                oldProject,
                newProject,
                featureName,
            }),
        );
    }

    // TODO: add project id.
    async deleteFeature(
        featureName: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.validateNoChildren(featureName);
        const toggle = await this.featureToggleStore.get(featureName);
        if (toggle === undefined) {
            return; /// Do nothing, toggle is already deleted
        }
        const tags = await this.tagStore.getAllTagsForFeature(featureName);
        await this.featureToggleStore.delete(featureName);

        await this.eventService.storeEvent(
            new FeatureDeletedEvent({
                featureName,
                project: toggle.project,
                auditUser,
                preData: toggle,
                tags,
            }),
        );
    }

    async deleteFeatures(
        featureNames: string[],
        projectId: string,
        auditUser: IAuditUser,
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

        if (eligibleFeatures.length === 0) {
            return;
        }

        const tags = await this.tagStore.getAllByFeatures(eligibleFeatureNames);
        await this.featureToggleStore.batchDelete(eligibleFeatureNames);

        await this.eventService.storeEvents(
            eligibleFeatures.map(
                (feature) =>
                    new FeatureDeletedEvent({
                        featureName: feature.name,
                        auditUser,
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
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.validateActiveProject(projectId);
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
                        auditUser,
                        project: feature.project,
                    }),
            ),
        );
    }

    // TODO: add project id.
    async reviveFeature(
        featureName: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const feature = await this.featureToggleStore.get(featureName);
        if (!feature) {
            throw new NotFoundError(`Feature ${featureName} does not exist`);
        }
        await this.validateActiveProject(feature.project);
        const toggle = await this.featureToggleStore.revive(featureName);
        await this.featureToggleStore.disableAllEnvironmentsForFeatures([
            featureName,
        ]);
        await this.eventService.storeEvent(
            new FeatureRevivedEvent({
                auditUser,
                featureName,
                project: toggle.project,
            }),
        );
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
        auditUser: IAuditUser,
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
                auditUser,
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
        auditUser: IAuditUser,
    ): Promise<IVariant[]> {
        const oldVariants = await this.getVariantsForEnv(
            featureName,
            environment,
        );

        try {
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
                auditUser,
                oldVariants,
            );
        } catch (e) {
            throw new BadDataError(
                `Could not apply provided patch: ${e.message}`,
            );
        }
    }

    async saveVariants(
        featureName: string,
        project: string,
        newVariants: IVariant[],
        auditUser: IAuditUser,
    ): Promise<FeatureToggle> {
        await variantsArraySchema.validateAsync(newVariants);
        const fixedVariants = this.fixVariantWeights(newVariants);
        const environments =
            await this.featureEnvironmentStore.getEnvironmentsForFeature(
                featureName,
            );
        for (const env of environments) {
            const oldVariants = env.variants || [];
            await this.featureEnvironmentStore.setVariantsToFeatureEnvironments(
                featureName,
                [env.environment],
                fixedVariants,
            );
            await this.eventService.storeEvent(
                new EnvironmentVariantEvent({
                    project,
                    environment: env.environment,
                    featureName,
                    auditUser,
                    oldVariants,
                    newVariants: fixedVariants,
                }),
            );
        }

        const toggle = await this.featureToggleStore.get(featureName);
        return toggle!;
    }

    private async verifyLegacyVariants(featureName: string) {
        const existingLegacyVariantsExist =
            await this.featureEnvironmentStore.variantExists(featureName);
        const enableLegacyVariants = this.flagResolver.isEnabled(
            'enableLegacyVariants',
        );
        const useLegacyVariants =
            existingLegacyVariantsExist || enableLegacyVariants;
        if (!useLegacyVariants) {
            throw new InvalidOperationError(
                `Environment variants deprecated for feature: ${featureName}. Use strategy variants instead.`,
            );
        }
    }

    async saveVariantsOnEnv(
        projectId: string,
        featureName: string,
        environment: string,
        newVariants: IVariant[],
        auditUser: IAuditUser,
        oldVariants?: IVariant[],
    ): Promise<IVariant[]> {
        await this.verifyLegacyVariants(featureName);
        return this.legacySaveVariantsOnEnv(
            projectId,
            featureName,
            environment,
            newVariants,
            auditUser,
            oldVariants,
        );
    }

    async legacySaveVariantsOnEnv(
        projectId: string,
        featureName: string,
        environment: string,
        newVariants: IVariant[],
        auditUser: IAuditUser,
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
            )?.variants ||
            [];

        await this.eventService.storeEvent(
            new EnvironmentVariantEvent({
                featureName,
                environment,
                project: projectId,
                oldVariants: theOldVariants,
                newVariants: fixedVariants,
                auditUser,
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
        auditUser: IAuditUser,
        oldVariants?: IVariant[],
    ): Promise<IVariant[]> {
        await this.stopWhenChangeRequestsEnabled(projectId, environment, user);
        return this.saveVariantsOnEnv(
            projectId,
            featureName,
            environment,
            newVariants,
            auditUser,
            oldVariants,
        );
    }

    async crProtectedSetVariantsOnEnvs(
        projectId: string,
        featureName: string,
        environments: string[],
        newVariants: IVariant[],
        _user: IUser,
        auditUser: IAuditUser,
    ): Promise<IVariant[]> {
        for (const env of environments) {
            await this.stopWhenChangeRequestsEnabled(projectId, env);
        }
        return this.setVariantsOnEnvs(
            projectId,
            featureName,
            environments,
            newVariants,
            auditUser,
        );
    }

    async setVariantsOnEnvs(
        projectId: string,
        featureName: string,
        environments: string[],
        newVariants: IVariant[],
        auditUser: IAuditUser,
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
            oldVariants[env] = featureEnv?.variants || [];
        }

        await this.eventService.storeEvents(
            environments.map(
                (environment) =>
                    new EnvironmentVariantEvent({
                        featureName,
                        environment,
                        project: projectId,
                        oldVariants: oldVariants[environment],
                        newVariants: fixedVariants,
                        auditUser,
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
                    throw new PermissionError(
                        CREATE_FEATURE_STRATEGY,
                        environment,
                    );
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
                                auditUser: SYSTEM_USER_AUDIT,
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

    async addLinksFromTemplates(
        projectId: string,
        featureName: string,
        auditUser: IAuditUser,
    ) {
        const featureLinksFromTemplates = (
            await this.projectStore.getProjectLinkTemplates(projectId)
        ).map((template) => ({
            title: template.title,
            url: template.urlTemplate
                .replace(/{{project}}/g, projectId)
                .replace(/{{feature}}/g, featureName),
            featureName,
        }));

        return Promise.all(
            featureLinksFromTemplates.map((link) =>
                this.featureLinkService.createLink(projectId, link, auditUser),
            ),
        );
    }
}
