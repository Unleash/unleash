import { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import FlexibleStrategy from './FlexibleStrategy';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { testServerSetup, testServerRoute } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/projects/default', {});
};

test('manipulates the rollout slider', async () => {
    const Wrapper = () => {
        const [parameters, setParameters] = useState({
            groupId: 'testid',
            rollout: '0',
            stickiness: 'default',
        });

        const updateParameter = (parameter: string, value: string) => {
            setParameters((prevParameters) => ({
                ...prevParameters,
                [parameter]: value,
            }));
        };

        return (
            <Routes>
                <Route
                    path='/projects/:projectId/features/:featureName'
                    element={
                        <FlexibleStrategy
                            parameters={parameters}
                            updateParameter={updateParameter}
                            context={{}}
                            editable={true}
                        />
                    }
                />
            </Routes>
        );
    };

    setupApi();

    render(<Wrapper />, {
        route: '/projects/default/features/test',
    });

    const slider = await screen.findByRole('slider', { name: /rollout/i });
    const groupIdInput = await screen.getByLabelText('groupId');

    expect(slider).toHaveValue('0');
    expect(groupIdInput).toHaveValue('testid');

    fireEvent.change(slider, { target: { value: '50' } });
    fireEvent.change(groupIdInput, { target: { value: 'newGroupId' } });

    expect(slider).toHaveValue('50');
    expect(groupIdInput).toHaveValue('newGroupId');
});
