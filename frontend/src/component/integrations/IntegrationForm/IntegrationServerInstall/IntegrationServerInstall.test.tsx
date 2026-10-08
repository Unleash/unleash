import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import type { AddonTypeSchema } from 'openapi';
import { IntegrationServerInstall } from './IntegrationServerInstall.tsx';

const parameters = { organization: 'acme', privateKey: 'a private key' };

const definitions: AddonTypeSchema['parameters'] = [
    {
        name: 'organization',
        displayName: 'Organization',
        type: 'text',
        required: true,
        sensitive: false,
    },
    {
        name: 'privateKey',
        displayName: 'Private key',
        type: 'textfield',
        required: true,
        sensitive: true,
    },
];

const installLink = () => screen.getByRole('link', { name: /install/i });

const installUrl = () =>
    new URL(installLink().getAttribute('href')!, 'http://localhost');

test('should send the non-sensitive parameters to the path in the addons API, in the same tab', () => {
    render(
        <IntegrationServerInstall
            path='github/app-manifest'
            parameters={parameters}
            definitions={definitions}
        />,
    );

    expect(installUrl().pathname).toBe('/api/admin/addons/github/app-manifest');
    expect(installUrl().searchParams.get('parameters[organization]')).toBe(
        'acme',
    );
    expect(installUrl().searchParams.has('parameters[privateKey]')).toBe(false);
    expect(installLink()).not.toHaveAttribute('target');
});

test("should send a project's parameters to that project's addons API", () => {
    render(
        <IntegrationServerInstall
            path='github/app-manifest'
            parameters={parameters}
            definitions={definitions}
            projectId='my-project'
        />,
    );

    expect(installUrl().pathname).toBe(
        '/api/admin/projects/my-project/addons/github/app-manifest',
    );
});

test('should show the error the install returned', () => {
    render(
        <IntegrationServerInstall
            path='github/app-manifest'
            parameters={parameters}
            definitions={definitions}
        />,
        {
            route: '/integrations/create/github?errorMsg=The%20request%20expired.',
        },
    );

    expect(screen.getByText('The request expired.')).toBeInTheDocument();
});
