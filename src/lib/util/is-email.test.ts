import isEmail from './is-email';

test.each([
    'jessie34@claritymail.net',
    'brianne33@sparkmail.com',
    'kevin98@brightmail.org',
    'sophia22@crestmail.com',
    'zachary55@horizonmail.net',
    'giselle89@fogmail.org',
    'david23@peakmail.net',
    'maria77@apexmail.com',
    'jacob66@skywardmail.org',
    'kylie44@oceanmail.net',
    'user1.email@testmail.com',
    'email2-user@example.org',
    '3test_email@example.net',
    'myemail+4@example.com',
    'em5a.il@example.net',
    'user#6@example.org',
    '_email7@example.com',
    'email-8@example.net',
    'test.email-9@example.com',
    'email10@test-mail.net',
])(`should validate email address %s`, (email) => {
    expect(isEmail(email)).toBe(true);
});

test.each([
    'myemail@.com', // (missing domain name)
    'email123@com', // (missing period before domain name)
    '@gmail.com', // (missing username)
    'email123@.com', // (missing domain name)
    'email123@domain.', // (missing top-level domain)
    'email@-domain.com', // (hyphen at the beginning of domain name)
    'email@domain.c', // (invalid top-level domain)
    'email@.domain.com', // (missing subdomain name)
    'notanemail',
    'missing@symbol',
    '@missingusername.com',
    'invalid.email@missingtld',
    '.missingusername@missingtld',
    'invalid.username@missingtld.',
    'invalid.email@-invalid-domain.com',
    'invalid.email@missingtld.',
])(`should validate email address %s`, (email) => {
    expect(isEmail(email)).toBe(false);
});
