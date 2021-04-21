'use strict';

import * as mime from 'mime';
import YAML from 'js-yaml';
import moment from 'moment';
import multer from 'multer';
import { Request, Response } from 'express';
import Controller from '../controller';
import { ADMIN } from '../../permissions';
import extractUser from '../../extract-user';
import { handleErrors } from './util';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import StateService from '../../services/state-service';

const upload = multer({ limits: { fileSize: 5242880 } });
const paramToBool = (param, def) => {
    if (param === null || param === undefined) {
        return def;
    }
    const nu = Number.parseInt(param, 10);
    if (Number.isNaN(nu)) {
        return param.toLowerCase() === 'true';
    }
    return Boolean(nu);
};
class StateController extends Controller {
    private logger: Logger;

    private stateService: StateService;

    constructor(
        config: IUnleashConfig,
        { stateService }: Pick<IUnleashServices, 'stateService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/state.js');
        this.stateService = stateService;
        this.fileupload('/import', upload.single('file'), this.import, ADMIN);
        this.get('/export', this.export, ADMIN);
    }

    async import(req: Request, res: Response): Promise<void> {
        const userName = extractUser(req);
        const { drop, keep } = req.query;
        // TODO: Should override request type so file is a type on request
        try {
            let data;
            // @ts-ignore
            if (req.file) {
                // @ts-ignore
                if (mime.getType(req.file.originalname) === 'text/yaml') {
                    // @ts-ignore
                    data = YAML.safeLoad(req.file.buffer);
                } else {
                    // @ts-ignore
                    data = JSON.parse(req.file.buffer);
                }
            } else {
                data = req.body;
            }

            await this.stateService.import({
                data,
                userName,
                dropBeforeImport: paramToBool(drop, false),
                keepExisting: paramToBool(keep, true),
            });
            res.sendStatus(202);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async export(req: Request, res: Response): Promise<void> {
        const { format } = req.query;

        const downloadFile = paramToBool(req.query.download, false);
        const includeStrategies = paramToBool(req.query.strategies, true);
        const includeFeatureToggles = paramToBool(
            req.query.featureToggles,
            true,
        );
        const includeProjects = paramToBool(req.query.projects, true);
        const includeTags = paramToBool(req.query.tags, true);

        try {
            const data = await this.stateService.export({
                includeStrategies,
                includeFeatureToggles,
                includeProjects,
                includeTags,
            });
            const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
            if (format === 'yaml') {
                if (downloadFile) {
                    res.attachment(`export-${timestamp}.yml`);
                }
                res.type('yaml').send(
                    YAML.safeDump(data, { skipInvalid: true }),
                );
            } else {
                if (downloadFile) {
                    res.attachment(`export-${timestamp}.json`);
                }
                res.json(data);
            }
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }
}
export default StateController;
module.exports = StateController;
