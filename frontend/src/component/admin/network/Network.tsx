import { lazy } from 'react';

import { Tab, Tabs } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { TabLink } from 'component/common/TabNav/TabLink';
import { PageContent } from 'component/common/PageContent/PageContent';

const NetworkOverview = lazy(() => import('./NetworkOverview/NetworkOverview'));
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
        label: 'Data Usage',
        path: '/admin/network/data-usage',
    },
];

export const Network = () => {
    const { pathname } = useLocation();

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
                        {tabs.map(({ label, path }) => (
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
                    <Route path='traffic' element={<NetworkTraffic />} />
                    <Route path='*' element={<NetworkOverview />} />
                    <Route
                        path='data-usage'
                        element={<NetworkTrafficUsage />}
                    />
                </Routes>
            </PageContent>
        </div>
    );
};
