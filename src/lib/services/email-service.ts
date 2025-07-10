import { createTransport, type Transporter } from 'nodemailer';
import Mustache from 'mustache';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import type { Logger } from '../logger.js';
import NotFoundError from '../error/notfound-error.js';
import type { IUnleashConfig } from '../types/option.js';
import {
    type ProductivityReportMetrics,
    productivityReportViewModel,
} from '../features/productivity-report/productivity-report-view-model.js';
import { fileURLToPath } from 'node:url';
import type { IFlagResolver } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    bcc?: string;
    subject: string;
    html: string;
    text: string;
    attachments?: {
        filename: string;
        path: string;
        cid: string;
    }[];
    headers?: Record<string, string>;
}

export interface ICrApprovalParameters {
    changeRequestLink: string;
    changeRequestTitle: string;
    requesterName: string;
    requesterEmail: string;
}

const RESET_MAIL_SUBJECT = 'Unleash - Reset your password';
const GETTING_STARTED_SUBJECT = 'Welcome to Unleash';
const PRODUCTIVITY_REPORT = 'Unleash - productivity report';
const SCHEDULED_CHANGE_CONFLICT_SUBJECT =
    'Unleash - Scheduled changes can no longer be applied';
const SCHEDULED_EXECUTION_FAILED_SUBJECT =
    'Unleash - Scheduled change request could not be applied';
const REQUESTED_CR_APPROVAL_SUBJECT =
    'Unleash - new change request waiting to be reviewed';
export const MAIL_ACCEPTED = '250 Accepted';

export type ChangeRequestScheduleConflictData =
    | { reason: 'flag archived'; flagName: string }
    | {
          reason: 'strategy deleted';
          flagName: string;
          strategyId: string;
      }
    | {
          reason: 'strategy updated';
          flagName: string;
          strategyId: string;
      }
    | {
          reason: 'segment updated';
          segment: { id: number; name: string };
      }
    | {
          reason: 'environment variants updated';
          flagName: string;
          environment: string;
      };

export type TransportProvider = () => Transporter;
export class EmailService {
    private logger: Logger;
    private config: IUnleashConfig;

    private readonly mailer?: Transporter;

    private readonly sender: string;

    private flagResolver: IFlagResolver;

