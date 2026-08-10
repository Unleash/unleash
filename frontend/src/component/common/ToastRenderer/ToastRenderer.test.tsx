import { expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { TOAST_LIVE_REGION_TEST_ID } from 'utils/testIds';
import useToast from 'hooks/useToast';
import ToastRenderer from './ToastRenderer.tsx';
import type { IToast } from 'interfaces/toast';

const ToastHarness = ({ toast }: { toast: IToast }) => {
    const { setToastData } = useToast();

    return (
        <>
            <button type='button' onClick={() => setToastData(toast)}>
                Show toast
            </button>
            <ToastRenderer />
        </>
    );
};

const showToast = () =>
    userEvent.click(screen.getByRole('button', { name: 'Show toast' }));

const liveRegion = () => screen.getByTestId(TOAST_LIVE_REGION_TEST_ID);

test('the live region exists and is a status region before any toast', () => {
    render(<ToastHarness toast={{ type: 'success', text: 'Flag updated' }} />);

    expect(liveRegion()).toHaveRole('status');
    expect(liveRegion()).toBeEmptyDOMElement();
});

test('a toast message is announced to screen readers', async () => {
    render(<ToastHarness toast={{ type: 'success', text: 'Flag updated' }} />);

    await showToast();

    expect(within(liveRegion()).getByText('Flag updated')).toBeInTheDocument();
});

test('an error toast is announced to screen readers', async () => {
    render(<ToastHarness toast={{ type: 'error', text: 'Update failed' }} />);

    await showToast();

    expect(within(liveRegion()).getByText('Update failed')).toBeInTheDocument();
});
