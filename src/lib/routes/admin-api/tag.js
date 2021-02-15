'use strict';

const Controller = require('../controller');

const { UPDATE_FEATURE } = require('../../permissions');
const { handleErrors } = require('./util');
const extractUsername = require('../../extract-user');

const version = 1;

class TagController extends Controller {
    constructor(config, { tagService }) {
        super(config);
        this.tagService = tagService;
        this.logger = config.getLogger('/admin-api/tag.js');

        this.get('/', this.getTags);
        this.post('/', this.createTag, UPDATE_FEATURE);
        this.get('/:type', this.getTagsByType);
        this.get('/:type/:value', this.getTag);
        this.delete('/:type/:value', this.deleteTag, UPDATE_FEATURE);
    }

    async getTags(req, res) {
        try {
            const tags = await this.tagService.getTags();
            res.json({ version, tags });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getTagsByType(req, res) {
        try {
            const tags = await this.tagService.getTagsByType(req.params.type);
            res.json({ version, tags });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getTag(req, res) {
        const { type, value } = req.params;
        try {
            const tag = await this.tagService.getTag({ type, value });
            res.json({ version, tag });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async createTag(req, res) {
        const userName = extractUsername(req);
        try {
            await this.tagService.createTag(req.body, userName);
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteTag(req, res) {
        const { type, value } = req.params;
        const userName = extractUsername(req);
        try {
            await this.tagService.deleteTag({ type, value }, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = TagController;
