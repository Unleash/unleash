import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { mockUserWithSplash } from 'component/onboarding/floatingChecklist/onboardingChecklistTestServer.ts';
import type { TableState } from '../ChangeRequests.types';
import { makeStyledChip } from './ChangeRequestFilters.styles';
import { UserFilterChips } from './UserFilterChips.tsx';
import { useApprovalRequestedCount } from 'hooks/api/getters/useApprovalRequestedCount/useApprovalRequestedCount';
import { setNewNavigationEnabled } from 'hooks/useNewNavigation';

const server = testServerSetup();
const USER_ID = 7;

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        flags: { improvedSidebarNavigation: true },
    });
    setNewNavigationEnabled(true);
    mockUserWithSplash(server, {}, USER_ID);
    testServerRoute(
        server,
        '/api/admin/search/change-requests',
        { changeRequests: [], total: 3 },
        'get',
        200,
        { requestedApproverId: `IS:${USER_ID}`, state: 'IS:open' },
    );
};

// A missing mark only means something once the count it depends on has loaded.
const CountLoaded = () =>
    useApprovalRequestedCount().total === undefined ? null : 'count loaded';

const renderChips = (tableState: Partial<TableState>) =>
    render(
        <>
            <UserFilterChips
                tableState={tableState as TableState}
                setTableState={() => {}}
                userId={USER_ID}
                StyledChip={makeStyledChip('change-requests-table')}
            />
            <CountLoaded />
        </>,
    );

test('marks Approval Requested when open change requests request my approval', async () => {
    setupApi();

    renderChips({
        createdBy: { operator: 'IS', values: [`${USER_ID}`] },
    });

    expect(
        await screen.findByRole('button', {
            name: /Has open change requests.*Approval Requested/,
        }),
    ).toBeInTheDocument();
});

test('drops the mark once Approval Requested is selected', async () => {
    setupApi();

    renderChips({
        requestedApproverId: { operator: 'IS', values: [`${USER_ID}`] },
    });

    await screen.findByText('count loaded');
    expect(
        screen.getByRole('button', { name: 'Approval Requested' }),
    ).toBeInTheDocument();
});
