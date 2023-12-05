import { createTransport, Transporter } from 'nodemailer';
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

export interface IEmailEnvelope {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
}

const RESET_MAIL_SUBJECT = 'Unleash - Reset your password';
const GETTING_STARTED_SUBJECT = 'Welcome to Unleash';
const SCHEDULED_CHANGE_CONFLICT_SUBJECT =
    'Unleash - Scheduled changes can no longer be applied';
const SCHEDULED_EXECUTION_FAILED_SUBJECT =
    'Unleash - Scheduled change request could not be applied';

export const MAIL_ACCEPTED = '250 Accepted';

export class EmailService {
    private logger: Logger;

    private readonly mailer?: Transporter;

    private readonly sender: string;

    constructor(email: IEmailOption | undefined, getLogger: LogProvider) {
        this.logger = getLogger('services/email-service.ts');
        if (email?.host) {
            this.sender = email.sender;
            if (email.host === 'test') {
                this.mailer = createTransport({ jsonTransport: true });
            } else {
                this.mailer = createTransport({
                    host: email.host,
                    port: email.port,
                    secure: email.secure,
                    auth: {
                        user: email.smtpuser ?? '',
                        pass: email.smtppass ?? '',
                    },
                    ...email.transportOptions,
                });
            }
            this.logger.info(
                `Initialized transport to ${email.host} on port ${email.port} with user: ${email.smtpuser}`,
            );
        } else {
            this.sender = 'not-configured';
            this.mailer = undefined;
        }
    }

    async sendScheduledExecutionFailedEmail(
        recipient: string,
        changeRequestLink: string,
        changeRequestTitle: string,
        scheduledAt: string,
        errorMessage: string,
    ): Promise<IEmailEnvelope> {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const bodyHtml = await this.compileTemplate(
                'scheduled-execution-failed',
                TemplateFormat.HTML,
                {
                    changeRequestLink,
                    changeRequestTitle,
                    scheduledAt,
                    errorMessage,
                    year,
                },
            );
            const bodyText = await this.compileTemplate(
                'scheduled-execution-failed',
                TemplateFormat.PLAIN,
                {
                    changeRequestLink,
                    changeRequestTitle,
                    scheduledAt,
                    errorMessage,
                    year,
                },
            );
            const email = {
                from: this.sender,
                to: recipient,
                subject: SCHEDULED_EXECUTION_FAILED_SUBJECT,
                html: bodyHtml,
                text: bodyText,
            };
            process.nextTick(() => {
                this.mailer!.sendMail(email).then(
                    () =>
                        this.logger.info(
                            'Successfully sent scheduled-execution-failed email',
                        ),
                    (e) =>
                        this.logger.warn(
                            'Failed to send scheduled-execution-failed email',
                            e,
                        ),
                );
            });
            return Promise.resolve(email);
        }
        return new Promise((res) => {
            this.logger.warn(
                'No mailer is configured. Please read the docs on how to configure an email service',
            );
            this.logger.debug('Change request link: ', changeRequestLink);
            res({
                from: this.sender,
                to: recipient,
                subject: SCHEDULED_EXECUTION_FAILED_SUBJECT,
                html: '',
                text: '',
            });
        });
    }

    async sendScheduledChangeConflictEmail(
        recipient: string,
        conflictScope: 'flag' | 'strategy',
        changeRequests: {
            id: number;
            scheduledAt: string;
            link: string;
            title?: string;
        }[],
        strategyIdOrFlagName: string,
    ) {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const conflict =
                conflictScope === 'flag'
                    ? `The feature flag ${strategyIdOrFlagName} has been archived.`
                    : `The strategy with id ${strategyIdOrFlagName} has been deleted. `;

            const conflictResolution =
                conflictScope === 'flag'
                    ? ' unless the flag is revived'
                    : false;

            const bodyHtml = await this.compileTemplate(
                'scheduled-change-conflict',
                TemplateFormat.HTML,
                {
                    conflict,
                    conflictScope,
                    conflictResolution,
                    changeRequests,
                    year,
                },
            );
            const bodyText = await this.compileTemplate(
                'scheduled-change-conflict',
                TemplateFormat.PLAIN,
                {
                    conflict,
                    conflictScope,
                    conflictResolution,
                    changeRequests,
                    year,
                },
            );
            const email = {
                from: this.sender,
                to: recipient,
                subject: SCHEDULED_CHANGE_CONFLICT_SUBJECT,
                html: bodyHtml,
                text: bodyText,
            };
            process.nextTick(() => {
                this.mailer!.sendMail(email).then(
                    () =>
                        this.logger.info(
                            'Successfully sent scheduled-change-conflict email',
                        ),
                    (e) =>
                        this.logger.warn(
                            'Failed to send scheduled-change-conflict email',
                            e,
                        ),
                );
            });
            return Promise.resolve(email);
        }
        return new Promise((res) => {
            this.logger.warn(
                'No mailer is configured. Please read the docs on how to configure an email service',
            );
            res({
                from: this.sender,
                to: recipient,
                subject: SCHEDULED_CHANGE_CONFLICT_SUBJECT,
                html: '',
                text: '',
            });
        });
    }

    async sendResetMail(
        name: string,
        recipient: string,
        resetLink: string,
    ): Promise<IEmailEnvelope> {
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
            process.nextTick(() => {
                this.mailer!.sendMail(email).then(
                    () =>
                        this.logger.info(
                            'Successfully sent reset-password email',
                        ),
                    (e) =>
                        this.logger.warn(
                            'Failed to send reset-password email',
                            e,
                        ),
                );
            });
            return Promise.resolve(email);
        }
        return new Promise((res) => {
            this.logger.warn(
                'No mailer is configured. Please read the docs on how to configure an emailservice',
            );
            this.logger.debug('Reset link: ', resetLink);
            res({
                from: this.sender,
                to: recipient,
                subject: RESET_MAIL_SUBJECT,
                html: '',
                text: '',
            });
        });
    }

    async sendGettingStartedMail(
        name: string,
        recipient: string,
        unleashUrl: string,
        passwordLink?: string,
    ): Promise<IEmailEnvelope> {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const context = {
                passwordLink,
                name: this.stripSpecialCharacters(name),
                year,
                unleashUrl,
            };
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
            process.nextTick(() => {
                this.mailer!.sendMail(email).then(
                    () =>
                        this.logger.info(
                            'Successfully sent getting started email',
                        ),
                    (e) =>
                        this.logger.warn(
                            'Failed to send getting started email',
                            e,
                        ),
                );
            });
            return Promise.resolve(email);
        }
        return new Promise((res) => {
            this.logger.warn(
                'No mailer is configured. Please read the docs on how to configure an EmailService',
            );
            res({
                from: this.sender,
                to: recipient,
                subject: GETTING_STARTED_SUBJECT,
                html: '',
                text: '',
            });
        });
    }

    isEnabled(): boolean {
        return this.mailer !== undefined;
    }

    async compileTemplate(
        templateName: string,
        format: TemplateFormat,
        context: unknown,
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
        const topPath = path.resolve(__dirname, '../../mailtemplates');
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
        return this.sender !== 'not-configured' && this.mailer !== undefined;
    }

    stripSpecialCharacters(str: string): string {
        return str?.replace(/[`~!@#$%^&*()_|+=?;:'",.<>{}[\]\\/]/gi, '');
    }
}
