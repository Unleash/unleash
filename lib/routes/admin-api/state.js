'use strict';

const Controller = require('../controller');
const { ADMIN } = require('../../permissions');
const extractUser = require('../../extract-user');
const { handleErrors } = require('./util');
const YAML = require('js-yaml');
const moment = require('moment');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5242880 } });

class ImportController extends Controller {
    constructor(config) {
        super(config);
        this.fileupload('/import', upload.single('file'), this.import, ADMIN);
        this.get('/export', this.export, ADMIN);
    }

    async import(req, res) {
        const userName = extractUser(req);
        const { drop } = req.query;

        let data;
        if (req.file) {
            if (req.file.mimetype === 'text/yaml') {
                data = YAML.safeLoad(req.file.buffer);
            } else {
                data = JSON.parse(req.file.buffer);
            }
        } else {
            data = req.body;
        }

        try {
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

        let strategies = 'strategies' in req.query;
        let featureToggles = 'features' in req.query;

        if (!strategies && !featureToggles) {
            strategies = true;
            featureToggles = true;
        }

        try {
            const data = await this.config.stateService.export({
                strategies,
                featureToggles,
            });
            const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
            if (format === 'yaml') {
                if ('download' in req.query) {
                    res.attachment(`export-${timestamp}.yml`);
                }
                res.type('yaml').send(YAML.safeDump(data));
            } else {
                if ('download' in req.query) {
                    res.attachment(`export-${timestamp}.json`);
                }
                res.json(data);
            }
        } catch (err) {
            handleErrors(res, err);
        }
    }
}

module.exports = ImportController;
