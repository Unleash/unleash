import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import {
    RELEASE_PLAN_TEMPLATE_CREATE,
    UPDATE_PROJECT_RELEASE_TEMPLATE,
} from '@server/types/permissions';
import { NewReleaseTemplateButton } from './NewReleaseTemplateButton.tsx';

const projectId = 'default';

const renderButton = (
    permissions: { permission: string; project?: string }[],
) =>
    render(<NewReleaseTemplateButton projectId={projectId} />, {
        permissions,
    });

const expectGlobalAndProjectChoice = async () => {
    fireEvent.click(
        await screen.findByRole('button', { name: /new template/i }),
    );

    expect(
        await screen.findByRole('menuitem', { name: 'Global template' }),
    ).toHaveAttribute('href', '/release-templates/create-template');
    expect(
        screen.getByRole('menuitem', { name: 'Project template' }),
    ).toHaveAttribute(
        'href',
        `/projects/${projectId}/settings/release-templates/create-template`,
    );
};

describe('creating a release template from the strategy wizard', () => {
    it('tells users without permission to contact an admin', async () => {
        renderButton([]);

        fireEvent.click(
            await screen.findByRole('button', { name: /new template/i }),
        );

        await screen.findByText(/contact admin to create release templates/i);
        expect(
            screen.getByText(
                /you don't have the required permissions to create release templates/i,
            ),
        ).toBeInTheDocument();
    });

    it('offers a choice between global and project template creation when user holds both permissions', async () => {
        renderButton([
            { permission: RELEASE_PLAN_TEMPLATE_CREATE },
            { permission: UPDATE_PROJECT_RELEASE_TEMPLATE, project: projectId },
        ]);

        await expectGlobalAndProjectChoice();
    });

    it('offers a choice between global and project template creation when user holds only the root permission', async () => {
        renderButton([{ permission: RELEASE_PLAN_TEMPLATE_CREATE }]);

        await expectGlobalAndProjectChoice();
    });

    it('links straight to project template creation for users without the root permission', async () => {
        renderButton([
            { permission: UPDATE_PROJECT_RELEASE_TEMPLATE, project: projectId },
        ]);

        expect(
            await screen.findByRole('link', { name: /new template/i }),
        ).toHaveAttribute(
            'href',
            `/projects/${projectId}/settings/release-templates/create-template`,
        );
    });
});
