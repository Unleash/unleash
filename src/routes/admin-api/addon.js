'use strict';

const Controller = require('../controller');

const extractUser = require('../../extract-user');
const { handleErrors } = require('./util');
const {
    CREATE_ADDON,
    UPDATE_ADDON,
    DELETE_ADDON,
} = require('../../permissions');

class AddonController extends Controller {
    constructor(config, { addonService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/addon.js');
        this.addonService = addonService;

        this.get('/', this.getAddons);
        this.post('/', this.createAddon, CREATE_ADDON);
        this.get('/:id', this.getAddon);
        this.put('/:id', this.updateAddon, UPDATE_ADDON);
        this.delete('/:id', this.deleteAddon, DELETE_ADDON);
    }

    async getAddons(req, res) {
        try {
            const addons = await this.addonService.getAddons();
            const providers = await this.addonService.getProviderDefinition();
            res.json({ addons, providers });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async getAddon(req, res) {
        const { id } = req.params;
        try {
            const addon = await this.addonService.getAddon(id);
            res.json(addon);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateAddon(req, res) {
        const { id } = req.params;
        const createdBy = extractUser(req);
        const data = req.body;

        try {
            const addon = await this.addonService.updateAddon(
                id,
                data,
                createdBy,
            );
            res.status(200).json(addon);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async createAddon(req, res) {
        const createdBy = extractUser(req);
        const data = req.body;
        try {
            const addon = await this.addonService.createAddon(data, createdBy);
            res.status(201).json(addon);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteAddon(req, res) {
        const { id } = req.params;
        const username = extractUser(req);
        try {
            await this.addonService.removeAddon(id, username);
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = AddonController;
