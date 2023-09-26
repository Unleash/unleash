import { Logger } from '../logger';
import {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from '../types/stores/context-field-store';
import { IEventStore } from '../types/stores/event-store';
import { IProjectStore } from '../types/stores/project-store';
import { IFeatureStrategiesStore, IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { ContextFieldStrategiesSchema } from '../openapi/spec/context-field-strategies-schema';
import { IFeatureStrategy, IFlagResolver } from '../types';
import { IPrivateProjectChecker } from '../features/private-project/privateProjectCheckerType';

const { contextSchema, nameSchema } = require('./context-schema');
const NameExistsError = require('../error/name-exists-error');

const {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
} = require('../types/events');

class ContextService {
    private projectStore: IProjectStore;

    private eventStore: IEventStore;

    private contextFieldStore: IContextFieldStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        {
            projectStore,
            eventStore,
            contextFieldStore,
            featureStrategiesStore,
        }: Pick<
            IUnleashStores,
            | 'projectStore'
            | 'eventStore'
            | 'contextFieldStore'
            | 'featureStrategiesStore'
        >,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.privateProjectChecker = privateProjectChecker;
        this.projectStore = projectStore;
        this.eventStore = eventStore;
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
        if (this.flagResolver.isEnabled('privateProjects')) {
            const accessibleProjects =
                await this.privateProjectChecker.getUserAccessibleProjects(
                    userId,
                );
            if (accessibleProjects.mode === 'all') {
                return this.mapStrategies(strategies);
            } else {
                return this.mapStrategies(
                    strategies.filter((strategy) =>
                        accessibleProjects.projects.includes(
                            strategy.projectId,
                        ),
                    ),
                );
            }
        }
        return this.mapStrategies(strategies);
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
    ): Promise<IContextField> {
        // validations
        await this.validateUniqueName(value);
        const contextField = await contextSchema.validateAsync(value);

        // creations
        const createdField = await this.contextFieldStore.create(value);
        await this.eventStore.store({
            type: CONTEXT_FIELD_CREATED,
            createdBy: userName,
            data: contextField,
        });

        return createdField;
    }

    async updateContextField(
        updatedContextField: IContextFieldDto,
        userName: string,
    ): Promise<void> {
        // validations
        await this.contextFieldStore.get(updatedContextField.name);
        const value = await contextSchema.validateAsync(updatedContextField);

        // update
        await this.contextFieldStore.update(value);
        await this.eventStore.store({
            type: CONTEXT_FIELD_UPDATED,
            createdBy: userName,
            data: value,
        });
    }

    async deleteContextField(name: string, userName: string): Promise<void> {
        // validate existence
        await this.contextFieldStore.get(name);

        // delete
        await this.contextFieldStore.delete(name);
        await this.eventStore.store({
            type: CONTEXT_FIELD_DELETED,
            createdBy: userName,
            data: { name },
        });
    }

    async validateUniqueName({
        name,
    }: Pick<IContextFieldDto, 'name'>): Promise<void> {
        let msg;
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
