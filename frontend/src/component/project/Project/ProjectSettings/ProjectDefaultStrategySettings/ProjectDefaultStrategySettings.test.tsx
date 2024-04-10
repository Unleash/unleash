import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';

import {
    UPDATE_PROJECT,
    PROJECT_DEFAULT_STRATEGY_READ,
} from 'component/providers/AccessProvider/permissions';
import { ProjectDefaultStrategySettings } from './ProjectDefaultStrategySettings';

const server = testServerSetup();

const setupProjectOverviewEndpoint = () => {
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [
            {
                environment: 'development',
                defaultStrategy: {
                    name: 'flexibleRollout',
                    disabled: false,
                    segments: [],
                    variants: [],
                    parameters: {
                        groupId: '',
                        rollout: '100',
                        stickiness: 'default',
                    },
                    constraints: [],
                },
            },
        ],
    });
};

const setupComponent = () => {
    return {
        wrapper: render(
            <Routes>
                <Route
                    path={'/projects/:projectId/settings/default-strategy'}
                    element={<ProjectDefaultStrategySettings />}
                />
            </Routes>,
            {
                route: `/projects/default/settings/default-strategy`,
                permissions: [
                    {
                        permission: UPDATE_PROJECT,
                        project: 'default',
                    },
                    {
                        permission: PROJECT_DEFAULT_STRATEGY_READ,
                        project: 'default',
                    },
                ],
            },
        ),
    };
};

beforeEach(() => {
    setupProjectOverviewEndpoint();
});

describe('ProjectDefaultStrategySettings', () => {
    test('should update view when strategy changes value', async () => {
        const { wrapper } = setupComponent();

        const editBtn = await screen.findByTestId(
            'STRATEGY_EDIT-flexibleRollout',
        );
        console.log(wrapper.debug());
        fireEvent.click(editBtn);

        console.log(wrapper.debug());

        const slider = await screen.findByRole('slider', { name: /rollout/i });

        expect(slider).toHaveValue('100');

        fireEvent.change(slider, { target: { value: '50' } });
        expect(slider).toHaveValue('50');
    });
});
