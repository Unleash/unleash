import { IUnleashConfig } from '../types/option';
import {
    FeatureToggleDTO,
    IFeatureStrategy,
    IFeatureStrategySegment,
    IVariant,
} from '../types/model';
import { Logger } from '../logger';
import { IFeatureTagStore } from '../types/stores/feature-tag-store';
import { ITagTypeStore } from '../types/stores/tag-type-store';
import { IEventStore } from '../types/stores/event-store';
import { IStrategy } from '../types/stores/strategy-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IContextFieldStore, IUnleashStores } from '../types/stores';
import { ISegmentStore } from '../types/stores/segment-store';
import { ExportQuerySchema } from '../openapi/spec/export-query-schema';
import {
    CREATE_CONTEXT_FIELD,
    CREATE_FEATURE,
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE_STRATEGY,
    FEATURES_EXPORTED,
    FEATURES_IMPORTED,
    IFlagResolver,
    IUnleashServices,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_TAG_TYPE,
    WithRequired,
} from '../types';
import {
    ExportResultSchema,
    FeatureStrategySchema,
    ImportTogglesValidateItemSchema,
    ImportTogglesValidateSchema,
} from '../openapi';
import { ImportTogglesSchema } from '../openapi/spec/import-toggles-schema';
import User from '../types/user';
import { IContextFieldDto } from '../types/stores/context-field-store';
import { BadDataError, InvalidOperationError } from '../error';
import { extractUsernameFromUser } from '../util';
import {
    AccessService,
    ContextService,
    FeatureTagService,
    FeatureToggleService,
    StrategyService,
    TagTypeService,
} from '../services';
import { isValidField } from './import-context-validation';
import { IImportTogglesStore } from './import-toggles-store-type';

export default class ExportImportService {
    private logger: Logger;

    private toggleStore: IFeatureToggleStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private eventStore: IEventStore;

    private importTogglesStore: IImportTogglesStore;

    private tagTypeStore: ITagTypeStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private featureTagStore: IFeatureTagStore;

    private segmentStore: ISegmentStore;

    private flagResolver: IFlagResolver;

    private featureToggleService: FeatureToggleService;

    private contextFieldStore: IContextFieldStore;

    private strategyService: StrategyService;

    private contextService: ContextService;

    private accessService: AccessService;

    private tagTypeService: TagTypeService;

    private featureTagService: FeatureTagService;

    constructor(
        stores: Pick<
            IUnleashStores,
            | 'importTogglesStore'
            | 'eventStore'
            | 'featureStrategiesStore'
            | 'featureToggleStore'
            | 'featureEnvironmentStore'
            | 'tagTypeStore'
            | 'featureTagStore'
            | 'segmentStore'
            | 'contextFieldStore'
        >,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        {
            featureToggleService,
            strategyService,
            contextService,
            accessService,
            tagTypeService,
            featureTagService,
        }: Pick<
            IUnleashServices,
            | 'featureToggleService'
            | 'strategyService'
            | 'contextService'
            | 'accessService'
            | 'tagTypeService'
            | 'featureTagService'
        >,
    ) {
        this.eventStore = stores.eventStore;
        this.toggleStore = stores.featureToggleStore;
        this.importTogglesStore = stores.importTogglesStore;
        this.featureStrategiesStore = stores.featureStrategiesStore;
        this.featureEnvironmentStore = stores.featureEnvironmentStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.featureTagStore = stores.featureTagStore;
        this.segmentStore = stores.segmentStore;
        this.flagResolver = flagResolver;
        this.featureToggleService = featureToggleService;
        this.contextFieldStore = stores.contextFieldStore;
        this.strategyService = strategyService;
        this.contextService = contextService;
        this.accessService = accessService;
        this.tagTypeService = tagTypeService;
        this.featureTagService = featureTagService;
        this.logger = getLogger('services/state-service.js');
    }

    async validate(
        dto: ImportTogglesSchema,
        user: User,
    ): Promise<ImportTogglesValidateSchema> {
        const [
            unsupportedStrategies,
            usedCustomStrategies,
            unsupportedContextFields,
            archivedFeatures,
            otherProjectFeatures,
            missingPermissions,
        ] = await Promise.all([
            this.getUnsupportedStrategies(dto),
            this.getUsedCustomStrategies(dto),
            this.getUnsupportedContextFields(dto),
            this.getArchivedFeatures(dto),
            this.getOtherProjectFeatures(dto),
            this.getMissingPermissions(dto, user),
        ]);

        const errors = this.compileErrors(
            dto.project,
            unsupportedStrategies,
            otherProjectFeatures,
            unsupportedContextFields,
        );
        const warnings = this.compileWarnings(
            usedCustomStrategies,
            archivedFeatures,
        );
        const permissions = this.compilePermissionErrors(missingPermissions);

        return {
            errors,
            warnings,
            permissions,
        };
    }

