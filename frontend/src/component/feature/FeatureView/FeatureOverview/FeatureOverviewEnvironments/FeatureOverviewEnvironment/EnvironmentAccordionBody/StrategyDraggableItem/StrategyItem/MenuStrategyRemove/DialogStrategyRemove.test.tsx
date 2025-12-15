import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import {
    FeatureStrategyRemoveDialogue,
    SuggestFeatureStrategyRemoveDialogue,
} from './DialogStrategyRemove.tsx';

const _strategyId = 'c81e3a1d-e91c-4083-bd0f-75bb8a9e32a2';
const projectId = 'default';
const _environment = 'development';
const _featureId = 'bb1d79e0-95b0-4393-b248-64d1e0294ee3';

describe('Use in scheduled change requests', () => {
    it.each([
        'enabled',
        'disabled',
    ])('should show usage in scheduled change requests with change requests %s for the project', async (changeRequestsEnabled) => {
        const changeRequestWithTitle = { id: 1, title: 'My CR' };
        const changeRequestWithoutTitle = { id: 2 };
        const scheduledChangeRequests = [
            changeRequestWithTitle,
            changeRequestWithoutTitle,
        ];

        if (changeRequestsEnabled === 'enabled') {
            render(
                <SuggestFeatureStrategyRemoveDialogue
                    onRemove={async () => {}}
                    onClose={() => {}}
                    isOpen={true}
                    scheduledChangeRequestsForStrategy={{
                        projectId,
                        changeRequests: scheduledChangeRequests,
                    }}
                />,
            );
        } else {
            render(
                <FeatureStrategyRemoveDialogue
                    onRemove={async () => {}}
                    onClose={() => {}}
                    isOpen={true}
                    scheduledChangeRequestsForStrategy={{
                        projectId,
                        changeRequests: scheduledChangeRequests,
                    }}
                />,
            );
        }

        const alerts = await screen.findAllByRole('alert');

        expect(
            alerts.find((alert) =>
                alert.textContent!.startsWith('This strategy'),
            ),
        ).toBeTruthy();

        const links = await screen.findAllByRole('link');

        expect(links).toHaveLength(scheduledChangeRequests.length);

        const [link1, link2] = links;

        expect(link1).toHaveTextContent('#1 (My CR)');
        expect(link1).toHaveAccessibleDescription('Change request 1');
        expect(link1).toHaveAttribute(
            'href',
            `/projects/default/change-requests/1`,
        );

        expect(link2).toHaveTextContent('#2');
        expect(link2).toHaveAccessibleDescription('Change request 2');
        expect(link2).toHaveAttribute(
            'href',
            `/projects/default/change-requests/2`,
        );
    });

    it('should not render scheduled change requests warning when there are no scheduled change requests', async () => {
        render(
            <SuggestFeatureStrategyRemoveDialogue
                onRemove={async () => {}}
                onClose={() => {}}
                isOpen={true}
                scheduledChangeRequestsForStrategy={{
                    projectId,
                    changeRequests: [],
                }}
            />,
        );

        const alerts = await screen.findAllByRole('alert');

        expect(
            alerts.find((alert) =>
                alert.textContent!.startsWith('This strategy'),
            ),
        ).toBeFalsy();

        expect(alerts).toHaveLength(1);

        const link = screen.queryByRole('link');

        expect(link).toBe(null);
    });

    it("It should render a warning saying there might be scheduled change requests if it doesn't get a successful API response", async () => {
        render(
            <SuggestFeatureStrategyRemoveDialogue
                onRemove={async () => {}}
                onClose={() => {}}
                isOpen={true}
                scheduledChangeRequestsForStrategy={{
                    projectId,
                    changeRequests: undefined,
                }}
            />,
        );

        const alerts = await screen.findAllByRole('alert');

        expect(
            alerts.find((alert) =>
                alert.textContent!.startsWith('This strategy'),
            ),
        ).toBeTruthy();

        expect(alerts).toHaveLength(2);

        const link = screen.queryByRole('link');

        expect(link).toBe(null);
    });
});
