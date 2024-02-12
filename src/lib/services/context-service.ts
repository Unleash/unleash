import { Logger } from '../logger';
import {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from '../types/stores/context-field-store';
import { IProjectStore } from '../features/project/project-store-type';
import { IFeatureStrategiesStore, IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { ContextFieldStrategiesSchema } from '../openapi/spec/context-field-strategies-schema';
import { IFeatureStrategy, IFlagResolver } from '../types';
import { IPrivateProjectChecker } from '../features/private-project/privateProjectCheckerType';
import EventService from '../features/events/event-service';

const { contextSchema, nameSchema } = require('./context-schema');
const NameExistsError = require('../error/name-exists-error');

const {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
} = require('../types/events');

class ContextService {
    private projectStore: IProjectStore;

    private eventService: EventService;

    private contextFieldStore: IContextFieldStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        {
            projectStore,
            contextFieldStore,
            featureStrategiesStore,
        }: Pick<
            IUnleashStores,
            'projectStore' | 'contextFieldStore' | 'featureStrategiesStore'
        >,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.privateProjectChecker = privateProjectChecker;
        this.projectStore = projectStore;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
        this.contextFieldStore = contextFieldStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.logger = getLogger('services/context-service.js');
    }

    async getAll(): Promise<IContextField[]> {
        return this.contextFieldStore.getAll();
    }

    async getContextField(name: string): Promise<IContextField> {
        return this.contextFieldStore.get(name);
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
        userName: string,
        createdByUserId: number,
    ): Promise<IContextField> {
        // validations
        await this.validateUniqueName(value);
        const contextField = await contextSchema.validateAsync(value);

        // creations
        const createdField = await this.contextFieldStore.create(value);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_CREATED,
            createdBy: userName,
            createdByUserId,
            data: contextField,
        });

        return createdField;
    }

    async updateContextField(
        updatedContextField: IContextFieldDto,
        userName: string,
        updatedByUserId: number,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(
            updatedContextField.name,
        );
        const value = await contextSchema.validateAsync(updatedContextField);

        // update
        await this.contextFieldStore.update(value);

        const { createdAt, sortOrder, ...previousContextField } = contextField;
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: userName,
            createdByUserId: updatedByUserId,
            preData: previousContextField,
            data: value,
        });
    }

    async deleteContextField(
        name: string,
        userName: string,
        deletedByUserId: number,
    ): Promise<void> {
        const contextField = await this.contextFieldStore.get(name);

        // delete
        await this.contextFieldStore.delete(name);
        await this.eventService.storeEvent({
            type: CONTEXT_FIELD_DELETED,
            createdBy: userName,
            createdByUserId: deletedByUserId,
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
        } catch (error) {
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
module.exports = ContextService;
