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
    test('should not render when segments array is empty', () => {
        render(
            <FeatureStrategySegmentList segments={[]} setSegments={() => {}} />,
        );

        expect(screen.queryByText('Selected Segments')).not.toBeInTheDocument();
    });

    test('should render segments with constraints without warning', () => {
        const segments: ISegment[] = [
            createMockSegment(1, 'Segment with constraints', [
                {
                    contextName: 'userId',
                    operator: 'IN',
                    values: ['user1', 'user2'],
                },
            ]),
            createMockSegment(2, 'Another segment', [
                {
                    contextName: 'email',
                    operator: 'IN',
                    values: ['test@example.com'],
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
        expect(screen.getByText('Another segment')).toBeInTheDocument();
        expect(
            screen.queryByText(/You are adding an empty segment/i),
        ).not.toBeInTheDocument();
    });

    test('should show warning when a segment has no constraints', () => {
        const segments: ISegment[] = [
            createMockSegment(1, 'Empty segment', []),
        ];

        render(
            <FeatureStrategySegmentList
                segments={segments}
                setSegments={() => {}}
            />,
        );

        expect(screen.getByText('Selected Segments')).toBeInTheDocument();
        expect(screen.getByText('Empty segment')).toBeInTheDocument();
        expect(
            screen.getByText(/You are adding an empty segment/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/This will activate this feature for ALL USERS/i),
        ).toBeInTheDocument();
    });

    test('should show warning with segment name when segment has no constraints', () => {
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
            screen.getByText(/You are adding an empty segment/i),
        ).toBeInTheDocument();
        const warningElements = screen.getAllByText(
            /pre-access-demo-accounts/i,
        );
        expect(warningElements.length).toBeGreaterThan(0);
    });

    test('should show plural warning when multiple empty segments are added', () => {
        const segments: ISegment[] = [
            createMockSegment(1, 'Empty segment 1', []),
            createMockSegment(2, 'Empty segment 2', []),
        ];

        render(
            <FeatureStrategySegmentList
                segments={segments}
                setSegments={() => {}}
            />,
        );

        expect(screen.getByText('Selected Segments')).toBeInTheDocument();
        expect(
            screen.getByText(/You are adding an empty segments/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Empty segment 1, Empty segment 2/i),
        ).toBeInTheDocument();
    });

    test('should show warning only for empty segments, not segments with constraints', () => {
        const segments: ISegment[] = [
            createMockSegment(1, 'Segment with constraints', [
                {
                    contextName: 'userId',
                    operator: 'IN',
                    values: ['user1'],
                },
            ]),
            createMockSegment(2, 'Empty segment', []),
        ];

        render(
            <FeatureStrategySegmentList
                segments={segments}
                setSegments={() => {}}
            />,
        );

        expect(
            screen.getByText('Segment with constraints'),
        ).toBeInTheDocument();
        const emptySegmentElements = screen.getAllByText(/Empty segment/i);
        expect(emptySegmentElements.length).toBeGreaterThan(0);
        expect(
            screen.getByText(/You are adding an empty segment/i),
        ).toBeInTheDocument();
    });

    test('should handle segment with no constraints property', () => {
        const segments: Partial<ISegment>[] = [
            {
                id: 1,
                name: 'Segment without constraints',
                description: 'Test',
                createdAt: '2023-01-01T00:00:00Z',
                createdBy: 'test-user',
            } as ISegment,
        ];

        render(
            <FeatureStrategySegmentList
                segments={segments as ISegment[]}
                setSegments={() => {}}
            />,
        );

        expect(
            screen.getByText(/You are adding an empty segment/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/This will activate this feature for ALL USERS/i),
        ).toBeInTheDocument();
    });
});
