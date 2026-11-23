import { expect, test } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import EditDefaultStrategy, {
    useDefaultStrategy,
} from './EditDefaultStrategy.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { UPDATE_PROJECT } from '@server/types/permissions';

const server = testServerSetup();

const setupEditFormEndpoints = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { singlePageStrategyForm: true },
    });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [{ environment: 'development' }],
    });
    testServerRoute(server, '/api/admin/strategies/flexibleRollout', {
        displayName: 'Gradual rollout',
        name: 'flexibleRollout',
        parameters: [
            { name: 'rollout' },
            { name: 'stickiness' },
            { name: 'groupId' },
        ],
    });
    testServerRoute(server, '/api/admin/segments', { segments: [] });
    testServerRoute(server, '/api/admin/context', []);
};

const renderEditForm = () =>
    render(
        <Routes>
            <Route
                path='/projects/:projectId/settings/default-strategy/edit'
                element={<EditDefaultStrategy />}
            />
        </Routes>,
        {
            route: '/projects/default/settings/default-strategy/edit?environmentId=development',
            permissions: [{ permission: UPDATE_PROJECT, project: 'default' }],
        },
    );

const RenderStrategy = () => {
    const { strategy } = useDefaultStrategy('default', 'development');

    return <div>{strategy?.name ?? 'no-default-strategy'}</div>;
};

const RenderFallbackStrategy = () => {
    const { defaultStrategyFallback } = useDefaultStrategy(
        'default',
        'development',
    );

    return <div>{defaultStrategyFallback.parameters.stickiness}</div>;
};

test('should render default strategy from project', async () => {
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [
            {
                environment: 'development',
                defaultStrategy: { name: 'my-strategy' },
            },
        ],
    });
    render(<RenderStrategy />);

    await screen.findByText('my-strategy');
});

test('should render fallback default strategy with project default stickiness', async () => {
    testServerRoute(server, '/api/admin/projects/default/overview', {
        defaultStickiness: 'clientId',
        environments: [],
    });
    render(<RenderFallbackStrategy />);

    await screen.findByText('clientId');
});

test('should render fallback default strategy with no project default stickiness', async () => {
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [],
    });
    render(<RenderFallbackStrategy />);

    await screen.findByText('default');
});

test('the form opens with the saved strategy, and a failed save selects the unnamed variant, shows the error on its name field and focuses it', async () => {
    setupEditFormEndpoints();
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [
            {
                environment: 'development',
                defaultStrategy: {
                    name: 'flexibleRollout',
                    constraints: [],
                    parameters: {
                        rollout: '67',
                        stickiness: 'default',
                        groupId: '',
                    },
                },
            },
        ],
    });
    renderEditForm();

    expect(await screen.findByRole('spinbutton')).toHaveValue(67);

    fireEvent.click(await screen.findByRole('button', { name: /^Variants/ }));
    fireEvent.click(screen.getByTestId('ADD_STRATEGY_VARIANT_BUTTON'));

    fireEvent.click(screen.getByText('Save strategy'));

    expect(
        await screen.findByText('Variant name is required.'),
    ).toBeInTheDocument();
    await waitFor(() => {
        expect(document.activeElement).toBe(
            screen.getByLabelText(/Variant name/),
        );
    });
});
