import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { StrategyDiff } from './StrategyTooltipLink';
import type { IFeatureStrategy } from 'interfaces/strategy';
import type { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';

test('Should not render the `snapshot` property', async () => {
    const existingStrategy: IFeatureStrategy = {
        name: 'flexibleRollout',
        constraints: [],
        variants: [],
        parameters: {
            groupId: 'aaa',
            rollout: '71',
            stickiness: 'default',
        },
        sortOrder: 0,
        id: '31572930-2db7-461f-813b-3eedc200cb33',
        title: '',
        disabled: false,
        segments: [],
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
            snapshot: existingStrategy,
            variants: [],
            parameters: {
                groupId: 'aaa',
                rollout: '38',
                stickiness: 'default',
            },
            constraints: [],
        },
        createdAt: new Date('2024-01-18T07:58:36.314Z'),
        createdBy: {
            id: 1,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918?s=42&d=retro&r=g',
        },
    };

    render(<StrategyDiff change={change} currentStrategy={existingStrategy} />);

    expect(screen.queryByText(/snapshot/)).toBeNull();
});
