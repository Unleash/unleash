import type {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from './context-field-store-type.js';
import type {
    IFeatureStrategiesStore,
    IUnleashStores,
} from '../../types/stores.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { ContextFieldStrategiesSchema } from '../../openapi/spec/context-field-strategies-schema.js';
import type { IAuditUser, IFeatureStrategy } from '../../types/index.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type EventService from '../events/event-service.js';
import {
    contextSchema,
    legalValueSchema,
} from '../../services/context-schema.js';
import { NameExistsError, NotFoundError } from '../../error/index.js';
import { nameSchema } from '../../schema/feature-schema.js';
import type { LegalValueSchema } from '../../openapi/index.js';
import {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
} from '../../events/index.js';
import ConflictError from '../../error/conflict-error.js';

class ContextService {
    private eventService: EventService;

    private contextFieldStore: IContextFieldStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        {
            contextFieldStore,
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'contextFieldStore' | 'featureStrategiesStore'>,
        _config: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.privateProjectChecker = privateProjectChecker;
        this.eventService = eventService;
        this.contextFieldStore = contextFieldStore;
        this.featureStrategiesStore = featureStrategiesStore;
    }

    async getAll(): Promise<IContextField[]> {
        return this.contextFieldStore.getAll();
    }

    async getAllWithoutProject(): Promise<IContextField[]> {
        const allFields = await this.contextFieldStore.getAll();
        return allFields.filter((field) => !field.project);
    }

    async getAllForProject(projectId: string): Promise<IContextField[]> {
        const allFields = await this.contextFieldStore.getAll();
        return allFields.filter((field) => field.project === projectId);
    }

    async getAssignableFieldsForProject(
        projectId: string,
    ): Promise<IContextField[]> {
        const allFields = await this.contextFieldStore.getAll();
        return allFields.filter(
            (field) => field.project === projectId || !field.project,
        );
    }

    async getContextFields({
        projectId,
        userId,
        include,
    }: {
        projectId?: string;
        userId?: number;
        include?: string;
    }): Promise<IContextField[]> {
        if (projectId) {
            if (include?.match(/^root$/i)) {
                return this.getAssignableFieldsForProject(projectId);
            }

            return this.getAllForProject(projectId);
        }

        if (include?.match(/^project$/i)) {
            const allFields = await this.getAll();
            if (!userId) {
                return allFields;
            }

            const accessibleProjects =
                await this.privateProjectChecker.getUserAccessibleProjects(
                    userId,
                );

            if (accessibleProjects.mode === 'all') {
                return allFields;
            }

            const projectSet = new Set(accessibleProjects.projects);

            return allFields.filter(
                (contextField) =>
                    !contextField.project ||
                    projectSet.has(contextField.project),
            );
        }

        return this.getAllWithoutProject();
    }
    
    async getContextField(name: string): Promise<IContextField> {
        const field = await this.contextFieldStore.get(name);
        if (field === undefined) {
            throw new NotFoundError(
                `Could not find context field with name ${name}`,
            );
        }
        return field;
    }

    async getStrategiesByContextField(
        name: string,
        userId: number,
    ): Promise<ContextFieldStrategiesSchema> {
        const strategies =
            await this.featureStrategiesStore.getStrategiesByContextField(name);
        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return this.mapStrategies(strategies);
        } else {
            return this.mapStrategies(
                strategies.filter((strategy) =>
                    accessibleProjects.projects.includes(strategy.projectId),
                ),
            );
        }
    }

    private mapStrategies(strategies: IFeatureStrategy[]) {
        return {
            strategies: strategies.map((strategy) => ({
                id: strategy.id,
                projectId: strategy.projectId,
                featureName: strategy.featureName,
                strategyName: strategy.strategyName,
                environment: strategy.environment,
            })),
        };
    }

    async createContextField(
        value: IContextFieldDto,
        auditUser: IAuditUser,
    ): Promise<IContextField> {
        // validations
        await this.validateUniqueName(value);
        const contextField = await contextSchema.validateAsync(value);

        // creations
        const createdField = await this.contextFieldStore.create(value);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_CREATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            data: contextField,
        });

        return createdField;
    }

    async updateContextField(
        updatedContextField: IContextFieldDto,
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            updatedContextField.name,
        );
        if (contextField === undefined) {
            throw new NotFoundError(
                `Could not find context field with name: ${updatedContextField.name}`,
            );
        }
        const value = await contextSchema.validateAsync(updatedContextField);

        await this.contextFieldStore.update(value);

        const { createdAt, sortOrder, ...previousContextField } = contextField;
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: previousContextField,
            data: value,
        });
    }

    async updateLegalValue(
        contextFieldLegalValue: { name: string; legalValue: LegalValueSchema },
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            contextFieldLegalValue.name,
        );
        if (contextField === undefined) {
            throw new NotFoundError(
                `Context field with name ${contextFieldLegalValue.name} was not found`,
            );
        }
        const validatedLegalValue = await legalValueSchema.validateAsync(
            contextFieldLegalValue.legalValue,
        );

        const legalValues = contextField.legalValues
            ? [...contextField.legalValues]
            : [];

        const existingIndex = legalValues.findIndex(
            (legalvalue) => legalvalue.value === validatedLegalValue.value,
        );

        if (existingIndex !== -1) {
            legalValues[existingIndex] = validatedLegalValue;
        } else {
            legalValues.push(validatedLegalValue);
        }

        const newContextField = { ...contextField, legalValues };

        await this.contextFieldStore.update(newContextField);

        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: newContextField,
        });
    }

    async deleteLegalValue(
        contextFieldLegalValue: { name: string; legalValue: string },
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            contextFieldLegalValue.name,
        );
        if (contextField === undefined) {
            throw new NotFoundError(
                `Could not find context field with name ${contextFieldLegalValue.name}`,
            );
        }

        const newContextField = {
            ...contextField,
            legalValues: contextField.legalValues?.filter(
                (legalValue) =>
                    legalValue.value !== contextFieldLegalValue.legalValue,
            ),
        };

        await this.contextFieldStore.update(newContextField);

        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: newContextField,
        });
    }

    async deleteContextField(
        name: string,
        auditUser: IAuditUser,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(name);

        const strategies =
            await this.featureStrategiesStore.getStrategiesByContextField(name);

        if (strategies.length > 0) {
            throw new ConflictError(
                `This context field is in use by existing flags. To delete it, first remove its usage from all flags.`,
            );
        }

        // delete
        await this.contextFieldStore.delete(name);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_DELETED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
        });
    }

    async validateUniqueName({
        name,
    }: Pick<IContextFieldDto, 'name'>): Promise<void> {
        let msg: string | undefined;
        try {
            await this.contextFieldStore.get(name);
            msg = 'A context field with that name already exist';
        } catch (_error) {
            // No conflict, everything ok!
            return;
        }

        // Intentional throw here!
        throw new NameExistsError(msg);
    }

    async validateName(name: string): Promise<void> {
        await nameSchema.validateAsync({ name });
        await this.validateUniqueName({ name });
    }
}
export default ContextService;
