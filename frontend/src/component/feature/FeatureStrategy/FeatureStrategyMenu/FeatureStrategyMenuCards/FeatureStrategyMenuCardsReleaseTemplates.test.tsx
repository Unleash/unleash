import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureStrategyMenuCardsReleaseTemplates } from './FeatureStrategyMenuCardsReleaseTemplates';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { enterprise: '1.0.0' },
        },
    });

    testServerRoute(server, '/api/admin/release-plan-templates', [
        { id: '1', name: 'Template 1', description: 'Description 1' },
    ]);
};

describe('FeatureStrategyMenuCardsReleaseTemplates', () => {
    beforeEach(() => {
        setupApi();
    });

    it('renders new template as a link when user has permission', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                onAddReleasePlan={() => {}}
                onReviewReleasePlan={() => {}}
                filter={null}
                setFilter={() => {}}
            />,
            {
                permissions: [{ permission: RELEASE_PLAN_TEMPLATE_CREATE }],
            },
        );

        const link = await screen.findByRole('link', {
            name: /new template/i,
        });
        expect(link).toHaveAttribute(
            'href',
            '/release-templates/create-template',
        );
    });

    it('shows no access dialog when user does not have permission', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                onAddReleasePlan={() => {}}
                onReviewReleasePlan={() => {}}
                filter={null}
                setFilter={() => {}}
            />,
            {
                permissions: [],
            },
        );

        const button = await screen.findByRole('button', {
            name: /new template/i,
        });
        fireEvent.click(button);

        await screen.findByText(/contact admin to create release templates/i);
        expect(
            screen.getByText(
                /you don't have the required permissions to create release templates/i,
            ),
        ).toBeInTheDocument();
    });
});
