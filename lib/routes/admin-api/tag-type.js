'use strict';

const Controller = require('../controller');

const { UPDATE_FEATURE } = require('../../permissions');
const { handleErrors } = require('./util');
const extractUsername = require('../../extract-user');

const version = 1;

class TagTypeController extends Controller {
    constructor(config, { tagTypeService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/tag-type.js');
        this.tagTypeService = tagTypeService;
        this.get('/', this.getTagTypes);
        this.post('/', this.createTagType, UPDATE_FEATURE);
        this.post('/validate', this.validate);
        this.get('/:name', this.getTagType);
        this.put('/:name', this.updateTagType, UPDATE_FEATURE);
        this.delete('/:name', this.deleteTagType, UPDATE_FEATURE);
    }

    async getTagTypes(req, res) {
        const tagTypes = await this.tagTypeService.getAll();
        res.json({ version, tagTypes });
    }

    async validate(req, res) {
        try {
            await this.tagTypeService.validate(req.body);
            res.status(200).json({ valid: true, tagType: req.body });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createTagType(req, res) {
        const userName = extractUsername(req);
        try {
            const tagType = await this.tagTypeService.createTagType(
                req.body,
                userName,
            );
            res.status(201).json(tagType);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateTagType(req, res) {
        const { description, icon } = req.body;
        const { name } = req.params;
        const userName = extractUsername(req);
        try {
            await this.tagTypeService.updateTagType(
                { name, description, icon },
                userName,
            );
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async getTagType(req, res) {
        const { name } = req.params;
        try {
            const tagType = await this.tagTypeService.getTagType(name);
            res.json({ version, tagType });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteTagType(req, res) {
        const { name } = req.params;
        const userName = extractUsername(req);
        try {
            await this.tagTypeService.deleteTagType(name, userName);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = TagTypeController;
