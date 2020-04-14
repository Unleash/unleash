'use strict';

const Controller = require('../controller');

const { contextSchema, nameSchema } = require('./context-schema');
const NameExistsError = require('../../error/name-exists-error');
const { handleErrors } = require('./util');
const extractUser = require('../../extract-user');

const {
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
} = require('../../event-type');

const {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
} = require('../../permissions');

class ContextController extends Controller {
    constructor(config) {
        super(config);
        this.logger = config.getLogger('/admin-api/feature.js');
        this.eventStore = config.stores.eventStore;
        this.store = config.stores.contextFieldStore;

        this.get('/', this.getContextFields);
        this.post('/', this.createContextField, CREATE_CONTEXT_FIELD);
        this.get('/:contextField', this.getContextField);
        this.put(
            '/:contextField',
            this.updateContextField,
            UPDATE_CONTEXT_FIELD,
        );
        this.delete(
            '/:contextField',
            this.deleteContextField,
            DELETE_CONTEXT_FIELD,
        );
        this.post('/validate', this.validate);
    }

    async getContextFields(req, res) {
        const fields = await this.store.getAll();
        res.status(200)
            .json(fields)
            .end();
    }

    async getContextField(req, res) {
        try {
            const name = req.params.contextField;
            const contextField = await this.store.get(name);
            res.json(contextField).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find context field' });
        }
    }

    async createContextField(req, res) {
        const { name } = req.body;
        const userName = extractUser(req);

        try {
            await this.validateUniqueName(name);
            const value = await contextSchema.validateAsync(req.body);
            await this.eventStore.store({
                type: CONTEXT_FIELD_CREATED,
                createdBy: userName,
                data: value,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateContextField(req, res) {
        const name = req.params.contextField;
        const userName = extractUser(req);
        const updatedContextField = req.body;

        updatedContextField.name = name;

        try {
            await this.store.get(name);

            await contextSchema.validateAsync(updatedContextField);
            await this.eventStore.store({
                type: CONTEXT_FIELD_UPDATED,
                createdBy: userName,
                data: updatedContextField,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteContextField(req, res) {
        const name = req.params.contextField;

        try {
            await this.store.get(name);
            await this.eventStore.store({
                type: CONTEXT_FIELD_DELETED,
                createdBy: extractUser(req),
                data: { name },
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async validateUniqueName(name) {
        let msg;
        try {
            await this.store.get(name);
            msg = 'A context field with that name already exist';
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Interntional throw here!
        throw new NameExistsError(msg);
    }

    async validate(req, res) {
        const { name } = req.body;

        try {
            await nameSchema.validateAsync({ name });
            await this.validateUniqueName(name);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = ContextController;
