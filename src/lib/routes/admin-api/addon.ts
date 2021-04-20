'use strict';

import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import AddonService from '../../services/addon-service';

import extractUser from '../../extract-user';
import { handleErrors } from './util';
import { CREATE_ADDON, UPDATE_ADDON, DELETE_ADDON } from '../../permissions';

class AddonController extends Controller {
    private logger: Logger;

    private addonService: AddonService;

    constructor(
        config: IUnleashConfig,
        { addonService }: Pick<IUnleashServices, 'addonService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/addon.js');
        this.addonService = addonService;

        this.get('/', this.getAddons);
        this.post('/', this.createAddon, CREATE_ADDON);
        this.get('/:id', this.getAddon);
        this.put('/:id', this.updateAddon, UPDATE_ADDON);
        this.delete('/:id', this.deleteAddon, DELETE_ADDON);
    }

    async getAddons(req: Request, res: Response): Promise<void> {
        try {
            const addons = await this.addonService.getAddons();
            const providers = await this.addonService.getProviderDefinition();
            res.json({ addons, providers });
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async getAddon(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const addon = await this.addonService.getAddon(id);
            res.json(addon);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateAddon(req: Request, res: Response): Promise<void> {
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

    async createAddon(req: Request, res: Response): Promise<void> {
        const createdBy = extractUser(req);
        const data = req.body;
        try {
            const addon = await this.addonService.createAddon(data, createdBy);
            res.status(201).json(addon);
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteAddon(req: Request, res: Response): Promise<void> {
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
export default AddonController;
module.exports = AddonController;
