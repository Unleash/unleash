import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { PlaygroundEnvironmentDiffTable } from './PlaygroundEnvironmentDiffTable';
import { UIProviderContainer } from '../../../providers/UIProvider/UIProviderContainer';

const irrelevantDetails = {
    strategies: {
        data: [],
        result: false,
    },
    isEnabledInCurrentEnvironment: true,
    variants: [],
    variant: {
        name: 'variantName',
        enabled: true,
        payload: {
            type: 'string' as const,
            value: 'variantValue',
        },
    },
    projectId: 'projectA',
};

test('should render environment diff table', async () => {
    render(
        <UIProviderContainer>
            <PlaygroundEnvironmentDiffTable
                features={{
                    development: [
                        {
                            name: 'featureA',
                            isEnabled: true,
                            environment: 'development',
                            context: {
                                channel: 'web',
                                client: 'clientA',
                                appName: 'myapp',
                            },
                            ...irrelevantDetails,
                        },
                    ],
                    production: [
                        {
                            name: 'featureA',
                            isEnabled: false,
                            environment: 'production',
                            context: {
                                channel: 'web',
                                client: 'clientA',
                                appName: 'myapp',
                            },
                            ...irrelevantDetails,
                        },
                    ],
                }}
            />
        </UIProviderContainer>
    );

    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('clientA')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
    expect(screen.getByText('myapp')).toBeInTheDocument();
});
