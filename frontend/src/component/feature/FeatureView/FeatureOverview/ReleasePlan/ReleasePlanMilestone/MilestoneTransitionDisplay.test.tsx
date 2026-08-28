import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { subHours } from 'date-fns';
import { Route, Routes } from 'react-router';
import { expect, test, vi } from 'vitest';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions.ts';
import type { TransitionConditionSchema } from 'openapi';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';
import { MilestoneTransitionDisplay } from './MilestoneTransitionDisplay.tsx';

const server = testServerSetup();

const setExposureFlag = (enabled: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { exposureBasedAutomation: enabled },
    });

const anHourAgo = () => subHours(new Date(), 1).toISOString();

const renderDisplay = ({
    transitionCondition,
    sourceMilestoneStartedAt,
    status,
}: {
    transitionCondition: TransitionConditionSchema;
    sourceMilestoneStartedAt?: string;
    status?: MilestoneStatus;
}) => {
    const onSave = vi.fn().mockResolvedValue({});
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={
                    <MilestoneTransitionDisplay
                        transitionCondition={transitionCondition}
                        targetMilestoneId='milestone-2'
                        sourceMilestoneStartedAt={sourceMilestoneStartedAt}
                        onSave={onSave}
                        onDelete={() => {}}
                        milestoneName='Milestone 1'
                        status={status}
                        environment='production'
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
            permissions: [{ permission: UPDATE_FEATURE_STRATEGY }],
        },
    );
    return onSave;
};

test('shows a saved exposure automation and keeps it editable when the flag is off', async () => {
    setExposureFlag(false);
    renderDisplay({
        transitionCondition: { type: 'exposure', minimumExposures: 1000 },
    });

    expect(screen.getByText('since feature creation')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Condition unit'));

    expect(
        await screen.findByRole('option', { name: 'Exposures' }),
    ).toBeInTheDocument();
});

test('offers save only when the condition meaningfully changes', async () => {
    setExposureFlag(true);
    renderDisplay({ transitionCondition: { intervalMinutes: 120 } });

    expect(screen.getByText('from milestone start')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Condition unit'));
    await userEvent.click(
        await screen.findByRole('option', { name: 'Minutes' }),
    );
    const input = screen.getByLabelText('Condition value');
    await userEvent.clear(input);
    await userEvent.type(input, '120');

    expect(screen.queryByText('Save')).not.toBeInTheDocument();

    await userEvent.type(input, '0');

    expect(screen.getByText('Save')).toBeInTheDocument();
});

test('saves an exposure automation for the target milestone', async () => {
    setExposureFlag(true);
    const onSave = renderDisplay({
        transitionCondition: { intervalMinutes: 120 },
    });

    await userEvent.click(screen.getByLabelText('Condition unit'));
    await userEvent.click(
        await screen.findByRole('option', { name: 'Exposures' }),
    );
    const input = screen.getByLabelText('Condition value');
    await userEvent.clear(input);
    await userEvent.type(input, '1000');
    await userEvent.click(screen.getByText('Save'));

    expect(onSave).toHaveBeenCalledWith({
        targetMilestone: 'milestone-2',
        transitionCondition: { type: 'exposure', minimumExposures: 1000 },
    });
});

test('projects the next milestone start for time automations only', () => {
    setExposureFlag(true);
    renderDisplay({
        transitionCondition: { intervalMinutes: 600 },
        sourceMilestoneStartedAt: anHourAgo(),
        status: { type: 'active', progression: 'active' },
    });

    expect(screen.getByText(/Will proceed at/)).toBeInTheDocument();
});

test('projects no start time for exposure automations', () => {
    setExposureFlag(true);
    renderDisplay({
        transitionCondition: { type: 'exposure', minimumExposures: 1000 },
        sourceMilestoneStartedAt: anHourAgo(),
        status: { type: 'active', progression: 'active' },
    });

    expect(
        screen.queryByText(/Will proceed at|Already/),
    ).not.toBeInTheDocument();
});
