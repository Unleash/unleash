import { EmailService, type TransportProvider } from './email-service.js';
import noLoggerProvider from '../../test/fixtures/no-logger.js';
import type { IUnleashConfig } from '../types/index.js';
import { vi } from 'vitest';

test('Can send reset email', async () => {
    const emailService = new EmailService({
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);
    const resetLinkUrl =
        'https://unleash-hosted.com/reset-password?token=$2b$10$M06Ysso6KL4ueH/xR6rdSuY5GSymdIwmIkEUJMRkB.Qn26r5Gi5vW';

    const content = await emailService.sendResetMail(
        'Some username',
        'test@resetLinkUrl.com',
        resetLinkUrl,
    );
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - Reset your password');
    expect(content.html.includes(resetLinkUrl)).toBe(true);
    expect(content.text.includes(resetLinkUrl)).toBe(true);
});

test('Can send welcome mail', async () => {
    const emailService = new EmailService({
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
        flagResolver: {
            isEnabled: () => true,
        },
    } as unknown as IUnleashConfig);
    const content = await emailService.sendGettingStartedMail(
        'Some username',
        'test@test.com',
        'abc123456',
    );
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Welcome to Unleash');
});

test('Can supply additional SMTP transport options', async () => {
    const transport = vi.fn() as unknown as TransportProvider;

    new EmailService(
        {
            email: {
                host: 'smtp.unleash.test',
                port: 9999,
                secure: false,
                sender: 'noreply@getunleash.ai',
                transportOptions: {
                    tls: {
                        rejectUnauthorized: true,
                    },
                },
            },
            getLogger: noLoggerProvider,
        } as unknown as IUnleashConfig,
        transport,
    );

    expect(transport).toHaveBeenCalledWith({
        auth: {
            user: '',
            pass: '',
        },
        host: 'smtp.unleash.test',
        port: 9999,
        secure: false,
        tls: {
            rejectUnauthorized: true,
        },
    });
});

test('should strip special characters from email subject', async () => {
    const emailService = new EmailService({
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);
    expect(emailService.stripSpecialCharacters('http://evil.com')).toBe(
        'httpevilcom',
    );
    expect(emailService.stripSpecialCharacters('http://ööbik.com')).toBe(
        'httpööbikcom',
    );
    expect(emailService.stripSpecialCharacters('tom-jones')).toBe('tom-jones');
});

test('Can send productivity report email', async () => {
    const emailService = new EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);

    const content = await emailService.sendProductivityReportEmail(
        'user@user.com',
        'customerId',
        {
            flagsCreated: 1,
            productionUpdates: 2,
            health: 99,
            previousMonth: {
                health: 89,
                flagsCreated: 1,
                productionUpdates: 3,
            },
        },
    );
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - productivity report');
    expect(content.html).toContain('Productivity Report');
    expect(content.html).toContain('localhost/insights');
    expect(content.html).toContain('localhost/profile');
    expect(content.html).toContain('#68a611');
    expect(content.html).toContain('1%');
    expect(content.html).toContain('10% less than previous month');
    expect(content.text).toContain('localhost/insights');
    expect(content.text).toContain('localhost/profile');
    expect(content.text).toContain('localhost/profile');
    expect(content.text).toContain('Your instance technical debt: 1%');
});

test('Sets correct color for technical debt', async () => {
    const emailService = new EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);

    const content = await emailService.sendProductivityReportEmail(
        'user@user.com',
        'customerId',
        {
            flagsCreated: 1,
            productionUpdates: 2,
            health: 20,
            previousMonth: {
                health: 50,
                flagsCreated: 1,
                productionUpdates: 3,
            },
        },
    );
    expect(content.html).not.toContain('#68a611');
    expect(content.html).toContain('#d93644');
    expect(content.html).toContain(
        'Remember to archive stale flags to reduce technical debt and keep your project healthy',
    );
});

test('warns the token owner before their personal API token expires', async () => {
    const emailService = new EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);

    const content = await emailService.sendPersonalApiTokenExpiryEmail({
        recipientEmail: 'owner@example.com',
        recipientName: 'Token Owner',
        tokenDescription: 'ci-pipeline',
        daysUntilExpiry: 14,
    });

    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.to).toBe('owner@example.com');
    expect(content.subject).toBe(
        'Unleash - your personal API token expires in 14 days',
    );
    expect(content.html).toContain(
        'Your personal API token <strong>ci-pipeline</strong> will expire in <strong>14 days</strong>.',
    );
    expect(content.text).toContain(
        'Your personal API token ci-pipeline will expire in 14 days.',
    );
    expect(content.text).toContain(
        'Manage tokens in Unleash: http://localhost/profile/personal-api-tokens',
    );
});

test('points admins at the service account whose token is about to expire', async () => {
    const emailService = new EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);

    const content = await emailService.sendServiceAccountTokenExpiryEmail({
        recipientEmail: 'admin@example.com',
        tokenDescription: 'R&D deploy-token',
        daysUntilExpiry: 1,
        serviceAccountName: 'deploy-bot',
    });

    expect(content.to).toBe('admin@example.com');
    expect(content.subject).toBe(
        'Unleash - a service account token expires in 1 day',
    );
    expect(content.html).toContain(
        'The token <strong>R&amp;D deploy-token</strong> of service account <strong>deploy-bot</strong> will expire in <strong>1 day</strong>.',
    );
    expect(content.text).toContain(
        'The token R&D deploy-token of service account deploy-bot will expire in 1 day.',
    );
    expect(content.text).toContain(
        'Manage service accounts in Unleash: http://localhost/admin/service-accounts',
    );
});

test('Should add optional headers to productivity email', async () => {
    const emailService = new EmailService({
        server: {
            unleashUrl: 'http://localhost',
        },
        email: {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
            optionalHeaders: {
                'x-header-name': 'value',
            },
        },
        getLogger: noLoggerProvider,
    } as unknown as IUnleashConfig);

    const passwordResetMail = await emailService.sendResetMail(
        'name',
        'user@example.com',
        'http://exempla.com',
    );

    const productivityMail = await emailService.sendProductivityReportEmail(
        'user@user.com',
        'customerId',
        {
            flagsCreated: 1,
            productionUpdates: 2,
            health: 99,
            previousMonth: null,
        },
    );

    expect(passwordResetMail.headers).toBeFalsy();

    expect(productivityMail.headers).toStrictEqual({
        'x-header-name': 'value',
    });
});
