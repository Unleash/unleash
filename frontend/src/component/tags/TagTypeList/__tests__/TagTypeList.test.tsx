import { expect, test } from 'vitest';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as renderWithProviders } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { MemoryRouter } from 'react-router';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';

const server = testServerSetup();

test('renders an empty list correctly', () => {
    const { asFragment } = render(
        <MemoryRouter>
            <ThemeProvider>
                <AnnouncerProvider>
                    <UIProvider>
                        <AccessProviderMock
                            permissions={[{ permission: ADMIN }]}
                        >
                            <TagTypeList />
                        </AccessProviderMock>
                    </UIProvider>
                </AnnouncerProvider>
            </ThemeProvider>
        </MemoryRouter>,
    );
    expect(asFragment()).toMatchSnapshot();
});

const openDeleteDialog = async (usage: {
    usedInProjects: number;
    valueCount: number;
}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { tagManagementViaUi: true },
    });
    testServerRoute(server, '/api/admin/tag-types', {
        version: 1,
        tagTypes: [{ name: 'team', ...usage }],
    });

    renderWithProviders(<TagTypeList />, {
        permissions: [{ permission: ADMIN }],
    });

    const row = (await screen.findByText('team')).closest('tr')!;
    await userEvent.click(
        await within(row).findByRole('button', { name: 'Delete tag type' }),
    );
    return { row, dialog: await screen.findByRole('dialog') };
};

test('shows impact of deleting a tag type', async () => {
    const { row, dialog } = await openDeleteDialog({
        usedInProjects: 2,
        valueCount: 3,
    });

    within(row).getByText('2 projects');
    within(row).getByText('3');
    expect(dialog).toHaveTextContent('delete 3 tag values');
    within(dialog).getByText('3 tag values', { selector: 'strong' });
    within(dialog).getByText('2 projects', { selector: 'strong' });
});

test('tells that deleted tag values are not assigned to any flags', async () => {
    const { dialog } = await openDeleteDialog({
        usedInProjects: 0,
        valueCount: 3,
    });

    expect(dialog).toHaveTextContent('delete 3 tag values');
    expect(dialog).toHaveTextContent('None of them are assigned to flags');
});

test('describes no impact when deleting a tag type without values', async () => {
    const { dialog } = await openDeleteDialog({
        usedInProjects: 0,
        valueCount: 0,
    });

    expect(dialog).not.toHaveTextContent('This will delete');
});
