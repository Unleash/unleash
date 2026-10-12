import { beforeEach, expect, test, vi } from 'vitest';
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
const yearLater = '2025-04-26T08:05:00.000Z';

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

test('render expected lifetime reminder with the planned cleanup date', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'release',
        createdAt: monthAgo,
        expectedLifetimeEndsAt: '2024-04-24T06:05:00.000Z',
        lifecycle: { stage: 'live', enteredStageAt: currentTime },
        environments: [{ name: 'prod', type: 'production', enabled: true }],
    } as IFeatureToggle;

    render(<CleanupReminder feature={feature} onChange={() => {}} />, {
        permissions: [{ permission: UPDATE_FEATURE }],
    });

    await screen.findByText('This flag has reached its expected lifetime');
    await screen.findByText('04/24/2024');
    await screen.findByText('Mark completed');
});

test('the lifecycle reminder takes precedence over the expected lifetime one', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'release',
        createdAt: monthAgo,
        expectedLifetimeEndsAt: '2024-04-24T06:05:00.000Z',
        lifecycle: { stage: 'live', enteredStageAt: monthAgo },
        environments: [{ name: 'prod', type: 'production', enabled: true }],
    } as IFeatureToggle;

    render(<CleanupReminder feature={feature} onChange={() => {}} />, {
        permissions: [{ permission: UPDATE_FEATURE }],
    });

    await screen.findByText('Is this flag ready to be completed?');
    expect(
        screen.queryByText('This flag has reached its expected lifetime'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
});

test('render yearly reminder for a permanent flag, skip it, and see it again a year later', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'kill-switch',
        createdAt: '2023-04-24T08:05:00.000Z',
        expectedLifetimeEndsAt: null,
        lifecycle: { stage: 'live', enteredStageAt: currentTime },
        environments: [{ name: 'prod', type: 'production', enabled: true }],
    } as IFeatureToggle;

    const { rerender } = render(
        <CleanupReminder feature={feature} onChange={() => {}} />,
        { permissions: [{ permission: UPDATE_FEATURE }] },
    );

    await screen.findByText('Yearly check-in: is this flag still needed?');

    const skip = await screen.findByText('Skip for now');
    skip.click();

    await waitFor(() => {
        expect(
            screen.queryByText('Yearly check-in: is this flag still needed?'),
        ).not.toBeInTheDocument();
    });

    vi.setSystemTime(yearLater);
    rerender(<CleanupReminder feature={feature} onChange={() => {}} />);

    await screen.findByText('Yearly check-in: is this flag still needed?');
});
