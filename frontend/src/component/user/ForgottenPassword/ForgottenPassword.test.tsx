import { render, screen } from '@testing-library/react';
import { FORGOTTEN_PASSWORD_FIELD } from 'utils/testIds';
import React from 'react';
import { TestContext } from 'utils/testContext';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';

test('should render password auth', async () => {
    render(
        <TestContext>
            <ForgottenPassword />
        </TestContext>
    );

    await screen.findByTestId(FORGOTTEN_PASSWORD_FIELD);
});
