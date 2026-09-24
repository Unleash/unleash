import { useState } from 'react';
import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { TestConfigurationSidebar } from './TestConfigurationSidebar.tsx';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/context', [{ name: 'appName' }]);
};

const playgroundResponse = ({ isEnabled }: { isEnabled: boolean }) => ({
    features: [
        {
            name: 'my-feature',
            projectId: 'default',
            environments: {
                production: [
                    {
                        name: 'my-feature',
                        environment: 'production',
                        context: { appName: 'playground' },
                        projectId: 'default',
                        isEnabled,
                        isEnabledInCurrentEnvironment: true,
                        variant: { name: 'disabled', enabled: false },
                        variants: [],
                        strategies: { result: isEnabled, data: [] },
                    },
                ],
            },
        },
    ],
    input: {
        environments: ['production'],
        projects: ['default'],
        context: { appName: 'playground' },
    },
});

const renderSidebar = (open = true, onClose = () => {}) =>
    render(
        <TestConfigurationSidebar
            open={open}
            onClose={onClose}
            projectId='default'
            featureId='my-feature'
            environmentId='production'
            strategies={[]}
        />,
    );

test('evaluates the flag and shows a True result on submit', async () => {
    setupApi();
    testServerRoute(
        server,
        '/api/admin/playground/advanced',
        playgroundResponse({ isEnabled: true }),
        'post',
    );
    const user = userEvent.setup();
    renderSidebar(true);

    await user.click(screen.getByRole('button', { name: 'Try configuration' }));

    expect(await screen.findByText('True')).toBeInTheDocument();
    await screen.findByText(/This feature flag is True in production because/);
    await screen.findByText('at least one strategy is True');
});

test('evaluates the flag and shows a False result on submit', async () => {
    setupApi();
    testServerRoute(
        server,
        '/api/admin/playground/advanced',
        playgroundResponse({ isEnabled: false }),
        'post',
    );
    const user = userEvent.setup();
    renderSidebar(true);

    await user.click(screen.getByRole('button', { name: 'Try configuration' }));

    expect(await screen.findByText('False')).toBeInTheDocument();
    await screen.findByText(/This feature flag is False in production because/);
    await screen.findByText(
        'all strategies are either False or could not be fully evaluated',
    );
});

test('shows a result for each value of a multi-value context field', async () => {
    setupApi();
    const evaluation = (region: string, isEnabled: boolean) => ({
        ...playgroundResponse({ isEnabled }).features[0].environments
            .production[0],
        context: { appName: 'playground', region },
    });
    testServerRoute(
        server,
        '/api/admin/playground/advanced',
        {
            ...playgroundResponse({ isEnabled: true }),
            features: [
                {
                    name: 'my-feature',
                    projectId: 'default',
                    environments: {
                        production: [
                            evaluation('eu', true),
                            evaluation('us', false),
                        ],
                    },
                },
            ],
        },
        'post',
    );
    const user = userEvent.setup();
    renderSidebar(true);

    await user.click(screen.getByRole('button', { name: 'Try configuration' }));

    expect(
        await screen.findByText('Result for region: eu'),
    ).toBeInTheDocument();
    expect(screen.getByText('Result for region: us')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
});

test('shows a configuration error when the request is rejected', async () => {
    setupApi();
    testServerRoute(
        server,
        '/api/admin/playground/advanced',
        {
            name: 'BadDataError',
            details: [{ message: 'some error about too many items' }],
        },
        'post',
        400,
    );
    const user = userEvent.setup();
    renderSidebar(true);

    await user.click(screen.getByRole('button', { name: 'Try configuration' }));

    await screen.findByText('some error about too many items');
});

test('does not persist the previous result when reopened', async () => {
    setupApi();
    testServerRoute(
        server,
        '/api/admin/playground/advanced',
        playgroundResponse({ isEnabled: true }),
        'post',
    );
    const user = userEvent.setup();

    const ToggleableSidebar = () => {
        const [open, setOpen] = useState(true);
        return (
            <>
                <button type='button' onClick={() => setOpen(false)}>
                    close drawer
                </button>
                <button type='button' onClick={() => setOpen(true)}>
                    open drawer
                </button>
                <TestConfigurationSidebar
                    open={open}
                    onClose={() => setOpen(false)}
                    projectId='default'
                    featureId='my-feature'
                    environmentId='production'
                    strategies={[]}
                />
            </>
        );
    };

    render(<ToggleableSidebar />);

    await user.click(screen.getByRole('button', { name: 'Try configuration' }));
    expect(await screen.findByText('True')).toBeInTheDocument();

    await user.click(screen.getByText('close drawer'));
    await user.click(screen.getByText('open drawer'));

    expect(screen.queryByText('True')).not.toBeInTheDocument();
});
