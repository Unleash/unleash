import { describe, expect, test } from 'vitest';
import { getSignupSteps } from './SignupDialog.tsx';

const signupData = {
    shouldSetPassword: false,
    companyRole: '',
};

describe('signup steps', () => {
    test('does not show the invite step to non-admins', () => {
        const titles = getSignupSteps(signupData, false).map(
            ({ title }) => title,
        );

        expect(titles).not.toContain('Invite your team');
    });

    test('shows the invite step to admins', () => {
        const titles = getSignupSteps(signupData, true).map(
            ({ title }) => title,
        );

        expect(titles).toContain('Invite your team');
    });
});
