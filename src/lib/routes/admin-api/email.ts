import { ADMIN } from '../../types/permissions';
import { TemplateFormat } from '../../services/email-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';

const Controller = require('../controller');

export default class EmailController extends Controller {
    constructor(
        config: IUnleashConfig,
        { emailService }: Pick<IUnleashServices, 'emailService'>,
    ) {
        super(config);
        this.emailService = emailService;
        this.logger = config.getLogger('routes/admin-api/email');
        this.get('/preview/html/:template', this.getHtmlPreview, ADMIN);
        this.get('/preview/text/:template', this.getTextPreview, ADMIN);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getHtmlPreview(req, res): Promise<void> {
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
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getTextPreview(req, res) {
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
    }
}
module.exports = EmailController;
