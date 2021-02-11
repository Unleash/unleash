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
                dropBeforeImport: drop,
                keepExisting: keep,
            });
            res.sendStatus(202);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async export(req, res) {
        const { format } = req.query;

        const downloadFile = Boolean(req.query.download);
        let includeStrategies = Boolean(req.query.strategies);
        let includeFeatureToggles = Boolean(req.query.featureToggles);

        // if neither is passed as query argument, export both
        if (!includeStrategies && !includeFeatureToggles) {
            includeStrategies = true;
            includeFeatureToggles = true;
        }

        try {
            const data = await this.stateService.export({
                includeStrategies,
                includeFeatureToggles,
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
