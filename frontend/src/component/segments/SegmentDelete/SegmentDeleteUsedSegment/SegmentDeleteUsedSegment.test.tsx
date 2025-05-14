import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { SegmentDeleteUsedSegment } from './SegmentDeleteUsedSegment.tsx';

describe('SegmentDeleteUsedSegment', () => {
    it('should link to change requests for change request strategies', async () => {
        const projectId = 'project1';

        const crStrategies = [
            {
                projectId,
                featureName: 'feature1',
                strategyName: 'flexible rollout',
                environment: 'default',
                changeRequest: { id: 1, title: null },
            },
            {
                projectId,
                featureName: 'feature1',
                strategyName: 'flexible rollout',
                environment: 'default',
                changeRequest: { id: 2, title: 'My cool CR' },
            },
        ];

        render(
            <SegmentDeleteUsedSegment
                changeRequestStrategies={crStrategies}
                segment={{
                    id: 1,
                    name: 'segment',
                    description: 'description',
                    project: projectId,
                    constraints: [],
                    createdAt: '',
                    createdBy: '',
                }}
                open={true}
                strategies={[]}
                onClose={() => {}}
            />,
        );

        const links = await screen.findAllByRole('link');
        expect(links).toHaveLength(crStrategies.length);

        const [link1, link2] = links;

        expect(link1).toHaveTextContent('#1');
        expect(link1).toHaveAccessibleDescription('Change request 1');
        expect(link1).toHaveAttribute(
            'href',
            `/projects/${projectId}/change-requests/1`,
        );
        expect(link2).toHaveTextContent('#2 (My cool CR)');
        expect(link2).toHaveAccessibleDescription('Change request 2');
        expect(link2).toHaveAttribute(
            'href',
            `/projects/${projectId}/change-requests/2`,
        );
    });
});
