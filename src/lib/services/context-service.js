'use strict';

const { contextSchema, nameSchema } = require('./context-schema');
const NameExistsError = require('../error/name-exists-error');

const {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
} = require('../event-type');

class ContextService {
    constructor(
        { projectStore, eventStore, contextFieldStore },
        { getLogger },
    ) {
        this.projectStore = projectStore;
        this.eventStore = eventStore;
        this.contextFieldStore = contextFieldStore;
        this.logger = getLogger('services/context-service.js');
    }

    async getAll() {
        return this.contextFieldStore.getAll();
    }

    async getContextField(name) {
        return this.contextFieldStore.get(name);
    }

    async createContextField(value, userName) {
        // validations
        await this.validateUniqueName(value);
        const contextField = await contextSchema.validateAsync(value);

        // creations
        await this.contextFieldStore.create(value);
        await this.eventStore.store({
            type: CONTEXT_FIELD_CREATED,
            createdBy: userName,
            data: contextField,
        });
    }

    async updateContextField(updatedContextField, userName) {
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

    async deleteContextField(name, userName) {
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

    async validateUniqueName({ name }) {
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

    async validateName(name) {
        await nameSchema.validateAsync({ name });
        await this.validateUniqueName({ name });
    }
}

module.exports = ContextService;
