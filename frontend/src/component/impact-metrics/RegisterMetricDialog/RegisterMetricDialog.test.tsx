import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { RegisterMetricDialog } from './RegisterMetricDialog';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';

const server = testServerSetup();

beforeEach(() => {
    testServerRoute(server, '/api/admin/impact-metrics/register', {}, 'post');
});

const openDialog = async () => {
    const user = userEvent.setup();
    render(
        <>
            <RegisterMetricDialog open onClose={vi.fn()} />
            <ToastRenderer />
        </>,
    );
    await screen.findByRole('heading', { name: 'Create an impact metric' });
    return {
        user,
        nameInput: screen.getByLabelText(/metric name/i),
        submitButton: screen.getByRole('button', { name: /next step/i }),
    };
};

test('submitting the form transitions to success stage', async () => {
    const { user, nameInput, submitButton } = await openDialog();

    await user.type(nameInput, 'checkout_error_count');
    await user.click(submitButton);

    await screen.findByText('Implement the impact metric');
    expect(await screen.findByText(/checkout_error_count/)).toBeInTheDocument();
    expect(
        await screen.findByRole('button', { name: /done/i }),
    ).toBeInTheDocument();
    expect(
        await screen.findByText(
            /The metric will be available in the UI shortly/i,
        ),
    ).toBeInTheDocument();
});

test('should not proceed to success screen on API error', async () => {
    testServerRoute(
        server,
        '/api/admin/impact-metrics/register',
        { name: 'AuthenticationRequired', message: 'You must be logged in.' },
        'post',
        401,
    );

    const { user, nameInput, submitButton } = await openDialog();

    await user.type(nameInput, 'checkout_error_count');
    await user.click(submitButton);

    expect(await screen.findByText(/Define your metric/i)).toBeInTheDocument();
    expect(
        await screen.findByText(/Authentication required/i),
    ).toBeInTheDocument();

    expect(
        screen.queryByText(/The metric will be available in the UI shortly/i),
    ).not.toBeInTheDocument();
});
