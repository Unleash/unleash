import { vi } from 'vitest';
import { useState } from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import FlexibleStrategy from './FlexibleStrategy.tsx';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { testServerSetup, testServerRoute } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/projects/default', {});
    testServerRoute(server, '/api/admin/projects/default/overview', {});
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
                    path='/projects/:projectId/features/:featureId'
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

test('if stickiness or groupId not present, fill it with defaults', async () => {
    const updateParameter = vi.fn();
    const Wrapper = () => (
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId'
                element={
                    <FlexibleStrategy
                        parameters={{
                            rollout: '50',
                        }}
                        updateParameter={updateParameter}
                        context={{}}
                        editable={true}
                    />
                }
            />
        </Routes>
    );

    setupApi();

    render(<Wrapper />, {
        route: '/projects/default/features/test',
    });

    await waitFor(() => {
        expect(updateParameter).toHaveBeenCalledWith('stickiness', 'default');
        expect(updateParameter).toHaveBeenCalledWith('groupId', 'test');
    });
});

test('displays groupId error', async () => {
    const Wrapper = () => (
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId'
                element={
                    <FlexibleStrategy
                        parameters={{
                            rollout: '50',
                            stickiness: 'default',
                        }}
                        updateParameter={(
                            _parameter: string,
                            _value: string,
                        ) => {}}
                        context={{}}
                        editable={true}
                        errors={
                            {
                                getFormError: () => 'Field required test',
                            } as any
                        }
                    />
                }
            />
        </Routes>
    );

    setupApi();

    render(<Wrapper />, {
        route: '/projects/default/features/test',
    });

    await waitFor(async () => {
        const errorText = await screen.queryByText('Field required test');
        expect(errorText).toBeInTheDocument();
    });
});
