import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import { StrategyView } from './StrategyView';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import theme from '../../../themes/mainTheme';
import AccessProvider from '../../providers/AccessProvider/AccessProvider';

test('renders correctly with one strategy', () => {
    const strategy = {
        name: 'Another',
        description: "another's description",
        editable: true,
        parameters: [
            {
                name: 'customParam',
                type: 'list',
                description: 'customList',
                required: true,
            },
        ],
    };
    const applications = [
        {
            appName: 'appA',
            description: 'app description',
        },
    ];
    const toggles = [
        {
            name: 'toggleA',
            description: 'toggle description',
        },
    ];
    const tree = renderer.create(
        <MemoryRouter>
            <AccessProvider>
                <ThemeProvider theme={theme}>
                    <StrategyView
                        strategyName={'Another'}
                        strategy={strategy}
                        activeTab="view"
                        applications={applications}
                        toggles={toggles}
                        fetchStrategies={jest.fn()}
                        fetchApplications={jest.fn()}
                        fetchFeatureToggles={jest.fn()}
                    />
                </ThemeProvider>
            </AccessProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
