import { render, screen } from '@testing-library/react';
import { AccessProviderMock } from '../component/providers/AccessProvider/AccessProviderMock';
import { useChangeRequestsEnabled } from './useChangeRequestsEnabled';
import { FC } from 'react';
import { testServerRoute, testServerSetup } from '../utils/testServer';
import {
    SKIP_CHANGE_REQUEST,
    ADMIN,
} from '../component/providers/AccessProvider/permissions';

const project = 'project';
const environment = 'production';

const TestComponent: FC = () => {
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(project);

    const string = isChangeRequestConfigured('production')
        ? 'change request'
        : 'regular mode';

    return <div>{string}</div>;
};

const server = testServerSetup();

testServerRoute(
    server,
    `/api/admin/projects/${project}/change-requests/config`,
    [
        {
            environment,
            changeRequestEnabled: true,
        },
    ]
);
testServerRoute(server, '/api/admin/ui-config', {
    versionInfo: {
        current: { enterprise: 'present' },
    },
});

test('SKIP_CHANGE_REQUEST disables change request mode', async () => {
    render(
        <AccessProviderMock
            permissions={[
                {
                    permission: ADMIN,
                    project,
                    environment,
                },
            ]}
        >
            <TestComponent />
        </AccessProviderMock>
    );

    const result = await screen.findByText('change request');
    expect(result).toBeInTheDocument();

    render(
        <AccessProviderMock
            permissions={[
                {
                    permission: SKIP_CHANGE_REQUEST,
                    project,
                    environment,
                },
            ]}
        >
            <TestComponent />
        </AccessProviderMock>
    );

    const regularModeElement = await screen.findByText('regular mode');
    expect(regularModeElement).toBeInTheDocument();
});
