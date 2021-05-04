import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import StrategyDetails from '../strategy-details-component';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import theme from '../../../themes/main-theme';
import { createFakeStore } from '../../../accessStoreFake';
import AccessProvider from '../../AccessProvider/AccessProvider';

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
            <AccessProvider store={createFakeStore()}>
                <ThemeProvider theme={theme}>
                    <StrategyDetails
                        strategyName={'Another'}
                        strategy={strategy}
                        activeTab="view"
                        applications={applications}
                        toggles={toggles}
                        fetchStrategies={jest.fn()}
                        fetchApplications={jest.fn()}
                        fetchFeatureToggles={jest.fn()}
                        history={{}}
                    />
                </ThemeProvider>
            </AccessProvider>
        </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
});
