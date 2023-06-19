import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { RolesTable } from './RolesTable/RolesTable';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Tab, Tabs, styled } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CenteredNavLink } from '../menu/CenteredNavLink';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PROJECT_ROLE_TYPE } from '@server/util/constants';

const StyledPageContent = styled(PageContent)(({ theme }) => ({
    '.page-header': {
        padding: 0,
    },
}));

const tabs = [
    {
        label: 'Root',
        path: '/admin/roles',
    },
    {
        label: 'Project',
        path: '/admin/roles/project-roles',
    },
];

export const Roles = () => {
    const { uiConfig } = useUiConfig();
    const { hasAccess } = useContext(AccessContext);
    const { pathname } = useLocation();

    if (!uiConfig.flags.customRootRoles) {
        return (
            <div>
                <ConditionallyRender
                    condition={hasAccess(ADMIN)}
                    show={<RolesTable type={PROJECT_ROLE_TYPE} />}
                    elseShow={<AdminAlert />}
                />
            </div>
        );
    }

    return (
        <div>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={
                    <StyledPageContent
                        headerClass="page-header"
                        bodyClass="page-body"
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
                            <Route
                                path="project-roles"
                                element={
                                    <RolesTable type={PROJECT_ROLE_TYPE} />
                                }
                            />
                            <Route path="*" element={<RolesTable />} />
                        </Routes>
                    </StyledPageContent>
                }
                elseShow={<AdminAlert />}
            />
        </div>
    );
};
