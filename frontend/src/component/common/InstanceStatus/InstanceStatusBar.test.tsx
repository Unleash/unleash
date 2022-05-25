import { InstanceStatusBar } from 'component/common/InstanceStatus/InstanceStatusBar';
import { InstancePlan, InstanceState } from 'interfaces/instance';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { addDays } from 'date-fns';
import { INSTANCE_STATUS_BAR_ID } from 'utils/testIds';
import { UNKNOWN_INSTANCE_STATUS } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

test('InstanceStatusBar should be hidden by default', async () => {
    render(<InstanceStatusBar instanceStatus={UNKNOWN_INSTANCE_STATUS} />);

    expect(
        screen.queryByTestId(INSTANCE_STATUS_BAR_ID)
    ).not.toBeInTheDocument();
});

test('InstanceStatusBar should be hidden when the trial is far from expired', async () => {
    render(
        <InstanceStatusBar
            instanceStatus={{
                plan: InstancePlan.PRO,
                state: InstanceState.TRIAL,
                trialExpiry: addDays(new Date(), 15).toISOString(),
            }}
        />
    );

    expect(
        screen.queryByTestId(INSTANCE_STATUS_BAR_ID)
    ).not.toBeInTheDocument();
});

test('InstanceStatusBar should warn when the trial is about to expire', async () => {
    render(
        <InstanceStatusBar
            instanceStatus={{
                plan: InstancePlan.PRO,
                state: InstanceState.TRIAL,
                trialExpiry: addDays(new Date(), 5).toISOString(),
            }}
        />
    );

    expect(screen.getByTestId(INSTANCE_STATUS_BAR_ID)).toBeInTheDocument();
    expect(await screen.findByTestId(INSTANCE_STATUS_BAR_ID)).toMatchSnapshot();
});

test('InstanceStatusBar should warn when the trial has expired', async () => {
    render(
        <InstanceStatusBar
            instanceStatus={{
                plan: InstancePlan.PRO,
                state: InstanceState.TRIAL,
                trialExpiry: new Date().toISOString(),
            }}
        />
    );

    expect(screen.getByTestId(INSTANCE_STATUS_BAR_ID)).toBeInTheDocument();
    expect(await screen.findByTestId(INSTANCE_STATUS_BAR_ID)).toMatchSnapshot();
});
