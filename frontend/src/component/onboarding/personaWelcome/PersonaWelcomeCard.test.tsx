import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { PersonaWelcomeCard } from './PersonaWelcomeCard.tsx';
import { PERSONA_OVERRIDE_STORAGE_KEY } from './persona.ts';

const server = testServerSetup();

const setupApi = ({ companyRole }: { companyRole?: string } = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { personaOnboarding: true },
    });
    testServerRoute(server, '/api/admin/user', {
        user: { name: 'Unleash User', companyRole },
    });
    testServerRoute(server, '/api/admin/personal-dashboard', {
        projects: [{ id: 'my-project', name: 'My project' }],
        flags: [],
    });
};

beforeEach(() => {
    window.localStorage.clear();
});

test('shows the developer experience for technical roles', async () => {
    setupApi({ companyRole: 'Developer' });

    render(<PersonaWelcomeCard />);

    await screen.findByText('Get a flag working in your code in minutes');
    await screen.findByText('Developer persona');
    expect(
        await screen.findByRole('link', { name: 'Create a flag' }),
    ).toHaveAttribute('href', '/projects/my-project');
});

test('shows the product experience for product roles', async () => {
    setupApi({ companyRole: 'Product Manager' });

    render(<PersonaWelcomeCard />);

    await screen.findByText(
        'See how Unleash de-risks your releases — no code needed',
    );
    await screen.findByText('Product persona');
    expect(
        await screen.findByRole('link', { name: 'Invite a developer' }),
    ).toHaveAttribute('href', '/admin/invite-link');
});

test('localStorage override takes precedence over the stored company role', async () => {
    setupApi({ companyRole: 'Developer' });
    window.localStorage.setItem(PERSONA_OVERRIDE_STORAGE_KEY, 'Executive');

    render(<PersonaWelcomeCard />);

    await screen.findByText(
        'See how Unleash de-risks your releases — no code needed',
    );
});
