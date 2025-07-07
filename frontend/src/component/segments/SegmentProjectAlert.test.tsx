import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { SegmentProjectAlert } from './SegmentProjectAlert.tsx';

describe('SegmentDeleteUsedSegment', () => {
    it('should link to change requests for change request strategies', async () => {
        const projectId = 'project1';

        const strategies = [
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

        const projectsUsed = [...new Set(strategies.map((s) => s.projectId))];

        render(
            <SegmentProjectAlert
                projects={[]}
                availableProjects={[]}
                projectsUsed={projectsUsed}
                strategies={strategies}
            />,
        );

        const links = await screen.findAllByRole('link');
        expect(links).toHaveLength(strategies.length + projectsUsed.length);

        const [projectLink, crLink1, crLink2] = links;

        expect(projectLink).toHaveTextContent(projectId);
        expect(projectLink).toHaveAttribute('href', `/projects/${projectId}`);

        expect(crLink1).toHaveTextContent('#1');
        expect(crLink1).toHaveAccessibleDescription('Change request 1');
        expect(crLink1).toHaveAttribute(
            'href',
            `/projects/${projectId}/change-requests/1`,
        );

        expect(crLink2).toHaveTextContent('#2 (My cool CR)');
        expect(crLink2).toHaveAccessibleDescription('Change request 2');
        expect(crLink2).toHaveAttribute(
            'href',
            `/projects/${projectId}/change-requests/2`,
        );
    });
});
