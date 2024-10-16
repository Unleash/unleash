import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { OrderEnvironments } from './OrderEnvironments';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupServerRoutes = (changeRequestsEnabled = true) => {
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Pro',
        flags: {
            purchaseAdditionalEnvironments: true,
        },
    });
};

describe('OrderEnvironmentsDialog Component', () => {
    test('should show error if environment name is empty', async () => {
        setupServerRoutes();
        render(<OrderEnvironments />);

        await waitFor(async () => {
            const openDialogButton = await screen.queryByRole('button', {
                name: /view pricing/i,
            });
            expect(openDialogButton).toBeInTheDocument();
            fireEvent.click(openDialogButton!);
        });

        const checkbox = screen.getByRole('checkbox', {
            name: /i understand adding environments/i,
        });
        fireEvent.click(checkbox);

        const submitButton = screen.getByRole('button', { name: /order/i });
        fireEvent.click(submitButton);

        expect(
            screen.getByText(/environment name is required/i),
        ).toBeInTheDocument();
    });
});
