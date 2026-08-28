import { type ReactNode, useState } from 'react';
import { Tab, Tabs, styled, useMediaQuery } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Search } from 'component/common/Search/Search';
import { TabLink } from 'component/common/TabNav/TabLink';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import { usePageTitle } from 'hooks/usePageTitle';
import theme from 'themes/theme';
import UsersList from '../UsersList/UsersList.tsx';
import { UsersHeaderActions } from '../UsersList/UsersHeaderActions.tsx';
import { InactiveUsersListBody } from '../InactiveUsersList/InactiveUsersListBody.tsx';
import { InactiveUsersCount } from '../InactiveUsersList/InactiveUsersCount.tsx';
import { InactiveUsersHeaderActions } from '../InactiveUsersList/InactiveUsersHeaderActions.tsx';
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
    const { isEnterprise } = useUiConfig();
    const { users, loading } = useUsers();

    const [searchValue, setSearchValue] = useState('');

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const tabs = [
        {
            label: `Users (${users.length})`,
            path: '/admin/users',
        },
        ...(isEnterprise()
            ? [
                  {
                      label: (
                          <>
                              Inactive users (<InactiveUsersCount />)
                          </>
                      ),
                      path: '/admin/users/inactive',
                  },
                  {
                      label: 'Access log',
                      path: '/admin/users/access-log',
                  },
              ]
            : []),
    ];

    const pageHeader = (actions: ReactNode, showSearch: boolean) => (
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
                                key={path}
                                value={path}
                                label={<TabLink to={path}>{label}</TabLink>}
                                sx={{ padding: 0 }}
                            />
                        ))}
                    </Tabs>
                </StyledTabsContainer>
                <StyledActions>{actions}</StyledActions>
            </StyledHeader>
            {showSearch && isSmallScreen ? (
                <Search initialValue={searchValue} onChange={setSearchValue} />
            ) : null}
        </>
    );

    return (
        <Routes>
            <Route
                index
                element={
                    <PageContent
                        withTabs
                        withStickyFooter
                        header={pageHeader(
                            <UsersHeaderActions
                                searchValue={searchValue}
                                onSearch={setSearchValue}
                                isSmallScreen={isSmallScreen}
                            />,
                            true,
                        )}
                        isLoading={loading}
                    >
                        <UsersList searchValue={searchValue} />
                    </PageContent>
                }
            />
            <Route
                path='inactive'
                element={
                    <PageContent
                        withTabs
                        withStickyFooter
                        header={pageHeader(
                            isEnterprise() ? (
                                <InactiveUsersHeaderActions />
                            ) : null,
                            false,
                        )}
                        isLoading={loading}
                    >
                        <ConditionallyRender
                            condition={isEnterprise()}
                            show={<InactiveUsersListBody />}
                            elseShow={
                                <PremiumFeature feature='inactive-users' page />
                            }
                        />
                    </PageContent>
                }
            />
            <Route
                path='access-log'
                element={
                    <PageContent
                        withTabs
                        withStickyFooter
                        header={pageHeader(null, false)}
                        disableLoading
                    >
                        <UserAccessLog />
                    </PageContent>
                }
            />
            <Route path='*' element={<NotFound />} />
        </Routes>
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
