import { screen } from '@testing-library/react';
import { INVALID_TOKEN_BUTTON } from 'utils/testIds';
import React from 'react';
import ResetPassword from 'component/user/ResetPassword/ResetPassword';
import { INVALID_TOKEN_ERROR } from 'hooks/api/getters/useResetPassword/useResetPassword';
import { testServerSetup, testServerRoute } from 'utils/testServer';
import { render } from 'utils/testRenderer';

const server = testServerSetup();

test('should render password auth', async () => {
    testServerRoute(server, '/auth/reset/validate', {
        name: INVALID_TOKEN_ERROR,
    });

    render(<ResetPassword />, { route: '/new-user?token=invalid' });

    await screen.findByTestId(INVALID_TOKEN_BUTTON);
});
