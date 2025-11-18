import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureStrategySegmentList } from './FeatureStrategySegmentList.tsx';
import type { ISegment } from 'interfaces/segment';

const createMockSegment = (
    id: number,
    name: string,
    constraints: ISegment['constraints'] = [],
): ISegment => ({
    id,
    name,
    description: `Description for ${name}`,
    createdAt: '2023-01-01T00:00:00Z',
    createdBy: 'test-user',
    constraints,
});

describe('FeatureStrategySegmentList', () => {
    test('should not show warning when segment has constraints', () => {
        const segments: ISegment[] = [
            createMockSegment(1, 'Segment with constraints', [
                {
                    contextName: 'userId',
                    operator: 'IN',
                    values: ['user1', 'user2'],
                },
            ]),
        ];

        render(
            <FeatureStrategySegmentList
                segments={segments}
                setSegments={() => {}}
            />,
        );

        expect(screen.getByText('Selected Segments')).toBeInTheDocument();
        expect(
            screen.getByText('Segment with constraints'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/You are adding an empty segment/i),
        ).not.toBeInTheDocument();
    });

    test('should show warning when segment has no constraints', () => {
        const segments: ISegment[] = [
            createMockSegment(1, 'pre-access-demo-accounts', []),
        ];

        render(
            <FeatureStrategySegmentList
                segments={segments}
                setSegments={() => {}}
            />,
        );

        expect(screen.getByText('Selected Segments')).toBeInTheDocument();
        expect(
            screen.getByText('pre-access-demo-accounts'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/You are adding an empty segment/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/This will activate this feature for ALL USERS/i),
        ).toBeInTheDocument();
    });
});
