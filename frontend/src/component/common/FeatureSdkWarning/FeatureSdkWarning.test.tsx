import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureSdkWarning } from './FeatureSdkWarning.tsx';

describe('FeatureSdkWarning', () => {
    it('should show warning icon for regexOperator', async () => {
        render(<FeatureSdkWarning featureName='regexOperator' />);

        const errorIcon = await screen.findByTestId('feature-sdk-warning');
        expect(errorIcon).toBeInTheDocument();
    });

    it('should show tooltip for regexOperator', async () => {
        const user = userEvent.setup();
        render(<FeatureSdkWarning featureName='regexOperator' />);

        const errorIcon = await screen.findByTestId('feature-sdk-warning');
        user.hover(errorIcon);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(/orphaned token/);
    });
});
