import { screen } from '@testing-library/react';
import { FeatureLifecycleTooltip } from './FeatureLifecycleTooltip';
import { render } from 'utils/testRenderer';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { LifecycleStage } from './LifecycleStage';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';

const currentTime = '2024-04-25T08:05:00.000Z';
const twoMinutesAgo = '2024-04-25T08:03:00.000Z';
const oneHourAgo = '2024-04-25T07:05:00.000Z';
const twoHoursAgo = '2024-04-25T06:05:00.000Z';

const renderOpenTooltip = (stage: LifecycleStage, onArchive = () => {}) => {
    render(
        <FeatureLifecycleTooltip stage={stage} onArchive={onArchive}>
            <span>child</span>
        </FeatureLifecycleTooltip>,
        { permissions: [{ permission: DELETE_FEATURE }] },
    );

    const child = screen.getByText('child');

    userEvent.hover(child);
};

test('render initial stage', async () => {
    vi.setSystemTime(currentTime);
    const enteredStageAt = twoMinutesAgo;

    renderOpenTooltip({ name: 'initial', enteredStageAt });

    await screen.findByText('initial');
    await screen.findByText('2 minutes');
    await screen.findByText(
        "This feature toggle is currently in the initial phase of it's life cycle.",
    );
});

test('render pre-live stage', async () => {
    vi.setSystemTime(currentTime);
    const enteredStageAt = twoMinutesAgo;
    const lastSeenAt = oneHourAgo;

    renderOpenTooltip({
        name: 'pre-live',
        environments: [{ name: 'development', lastSeenAt }],
        enteredStageAt,
    });

    await screen.findByText('pre-live');
    await screen.findByText('development');
    await screen.findByText('1 hour ago');
});

test('render live stage', async () => {
    vi.setSystemTime(currentTime);
    const enteredStageAt = twoMinutesAgo;
    const lastSeenAt = twoHoursAgo;

    renderOpenTooltip({
        name: 'live',
        environments: [{ name: 'production', lastSeenAt }],
        enteredStageAt,
    });

    await screen.findByText('Is this feature complete?');
    await screen.findByText('live');
    await screen.findByText('production');
    await screen.findByText('2 hours ago');
});

test('render completed stage with still active', async () => {
    vi.setSystemTime(currentTime);
    const enteredStageAt = twoMinutesAgo;
    const lastSeenAt = twoHoursAgo;

    renderOpenTooltip({
        name: 'completed',
        status: 'kept',
        environments: [{ name: 'production', lastSeenAt }],
        enteredStageAt,
    });

    await screen.findByText('completed');
    await screen.findByText('production');
    await screen.findByText('2 hours ago');
    expect(screen.queryByText('Archive feature')).not.toBeInTheDocument();
});

test('render completed stage safe to archive', async () => {
    vi.setSystemTime(currentTime);
    const enteredStageAt = twoMinutesAgo;
    let onArchiveInvoked = false;
    const onArchive = () => {
        onArchiveInvoked = true;
    };

    renderOpenTooltip(
        {
            name: 'completed',
            status: 'kept',
            environments: [],
            enteredStageAt,
        },
        onArchive,
    );

    await screen.findByText('completed');
    const button = await screen.findByText('Archive feature');

    button.click();

    expect(onArchiveInvoked).toBe(true);
});
