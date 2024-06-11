import { screen } from '@testing-library/react';
import { FORGOTTEN_PASSWORD_FIELD } from 'utils/testIds';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

test('should render password auth', async () => {
    render(<ForgottenPassword />);

    const submitButton = screen.getByText('Submit');
    const emailField = screen.getByTestId(FORGOTTEN_PASSWORD_FIELD);

    await userEvent.type(emailField, 'user@example.com');
    testServerRoute(server, '/auth/reset/password-email', {}, 'post', 200);
    submitButton.click();

    await screen.findByText('Attempted to send email');
    await screen.findByText('Try again');
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();

    testServerRoute(server, '/auth/reset/password-email', {}, 'post', 429);
    submitButton.click();

    await screen.findByText('Too many password reset attempts');
    await screen.findByText('Try again');
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    expect(
        screen.queryByText('Attempted to send email'),
    ).not.toBeInTheDocument();
});
