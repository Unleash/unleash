import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import CreateFeature from './CreateFeature';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

const renderForm = () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId/create-toggle'
                element={<CreateFeature />}
            />
        </Routes>,
        {
            route: '/projects/default/create-toggle',
        },
    );
};

describe('flag name validation', () => {
    test('it gives an error if a flag name is not URL-friendly', async () => {
        const user = userEvent.setup();
        const unfriendlyName = 'unfriendlyName####$#//';
        const error = {
            details: [
                {
                    message: `"name" must be URL friendly. You provided "${unfriendlyName}".`,
                },
            ],
        };

        testServerRoute(
            server,
            '/api/admin/features/validate',
            error,
            'post',
            400,
        );

        renderForm();

        const nameInput = await screen.findByLabelText(/name/i);
        fireEvent.change(nameInput, {
            target: { value: unfriendlyName },
        });

        user.tab();

        expect(
            await screen.findByTestId('INPUT_ERROR_TEXT'),
        ).toBeInTheDocument();
    });

    test('it gives an error if a flag with that name already exists', async () => {
        const user = userEvent.setup();
        const error = {
            details: [
                {
                    message: 'A flag with that name already exists',
                },
            ],
        };

        testServerRoute(
            server,
            '/api/admin/features/validate',
            error,
            'post',
            400,
        );

        renderForm();

        const nameInput = await screen.findByLabelText(/name/i);
        fireEvent.change(nameInput, {
            target: { value: 'preExistingFlag' },
        });

        user.tab();

        expect(
            await screen.findByTestId('INPUT_ERROR_TEXT'),
        ).toBeInTheDocument();
    });
});
