import { useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { RolesTable } from './RolesTable/RolesTable.tsx';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Tab, Tabs, styled, useMediaQuery } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PROJECT_ROLE_TYPE, ROOT_ROLE_TYPE } from '@server/util/constants';
import { useRoles } from 'hooks/api/getters/useRoles/useRoles';
import { Search } from 'component/common/Search/Search';
import theme from 'themes/theme';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import Add from '@mui/icons-material/Add';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import type { IRole } from 'interfaces/role';
import { TabLink } from 'component/common/TabNav/TabLink';
import { usePageTitle } from 'hooks/usePageTitle';

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

export const RolesPage = () => {
    usePageTitle('Roles');
    const { pathname } = useLocation();

    const { roles, projectRoles, loading } = useRoles();

    const [searchValue, setSearchValue] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<IRole>();

    const tabs = [
        {
            label: 'Root roles',
            path: '/admin/roles',
            total: roles.length,
        },
        {
            label: 'Project roles',
            path: '/admin/roles/project-roles',
            total: projectRoles.length,
        },
    ];

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const type = pathname.includes('project-roles')
        ? PROJECT_ROLE_TYPE
        : ROOT_ROLE_TYPE;

    return (
        <PageContent
            withTabs
            bodyClass='page-body'
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
                                {tabs.map(({ label, path, total }) => (
                                    <Tab
                                        key={label}
                                        value={path}
                                        label={
                                            <TabLink to={path}>
                                                {label} ({total})
                                            </TabLink>
                                        }
                                        sx={{ padding: 0 }}
                                    />
                                ))}
                            </Tabs>
                        </StyledTabsContainer>
                        <StyledActions>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <ResponsiveButton
                                onClick={() => {
                                    setSelectedRole(undefined);
                                    setModalOpen(true);
                                }}
                                maxWidth={`${theme.breakpoints.values.sm}px`}
                                Icon={Add}
                                permission={ADMIN}
                            >
                                New {type} role
                            </ResponsiveButton>
                        </StyledActions>
                    </StyledHeader>
                    <ConditionallyRender
                        condition={isSmallScreen}
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
                    path='project-roles'
                    element={
                        <RolesTable
                            type={PROJECT_ROLE_TYPE}
                            searchValue={searchValue}
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                            selectedRole={selectedRole}
                            setSelectedRole={setSelectedRole}
                        />
                    }
                />
                <Route
                    path='*'
                    element={
                        <RolesTable
                            type={ROOT_ROLE_TYPE}
                            searchValue={searchValue}
                            modalOpen={modalOpen}
                            setModalOpen={setModalOpen}
                            selectedRole={selectedRole}
                            setSelectedRole={setSelectedRole}
                        />
                    }
                />
            </Routes>
        </PageContent>
    );
};
