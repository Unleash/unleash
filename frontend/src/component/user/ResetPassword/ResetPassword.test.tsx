import { render, screen } from '@testing-library/react';
import { INVALID_TOKEN_BUTTON } from 'utils/testIds';
import React from 'react';
import { TestContext } from 'utils/testContext';
import ResetPassword from 'component/user/ResetPassword/ResetPassword';
import { MemoryRouter } from 'react-router-dom';
import { INVALID_TOKEN_ERROR } from 'hooks/api/getters/useResetPassword/useResetPassword';
import { testServerSetup, testServerRoute } from 'utils/testServer';

const server = testServerSetup();

test('should render password auth', async () => {
    testServerRoute(server, '/auth/reset/validate', {
        name: INVALID_TOKEN_ERROR,
    });

    render(
        <TestContext>
            <MemoryRouter initialEntries={['/new-user?token=invalid']}>
                <ResetPassword />
            </MemoryRouter>
        </TestContext>
    );

    await screen.findByTestId(INVALID_TOKEN_BUTTON);
});
