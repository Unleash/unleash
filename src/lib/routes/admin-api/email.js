import { TemplateFormat } from '../../services/email-service';
import { handleErrors } from './util';

const Controller = require('../controller');

class EmailController extends Controller {
    constructor(config, { emailService }) {
        super(config);
        this.emailService = emailService;
        this.logger = config.getLogger('routes/admin-api/email');
        this.get('/preview/html/:template', this.getHtmlPreview);
        this.get('/preview/text/:template', this.getTextPreview);
    }

    async getHtmlPreview(req, res) {
        try {
            const { template } = req.params;
            const ctx = req.query;
            const data = await this.emailService.compileTemplate(
                template,
                TemplateFormat.HTML,
                ctx,
            );
            res.setHeader('Content-Type', 'text/html');
            res.status(200);
            res.send(data);
            res.end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getTextPreview(req, res) {
        try {
            const { template } = req.params;
            const ctx = req.query;
            const data = await this.emailService.compileTemplate(
                template,
                TemplateFormat.PLAIN,
                ctx,
            );
            res.setHeader('Content-Type', 'text/plain');
            res.status(200);
            res.send(data);
            res.end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}
module.exports = EmailController;
