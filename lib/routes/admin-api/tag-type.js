'use strict';

const Controller = require('../controller');

const { tagTypeSchema } = require('./tag-type-schema');
const {
    UPDATE_TAG_TYPE,
    CREATE_TAG_TYPE,
    DELETE_TAG_TYPE,
} = require('../../command-type');
const { UPDATE_FEATURE } = require('../../permissions');
const { handleErrors } = require('./util');
const extractUsername = require('../../extract-user');
const NameExistsError = require('../../error/name-exists-error');

const version = 1;

class TagTypeController extends Controller {
    constructor(config) {
        super(config);
        this.tagTypeStore = config.stores.tagTypeStore;
        this.eventStore = config.stores.eventStore;
        this.logger = config.getLogger('/admin-api/tag-type.js');

        this.get('/', this.getTagTypes);
        this.post('/', this.createTagType, UPDATE_FEATURE);
        this.post('/validate', this.validate);
        this.get('/:name', this.getTagType);
        this.put('/:name', this.updateTagType, UPDATE_FEATURE);
        this.delete('/:name', this.deleteTagType, UPDATE_FEATURE);
    }

    async getTagTypes(req, res) {
        const tagTypes = await this.tagTypeStore.getAll();
        res.json({ version, tagTypes });
    }

    async validateUniqueName(name) {
        let msg;
        try {
            await this.tagTypeStore.getTagType(name);
            msg = `A Tag type with name: [${name}] already exist`;
        } catch (error) {
            // No conflict, everything ok!
            return;
        }

        // Intentional throw here!
        throw new NameExistsError(msg);
    }

    async validate(req, res) {
        const { name, description, icon } = req.body;
        try {
            await tagTypeSchema.validateAsync({ name, description, icon });
            await this.validateUniqueName(name);
            res.status(200).json({ valid: true });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createTagType(req, res) {
        const userName = extractUsername(req);
        try {
            const data = await tagTypeSchema.validateAsync(req.body);
            data.name = data.name.toLowerCase();
            await this.validateUniqueName(data.name);
            await this.eventStore.store({
                type: CREATE_TAG_TYPE,
                createdBy: userName,
                data,
            });
            res.status(201).json(data);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateTagType(req, res) {
        const { description, icon } = req.body;
        const { name } = req.params;
        const userName = extractUsername(req);
        try {
            const data = await tagTypeSchema.validateAsync({
                description,
                icon,
                name,
            });
            await this.eventStore.store({
                type: UPDATE_TAG_TYPE,
                createdBy: userName,
                data,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async getTagType(req, res) {
        const { name } = req.params;
        try {
            const tagType = await this.tagTypeStore.getTagType(name);
            res.json({ version, tagType });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteTagType(req, res) {
        const { name } = req.params;
        const userName = extractUsername(req);
        try {
            await this.eventStore.store({
                type: DELETE_TAG_TYPE,
                createdBy: userName,
                data: { name },
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = TagTypeController;
