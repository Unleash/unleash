import { vi } from 'vitest';
import { CleanupReminder } from './CleanupReminder';
import { render } from 'utils/testRenderer';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { screen } from '@testing-library/react';
import { UPDATE_FEATURE } from '../../../providers/AccessProvider/permissions';

const currentTime = '2024-04-25T08:05:00.000Z';
const monthAgo = '2024-03-25T06:05:00.000Z';

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
    await screen.findByText('Cancel');
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
});

test('render archive flag reminder', async () => {
    vi.setSystemTime(currentTime);
    const feature = {
        name: 'feature',
        project: 'default',
        type: 'release',
        lifecycle: { stage: 'completed', enteredStageAt: monthAgo },
        environments: [{ name: 'prod', type: 'production', enabled: true }],
    } as IFeatureToggle;

    render(<CleanupReminder feature={feature} onChange={() => {}} />, {
        permissions: [{ permission: UPDATE_FEATURE }],
    });

    await screen.findByText('Time to clean up technical debt?');
});