    async import(dto: ImportTogglesSchema, user: User): Promise<void> {
        const cleanedDto = await this.cleanData(dto);

        await Promise.all([
            this.verifyStrategies(cleanedDto),
            this.verifyContextFields(cleanedDto),
            this.verifyPermissions(dto, user),
            this.verifyFeatures(dto),
        ]);
        await this.createToggles(cleanedDto, user);
        await this.importToggleVariants(dto, user);
        await this.importTagTypes(cleanedDto, user);
        await this.importTags(cleanedDto, user);
        await this.importContextFields(dto, user);

        await this.importDefault(cleanedDto, user);
        await this.eventStore.store({
            project: cleanedDto.project,
            environment: cleanedDto.environment,
            type: FEATURES_IMPORTED,
            createdBy: extractUsernameFromUser(user),
        });
    }

    private async importDefault(dto: ImportTogglesSchema, user: User) {
        await this.deleteStrategies(dto);
        await this.importStrategies(dto, user);
        await this.importToggleStatuses(dto, user);
    }

    private async importToggleStatuses(dto: ImportTogglesSchema, user: User) {
        await Promise.all(
            dto.data.featureEnvironments?.map((featureEnvironment) =>
                this.featureToggleService.updateEnabled(
                    dto.project,
                    featureEnvironment.name,
                    dto.environment,
                    featureEnvironment.enabled,
                    extractUsernameFromUser(user),
                    user,
                ),
            ),
        );
    }

    private async importStrategies(dto: ImportTogglesSchema, user: User) {
        const hasFeatureName = (
            featureStrategy: FeatureStrategySchema,
        ): featureStrategy is WithRequired<
            FeatureStrategySchema,
            'featureName'
        > => Boolean(featureStrategy.featureName);
        await Promise.all(
            dto.data.featureStrategies
                ?.filter(hasFeatureName)
                .map((featureStrategy) =>
                    this.featureToggleService.createStrategy(
                        {
                            name: featureStrategy.name,
                            constraints: featureStrategy.constraints,
                            parameters: featureStrategy.parameters,
                            segments: featureStrategy.segments,
                            sortOrder: featureStrategy.sortOrder,
                        },
                        {
                            featureName: featureStrategy.featureName,
                            environment: dto.environment,
                            projectId: dto.project,
                        },
                        extractUsernameFromUser(user),
                    ),
                ),
        );
    }

    private async deleteStrategies(dto: ImportTogglesSchema) {
        return this.importTogglesStore.deleteStrategiesForFeatures(
            dto.data.features.map((feature) => feature.name),
            dto.environment,
        );
    }

    private async importTags(dto: ImportTogglesSchema, user: User) {
        await this.importTogglesStore.deleteTagsForFeatures(
            dto.data.features.map((feature) => feature.name),
        );
        return Promise.all(
            dto.data.featureTags?.map((tag) =>
                this.featureTagService.addTag(
                    tag.featureName,
                    { type: tag.tagType, value: tag.tagValue },
                    extractUsernameFromUser(user),
                ),
            ),
        );
    }

    private async importContextFields(dto: ImportTogglesSchema, user: User) {
        const newContextFields = (await this.getNewContextFields(dto)) || [];
        await Promise.all(
            newContextFields.map((contextField) =>
                this.contextService.createContextField(
                    {
                        name: contextField.name,
                        description: contextField.description,
                        legalValues: contextField.legalValues,
                        stickiness: contextField.stickiness,
                    },
                    extractUsernameFromUser(user),
                ),
            ),
        );
    }

    private async importTagTypes(dto: ImportTogglesSchema, user: User) {
        const newTagTypes = await this.getNewTagTypes(dto);
        return Promise.all(
            newTagTypes.map((tagType) =>
                this.tagTypeService.createTagType(
                    tagType,
                    extractUsernameFromUser(user),
                ),
            ),
        );
    }

    private async importToggleVariants(dto: ImportTogglesSchema, user: User) {
        const featureEnvsWithVariants =
            dto.data.featureEnvironments?.filter(
                (featureEnvironment) =>
                    Array.isArray(featureEnvironment.variants) &&
                    featureEnvironment.variants.length > 0,
            ) || [];
        await Promise.all(
            featureEnvsWithVariants.map((featureEnvironment) =>
                this.featureToggleService.saveVariantsOnEnv(
                    dto.project,
                    featureEnvironment.featureName,
                    dto.environment,
                    featureEnvironment.variants as IVariant[],
                    user,
                ),
            ),
        );
    }

