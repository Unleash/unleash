import { screen } from '@testing-library/react';
import { FORGOTTEN_PASSWORD_FIELD } from 'utils/testIds';
import React from 'react';
import ForgottenPassword from 'component/user/ForgottenPassword/ForgottenPassword';
import { render } from 'utils/testRenderer';

test('should render password auth', async () => {
    render(<ForgottenPassword />);

    await screen.findByTestId(FORGOTTEN_PASSWORD_FIELD);
});
