import type { Logger } from '../../logger';
import type {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from './context-field-store-type';
import type {
    IFeatureStrategiesStore,
    IUnleashStores,
} from '../../types/stores';
import type { IUnleashConfig } from '../../types/option';
import type { ContextFieldStrategiesSchema } from '../../openapi/spec/context-field-strategies-schema';
import {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_DELETED,
    CONTEXT_FIELD_UPDATED,
    type IAuditUser,
    type IFeatureStrategy,
    type IFlagResolver,
} from '../../types';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type EventService from '../events/event-service';
import { contextSchema, legalValueSchema } from '../../services/context-schema';
import { NameExistsError, NotFoundError } from '../../error';
import { nameSchema } from '../../schema/feature-schema';
import type { LegalValueSchema } from '../../openapi';

export class ContextService {
    private eventService: EventService;

    private contextFieldStore: IContextFieldStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        {
            contextFieldStore,
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'contextFieldStore' | 'featureStrategiesStore'>,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.privateProjectChecker = privateProjectChecker;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
        this.contextFieldStore = contextFieldStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.logger = getLogger('services/context-service.js');
    }

    async getAll(workspaceId: number): Promise<IContextField[]> {
        return this.contextFieldStore.getAll(workspaceId);
    }

    async getContextField(
        name: string,
        workspaceId: number,
    ): Promise<IContextField> {
        const contextField = await this.contextFieldStore.get(
            name,
            workspaceId,
        );
        if (!contextField) {
            throw new NotFoundError('Could not find context field');
        }
        return contextField;
    }

    // TODO: Feature strategy store needs to be updated to support workspaceId
    async getStrategiesByContextField(
        name: string,
        userId: number,
        workspaceId: number,
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
        workspaceId: number,
    ): Promise<IContextField> {
        await this.validateUniqueName(value, workspaceId);
        const contextField = await contextSchema.validateAsync(value);

        const createdField = await this.contextFieldStore.create(
            value,
            workspaceId,
        );
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_CREATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            data: { ...contextField, workspaceId },
        });

        return createdField;
    }

    async updateContextField(
        updatedContextField: IContextFieldDto,
        auditUser: IAuditUser,
        workspaceId: number,
    ): Promise<void> {
        const contextField = await this.getContextField(
            updatedContextField.name,
            workspaceId,
        );
        const value = await contextSchema.validateAsync(updatedContextField);

        await this.contextFieldStore.update(value, workspaceId);

        const { createdAt, sortOrder, ...previousContextField } = contextField;
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: previousContextField,
            data: { ...value, workspaceId },
        });
    }

    async updateLegalValue(
        contextFieldLegalValue: { name: string; legalValue: LegalValueSchema },
        auditUser: IAuditUser,
        workspaceId: number,
    ): Promise<void> {
        const contextField = await this.getContextField(
            contextFieldLegalValue.name,
            workspaceId,
        );
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

        await this.contextFieldStore.update(newContextField, workspaceId);

        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: { ...newContextField, workspaceId },
        });
    }

    async deleteLegalValue(
        contextFieldLegalValue: { name: string; legalValue: string },
        auditUser: IAuditUser,
        workspaceId: number,
    ): Promise<void> {
        const contextField = await this.getContextField(
            contextFieldLegalValue.name,
            workspaceId,
        );

        const newContextField = {
            ...contextField,
            legalValues: contextField.legalValues?.filter(
                (legalValue) =>
                    legalValue.value !== contextFieldLegalValue.legalValue,
            ),
        };

        await this.contextFieldStore.update(newContextField, workspaceId);

        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: contextField,
            data: { ...newContextField, workspaceId },
        });
    }

    async deleteContextField(
        name: string,
        auditUser: IAuditUser,
        workspaceId: number,
    ): Promise<void> {
        const contextField = await this.getContextField(name, workspaceId);

        await this.contextFieldStore.delete(name, workspaceId);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_DELETED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            preData: { ...contextField, workspaceId },
        });
    }

    async validateUniqueName(
        { name }: Pick<IContextFieldDto, 'name'>,
        workspaceId: number,
    ): Promise<void> {
        let msg: string | undefined;
        try {
            await this.contextFieldStore.get(name, workspaceId);
            msg = 'A context field with that name already exist';
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Intentional throw here!
        throw new NameExistsError(msg);
    }

    async validateName(name: string, workspaceId: number): Promise<void> {
        await nameSchema.validateAsync({ name });
        await this.validateUniqueName({ name }, workspaceId);
    }
}

export default ContextService;
module.exports = ContextService;
