import { beforeEach, describe, expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureStrategyMenuCardsReleaseTemplates } from './FeatureStrategyMenuCardsReleaseTemplates';
import {
    RELEASE_PLAN_TEMPLATE_CREATE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { enterprise: '1.0.0' },
        },
    });

    testServerRoute(
        server,
        '/api/admin/projects/default/release-templates',
        [
            {
                id: '1',
                name: 'Project template',
                description: 'Description 1',
                project: 'default',
            },
            {
                id: '2',
                name: 'Global template',
                description: 'Description 2',
                project: null,
            },
        ],
        'get',
        200,
        { include: 'root' },
    );
};

describe('FeatureStrategyMenuCardsReleaseTemplates', () => {
    beforeEach(() => {
        setupApi();
    });

    it('shows no access dialog when user does not have permission', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                projectId='default'
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

    it('lists project templates alongside global ones', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                projectId='default'
                onAddReleasePlan={() => {}}
                onReviewReleasePlan={() => {}}
                filter={null}
                setFilter={() => {}}
            />,
        );

        await screen.findByText('Project template');
        await screen.findByText('Global template');
        expect(screen.getByText('Project')).toBeInTheDocument();
        expect(screen.getByText('Global')).toBeInTheDocument();
    });

    it('offers a choice between global and project template creation when user holds both permissions', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                projectId='default'
                onAddReleasePlan={() => {}}
                onReviewReleasePlan={() => {}}
                filter={null}
                setFilter={() => {}}
            />,
            {
                permissions: [
                    { permission: RELEASE_PLAN_TEMPLATE_CREATE },
                    {
                        permission: UPDATE_PROJECT_RELEASE_TEMPLATE,
                        project: 'default',
                    },
                ],
            },
        );

        fireEvent.click(
            await screen.findByRole('button', { name: /new template/i }),
        );

        const globalItem = await screen.findByRole('menuitem', {
            name: 'Global template',
        });
        expect(globalItem).toHaveAttribute(
            'href',
            '/release-templates/create-template',
        );
        const projectItem = screen.getByRole('menuitem', {
            name: 'Project template',
        });
        expect(projectItem).toHaveAttribute(
            'href',
            '/projects/default/settings/release-templates/create-template',
        );
    });

    it('offers a choice between global and project template creation when user holds only the root permission', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                projectId='default'
                onAddReleasePlan={() => {}}
                onReviewReleasePlan={() => {}}
                filter={null}
                setFilter={() => {}}
            />,
            {
                permissions: [{ permission: RELEASE_PLAN_TEMPLATE_CREATE }],
            },
        );

        fireEvent.click(
            await screen.findByRole('button', { name: /new template/i }),
        );

        const globalItem = await screen.findByRole('menuitem', {
            name: 'Global template',
        });
        expect(globalItem).toHaveAttribute(
            'href',
            '/release-templates/create-template',
        );
        const projectItem = screen.getByRole('menuitem', {
            name: 'Project template',
        });
        expect(projectItem).toHaveAttribute(
            'href',
            '/projects/default/settings/release-templates/create-template',
        );
    });

    it('links straight to project template creation for users without the root permission', async () => {
        render(
            <FeatureStrategyMenuCardsReleaseTemplates
                projectId='default'
                onAddReleasePlan={() => {}}
                onReviewReleasePlan={() => {}}
                filter={null}
                setFilter={() => {}}
            />,
            {
                permissions: [
                    {
                        permission: UPDATE_PROJECT_RELEASE_TEMPLATE,
                        project: 'default',
                    },
                ],
            },
        );

        const link = await screen.findByRole('link', {
            name: /new template/i,
        });
        expect(link).toHaveAttribute(
            'href',
            '/projects/default/settings/release-templates/create-template',
        );
    });
});
