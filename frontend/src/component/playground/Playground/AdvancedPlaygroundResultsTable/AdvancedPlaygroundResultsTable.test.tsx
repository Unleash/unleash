import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { AdvancedPlaygroundResultsTable } from './AdvancedPlaygroundResultsTable.tsx';

test('should render advanced playground table', async () => {
    render(
        <AdvancedPlaygroundResultsTable
            loading={false}
            features={[
                {
                    name: 'Infinite',
                    projectId: 'ChangeReqs',
                    environments: {
                        development: [
                            {
                                isEnabled: false,
                                isEnabledInCurrentEnvironment: false,
                                strategies: {
                                    result: true,
                                    data: [
                                        {
                                            name: 'flexibleRollout',
                                            id: '45971fe0-1122-40a7-a68c-3a1430c44062',
                                            disabled: false,
                                            parameters: {
                                                groupId: 'Infinite',
                                                rollout: '50',
                                                stickiness: 'default',
                                            },
                                            result: {
                                                enabled: true,
                                                evaluationStatus: 'complete',
                                            },
                                            constraints: [],
                                            segments: [],
                                            links: {
                                                edit: '/projects/ChangeReqs/features/Infinite/strategies/edit?environmenId=development&strategyId=45971fe0-1122-40a7-a68c-3a1430c44062',
                                            },
                                        },
                                        {
                                            name: 'default',
                                            id: 'bf5e35b6-edc1-4e54-8f7e-a6cc8d4f352a',
                                            disabled: false,
                                            parameters: {},
                                            result: {
                                                enabled: true,
                                                evaluationStatus: 'complete',
                                            },
                                            constraints: [],
                                            segments: [],
                                            links: {
                                                edit: '/projects/ChangeReqs/features/Infinite/strategies/edit?environmenId=development&strategyId=bf5e35b6-edc1-4e54-8f7e-a6cc8d4f352a',
                                            },
                                        },
                                    ],
                                },
                                projectId: 'ChangeReqs',
                                variant: {
                                    name: 'disabled',
                                    enabled: false,
                                },
                                name: 'Infinite',
                                environment: 'development',
                                context: {
                                    appName: 'MyApp',
                                },
                                variants: [],
                            },
                        ],
                        production: [
                            {
                                isEnabled: false,
                                isEnabledInCurrentEnvironment: false,
                                strategies: {
                                    result: false,
                                    data: [],
                                },
                                projectId: 'ChangeReqs',
                                variant: {
                                    name: 'disabled',
                                    enabled: false,
                                },
                                name: 'Infinite',
                                environment: 'production',
                                context: {
                                    appName: 'MyApp',
                                },
                                variants: [],
                            },
                        ],
                    },
                },
            ]}
            input={{
                environments: ['development', 'production'],
                projects: '*',
                context: {
                    appName: 'MyApp',
                },
            }}
        />,
    );

    expect(screen.getByText('Infinite')).toBeInTheDocument();
    expect(screen.getByText('ChangeReqs')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('View diff')).toBeInTheDocument();
});
