import type { ReactNode } from 'react';
import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useChangeRequestConfig } from 'hooks/api/getters/useChangeRequestConfig/useChangeRequestConfig';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { DraftBanner } from './DraftBanner.tsx';
import { mockDraftInDefaultProject } from './draftBannerTestServer.ts';

const server = testServerSetup();

// Both requests fall back to empty lists until ui-config says enterprise, and a
// banner that ignored the config would still wait for the pending changes, so
// asserting an absent banner is only meaningful once both have loaded.
const ChangeRequestDataLoaded = () => {
    const { isEnterprise } = useUiConfig();
    const { loading: configLoading } = useChangeRequestConfig('default');
    const { loading: pendingLoading } = usePendingChangeRequests('default');
    return isEnterprise() && !configLoading && !pendingLoading
        ? 'change request data loaded'
        : null;
};

const mockEnterprise = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        environment: 'Enterprise',
    });

const renderInDefaultProject = (element: ReactNode) =>
    render(
        <Routes>
            <Route path='/projects/:projectId/*' element={element} />
        </Routes>,
        { route: '/projects/default' },
    );

test('explains that a single draft needs to be reviewed', async () => {
    mockEnterprise();
    mockDraftInDefaultProject(server, { changeRequestEnabled: true });

    renderInDefaultProject(<DraftBanner />);

    expect(
        await screen.findByText(/that need to be reviewed/),
    ).toBeInTheDocument();
});

test('hides the banner when change requests are disabled in the project', async () => {
    mockEnterprise();
    mockDraftInDefaultProject(server, { changeRequestEnabled: false });

    renderInDefaultProject(
        <>
            <DraftBanner />
            <ChangeRequestDataLoaded />
        </>,
    );

    await screen.findByText('change request data loaded');
    expect(
        screen.queryByRole('button', { name: /View changes/ }),
    ).not.toBeInTheDocument();
});
