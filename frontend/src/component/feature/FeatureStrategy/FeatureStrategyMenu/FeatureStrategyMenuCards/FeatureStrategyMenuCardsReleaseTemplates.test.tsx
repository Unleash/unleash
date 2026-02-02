import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureStrategyMenuCardsReleaseTemplates } from './FeatureStrategyMenuCardsReleaseTemplates';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';
import { Route, Routes } from 'react-router-dom';

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

const Component = () => (
    <Routes>
        <Route
            path='/'
            element={
                <FeatureStrategyMenuCardsReleaseTemplates
                    onAddReleasePlan={() => {}}
                    onReviewReleasePlan={() => {}}
                    filter={null}
                    setFilter={() => {}}
                />
            }
        />
        <Route
            path='/release-templates/create-template'
            element={<div>Create Template Page</div>}
        />
    </Routes>
);

describe('FeatureStrategyMenuCardsReleaseTemplates', () => {
    beforeEach(() => {
        setupApi();
    });

    it('renders New template button', async () => {
        render(<Component />, {
            permissions: [{ permission: RELEASE_PLAN_TEMPLATE_CREATE }],
        });

        await screen.findByText('Release templates');
        const button = await screen.findByRole('button', {
            name: /new template/i,
        });
        expect(button).toBeInTheDocument();
    });

    it('navigates to create template page when user has permission', async () => {
        render(<Component />, {
            permissions: [{ permission: RELEASE_PLAN_TEMPLATE_CREATE }],
        });

        const button = await screen.findByRole('button', {
            name: /new template/i,
        });
        fireEvent.click(button);

        await screen.findByText('Create Template Page');
    });

    it('shows no access dialog when user does not have permission', async () => {
        render(<Component />, {
            permissions: [],
        });

        const button = await screen.findByRole('button', {
            name: /new template/i,
        });
        fireEvent.click(button);

        await screen.findByText(/contact admin to create release templates/i);
        expect(
            screen.getByText(
                /you don't have the privileges to create release templates/i,
            ),
        ).toBeInTheDocument();
    });

    it('closes the no access dialog when close button is clicked', async () => {
        render(<Component />, {
            permissions: [],
        });

        const newTemplateButton = await screen.findByRole('button', {
            name: /new template/i,
        });
        fireEvent.click(newTemplateButton);

        await screen.findByText(/contact admin to create release templates/i);

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(
                screen.queryByText(
                    /contact admin to create release templates/i,
                ),
            ).not.toBeInTheDocument();
        });
    });
});