    constructor(config: IUnleashConfig, transportProvider?: TransportProvider) {
        this.config = config;
        this.logger = config.getLogger('services/email-service.ts');
        this.flagResolver = config.flagResolver;
        const { email } = config;
        if (email?.host) {
            this.sender = email.sender;
            const provider = transportProvider
                ? transportProvider
                : createTransport;
            if (email.host === 'test') {
                this.mailer = provider({ jsonTransport: true });
            } else {
                this.mailer = provider({
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

    async sendRequestedCRApprovalEmail(
        recipient: string,
        crApprovalParams: ICrApprovalParameters,
    ): Promise<IEmailEnvelope> {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const bodyHtml = await this.compileTemplate(
                'requested-cr-approval',
                TemplateFormat.HTML,
                {
                    ...crApprovalParams,
                    year,
                },
            );
            const bodyText = await this.compileTemplate(
                'requested-cr-approval',
                TemplateFormat.PLAIN,
                {
                    ...crApprovalParams,
                    year,
                },
            );
            const email = {
                from: this.sender,
                to: recipient,
                subject: REQUESTED_CR_APPROVAL_SUBJECT,
                html: bodyHtml,
                text: bodyText,
            };
            process.nextTick(() => {
                this.mailer!.sendMail(email).then(
                    () =>
                        this.logger.info(
                            'Successfully sent requested-cr-approval email',
                        ),
                    (e) =>
                        this.logger.warn(
                            'Failed to send requested-cr-approval email',
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
                subject: REQUESTED_CR_APPROVAL_SUBJECT,
                html: '',
                text: '',
            });
        });
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
        conflictingChangeRequestId: number | undefined,
        changeRequests: {
            id: number;
            scheduledAt: string;
            link: string;
            title?: string;
        }[],
        flagName: string,
        project: string,
        strategyId?: string,
    ) {
        const conflictData =
            conflictScope === 'flag'
                ? { reason: 'flag archived' as const, flagName }
                : {
                      reason: 'strategy deleted' as const,
                      flagName,
                      strategyId: strategyId ?? '',
                  };

        return this.sendScheduledChangeSuspendedEmail(
            recipient,
            conflictData,
            conflictingChangeRequestId,
            changeRequests,
            project,
        );
    }

    async sendScheduledChangeSuspendedEmail(
        recipient: string,
        conflictData: ChangeRequestScheduleConflictData,

        conflictingChangeRequestId: number | undefined,
        changeRequests: {
            id: number;
            scheduledAt: string;
            link: string;
            title?: string;
        }[],
        project: string,
    ) {
        if (this.configured()) {
            const year = new Date().getFullYear();
            const getConflictDetails = () => {
                switch (conflictData.reason) {
                    case 'flag archived':
                        return {
                            conflictScope: 'flag',
                            conflict: `The feature flag ${conflictData.flagName} in ${project} has been archived`,
                            flagArchived: true,
                            flagLink: `${this.config.server.unleashUrl}/projects/${project}/archive?sort=archivedAt&search=${conflictData.flagName}`,
                            canBeRescheduled: false,
                        };
                    case 'strategy deleted':
                        return {
                            conflictScope: 'strategy',
                            conflict: `The strategy with id ${conflictData.strategyId} for flag ${conflictData.flagName} in ${project} has been deleted`,
                            canBeRescheduled: false,
                        };
                    case 'strategy updated':
                        return {
                            conflictScope: 'strategy',
                            conflict: `A strategy belonging to ${conflictData.flagName} (ID: ${conflictData.strategyId}) in the project ${project} has been updated, and your changes would overwrite some of the recent changes`,
                            canBeRescheduled: true,
                        };
                    case 'environment variants updated':
                        return {
                            conflictScope: 'environment variant configuration',
                            conflict: `The ${conflictData.environment} environment variant configuration for ${conflictData.flagName} in the project ${project} has been updated, and your changes would overwrite some of the recent changes`,
                            canBeRescheduled: true,
                        };
                    case 'segment updated':
                        return {
                            conflictScope: 'segment',
                            conflict: `Segment ${conflictData.segment.id} ("${conflictData.segment.name}") in ${project} has been updated, and your changes would overwrite some of the recent changes`,
                            canBeRescheduled: true,
                        };
                }
            };

            const {
                canBeRescheduled,
                conflict,
                conflictScope,
                flagArchived = false,
                flagLink = false,
            } = getConflictDetails();

            const conflictingChangeRequestLink = conflictingChangeRequestId
                ? `${this.config.server.unleashUrl}/projects/${project}/change-requests/${conflictingChangeRequestId}`
                : false;

            const bodyHtml = await this.compileTemplate(
                'scheduled-change-conflict',
                TemplateFormat.HTML,
                {
                    conflict,
                    conflictScope,
                    canBeRescheduled,
                    flagArchived,
                    flagLink,
                    conflictingChangeRequestLink,
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
                    canBeRescheduled,
                    flagArchived,
                    flagLink,
                    conflictingChangeRequestLink,
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
                recipient,
            };

            const gettingStartedTemplate = 'getting-started';

            // If the password link is the base Unleash URL, we remove it from the context
            // This can happen if the instance is using SSO instead of password-based authentication
            // In that case, our template should show the alternative path: You don't set a password, you log in with SSO
            if (passwordLink === unleashUrl) {
                delete context.passwordLink;
            }

            const bodyHtml = await this.compileTemplate(
                gettingStartedTemplate,
                TemplateFormat.HTML,
                context,
            );
            const bodyText = await this.compileTemplate(
                gettingStartedTemplate,
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

    async sendProductivityReportEmail(
        userEmail: string,
        userName: string,
        metrics: ProductivityReportMetrics,
    ): Promise<IEmailEnvelope> {
        if (this.configured()) {
            const context = productivityReportViewModel({
                metrics,
                userEmail,
                userName,
                unleashUrl: this.config.server.unleashUrl,
            });

            const template = 'productivity-report';

            const bodyHtml = await this.compileTemplate(
                template,
                TemplateFormat.HTML,
                context,
            );
            const bodyText = await this.compileTemplate(
                template,
                TemplateFormat.PLAIN,
                context,
            );

            const headers: Record<string, string> = {};
            Object.entries(this.config.email.optionalHeaders || {}).forEach(
                ([key, value]) => {
                    if (typeof value === 'string') {
                        headers[key] = value;
                    }
                },
            );

            const email: IEmailEnvelope = {
                from: this.sender,
                to: userEmail,
                bcc: '',
                subject: PRODUCTIVITY_REPORT,
                html: bodyHtml,
                text: bodyText,
                attachments: [
                    this.resolveTemplateAttachment(
                        template,
                        'unleash-logo.png',
                        'unleashLogo',
                    ),
                ],
                headers,
            } satisfies IEmailEnvelope;

            process.nextTick(() => {
                this.mailer!.sendMail(email).then(
                    () =>
                        this.logger.info(
                            'Successfully sent productivity report email',
                        ),
                    (e) =>
                        this.logger.warn(
                            'Failed to send productivity report email',
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
                to: userEmail,
                bcc: '',
                subject: PRODUCTIVITY_REPORT,
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

    private resolveTemplateAttachment(
        templateName: string,
        filename: string,
        cid: string,
    ): {
        filename: string;
        path: string;
        cid: string;
    } {
        const topPath = path.resolve(__dirname, '../../mailtemplates');
        const attachment = path.join(topPath, templateName, filename);
        if (existsSync(attachment)) {
            return {
                filename,
                path: attachment,
                cid,
            };
        }

        throw new NotFoundError('Could not find email attachment');
    }

    configured(): boolean {
        return this.sender !== 'not-configured' && this.mailer !== undefined;
    }

    stripSpecialCharacters(str: string): string {
        return str?.replace(/[`~!@#$%^&*()_|+=?;:'",.<>{}[\]\\/]/gi, '');
    }
}
