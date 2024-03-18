import { createTransport, type Transporter } from 'nodemailer';
import Mustache from 'mustache';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import type { Logger } from '../logger';
import NotFoundError from '../error/notfound-error';
import type { IUnleashConfig } from '../types/option';

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

export class EmailService {
    private logger: Logger;
    private config: IUnleashConfig;

    private readonly mailer?: Transporter;

    private readonly sender: string;

    constructor(config: IUnleashConfig) {
        this.config = config;
        this.logger = config.getLogger('services/email-service.ts');
        const { email } = config;
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
