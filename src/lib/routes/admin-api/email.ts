import { ADMIN } from '../../types/permissions.js';
import {
    type EmailService,
    TemplateFormat,
} from '../../services/email-service.js';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type { Request, Response } from 'express';
import Controller from '../controller.js';
import type { Logger } from '../../logger.js';
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
        const data = await this.emailService.compileTemplate(
            sanitize(template),
            TemplateFormat.HTML,
            req.query,
            { escapeContext: true },
        );
        res.setHeader('Content-Type', 'text/html');
        res.status(200);
        res.send(data);
        res.end();
    }

    async getTextPreview(req: Request, res: Response): Promise<void> {
        const { template } = req.params;
        const data = await this.emailService.compileTemplate(
            sanitize(template),
            TemplateFormat.PLAIN,
            req.query,
        );
        res.setHeader('Content-Type', 'text/plain');
        res.status(200);
        res.send(data);
        res.end();
    }
}