    private async createToggles(dto: ImportTogglesSchema, user: User) {
        await Promise.all(
            dto.data.features.map((feature) =>
                this.featureToggleService
                    .validateName(feature.name)
                    .then(() => {
                        const { archivedAt, createdAt, ...rest } = feature;
                        return this.featureToggleService.createFeatureToggle(
                            dto.project,
                            rest as FeatureToggleDTO,
                            extractUsernameFromUser(user),
                        );
                    })
                    .catch(() => {}),
            ),
        );
    }

    private async verifyContextFields(dto: ImportTogglesSchema) {
        const unsupportedContextFields = await this.getUnsupportedContextFields(
            dto,
        );
        if (
            Array.isArray(unsupportedContextFields) &&
            unsupportedContextFields.length > 0
        ) {
            throw new BadDataError(
                `Context fields with errors: ${unsupportedContextFields
                    .map((field) => field.name)
                    .join(', ')}`,
            );
        }
    }

    private async verifyPermissions(dto: ImportTogglesSchema, user: User) {
        const missingPermissions = await this.getMissingPermissions(dto, user);
        if (missingPermissions.length > 0) {
            throw new InvalidOperationError(
                'You are missing permissions to import',
            );
        }
    }

    private async verifyFeatures(dto: ImportTogglesSchema) {
        const otherProjectFeatures = await this.getOtherProjectFeatures(dto);
        if (otherProjectFeatures.length > 0) {
            throw new BadDataError(
                `These features exist already in other projects: ${otherProjectFeatures.join(
                    ', ',
                )}`,
            );
        }
    }

    private async cleanData(dto: ImportTogglesSchema) {
        const removedFeaturesDto = await this.removeArchivedFeatures(dto);
        const remappedDto = this.remapSegments(removedFeaturesDto);
        return remappedDto;
    }

    private async remapSegments(dto: ImportTogglesSchema) {
        return {
            ...dto,
            data: {
                ...dto.data,
                featureStrategies: dto.data.featureStrategies.map(
                    (strategy) => ({
                        ...strategy,
                        segments: [],
                    }),
                ),
            },
        };
    }

    private async removeArchivedFeatures(dto: ImportTogglesSchema) {
        const archivedFeatures = await this.getArchivedFeatures(dto);
        const featureTags =
            dto.data.featureTags?.filter(
                (tag) => !archivedFeatures.includes(tag.featureName),
            ) || [];
        return {
            ...dto,
            data: {
                ...dto.data,
                features: dto.data.features.filter(
                    (feature) => !archivedFeatures.includes(feature.name),
                ),
                featureEnvironments: dto.data.featureEnvironments?.filter(
                    (environment) =>
                        environment.featureName &&
                        !archivedFeatures.includes(environment.featureName),
                ),
                featureStrategies: dto.data.featureStrategies.filter(
                    (strategy) =>
                        strategy.featureName &&
                        !archivedFeatures.includes(strategy.featureName),
                ),
                featureTags,
                tagTypes: dto.data.tagTypes?.filter((tagType) =>
                    featureTags
                        .map((tag) => tag.tagType)
                        .includes(tagType.name),
                ),
            },
        };
    }

    private async verifyStrategies(dto: ImportTogglesSchema) {
        const unsupportedStrategies = await this.getUnsupportedStrategies(dto);
        if (unsupportedStrategies.length > 0) {
            throw new BadDataError(
                `Unsupported strategies: ${unsupportedStrategies
                    .map((strategy) => strategy.name)
                    .join(', ')}`,
            );
        }
    }

    private compileErrors(
        projectName: string,
        strategies: FeatureStrategySchema[],
        otherProjectFeatures: string[],
        contextFields?: IContextFieldDto[],
    ) {
        const errors: ImportTogglesValidateItemSchema[] = [];

        if (strategies.length > 0) {
            errors.push({
                message:
                    'We detected the following custom strategy in the import file that needs to be created first:',
                affectedItems: strategies.map((strategy) => strategy.name),
            });
        }
        if (Array.isArray(contextFields) && contextFields.length > 0) {
            errors.push({
                message:
                    'We detected the following context fields that do not have matching legal values with the imported ones:',
                affectedItems: contextFields.map(
                    (contextField) => contextField.name,
                ),
            });
        }
        if (otherProjectFeatures.length > 0) {
            errors.push({
                message: `You cannot import a features that already exist in other projects. You already have the following features defined outside of project ${projectName}:`,
                affectedItems: otherProjectFeatures,
            });
        }

        return errors;
    }

