import { lazy } from 'react';

import { Tab, Tabs } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TabLink } from 'component/common/TabNav/TabLink';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useUiFlag } from 'hooks/useUiFlag';

const NetworkOverview = lazy(() => import('./NetworkOverview/NetworkOverview'));
const NetworkConnectedEdges = lazy(
    () => import('./NetworkConnectedEdges/NetworkConnectedEdges'),
);
const NetworkTraffic = lazy(() => import('./NetworkTraffic/NetworkTraffic'));
const NetworkTrafficUsage = lazy(
    () => import('./NetworkTrafficUsage/NetworkTrafficUsage'),
);

const tabs = [
    {
        label: 'Overview',
        path: '/admin/network',
    },
    {
        label: 'Traffic',
        path: '/admin/network/traffic',
    },
    {
        label: 'Connected Edges',
        path: '/admin/network/connected-edges',
    },
    {
        label: 'Data Usage',
        path: '/admin/network/data-usage',
    },
];

export const Network = () => {
    const { pathname } = useLocation();
    const edgeObservabilityEnabled = useUiFlag('edgeObservability');

    const filteredTabs = tabs.filter(
        ({ label }) => label !== 'Connected Edges' || edgeObservabilityEnabled,
    );

    return (
        <div>
            <PageContent
                withTabs
                header={
                    <Tabs
                        value={pathname}
                        indicatorColor='primary'
                        textColor='primary'
                        variant='scrollable'
                        allowScrollButtonsMobile
                    >
                        {filteredTabs.map(({ label, path }) => (
                            <Tab
                                key={label}
                                value={path}
                                label={
                                    <TabLink to={path}>
                                        <span>{label}</span>
                                    </TabLink>
                                }
                                sx={{ padding: 0 }}
                            />
                        ))}
                    </Tabs>
                }
            >
                <Routes>
                    <Route path='*' element={<NetworkOverview />} />
                    {edgeObservabilityEnabled && (
                        <Route
                            path='connected-edges'
                            element={<NetworkConnectedEdges />}
                        />
                    )}
                    <Route path='traffic' element={<NetworkTraffic />} />
                    <Route
                        path='data-usage'
                        element={<NetworkTrafficUsage />}
                    />
                </Routes>
            </PageContent>
        </div>
    );
};
