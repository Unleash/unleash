import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { ChangesToOverwriteInternal } from './ChangeOverwriteWarning';
import { IFeatureStrategy } from 'interfaces/strategy';
import {
    ChangeRequestState,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';

const existingStrategy: IFeatureStrategy = {
    name: 'flexibleRollout',
    constraints: [],
    variants: [],
    parameters: {
        groupId: 'aaa',
        rollout: '71',
        stickiness: 'default',
    },
    id: '31572930-2db7-461f-813b-3eedc200cb33',
    title: '',
    disabled: false,
    segments: [],
};

const snapshot: IFeatureStrategy = {
    id: '31572930-2db7-461f-813b-3eedc200cb33',
    name: 'flexibleRollout',
    title: '',
    disabled: true,
    segments: [],
    variants: [],
    parameters: {
        groupId: 'aaa',
        rollout: '72',
        stickiness: 'default',
    },
    constraints: [],
};

const change: IChangeRequestUpdateStrategy = {
    id: 39,
    action: 'updateStrategy' as const,
    payload: {
        id: '31572930-2db7-461f-813b-3eedc200cb33',
        name: 'flexibleRollout',
        title: '',
        disabled: false,
        segments: [],
        snapshot,
        variants: [],
        parameters: {
            groupId: 'baa',
            rollout: '38',
            stickiness: 'default',
        },
        constraints: [],
    },
    createdAt: new Date('2024-01-18T07:58:36.314Z'),
    createdBy: {
        id: 1,
        username: 'admin',
        imageUrl: '',
    },
};

test.each([
    ['Draft', true],
    ['Approved', true],
    ['In review', true],
    ['Applied', false],
    ['Scheduled', true],
    ['Cancelled', false],
    ['Rejected', false],
])('Shows warnings for CRs in the "%s" state: %s', (status, showWarning) => {
    render(
        <ChangesToOverwriteInternal
            change={change}
            currentStrategy={existingStrategy}
            changeRequestState={status as ChangeRequestState}
        />,
    );

    const hasRendered = screen.queryByText('Heads up!') !== null;
    expect(hasRendered).toBe(showWarning);
});