    private compileWarnings(
        usedCustomStrategies: string[],
        archivedFeatures: string[],
    ) {
        const warnings: ImportTogglesValidateItemSchema[] = [];
        if (usedCustomStrategies.length > 0) {
            warnings.push({
                message:
                    'The following strategy types will be used in import. Please make sure the strategy type parameters are configured as in source environment:',
                affectedItems: usedCustomStrategies,
            });
        }
        if (archivedFeatures.length > 0) {
            warnings.push({
                message:
                    'The following features will not be imported as they are currently archived. To import them, please unarchive them first:',
                affectedItems: archivedFeatures,
            });
        }
        return warnings;
    }

    private compilePermissionErrors(missingPermissions: string[]) {
        const errors: ImportTogglesValidateItemSchema[] = [];
        if (missingPermissions.length > 0) {
            errors.push({
                message:
                    'We detected you are missing the following permissions:',
                affectedItems: missingPermissions,
            });
        }

        return errors;
    }

    private async getUnsupportedStrategies(
        dto: ImportTogglesSchema,
    ): Promise<FeatureStrategySchema[]> {
        const supportedStrategies = await this.strategyService.getStrategies();
        return dto.data.featureStrategies.filter(
            (featureStrategy) =>
                !supportedStrategies.find(
                    (strategy) => featureStrategy.name === strategy.name,
                ),
        );
    }

    private async getUsedCustomStrategies(dto: ImportTogglesSchema) {
        const supportedStrategies = await this.strategyService.getStrategies();
        const uniqueFeatureStrategies = [
            ...new Set(
                dto.data.featureStrategies.map((strategy) => strategy.name),
            ),
        ];
        return uniqueFeatureStrategies.filter(
            this.isCustomStrategy(supportedStrategies),
        );
    }

    isCustomStrategy = (
        supportedStrategies: IStrategy[],
    ): ((x: string) => boolean) => {
        const customStrategies = supportedStrategies
            .filter((s) => s.editable)
            .map((strategy) => strategy.name);
        return (featureStrategy) => customStrategies.includes(featureStrategy);
    };

    private async getUnsupportedContextFields(dto: ImportTogglesSchema) {
        const availableContextFields = await this.contextService.getAll();

        return dto.data.contextFields?.filter(
            (contextField) =>
                !isValidField(contextField, availableContextFields),
        );
    }

    private async getArchivedFeatures(dto: ImportTogglesSchema) {
        return this.importTogglesStore.getArchivedFeatures(
            dto.data.features.map((feature) => feature.name),
        );
    }

    private async getOtherProjectFeatures(dto: ImportTogglesSchema) {
        const otherProjectsFeatures =
            await this.importTogglesStore.getFeaturesInOtherProjects(
                dto.data.features.map((feature) => feature.name),
                dto.project,
            );
        return otherProjectsFeatures.map(
            (it) => `${it.name} (in project ${it.project})`,
        );
    }

    private async getMissingPermissions(
        dto: ImportTogglesSchema,
        user: User,
    ): Promise<string[]> {
        const [
            newTagTypes,
            newContextFields,
            strategiesExistForFeatures,
            featureEnvsWithVariants,
            existingFeatures,
        ] = await Promise.all([
            this.getNewTagTypes(dto),
            this.getNewContextFields(dto),
            this.importTogglesStore.strategiesExistForFeatures(
                dto.data.features.map((feature) => feature.name),
                dto.environment,
            ),
            dto.data.featureEnvironments?.filter(
                (featureEnvironment) =>
                    Array.isArray(featureEnvironment.variants) &&
                    featureEnvironment.variants.length > 0,
            ) || Promise.resolve([]),
            this.importTogglesStore.getExistingFeatures(
                dto.data.features.map((feature) => feature.name),
            ),
        ]);

        const permissions = [UPDATE_FEATURE];
        if (newTagTypes.length > 0) {
            permissions.push(UPDATE_TAG_TYPE);
        }

        if (Array.isArray(newContextFields) && newContextFields.length > 0) {
            permissions.push(CREATE_CONTEXT_FIELD);
        }

        if (strategiesExistForFeatures) {
            permissions.push(DELETE_FEATURE_STRATEGY);
        }

        if (dto.data.featureStrategies.length > 0) {
            permissions.push(CREATE_FEATURE_STRATEGY);
        }

        if (featureEnvsWithVariants.length > 0) {
            permissions.push(UPDATE_FEATURE_ENVIRONMENT_VARIANTS);
        }

        if (existingFeatures.length < dto.data.features.length) {
            permissions.push(CREATE_FEATURE);
        }

        const displayPermissions =
            await this.importTogglesStore.getDisplayPermissions(permissions);

        const results = await Promise.all(
            displayPermissions.map((permission) =>
                this.accessService
                    .hasPermission(
                        user,
                        permission.name,
                        dto.project,
                        dto.environment,
                    )
                    .then(
                        (hasPermission) => [permission, hasPermission] as const,
                    ),
            ),
        );
        return results
            .filter(([, hasAccess]) => !hasAccess)
            .map(([permission]) => permission.displayName);
    }

