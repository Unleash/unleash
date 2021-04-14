import test from 'ava';
import { EmailService, TransporterType } from './email-service';
import noLoggerProvider from '../../test/fixtures/no-logger';

test('Can send reset email', async t => {
    const emailService = new EmailService(
        {
            host: 'test',
            port: 587,
            secure: false,
            auth: {
                user: '',
                pass: '',
            },
            sender: 'noreply@getunleash.ai',
            transporterType: TransporterType.JSON,
        },
        noLoggerProvider,
    );
    const content = await emailService.sendResetMail(
        'Some username',
        'test@test.com',
        'abc123',
    );
    const message = JSON.parse(content.message);
    t.is(message.from.address, 'noreply@getunleash.ai');
    t.is(message.subject, 'Someone has requested to reset your password');
    t.true(message.html.indexOf('Some username') > 0);
    t.true(message.text.indexOf('Some username') > 0);
    t.true(message.html.indexOf('abc123') > 0);
    t.true(message.text.indexOf('abc123') > 0);
});

test('Can send welcome mail', async t => {
    const emailService = new EmailService(
        {
            host: 'test',
            port: 9999,
            secure: false,
            sender: 'noreply@getunleash.ai',
            auth: {
                user: '',
                pass: '',
            },
            transporterType: TransporterType.JSON,
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
    t.is(
        message.subject,
        'Welcome to Unleash. Please configure your password.',
    );
});
