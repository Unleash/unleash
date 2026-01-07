import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ProductivityEmailSubscription } from './ProductivityEmailSubscription.tsx';
import ToastRenderer from '../../../common/ToastRenderer/ToastRenderer.tsx';

const server = testServerSetup();

const setupSubscribeApi = () => {
    testServerRoute(
        server,
        '/api/admin/email-subscription/productivity-report',
        {},
        'put',
        202,
    );
};

const setupUnsubscribeApi = () => {
    testServerRoute(
        server,
        '/api/admin/email-subscription/productivity-report',
        {},
        'delete',
        202,
    );
};

const setupErrorApi = () => {
    testServerRoute(
        server,
        '/api/admin/email-subscription/productivity-report',
        { message: 'user error' },
        'delete',
        400,
    );
};

test('unsubscribe', async () => {
    setupUnsubscribeApi();
    let changed = false;
    render(
        <>
            <ProductivityEmailSubscription
                status='subscribed'
                onChange={() => {
                    changed = true;
                }}
            />
            <ToastRenderer />
        </>,
    );
    const checkbox = screen.getByLabelText('Productivity Email Subscription');
    expect(checkbox).toBeChecked();

    checkbox.click();

    await screen.findByText('Unsubscribed from productivity report');
    expect(changed).toBe(true);
});

test('subscribe', async () => {
    setupSubscribeApi();
    let changed = false;
    render(
        <>
            <ProductivityEmailSubscription
                status='unsubscribed'
                onChange={() => {
                    changed = true;
                }}
            />
            <ToastRenderer />
        </>,
    );
    const checkbox = screen.getByLabelText('Productivity Email Subscription');
    expect(checkbox).not.toBeChecked();

    checkbox.click();

    await screen.findByText('Subscribed to productivity report');
    expect(changed).toBe(true);
});

test('handle error', async () => {
    setupErrorApi();
    let changed = false;
    render(
        <>
            <ProductivityEmailSubscription
                status='subscribed'
                onChange={() => {
                    changed = true;
                }}
            />
            <ToastRenderer />
        </>,
    );
    const checkbox = screen.getByLabelText('Productivity Email Subscription');

    checkbox.click();

    await screen.findByText('user error');
    expect(changed).toBe(true);
});
