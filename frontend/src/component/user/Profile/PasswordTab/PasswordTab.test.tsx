import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { PasswordTab } from './PasswordTab';
import userEvent from '@testing-library/user-event';
import { UIProviderContainer } from '../../../providers/UIProvider/UIProviderContainer';

const server = testServerSetup();
testServerRoute(server, '/api/admin/ui-config', {});
testServerRoute(server, '/api/admin/auth/simple/settings', {
    disabled: false,
});
testServerRoute(server, '/api/admin/user/change-password', {}, 'post', 401);
testServerRoute(server, '/auth/reset/validate-password', {}, 'post');

test('should render authorization error on missing old password', async () => {
    const user = userEvent.setup();

    render(
        <UIProviderContainer>
            <PasswordTab />
        </UIProviderContainer>
    );

    await screen.findByText('Change password');
    const passwordInput = await screen.findByLabelText('Password');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'IAmThePass1!@');

    const confirmPasswordInput = await screen.findByLabelText(
        'Confirm password'
    );
    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, 'IAmThePass1!@');

    await screen.findByText('Passwords match');

    const saveButton = await screen.findByText('Save');
    await user.click(saveButton);

    await screen.findByText('Authentication required');
});
