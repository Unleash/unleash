import { IImportTogglesStore } from './import-toggles-store-type';
import { AccessService, ContextService, TagTypeService } from '../../services';
import { ContextFieldSchema, ImportTogglesSchema } from '../../openapi';
import { ITagType } from '../../types/stores/tag-type-store';
import User from '../../types/user';
import {
    CREATE_CONTEXT_FIELD,
    CREATE_FEATURE,
    CREATE_FEATURE_STRATEGY,
    DELETE_FEATURE_STRATEGY,
    UPDATE_FEATURE,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_TAG_TYPE,
} from '../../types';
import { InvalidOperationError } from '../../error';

type Mode = 'regular' | 'change_request';

export class ImportPermissionsService {
    private importTogglesStore: IImportTogglesStore;

    private accessService: AccessService;

    private tagTypeService: TagTypeService;

    private contextService: ContextService;

    private async getNewTagTypes(
        dto: ImportTogglesSchema,
    ): Promise<ITagType[]> {
        const existingTagTypes = (await this.tagTypeService.getAll()).map(
            (tagType) => tagType.name,
        );
        const newTagTypes = dto.data.tagTypes?.filter(
            (tagType) => !existingTagTypes.includes(tagType.name),
        );
        return [
            ...new Map(newTagTypes.map((item) => [item.name, item])).values(),
        ];
    }

    private async getNewContextFields(
        dto: ImportTogglesSchema,
    ): Promise<ContextFieldSchema[]> {
        const availableContextFields = await this.contextService.getAll();

        return dto.data.contextFields?.filter(
            (contextField) =>
                !availableContextFields.some(
                    (availableField) =>
                        availableField.name === contextField.name,
                ),
        );
    }

    constructor(
        importTogglesStore: IImportTogglesStore,
        accessService: AccessService,
        tagTypeService: TagTypeService,
        contextService: ContextService,
    ) {
        this.importTogglesStore = importTogglesStore;
        this.accessService = accessService;
        this.tagTypeService = tagTypeService;
        this.contextService = contextService;
    }

    async getMissingPermissions(
        dto: ImportTogglesSchema,
        user: User,
        mode: Mode,
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

        if (strategiesExistForFeatures && mode === 'regular') {
            permissions.push(DELETE_FEATURE_STRATEGY);
        }

        if (dto.data.featureStrategies.length > 0 && mode === 'regular') {
            permissions.push(CREATE_FEATURE_STRATEGY);
        }

        if (featureEnvsWithVariants.length > 0 && mode === 'regular') {
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

    async verifyPermissions(
        dto: ImportTogglesSchema,
        user: User,
        mode: Mode,
    ): Promise<void> {
        const missingPermissions = await this.getMissingPermissions(
            dto,
            user,
            mode,
        );
        if (missingPermissions.length > 0) {
            throw new InvalidOperationError(
                'You are missing permissions to import',
            );
        }
    }
}
