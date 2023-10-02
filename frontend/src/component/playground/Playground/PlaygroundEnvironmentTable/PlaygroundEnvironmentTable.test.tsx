import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { PlaygroundEnvironmentTable } from './PlaygroundEnvironmentTable';
import { UIProviderContainer } from '../../../providers/UIProvider/UIProviderContainer';

test('should render environment table', async () => {
    render(
        <UIProviderContainer>
            <PlaygroundEnvironmentTable
                features={[
                    {
                        name: 'featureA',
                        strategies: {
                            data: [],
                            result: false,
                        },
                        isEnabled: false,
                        isEnabledInCurrentEnvironment: false,
                        variants: [],
                        projectId: 'projectA',
                        variant: {
                            name: 'variantName',
                            enabled: true,
                            payload: {
                                type: 'string',
                                value: 'variantValue',
                            },
                        },
                        environment: 'dev',
                        context: {
                            channel: 'web',
                            client: 'clientA',
                            appName: 'myapp',
                        },
                    },
                ]}
            />
        </UIProviderContainer>
    );

    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('clientA')).toBeInTheDocument();
    expect(screen.getByText('variantName')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
    expect(screen.getByText('myapp')).toBeInTheDocument();
});
