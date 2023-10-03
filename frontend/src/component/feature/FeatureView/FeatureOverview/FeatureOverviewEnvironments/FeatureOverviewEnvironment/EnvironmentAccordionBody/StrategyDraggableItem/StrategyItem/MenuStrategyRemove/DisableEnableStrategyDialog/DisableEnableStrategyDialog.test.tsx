import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { DisableEnableStrategyDialog } from './DisableEnableStrategyDialog';

const server = testServerSetup();

const defaultProps = {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    projectId: 'project1',
    featureId: 'feature1',
    environmentId: 'env1',
    strategy: {
        id: 'some-id',
        name: 'flexibleRollout',
        constraints: [],
        parameters: {
            rollout: '50%',
            stickiness: 'default',
        },
    },
};

test('should render disable dialog in regular mode', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/projects/project1', {});

    render(<DisableEnableStrategyDialog {...defaultProps} />);

    expect(
        screen.queryByText('Change requests are enabled for this environment.')
    ).not.toBeInTheDocument();
    expect(
        screen.getByText('Are you sure you want to disable this strategy?')
    ).toBeInTheDocument();
});

test('should render enable dialog in regular mode', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/projects/project1', {});

    const props = {
        ...defaultProps,
        strategy: { ...defaultProps.strategy, disabled: true },
    };

    render(<DisableEnableStrategyDialog {...props} />);

    expect(
        screen.queryByText('Change requests are enabled for this environment.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Enable strategy')).toBeInTheDocument();
});
