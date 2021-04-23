import { createTransport, SentMessageInfo, Transporter } from 'nodemailer';
import Mustache from 'mustache';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import { IEmailOption } from '../types/option';

export interface IAuthOptions {
    user: string;
    pass: string;
}

export enum TemplateFormat {
    HTML = 'html',
    PLAIN = 'plain',
}

export enum TransporterType {
    SMTP = 'smtp',
    JSON = 'json',
}

export interface IEmailOptions {
    host: string;
    port: number;
    secure: boolean;
    sender: string;
    auth: IAuthOptions;
    transporterType: TransporterType;
}

const RESET_MAIL_SUBJECT = 'Unleash - Reset your password';
const GETTING_STARTED_SUBJECT = 'Welcome to Unleash';

export const MAIL_ACCEPTED = '250 Accepted';

export class EmailService {
    private logger: Logger;

    private mailer?: Transporter;

    private readonly sender: string;

    constructor(email: IEmailOption, getLogger: LogProvider) {
        this.logger = getLogger('services/email-service.ts');
        if (email && email.host) {
            this.sender = email.sender;
            if (email.host === 'test') {
                this.mailer = createTransport({ jsonTransport: true });
            } else {
                const connectionString = `${email.smtpuser}:${email.smtppass}@${email.host}:${email.port}`;
                this.mailer = email.secure
                    ? createTransport(`smtps://${connectionString}`)
                    : createTransport(`smtp://${connectionString}`);
            }
            this.logger.info(
                `Initialized transport to ${email.host} on port ${email.port} with user: ${email.smtpuser}`,
            );
        } else {
            this.sender = 'not-configured';
            this.mailer = undefined;
        }
    }

    async sendResetMail(
        name: string,
        recipient: string,
        resetLink: string,
    ): Promise<SentMessageInfo> {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const bodyHtml = await this.compileTemplate(
                'reset-password',
                TemplateFormat.HTML,
                {
                    resetLink,
                    name,
                    year,
                },
            );
            const bodyText = await this.compileTemplate(
                'reset-password',
                TemplateFormat.PLAIN,
                {
                    resetLink,
                    name,
                    year,
                },
            );
            const email = {
                from: this.sender,
                to: recipient,
                subject: RESET_MAIL_SUBJECT,
                html: bodyHtml,
                text: bodyText,
            };
            return this.mailer.sendMail(email);
        }
        return new Promise(res => {
            this.logger.warn(
                'No mailer is configured. Please read the docs on how to configure an emailservice',
            );
            res({});
        });
    }

    async sendGettingStartedMail(
        name: string,
        recipient: string,
        passwordLink: string,
    ): Promise<SentMessageInfo> {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const context = { passwordLink, name, year };
            const bodyHtml = await this.compileTemplate(
                'getting-started',
                TemplateFormat.HTML,
                context,
            );
            const bodyText = await this.compileTemplate(
                'getting-started',
                TemplateFormat.PLAIN,
                context,
            );
            const email = {
                from: this.sender,
                to: recipient,
                subject: GETTING_STARTED_SUBJECT,
                html: bodyHtml,
                text: bodyText,
            };
            return this.mailer.sendMail(email);
        }
        return new Promise(res => {
            this.logger.warn(
                'No mailer is configured. Please read the docs on how to configure an EmailService',
            );
            res({});
        });
    }

    isEnabled(): boolean {
        return this.mailer !== undefined;
    }

    private async compileTemplate(
        templateName: string,
        format: TemplateFormat,
        context: any,
    ): Promise<string> {
        try {
            const template = this.resolveTemplate(templateName, format);
            return await Promise.resolve(Mustache.render(template, context));
        } catch (e) {
            this.logger.info(`Could not find template ${templateName}`);
            return Promise.reject(e);
        }
    }

    private resolveTemplate(
        templateName: string,
        format: TemplateFormat,
    ): string {
        let topPath = path.resolve('mailtemplates');
        if (!existsSync(topPath)) {
            topPath = path.resolve('dist', 'mailtemplates');
        }
        const template = path.join(
            topPath,
            templateName,
            `${templateName}.${format}.mustache`,
        );
        if (existsSync(template)) {
            return readFileSync(template, 'utf-8');
        }
        throw new NotFoundError('Could not find template');
    }

    configured(): boolean {
        if (this.sender !== 'not-configured' && this.mailer !== undefined) {
            return true;
        }
        return false;
    }
}
