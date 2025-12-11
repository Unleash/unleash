import { lazy } from 'react';

import { Tab, Tabs } from '@mui/material';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { TabLink } from 'component/common/TabNav/TabLink';
import { PageContent } from 'component/common/PageContent/PageContent';
import { useUiFlag } from 'hooks/useUiFlag';

const NetworkOverview = lazy(
    () => import('./NetworkOverview/NetworkOverview.tsx'),
);
const NetworkConnectedEdges = lazy(
    () => import('./NetworkConnectedEdges/NetworkConnectedEdges.tsx'),
);
const NetworkTraffic = lazy(
    () => import('./NetworkTraffic/NetworkTraffic.tsx'),
);
const NetworkTrafficUsage = lazy(
    () => import('./NetworkTrafficUsage/NetworkTrafficUsage.tsx'),
);
const BackendConnections = lazy(
    () => import('./NetworkTrafficUsage/BackendConnections.tsx'),
);
const FrontendNetworkTrafficUsage = lazy(
    () => import('./NetworkTrafficUsage/FrontendNetworkTrafficUsage.tsx'),
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
];

const seatModelTabs = [
    {
        label: 'Data Usage',
        path: '/admin/network/data-usage',
    },
];

const consumptionModelTabs = [
    {
        label: 'Backend Connections',
        path: '/admin/network/backend-connections',
    },
    {
        label: 'Frontend Traffic',
        path: '/admin/network/frontend-data-usage',
    },
];

export const Network = () => {
    const { pathname } = useLocation();
    const consumptionModelEnabled = useUiFlag('consumptionModelUI');
    const allTabs = consumptionModelEnabled
        ? [...tabs, ...consumptionModelTabs]
        : [...tabs, ...seatModelTabs];

    const filteredTabs = allTabs.filter(
        ({ label }) => label !== 'Connected Edges',
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
                    <Route path='traffic' element={<NetworkTraffic />} />
                    <Route
                        path='connected-edges'
                        element={
                            <Navigate to='/admin/enterprise-edge' replace />
                        }
                    />
                    <Route
                        path='data-usage'
                        element={<NetworkTrafficUsage />}
                    />
                    <Route
                        path='backend-connections'
                        element={<BackendConnections />}
                    />
                    <Route
                        path='frontend-data-usage'
                        element={<FrontendNetworkTrafficUsage />}
                    />
                </Routes>
            </PageContent>
        </div>
    );
};
