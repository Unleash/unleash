import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiTokenIcon } from './ApiTokenIcon';

describe('ApiTokenIcon', () => {
    it('should show warning icon if it is an orphaned token', async () => {
        render(
            <ApiTokenIcon secret='test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b' />,
        );

        const errorIcon = await screen.findByTestId('orphaned-token-icon');
        expect(errorIcon).toBeInTheDocument();
    });

    it('should show tooltip with warning message if it is an orphaned token', async () => {
        const user = userEvent.setup();
        render(
            <ApiTokenIcon secret='test:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b' />,
        );

        const errorIcon = await screen.findByTestId('orphaned-token-icon');
        user.hover(errorIcon);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(/orphaned token/);
    });

    it('should not show warning icon if token is in v1 format', async () => {
        render(
            <ApiTokenIcon secret='be44368985f7fb3237c584ef86f3d6bdada42ddbd63a019d26955178' />,
        );

        const errorIcon = await screen.queryByTestId('orphaned-token-icon');
        expect(errorIcon).toBeNull();
    });

    it('should not show warning for true wildcard tokens', async () => {
        render(
            <ApiTokenIcon secret='*:development.be7536c3a160ff15e3a92da45de531dd54bc1ae15d8455c0476f086b' />,
        );

        const errorIcon = await screen.queryByTestId('orphaned-token-icon');
        expect(errorIcon).toBeNull();
    });
});
