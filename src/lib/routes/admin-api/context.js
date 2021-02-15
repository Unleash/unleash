'use strict';

const Controller = require('../controller');

const { handleErrors } = require('./util');
const extractUser = require('../../extract-user');

const {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
} = require('../../permissions');

class ContextController extends Controller {
    constructor(config, { contextService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/feature.js');
        this.contextService = contextService;

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
        try {
            const fields = await this.contextService.getAll();
            res.status(200)
                .json(fields)
                .end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getContextField(req, res) {
        try {
            const name = req.params.contextField;
            const contextField = await this.contextService.getContextField(
                name,
            );
            res.json(contextField).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find context field' });
        }
    }

    async createContextField(req, res) {
        const value = req.body;
        const userName = extractUser(req);

        try {
            await this.contextService.createContextField(value, userName);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateContextField(req, res) {
        const name = req.params.contextField;
        const userName = extractUser(req);
        const contextField = req.body;

        contextField.name = name;

        try {
            await this.contextService.updateContextField(
                contextField,
                userName,
            );
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteContextField(req, res) {
        const name = req.params.contextField;
        const userName = extractUser(req);

        try {
            await this.contextService.deleteContextField(name, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async validate(req, res) {
        const { name } = req.body;

        try {
            await this.contextService.validateName(name);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = ContextController;
