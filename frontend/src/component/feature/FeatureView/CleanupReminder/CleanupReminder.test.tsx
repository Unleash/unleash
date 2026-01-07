import { vi } from 'vitest';
import { CleanupReminder } from './CleanupReminder.tsx';
import { render } from 'utils/testRenderer';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { screen, waitFor } from '@testing-library/react';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from '../../../providers/AccessProvider/permissions.ts';

const currentTime = '2024-04-25T08:05:00.000Z';
const monthAgo = '2024-03-25T06:05:00.000Z';

beforeEach(() => {
    window.localStorage.clear();
});

test('render complete feature reminder', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'release',
        lifecycle: { stage: 'live', enteredStageAt: monthAgo },
        environments: [{ name: 'prod', type: 'production', enabled: true }],
    } as IFeatureToggle;

    render(<CleanupReminder feature={feature} onChange={() => {}} />, {
        permissions: [{ permission: UPDATE_FEATURE }],
    });

    const button = await screen.findByText('Mark completed');
    await screen.findByText('31 days');

    button.click();
    const cancel = await screen.findByText('Cancel');
    cancel.click();
});

test('render remove flag from code reminder', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'release',
        lifecycle: { stage: 'completed', enteredStageAt: monthAgo },
        environments: [
            {
                name: 'prod',
                type: 'production',
                enabled: true,
                lastSeenAt: currentTime,
            },
        ],
    } as IFeatureToggle;

    render(<CleanupReminder feature={feature} onChange={() => {}} />, {
        permissions: [{ permission: UPDATE_FEATURE }],
    });

    await screen.findByText('Time to remove flag from code?');
    await screen.findByText('Revert to previous stage');

    const reminder = await screen.findByText('Remind me later');
    reminder.click();

    await waitFor(() => {
        expect(screen.queryByText('Archive flag')).not.toBeInTheDocument();
    });
});

test('render archive flag reminder', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'release',
        lifecycle: { stage: 'completed', enteredStageAt: monthAgo },
        environments: [{ name: 'prod', type: 'production', enabled: true }],
        children: ['child1'],
    } as IFeatureToggle;

    render(<CleanupReminder feature={feature} onChange={() => {}} />, {
        permissions: [{ permission: DELETE_FEATURE }],
    });

    const button = await screen.findByText('Archive flag');
    button.click();

    await screen.findByText('child1');
    const okButton = await screen.findByText('OK');
    okButton.click();

    const reminder = await screen.findByText('Remind me later');
    reminder.click();

    await waitFor(() => {
        expect(screen.queryByText('Archive flag')).not.toBeInTheDocument();
    });
});
