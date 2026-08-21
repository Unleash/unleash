import { useState } from 'react';
import {
    Button,
    IconButton,
    Tab,
    Tabs,
    Tooltip,
    styled,
    useMediaQuery,
} from '@mui/material';
import Download from '@mui/icons-material/Download';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Search } from 'component/common/Search/Search';
import { TabLink } from 'component/common/TabNav/TabLink';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { useAccessOverviewApi } from 'hooks/api/actions/useAccessOverviewApi/useAccessOverviewApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePageTitle } from 'hooks/usePageTitle';
import theme from 'themes/theme';
import UsersList from '../UsersList/UsersList.tsx';
import EditUser from '../EditUser/EditUser.tsx';
import { AccessOverview } from '../AccessOverview/AccessOverview.tsx';
import { UserAccessLog } from '../UserAccessLog/UserAccessLog.tsx';
import NotFound from 'component/common/NotFound/NotFound';

const StyledHeader = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledTabsContainer = styled('div')({
    flex: 1,
});

const StyledActions = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

const UsersTabsView = () => {
    usePageTitle('Users');
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { users, loading } = useUsers();
    const { downloadCSV } = useAccessOverviewApi();
    const { isEnterprise } = useUiConfig();

    const [searchValue, setSearchValue] = useState('');

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isUsersTab = pathname === '/admin/users';

    const tabs = [
        {
            label: `Users (${users.length})`,
            path: '/admin/users',
        },
        ...(isEnterprise()
            ? [
                  {
                      label: 'Access log',
                      path: '/admin/users/access-log',
                  },
              ]
            : []),
    ];

    return (
        <PageContent
            withTabs
            isLoading={loading}
            header={
                <>
                    <StyledHeader>
                        <StyledTabsContainer>
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
                                            <TabLink to={path}>{label}</TabLink>
                                        }
                                        sx={{ padding: 0 }}
                                    />
                                ))}
                            </Tabs>
                        </StyledTabsContainer>
                        <ConditionallyRender
                            condition={isUsersTab}
                            show={
                                <StyledActions>
                                    <ConditionallyRender
                                        condition={!isSmallScreen}
                                        show={
                                            <Search
                                                initialValue={searchValue}
                                                onChange={setSearchValue}
                                            />
                                        }
                                    />
                                    <PageHeader.Divider />
                                    <Tooltip
                                        title='Exports user access information'
                                        arrow
                                        describeChild
                                    >
                                        <IconButton onClick={downloadCSV}>
                                            <Download />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() =>
                                            navigate('/admin/create-user')
                                        }
                                    >
                                        Add new user
                                    </Button>
                                </StyledActions>
                            }
                        />
                    </StyledHeader>
                    <ConditionallyRender
                        condition={isSmallScreen && isUsersTab}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </>
            }
        >
            <Routes>
                <Route
                    index
                    element={<UsersList searchValue={searchValue} />}
                />
                <Route path='access-log' element={<UserAccessLog />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </PageContent>
    );
};

export const UsersTabs = () => (
    <div>
        <PermissionGuard permissions={ADMIN}>
            <Routes>
                <Route path=':id/edit' element={<EditUser />} />
                <Route path=':id/access' element={<AccessOverview />} />
                <Route path='*' element={<UsersTabsView />} />
            </Routes>
        </PermissionGuard>
    </div>
);

export default UsersTabs;
