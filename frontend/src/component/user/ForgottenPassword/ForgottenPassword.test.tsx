import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { FORGOTTEN_PASSWORD_FIELD } from 'utils/testIds';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

test('should render password auth', async () => {
    render(<ForgottenPassword />);

    const submitButton = screen.getByText('Reset password');
    const emailField = screen.getByTestId(FORGOTTEN_PASSWORD_FIELD);

    await userEvent.type(emailField, 'user@example.com');
    testServerRoute(server, '/auth/reset/password-email', {}, 'post', 200);
    submitButton.click();

    await screen.findByText('Email sent to');
    await screen.findByText('Try again');
    expect(screen.queryByText('Reset password')).not.toBeInTheDocument();

    const tryAgainButton = screen.getByText('Try again');
    testServerRoute(server, '/auth/reset/password-email', {}, 'post', 429);
    tryAgainButton.click();

    await screen.findByText('Too many password reset attempts');
    await screen.findByText('Reset password');
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
    expect(screen.queryByText('Email sent to')).not.toBeInTheDocument();
});
