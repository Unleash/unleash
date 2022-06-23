import { ADMIN } from '../../types/permissions';
import { EmailService, TemplateFormat } from '../../services/email-service';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Request, Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';

export default class EmailController extends Controller {
    private emailService: EmailService;

    private logger: Logger;

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

    async getHtmlPreview(req: Request, res: Response): Promise<void> {
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

    async getTextPreview(req: Request, res: Response): Promise<void> {
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
