import { ADMIN } from '../../types/permissions';
import {
    type EmailService,
    TemplateFormat,
} from '../../services/email-service';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { Request, Response } from 'express';
import Controller from '../controller';
import type { Logger } from '../../logger';
import sanitize from 'sanitize-filename';

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
            sanitize(template),
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
            sanitize(template),
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