    private async getNewTagTypes(dto: ImportTogglesSchema) {
        const existingTagTypes = (await this.tagTypeService.getAll()).map(
            (tagType) => tagType.name,
        );
        const newTagTypes =
            dto.data.tagTypes?.filter(
                (tagType) => !existingTagTypes.includes(tagType.name),
            ) || [];
        const uniqueTagTypes = [
            ...new Map(newTagTypes.map((item) => [item.name, item])).values(),
        ];
        return uniqueTagTypes;
    }

    private async getNewContextFields(dto: ImportTogglesSchema) {
        const availableContextFields = await this.contextService.getAll();

        return dto.data.contextFields?.filter(
            (contextField) =>
                !availableContextFields.some(
                    (availableField) =>
                        availableField.name === contextField.name,
                ),
        );
    }

    async export(
        query: ExportQuerySchema,
        userName: string,
    ): Promise<ExportResultSchema> {
        const [
            features,
            featureEnvironments,
            featureStrategies,
            strategySegments,
            contextFields,
            featureTags,
            segments,
            tagTypes,
        ] = await Promise.all([
            this.toggleStore.getAllByNames(query.features),
            await this.featureEnvironmentStore.getAllByFeatures(
                query.features,
                query.environment,
            ),
            this.featureStrategiesStore.getAllByFeatures(
                query.features,
                query.environment,
            ),
            this.segmentStore.getAllFeatureStrategySegments(),
            this.contextFieldStore.getAll(),
            this.featureTagStore.getAllByFeatures(query.features),
            this.segmentStore.getAll(),
            this.tagTypeStore.getAll(),
        ]);
        this.addSegmentsToStrategies(featureStrategies, strategySegments);
        const filteredContextFields = contextFields.filter(
            (field) =>
                featureEnvironments.some((featureEnv) =>
                    featureEnv.variants?.some(
                        (variant) =>
                            variant.stickiness === field.name ||
                            variant.overrides?.some(
                                (override) =>
                                    override.contextName === field.name,
                            ),
                    ),
                ) ||
                featureStrategies.some(
                    (strategy) =>
                        strategy.parameters.stickiness === field.name ||
                        strategy.constraints.some(
                            (constraint) =>
                                constraint.contextName === field.name,
                        ),
                ),
        );
        const filteredSegments = segments.filter((segment) =>
            featureStrategies.some((strategy) =>
                strategy.segments?.includes(segment.id),
            ),
        );
        const filteredTagTypes = tagTypes.filter((tagType) =>
            featureTags.map((tag) => tag.tagType).includes(tagType.name),
        );
        const result = {
            features: features.map((item) => {
                const { createdAt, archivedAt, lastSeenAt, ...rest } = item;
                return rest;
            }),
            featureStrategies: featureStrategies.map((item) => {
                const name = item.strategyName;
                const {
                    createdAt,
                    projectId,
                    environment,
                    strategyName,
                    ...rest
                } = item;
                return {
                    name,
                    ...rest,
                };
            }),
            featureEnvironments: featureEnvironments.map((item) => ({
                ...item,
                name: item.featureName,
            })),
            contextFields: filteredContextFields.map((item) => {
                const { createdAt, ...rest } = item;
                return rest;
            }),
            featureTags,
            segments: filteredSegments.map((item) => {
                const { id, name } = item;
                return { id, name };
            }),
            tagTypes: filteredTagTypes,
        };
        await this.eventStore.store({
            type: FEATURES_EXPORTED,
            createdBy: userName,
            data: result,
        });

        return result;
    }

    addSegmentsToStrategies(
        featureStrategies: IFeatureStrategy[],
        strategySegments: IFeatureStrategySegment[],
    ): void {
        featureStrategies.forEach((featureStrategy) => {
            featureStrategy.segments = strategySegments
                .filter(
                    (segment) =>
                        segment.featureStrategyId === featureStrategy.id,
                )
                .map((segment) => segment.segmentId);
        });
    }
}

module.exports = ExportImportService;
