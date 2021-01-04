'use strict';

const Controller = require('../controller');

const { tagSchema } = require('./tag-schema');
const { CREATE_TAG, DELETE_TAG } = require('../../command-type');
const { UPDATE_FEATURE } = require('../../permissions');
const { handleErrors } = require('./util');
const extractUsername = require('../../extract-user');

const version = 1;

class TagController extends Controller {
    constructor(config) {
        super(config);
        this.featureTagStore = config.stores.featureTagStore;
        this.eventStore = config.stores.eventStore;
        this.logger = config.getLogger('/admin-api/tag.js');

        this.get('/', this.getTags);
        this.post('/', this.createTag, UPDATE_FEATURE);
        this.get('/:type', this.getTagsByType);
        this.get('/:type/:value', this.getTagByTypeAndValue);
        this.delete('/:type/:value', this.deleteTag, UPDATE_FEATURE);
    }

    async getTags(req, res) {
        const tags = await this.featureTagStore.getTags();
        res.json({ version, tags });
    }

    async getTagsByType(req, res) {
        const tags = await this.featureTagStore.getAllOfType(req.params.type);
        res.json({ version, tags });
    }

    async getTagByTypeAndValue(req, res) {
        const { type, value } = req.params;
        try {
            const tag = await this.featureTagStore.getTagByTypeAndValue(
                type,
                value,
            );
            res.json({ version, tag });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async createTag(req, res) {
        const userName = extractUsername(req);
        try {
            const data = await tagSchema.validateAsync(req.body);
            await this.eventStore.store({
                type: CREATE_TAG,
                createdBy: userName,
                data,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteTag(req, res) {
        const { type, value } = req.params;
        const userName = extractUsername(req);

        try {
            await this.eventStore.store({
                type: DELETE_TAG,
                createdBy: userName || 'unleash-system',
                data: {
                    type,
                    value,
                },
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = TagController;
