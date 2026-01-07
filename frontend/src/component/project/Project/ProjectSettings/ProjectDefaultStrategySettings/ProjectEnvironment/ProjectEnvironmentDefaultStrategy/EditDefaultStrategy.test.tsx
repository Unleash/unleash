import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { useDefaultStrategy } from './EditDefaultStrategy.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

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
