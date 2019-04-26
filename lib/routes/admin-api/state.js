'use strict';

const Controller = require('../controller');
const { ADMIN } = require('../../permissions');
const extractUser = require('../../extract-user');
const { handleErrors } = require('./util');
const mime = require('mime');
const YAML = require('js-yaml');
const moment = require('moment');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5242880 } });

class StateController extends Controller {
    constructor(config) {
        super(config);
        this.fileupload('/import', upload.single('file'), this.import, ADMIN);
        this.get('/export', this.export, ADMIN);
    }

    async import(req, res) {
        const userName = extractUser(req);
        const { drop } = req.query;

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

            await this.config.stateService.import({
                data,
                userName,
                dropBeforeImport: drop,
            });
            res.sendStatus(202);
        } catch (err) {
            handleErrors(res, err);
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
            const data = await this.config.stateService.export({
                includeStrategies,
                includeFeatureToggles,
            });
            const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
            if (format === 'yaml') {
                if (downloadFile) {
                    res.attachment(`export-${timestamp}.yml`);
                }
                res.type('yaml').send(YAML.safeDump(data));
            } else {
                if (downloadFile) {
                    res.attachment(`export-${timestamp}.json`);
                }
                res.json(data);
            }
        } catch (err) {
            handleErrors(res, err);
        }
    }
}

module.exports = StateController;
