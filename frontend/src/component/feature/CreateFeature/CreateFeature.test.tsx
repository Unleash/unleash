import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import CreateFeature from './CreateFeature';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

describe('flag name validation', () => {
    test('it gives an error if a flag name is not URL-friendly', async () => {
        const user = userEvent.setup();
        const unfriendlyName = 'unfriendlyName####$#//';
        const error = {
            id: 'de15e702-e7c7-4083-9f31-384dea4da2e9',
            name: 'BadDataError',
            message:
                'Request validation failed: your request body or params contain invalid data. Refer to the `details` list for more information.',
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
            id: '07716b38-076c-4ab0-94c9-1a73663fec94',
            name: 'NameExistsError',
            message: 'A flag with that name already exists',
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
