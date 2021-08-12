import { EmailService } from './email-service';
import noLoggerProvider from '../../test/fixtures/no-logger';

test('Can send reset email', async () => {
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
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Unleash - Reset your password');
    expect(content.html.includes(resetLinkUrl)).toBe(true);
    expect(content.text.includes(resetLinkUrl)).toBe(true);
});

test('Can send welcome mail', async () => {
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
    expect(content.from).toBe('noreply@getunleash.ai');
    expect(content.subject).toBe('Welcome to Unleash');
});
