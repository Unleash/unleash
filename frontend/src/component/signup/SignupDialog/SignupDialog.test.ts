import { describe, expect, test } from 'vitest';
import { getSignupSteps } from './SignupDialog.tsx';

const signupData = {
    shouldSetPassword: false,
    companyRole: '',
};

const DOMAIN_STEP = 'Let your team join';

const titles = (...args: Parameters<typeof getSignupSteps>) =>
    getSignupSteps(...args).map(({ title }) => title);

describe('signup steps', () => {
    test('never shows an invite step', () => {
        expect(
            titles({ signupData, emailDomain: 'example.com' }, true),
        ).not.toContain('Invite your team');
    });

    test('shows the domain step to admins when an email domain is available', () => {
        expect(
            titles({ signupData, emailDomain: 'example.com' }, true),
        ).toEqual(['Set up your account', DOMAIN_STEP, `You're all set`]);
    });

    test('does not show the domain step to non-admins', () => {
        expect(
            titles({ signupData, emailDomain: 'example.com' }, false),
        ).not.toContain(DOMAIN_STEP);
    });

    test('does not show the domain step without an email domain', () => {
        expect(titles({ signupData }, true)).not.toContain(DOMAIN_STEP);
    });

    test('does not show the domain step when the company is already set up', () => {
        expect(
            titles(
                {
                    signupData: { ...signupData, companyName: 'Acme' },
                    emailDomain: 'example.com',
                },
                true,
            ),
        ).not.toContain(DOMAIN_STEP);
    });
});
