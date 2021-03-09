'use strict';

const mime = require('mime');
const YAML = require('js-yaml');
const moment = require('moment');
const multer = require('multer');
const Controller = require('../controller');
const { ADMIN } = require('../../permissions');
const extractUser = require('../../extract-user');
const { handleErrors } = require('./util');

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
    constructor(config, services) {
        super(config);
        this.logger = config.getLogger('/admin-api/state.js');
        this.stateService = services.stateService;
        this.fileupload('/import', upload.single('file'), this.import, ADMIN);
        this.get('/export', this.export, ADMIN);
    }

    async import(req, res) {
        const userName = extractUser(req);
        const { drop, keep } = req.query;

        try {
            let data;
            if (req.file) {
                if (mime.getType(req.file.originalname) === 'text/yaml') {
                    data = YAML.safeLoad(req.file.buffer);
                } else {
                    data = JSON.parse(req.file.buffer);
                }
            } else {
                data = req.body;
            }

            await this.stateService.import({
                data,
                userName,
                dropBeforeImport: paramToBool(drop),
                keepExisting: paramToBool(keep),
            });
            res.sendStatus(202);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async export(req, res) {
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

module.exports = StateController;
