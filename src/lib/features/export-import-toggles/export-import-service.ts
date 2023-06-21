import { IUnleashConfig } from '../../types/option';
import {
    FeatureToggleDTO,
    IFeatureStrategy,
    IFeatureStrategySegment,
    IVariant,
} from '../../types/model';
import { Logger } from '../../logger';
import { IFeatureTagStore } from '../../types/stores/feature-tag-store';
import { ITagTypeStore } from '../../types/stores/tag-type-store';
import { IEventStore } from '../../types/stores/event-store';
import { IStrategy } from '../../types/stores/strategy-store';
import { IFeatureToggleStore } from '../../types/stores/feature-toggle-store';
import { IFeatureStrategiesStore } from '../../types/stores/feature-strategies-store';
import { IFeatureEnvironmentStore } from '../../types/stores/feature-environment-store';
import { IContextFieldStore, IUnleashStores } from '../../types/stores';
import { ISegmentStore } from '../../types/stores/segment-store';
import { ExportQuerySchema } from '../../openapi/spec/export-query-schema';
import {
    FEATURES_EXPORTED,
    FEATURES_IMPORTED,
    IFlagResolver,
    IUnleashServices,
    WithRequired,
} from '../../types';
import {
    ExportResultSchema,
    FeatureStrategySchema,
    ImportTogglesValidateSchema,
} from '../../openapi';
import { ImportTogglesSchema } from '../../openapi/spec/import-toggles-schema';
import User from '../../types/user';
import { BadDataError } from '../../error';
import { extractUsernameFromUser } from '../../util';
import {
    AccessService,
    ContextService,
    FeatureTagService,
    FeatureToggleService,
    StrategyService,
    TagTypeService,
} from '../../services';
import { isValidField } from './import-context-validation';
import { IImportTogglesStore } from './import-toggles-store-type';
import { ImportPermissionsService } from './import-permissions-service';
import { ImportValidationMessages } from './import-validation-messages';

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

    private importPermissionsService: ImportPermissionsService;

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
        this.importPermissionsService = new ImportPermissionsService(
            this.importTogglesStore,
            this.accessService,
            this.tagTypeService,
            this.contextService,
        );
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
            this.importPermissionsService.getMissingPermissions(
                dto,
                user,
                'regular',
            ),
        ]);

        const errors = ImportValidationMessages.compileErrors(
            dto.project,
            unsupportedStrategies,
            unsupportedContextFields || [],
            [],
            otherProjectFeatures,
            false,
        );
        const warnings = ImportValidationMessages.compileWarnings(
            usedCustomStrategies,
            archivedFeatures,
        );
        const permissions =
            ImportValidationMessages.compilePermissionErrors(
                missingPermissions,
            );

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
            this.importPermissionsService.verifyPermissions(
                dto,
                user,
                'regular',
            ),
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
            (dto.data.featureEnvironments || []).map((featureEnvironment) =>
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

        const featureTags = dto.data.featureTags || [];
        for (const tag of featureTags) {
            if (tag.tagType) {
                await this.featureTagService.addTag(
                    tag.featureName,
                    { type: tag.tagType, value: tag.tagValue },
                    extractUsernameFromUser(user),
                );
            }
        }
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
            newTagTypes.map((tagType) => {
                return tagType
                    ? this.tagTypeService.createTagType(
                          tagType,
                          extractUsernameFromUser(user),
                      )
                    : Promise.resolve();
            }),
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
            featureEnvsWithVariants.map((featureEnvironment) => {
                return featureEnvironment.featureName
                    ? this.featureToggleService.saveVariantsOnEnv(
                          dto.project,
                          featureEnvironment.featureName,
                          dto.environment,
                          featureEnvironment.variants as IVariant[],
                          user,
                      )
                    : Promise.resolve();
            }),
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
        if (Array.isArray(unsupportedContextFields)) {
            const [firstError, ...remainingErrors] =
                unsupportedContextFields.map((field) => {
                    const description = `${field.name} is not supported.`;
                    return {
                        description,
                        message: description,
                    };
                });
            if (firstError !== undefined) {
                throw new BadDataError(
                    'Some of the context fields you are trying to import are not supported.',
                    [firstError, ...remainingErrors],
                );
            }
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
        return ExportImportService.remapSegments(removedFeaturesDto);
    }

    private static async remapSegments(dto: ImportTogglesSchema) {
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

        const [firstError, ...remainingErrors] = unsupportedStrategies.map(
            (strategy) => {
                const description = `${strategy.name} is not supported.`;

                return {
                    description,
                    message: description,
                };
            },
        );
        if (firstError !== undefined) {
            throw new BadDataError(
                'Some of the strategies you are trying to import are not supported.',
                [firstError, ...remainingErrors],
            );
        }
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

    private async getNewTagTypes(dto: ImportTogglesSchema) {
        const existingTagTypes = (await this.tagTypeService.getAll()).map(
            (tagType) => tagType.name,
        );
        const newTagTypes = (dto.data.tagTypes || []).filter(
            (tagType) => !existingTagTypes.includes(tagType.name),
        );
        return [
            ...new Map(newTagTypes.map((item) => [item.name, item])).values(),
        ];
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
        const featureNames =
            typeof query.tag === 'string'
                ? await this.featureTagService.listFeatures(query.tag)
                : (query.features as string[]) || [];
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
            this.toggleStore.getAllByNames(featureNames),
            await this.featureEnvironmentStore.getAllByFeatures(
                featureNames,
                query.environment,
            ),
            this.featureStrategiesStore.getAllByFeatures(
                featureNames,
                query.environment,
            ),
            this.segmentStore.getAllFeatureStrategySegments(),
            this.contextFieldStore.getAll(),
            this.featureTagStore.getAllByFeatures(featureNames),
            this.segmentStore.getAll(),
            this.tagTypeStore.getAll(),
        ]);
        this.addSegmentsToStrategies(featureStrategies, strategySegments);
        const filteredContextFields = contextFields
            .filter(
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
            )
            .map((item) => {
                const { usedInFeatures, usedInProjects, ...rest } = item;
                return rest;
            });
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
