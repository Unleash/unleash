import test from 'ava';
import { EmailService, TransporterType } from './email-service';
import noLoggerProvider from '../../test/fixtures/no-logger';

test('Can send reset email', async t => {
    const emailService = new EmailService(
        {
            host: 'test',
            port: 587,
            secure: false,
            smtpuser: '',
            smtppass: '',
            sender: 'noreply@getunleash.ai',
        },
        noLoggerProvider,
    );
    const resetLinkUrl =
        'https://unleash-hosted.com/reset-password?token=$2b$10$M06Ysso6KL4ueH/xR6rdSuY5GSymdIwmIkEUJMRkB.Qn26r5Gi5vW';

    const content = await emailService.sendResetMail(
        'Some username',
        'test@resetLinkUrl.com',
        resetLinkUrl,
    );
    const message = JSON.parse(content.message);
    t.is(message.from.address, 'noreply@getunleash.ai');
    t.is(message.subject, 'Unleash - Reset your password');
    t.true(message.html.includes(resetLinkUrl));
    t.true(message.text.includes(resetLinkUrl));
});

test('Can send welcome mail', async t => {
    const emailService = new EmailService(
        {
            host: 'test',
            port: 9999,
            secure: false,
            sender: 'noreply@getunleash.ai',
            smtpuser: '',
            smtppass: '',
        },
        noLoggerProvider,
    );
    const content = await emailService.sendGettingStartedMail(
        'Some username',
        'test@test.com',
        'abc123456',
    );
    const message = JSON.parse(content.message);
    t.is(message.from.address, 'noreply@getunleash.ai');
    t.is(message.subject, 'Welcome to Unleash');
});
