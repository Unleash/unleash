import { Logger } from '../logger';
import {
    IContextField,
    IContextFieldDto,
    IContextFieldStore,
} from '../types/stores/context-field-store';
import { IEventStore } from '../types/stores/event-store';
import { IProjectStore } from '../types/stores/project-store';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';

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

    private logger: Logger;

    constructor(
        {
            projectStore,
            eventStore,
            contextFieldStore,
        }: Pick<
            IUnleashStores,
            'projectStore' | 'eventStore' | 'contextFieldStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.contextFieldStore = contextFieldStore;
        this.logger = getLogger('services/context-service.js');
    }

    async getAll(): Promise<IContextField[]> {
        return this.contextFieldStore.getAll();
    }

    async getContextField(name: string): Promise<IContextField> {
        return this.contextFieldStore.get(name);
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
