import nodemailer from 'nodemailer';
import { EmailService } from './email-service';
import noLoggerProvider from '../../test/fixtures/no-logger';
import type { IUnleashConfig } from '../types';

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
    const spy = jest.spyOn(nodemailer, 'createTransport');

    new EmailService({
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
    } as unknown as IUnleashConfig);

    expect(spy).toHaveBeenCalledWith({
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

test('Can send order environments email', async () => {
    process.env.ORDER_ENVIRONMENTS_BCC = 'bcc@bcc.com';
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

    const customerId = 'customer133';
    const environments = [
        { name: 'test', type: 'development' },
        { name: 'live', type: 'production' },
    ];

    const content = await emailService.sendOrderEnvironmentEmail(
        'user@user.com',
        customerId,
        environments,
    );
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - ordered environments successfully');
    expect(
        content.html.includes(
            `<li>Name: ${environments[0].name}, Type: ${environments[0].type}</li>`,
        ),
    ).toBe(true);
    expect(
        content.html.includes(
            `<li>Name: ${environments[1].name}, Type: ${environments[1].type}</li>`,
        ),
    ).toBe(true);
    expect(content.html.includes(customerId)).toBe(true);
    expect(content.bcc).toBe('bcc@bcc.com');
});

test('Can send productivity report email', async () => {
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

    const customerId = 'customer133';

    const content = await emailService.sendProductivityReportEmail(
        'user@user.com',
        customerId,
    );
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - productivity report');
    expect(
        content.html.includes(`<b>Productivity report for customer133</b>`),
    ).toBe(true);
});
