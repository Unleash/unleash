import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, test } from 'vitest';
import { createElement } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { SignupDialog, getSignupSteps } from './SignupDialog.tsx';

const server = testServerSetup();

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

describe('signup navigation', () => {
    beforeEach(() => {
        testServerRoute(server, '/api/admin/user', {
            user: { id: 1, email: 'user@example.com' },
            permissions: [],
            splash: {},
        });
        testServerRoute(server, '/api/instance/status', { ucaSignup: true });
        testServerRoute(server, '/api/admin/projects', {
            projects: [{ id: 'my-project' }],
        });
        let completed = false;
        server.use(
            http.get('/api/admin/signup', () =>
                HttpResponse.json({
                    companyRole: completed ? 'Developer' : '',
                }),
            ),
            http.post('/api/admin/signup', () => {
                completed = true;
                return new HttpResponse(null, { status: 200 });
            }),
        );
    });

    test.each([
        { dashboardV2: true, dashboardV2Widgets: true, route: '/personal' },
        {
            dashboardV2: true,
            dashboardV2Widgets: true,
            route: '/projects/default/features/my-flag?tab=metrics#details',
        },
        { dashboardV2: true, dashboardV2Widgets: false, route: '/personal' },
    ])('completes signup at the appropriate destination (%j)', async ({
        dashboardV2,
        dashboardV2Widgets,
        route,
    }) => {
        testServerRoute(server, '/api/admin/ui-config', {
            billing: 'pay-as-you-go',
            versionInfo: { current: { enterprise: '8.3.1' } },
            flags: { UNLEASH_CLOUD: true, dashboardV2, dashboardV2Widgets },
        });
        render(createElement(SignupDialog), { route });

        await userEvent.type(
            await screen.findByPlaceholderText('Enter full name'),
            'Test User',
        );
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(
            screen.getByRole('option', { name: 'Developer' }),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Next' }));
        await userEvent.click(
            await screen.findByRole('button', { name: 'Open Unleash' }),
        );

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(
                window.location.pathname +
                    window.location.search +
                    window.location.hash,
            ).toBe(
                dashboardV2 && dashboardV2Widgets
                    ? route
                    : '/projects/my-project',
            );
        });
    });
});
