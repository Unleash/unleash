import type { Logger } from '../../logger.js';
import type { IStrategy } from '../../types/stores/strategy-store.js';
import type { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type.js';
import type { IFeatureStrategiesStore } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import {
    FeaturesExportedEvent,
    FeaturesImportedEvent,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
    type FeatureToggleDTO,
    type IAuditUser,
    type IContextFieldStore,
    type IFeatureEnvironmentStore,
    type IFeatureStrategy,
    type IFeatureStrategySegment,
    type IFeatureTagStore,
    type IFlagResolver,
    type ITagTypeStore,
    type IUnleashConfig,
    type IUnleashStores,
    type IVariant,
    type WithRequired,
    type IFeatureLinksReadModel,
} from '../../types/index.js';
import type {
    ExportQuerySchema,
    ExportResultSchema,
    FeatureStrategySchema,
    ImportTogglesSchema,
    ImportTogglesValidateSchema,
} from '../../openapi/index.js';
import type { IUser } from '../../types/user.js';
import { BadDataError } from '../../error/index.js';
import type {
    AccessService,
    ContextService,
    DependentFeaturesService,
    EventService,
    FeatureTagService,
    FeatureToggleService,
    IUnleashServices,
    StrategyService,
    TagTypeService,
} from '../../services/index.js';
import { isValidField } from './import-context-validation.js';
import type {
    IImportTogglesStore,
    ProjectFeaturesLimit,
} from './import-toggles-store-type.js';
import {
    ImportPermissionsService,
    type Mode,
} from './import-permissions-service.js';
import { ImportValidationMessages } from './import-validation-messages.js';
import { findDuplicates } from '../../util/findDuplicates.js';
import type { FeatureNameCheckResultWithFeaturePattern } from '../feature-toggle/feature-toggle-service.js';
import type { IDependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model-type.js';
import groupBy from 'lodash.groupby';
import { allSettledWithRejection } from '../../util/allSettledWithRejection.js';
import type { ISegmentReadModel } from '../segment/segment-read-model-type.js';
import { readFile } from '../../util/read-file.js';
import type FeatureLinkService from '../feature-links/feature-link-service.js';

export type IImportService = {
    validate(
        dto: ImportTogglesSchema,
        user: IUser,
    ): Promise<ImportTogglesValidateSchema>;

    import(
        dto: ImportTogglesSchema,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void>;

    importFromFile(
        file: string,
        project: string,
        environment: string,
    ): Promise<void>;
};

export type IExportService = {
    export(
        query: ExportQuerySchema,
        auditUser: IAuditUser,
    ): Promise<ExportResultSchema>;
};

export default class ExportImportService
    implements IExportService, IImportService
{
    private logger: Logger;

    private toggleStore: IFeatureToggleStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private importTogglesStore: IImportTogglesStore;

    private tagTypeStore: ITagTypeStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private featureTagStore: IFeatureTagStore;

    private flagResolver: IFlagResolver;

    private featureToggleService: FeatureToggleService;

    private contextFieldStore: IContextFieldStore;

    private strategyService: StrategyService;

    private contextService: ContextService;

    private accessService: AccessService;

    private eventService: EventService;

    private tagTypeService: TagTypeService;

    private segmentReadModel: ISegmentReadModel;

    private featureTagService: FeatureTagService;

    private importPermissionsService: ImportPermissionsService;

    private dependentFeaturesReadModel: IDependentFeaturesReadModel;

    private dependentFeaturesService: DependentFeaturesService;

    private featureLinksReadModel: IFeatureLinksReadModel;

    private featureLinkService: FeatureLinkService;

    constructor(
        stores: Pick<
            IUnleashStores,
            | 'importTogglesStore'
            | 'featureStrategiesStore'
            | 'featureToggleStore'
            | 'featureEnvironmentStore'
            | 'tagTypeStore'
            | 'featureTagStore'
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
            eventService,
            tagTypeService,
            featureTagService,
            dependentFeaturesService,
            featureLinkService,
        }: Pick<
            IUnleashServices,
            | 'featureToggleService'
            | 'strategyService'
            | 'contextService'
            | 'accessService'
            | 'eventService'
            | 'tagTypeService'
            | 'featureTagService'
            | 'dependentFeaturesService'
            | 'featureLinkService'
        >,
        dependentFeaturesReadModel: IDependentFeaturesReadModel,
        segmentReadModel: ISegmentReadModel,
        featureLinksReadModel: IFeatureLinksReadModel,
    ) {
        this.toggleStore = stores.featureToggleStore;
        this.importTogglesStore = stores.importTogglesStore;
        this.featureStrategiesStore = stores.featureStrategiesStore;
        this.featureEnvironmentStore = stores.featureEnvironmentStore;
        this.tagTypeStore = stores.tagTypeStore;
        this.featureTagStore = stores.featureTagStore;
        this.flagResolver = flagResolver;
        this.featureToggleService = featureToggleService;
        this.contextFieldStore = stores.contextFieldStore;
        this.strategyService = strategyService;
        this.contextService = contextService;
        this.accessService = accessService;
        this.eventService = eventService;
        this.tagTypeService = tagTypeService;
        this.featureTagService = featureTagService;
        this.dependentFeaturesService = dependentFeaturesService;
        this.featureLinkService = featureLinkService;
        this.importPermissionsService = new ImportPermissionsService(
            this.importTogglesStore,
            this.accessService,
            this.tagTypeService,
            this.contextService,
        );
        this.dependentFeaturesReadModel = dependentFeaturesReadModel;
        this.segmentReadModel = segmentReadModel;
        this.featureLinksReadModel = featureLinksReadModel;
        this.logger = getLogger('services/state-service.js');
    }

    async validate(
        dto: ImportTogglesSchema,
        user: IUser,
        mode = 'regular' as Mode,
    ): Promise<ImportTogglesValidateSchema> {
        const [
            unsupportedStrategies,
            usedCustomStrategies,
            unsupportedContextFields,
            archivedFeatures,
            otherProjectFeatures,
            existingProjectFeatures,
            missingPermissions,
            duplicateFeatures,
            featureNameCheckResult,
            featureLimitResult,
            unsupportedSegments,
            unsupportedDependencies,
        ] = await Promise.all([
            this.getUnsupportedStrategies(dto),
            this.getUsedCustomStrategies(dto),
            this.getUnsupportedContextFields(dto),
            this.getArchivedFeatures(dto),
            this.getOtherProjectFeatures(dto),
            this.getExistingProjectFeatures(dto),
            this.importPermissionsService.getMissingPermissions(
                dto,
                user,
                mode,
            ),
            this.getDuplicateFeatures(dto),
            this.getInvalidFeatureNames(dto),
            this.getFeatureLimit(dto),
            this.getUnsupportedSegments(dto),
            this.getMissingDependencies(dto),
        ]);

        const errors = ImportValidationMessages.compileErrors({
            projectName: dto.project,
            strategies: unsupportedStrategies,
            contextFields: unsupportedContextFields || [],
            otherProjectFeatures,
            duplicateFeatures,
            featureNameCheckResult,
            featureLimitResult,
            segments: unsupportedSegments,
            dependencies: unsupportedDependencies,
        });
        const warnings = ImportValidationMessages.compileWarnings({
            archivedFeatures,
            existingFeatures: existingProjectFeatures,
            usedCustomStrategies,
        });
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

    async importVerify(
        dto: ImportTogglesSchema,
        user: IUser,
        mode = 'regular' as Mode,
    ): Promise<void> {
        await allSettledWithRejection([
            this.verifyStrategies(dto),
            this.verifyContextFields(dto),
            this.importPermissionsService.verifyPermissions(dto, user, mode),
            this.verifyFeatures(dto),
            this.verifySegments(dto),
            this.verifyDependencies(dto),
        ]);
    }

    async fileImportVerify(dto: ImportTogglesSchema): Promise<void> {
        await allSettledWithRejection([
            this.verifyStrategies(dto),
            this.verifyContextFields(dto),
            this.verifyFeatures(dto),
            this.verifySegments(dto),
            this.verifyDependencies(dto),
        ]);
    }

    async importFeatureData(
        dto: ImportTogglesSchema,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.createOrUpdateToggles(dto, auditUser);
        await this.importToggleVariants(dto, auditUser);
        await this.importTagTypes(dto, auditUser);
        await this.importTags(dto, auditUser);
        await this.importContextFields(dto, auditUser);
        await this.importLinks(dto, auditUser);
    }

    async import(
        dto: ImportTogglesSchema,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void> {
        const cleanedDto = await this.cleanData(dto);
        await this.importVerify(cleanedDto, user);
        await this.processImport(cleanedDto, user, auditUser);
    }

    async importFromFile(
        file: string,
        project: string,
        environment: string,
    ): Promise<void> {
        const content = await readFile(file);
        const data = JSON.parse(content);
        const dto = {
            project,
            environment,
            data,
        };
        const cleanedDto = await this.cleanData(dto);

        await this.fileImportVerify(cleanedDto);
        await this.processImport(cleanedDto, SYSTEM_USER, SYSTEM_USER_AUDIT);
    }

    private async processImport(
        dto: ImportTogglesSchema,
        user: IUser,
        auditUser: IAuditUser,
    ) {
        await this.importFeatureData(dto, auditUser);

        await this.importEnvironmentData(dto, user, auditUser);
        await this.eventService.storeEvent(
            new FeaturesImportedEvent({
                project: dto.project,
                environment: dto.environment,
                auditUser,
            }),
        );
    }

    async importEnvironmentData(
        dto: ImportTogglesSchema,
        user: IUser,
        auditUser: IAuditUser,
    ): Promise<void> {
        await this.deleteStrategies(dto);
        await this.importStrategies(dto, auditUser);
        await this.importToggleStatuses(dto, user, auditUser);
        await this.importDependencies(dto, user, auditUser);
    }

    private async importLinks(dto: ImportTogglesSchema, auditUser: IAuditUser) {
        await this.importTogglesStore.deleteLinksForFeatures(
            (dto.data.links ?? []).map((featureLink) => featureLink.feature),
        );

        const links = dto.data.links || [];
        for (const featureLink of links) {
            for (const link of featureLink.links) {
                await this.featureLinkService.createLink(
                    dto.project,
                    {
                        featureName: featureLink.feature,
                        url: link.url,
                        title: link.title || undefined,
                    },
                    auditUser,
                );
            }
        }
    }

    private async importDependencies(
        dto: ImportTogglesSchema,
        user: IUser,
        auditUser: IAuditUser,
    ) {
        await Promise.all(
            (dto.data.dependencies || []).flatMap((dependency) => {
                const feature = dto.data.features.find(
                    (feature) => feature.name === dependency.feature,
                );
                if (!feature || !feature.project) {
                    return [];
                }

                const projectId = feature!.project!;
                return dependency.dependencies.map((parentDependency) =>
                    this.dependentFeaturesService.upsertFeatureDependency(
                        {
                            child: dependency.feature,
                            projectId,
                        },
                        parentDependency,
                        user,
                        auditUser,
                    ),
                );
            }),
        );
    }

    private async importToggleStatuses(
        dto: ImportTogglesSchema,
        user: IUser,
        auditUser: IAuditUser,
    ) {
        await Promise.all(
            (dto.data.featureEnvironments || []).map((featureEnvironment) =>
                this.featureToggleService.updateEnabled(
                    dto.project,
                    featureEnvironment.name,
                    dto.environment,
                    featureEnvironment.enabled,
                    auditUser,
                    user,
                ),
            ),
        );
    }

    private async importStrategies(
        dto: ImportTogglesSchema,
        auditUser: IAuditUser,
    ) {
        const hasFeatureName = (
            featureStrategy: FeatureStrategySchema,
        ): featureStrategy is WithRequired<
            FeatureStrategySchema,
            'featureName'
        > => Boolean(featureStrategy.featureName);
        await Promise.all(
            dto.data.featureStrategies
                ?.filter(hasFeatureName)
                .map(({ featureName, ...restOfFeatureStrategy }) =>
                    this.featureToggleService.createStrategy(
                        restOfFeatureStrategy,
                        {
                            featureName,
                            environment: dto.environment,
                            projectId: dto.project,
                        },
                        auditUser,
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

    private async importTags(dto: ImportTogglesSchema, auditUser: IAuditUser) {
        await this.importTogglesStore.deleteTagsForFeatures(
            dto.data.features.map((feature) => feature.name),
        );

        const featureTags = dto.data.featureTags || [];
        for (const tag of featureTags) {
            if (tag.tagType) {
                await this.featureTagService.addTag(
                    tag.featureName,
                    {
                        type: tag.tagType,
                        value: tag.tagValue,
                    },
                    auditUser,
                );
            }
        }
    }

    private async importContextFields(
        dto: ImportTogglesSchema,
        auditUser: IAuditUser,
    ) {
        const newContextFields = (await this.getNewContextFields(dto)) || [];
        await Promise.all(
            newContextFields.map((contextField) =>
                this.contextService.createContextField(
                    {
                        name: contextField.name,
                        description: contextField.description,
                        legalValues: contextField.legalValues,
                        stickiness: contextField.stickiness,
                        project: contextField.project ? dto.project : undefined,
                    },
                    auditUser,
                ),
            ),
        );
    }

    private async importTagTypes(
        dto: ImportTogglesSchema,
        auditUser: IAuditUser,
    ) {
        const newTagTypes = await this.getNewTagTypes(dto);
        return Promise.all(
            newTagTypes.map((tagType) => {
                return tagType
                    ? this.tagTypeService.createTagType(tagType, auditUser)
                    : Promise.resolve();
            }),
        );
    }

    private async importToggleVariants(
        dto: ImportTogglesSchema,
        auditUser: IAuditUser,
    ) {
        const featureEnvsWithVariants =
            dto.data.featureEnvironments?.filter(
                (featureEnvironment) =>
                    Array.isArray(featureEnvironment.variants) &&
                    featureEnvironment.variants.length > 0,
            ) || [];
        await Promise.all(
            featureEnvsWithVariants.map((featureEnvironment) => {
                return featureEnvironment.featureName
                    ? this.featureToggleService.legacySaveVariantsOnEnv(
                          dto.project,
                          featureEnvironment.featureName,
                          dto.environment,
                          featureEnvironment.variants as IVariant[],
                          auditUser,
                      )
                    : Promise.resolve();
            }),
        );
    }

    private async createOrUpdateToggles(
        dto: ImportTogglesSchema,
        auditUser: IAuditUser,
    ) {
        const existingFeatures = await this.getExistingProjectFeatures(dto);

        for (const feature of dto.data.features) {
            if (existingFeatures.includes(feature.name)) {
                const { archivedAt, createdAt, ...rest } = feature;
                await this.featureToggleService.updateFeatureToggle(
                    dto.project,
                    rest as FeatureToggleDTO,
                    feature.name,
                    auditUser,
                );
            } else {
                await this.featureToggleService.validateName(feature.name);
                const { archivedAt, createdAt, ...rest } = feature;
                await this.featureToggleService.createFeatureToggle(
                    dto.project,
                    rest as FeatureToggleDTO,
                    auditUser,
                );
            }
        }
    }

    private async getUnsupportedSegments(
        dto: ImportTogglesSchema,
    ): Promise<string[]> {
        const supportedSegments = await this.segmentReadModel.getAll();
        const targetProject = dto.project;
        return dto.data.segments
            ? dto.data.segments
                  .filter(
                      (importingSegment) =>
                          !supportedSegments.find(
                              (existingSegment) =>
                                  importingSegment.name ===
                                      existingSegment.name &&
                                  (!existingSegment.project ||
                                      existingSegment.project ===
                                          targetProject),
                          ),
                  )

                  .map((it) => it.name)
            : [];
    }

    private async getMissingDependencies(
        dto: ImportTogglesSchema,
    ): Promise<string[]> {
        const dependentFeatures =
            dto.data.dependencies?.flatMap((dependency) =>
                dependency.dependencies.map((d) => d.feature),
            ) || [];
        const importedFeatures = dto.data.features.map((f) => f.name);

        const missingFromImported = dependentFeatures.filter(
            (feature) => !importedFeatures.includes(feature),
        );

        let missingFeatures: string[] = [];

        if (missingFromImported.length) {
            const featuresFromStore = (
                await this.toggleStore.getAllByNames(missingFromImported)
            ).map((f) => f.name);
            missingFeatures = missingFromImported.filter(
                (feature) => !featuresFromStore.includes(feature),
            );
        }
        return missingFeatures;
    }

    private async verifySegments(dto: ImportTogglesSchema) {
        const unsupportedSegments = await this.getUnsupportedSegments(dto);
        if (unsupportedSegments.length > 0) {
            throw new BadDataError(
                `Unsupported segments: ${unsupportedSegments.join(', ')}`,
            );
        }
    }

    private async verifyDependencies(dto: ImportTogglesSchema) {
        const unsupportedDependencies = await this.getMissingDependencies(dto);
        if (unsupportedDependencies.length > 0) {
            throw new BadDataError(
                `The following dependent features are missing: ${unsupportedDependencies.join(
                    ', ',
                )}`,
            );
        }
    }

    private async verifyContextFields(dto: ImportTogglesSchema) {
        const unsupportedContextFields =
            await this.getUnsupportedContextFields(dto);
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
        return this.remapSegments(removedFeaturesDto);
    }

    private async remapSegments(dto: ImportTogglesSchema) {
        const existingSegments = await this.segmentReadModel.getAll();

        const segmentMapping = new Map(
            dto.data.segments?.map((segment) => [
                segment.id,
                existingSegments.find(
                    (existingSegment) => existingSegment.name === segment.name,
                )?.id,
            ]),
        );

        return {
            ...dto,
            data: {
                ...dto.data,
                featureStrategies: dto.data.featureStrategies.map(
                    (strategy) => ({
                        ...strategy,
                        segments: strategy.segments?.map(
                            (segment) => segmentMapping.get(segment)!,
                        ),
                    }),
                ),
            },
        };
    }

    async removeArchivedFeatures(
        dto: ImportTogglesSchema,
    ): Promise<ImportTogglesSchema> {
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

    private async getInvalidFeatureNames({
        project,
        data,
    }: ImportTogglesSchema): Promise<FeatureNameCheckResultWithFeaturePattern> {
        return this.featureToggleService.checkFeatureFlagNamesAgainstProjectPattern(
            project,
            data.features.map((f) => f.name),
        );
    }

    private async getFeatureLimit({
        project,
        data,
    }: ImportTogglesSchema): Promise<ProjectFeaturesLimit> {
        return this.importTogglesStore.getProjectFeaturesLimit(
            [...new Set(data.features.map((f) => f.name))],
            project,
        );
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

    private async getExistingProjectFeatures(dto: ImportTogglesSchema) {
        return this.importTogglesStore.getFeaturesInProject(
            dto.data.features.map((feature) => feature.name),
            dto.project,
        );
    }

    private getDuplicateFeatures(dto: ImportTogglesSchema) {
        return findDuplicates(dto.data.features.map((feature) => feature.name));
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
        auditUser: IAuditUser,
    ): Promise<ExportResultSchema> {
        let featureNames: string[] = [];
        if (typeof query.tag === 'string') {
            featureNames = await this.featureTagService.listFeatures(query.tag);
        } else if (Array.isArray(query.features) && query.features.length) {
            featureNames = query.features;
        } else if (typeof query.project === 'string') {
            const allProjectFeatures = await this.toggleStore.getAll({
                project: query.project,
            });
            featureNames = allProjectFeatures.map((feature) => feature.name);
        } else {
            const allFeatures = await this.toggleStore.getAll();
            featureNames = allFeatures.map((feature) => feature.name);
        }

        const [
            features,
            featureEnvironments,
            featureStrategies,
            strategySegments,
            contextFields,
            featureTags,
            segments,
            tagTypes,
            featureDependencies,
            featureLinks,
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
            this.segmentReadModel.getAllFeatureStrategySegments(),
            this.contextFieldStore.getAll(),
            this.featureTagStore.getAllByFeatures(featureNames),
            this.segmentReadModel.getAll(),
            this.tagTypeStore.getAll(),
            this.dependentFeaturesReadModel.getDependencies(featureNames),
            this.featureLinksReadModel.getLinks(...featureNames),
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

        const groupedFeatureDependencies = groupBy(
            featureDependencies,
            'feature',
        );
        const mappedFeatureDependencies = Object.entries(
            groupedFeatureDependencies,
        ).map(([feature, dependencies]) => ({
            feature,
            dependencies: dependencies.map((d) => d.dependency),
        }));

        const groupedFeatureLinks = groupBy(featureLinks, 'feature');
        const mappedFeatureLinks = Object.entries(groupedFeatureLinks).map(
            ([feature, links]) => ({
                feature,
                links: links.map((link) => ({
                    id: link.id,
                    url: link.url,
                    title: link.title,
                })),
            }),
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
                    milestoneId,
                    ...rest
                } = item;
                return {
                    name,
                    ...rest,
                };
            }),
            featureEnvironments: featureEnvironments.map((item) => {
                const { lastSeenAt, ...rest } = item;
                return {
                    ...rest,
                    name: item.featureName,
                };
            }),
            contextFields: filteredContextFields.map((item) => {
                const { createdAt, ...rest } = item;
                return rest;
            }),
            featureTags,
            segments: filteredSegments.map((item) => {
                const { id, name } = item;
                return {
                    id,
                    name,
                };
            }),
            tagTypes: filteredTagTypes,
            dependencies: mappedFeatureDependencies,
            links: mappedFeatureLinks,
        };
        await this.eventService.storeEvent(
            new FeaturesExportedEvent({ data: result, auditUser }),
        );

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
