import { NetworkOverview } from './NetworkOverview/NetworkOverview';
import { NetworkTraffic } from './NetworkTraffic/NetworkTraffic';
import AdminMenu from '../menu/AdminMenu';
import { styled, Tab, Tabs } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CenteredNavLink } from '../menu/CenteredNavLink';
import { PageContent } from 'component/common/PageContent/PageContent';

const StyledPageContent = styled(PageContent)(() => ({
    '.page-header': {
        padding: 0,
    },
}));

const tabs = [
    {
        label: 'Overview',
        path: '/admin/network',
    },
    {
        label: 'Traffic',
        path: '/admin/network/traffic',
    },
];

export const Network = () => {
    const { pathname } = useLocation();

    return (
        <div>
            <AdminMenu />
            <StyledPageContent
                headerClass="page-header"
                header={
                    <Tabs
                        value={pathname}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        allowScrollButtonsMobile
                    >
                        {tabs.map(({ label, path }) => (
                            <Tab
                                key={label}
                                value={path}
                                label={
                                    <CenteredNavLink to={path}>
                                        <span>{label}</span>
                                    </CenteredNavLink>
                                }
                            />
                        ))}
                    </Tabs>
                }
            >
                <Routes>
                    <Route path="traffic" element={<NetworkTraffic />} />
                    <Route path="*" element={<NetworkOverview />} />
                </Routes>
            </StyledPageContent>
        </div>
    );
};
