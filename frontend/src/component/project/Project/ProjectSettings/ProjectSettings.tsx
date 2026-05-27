import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    type ITab,
    VerticalTabs,
} from 'component/common/VerticalTabs/VerticalTabs';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { Box, styled } from '@mui/material';
import { useUiFlag } from 'hooks/useUiFlag';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam.ts';

const StyledBadgeContainer = styled(Box)({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
});

export const ProjectSettings = () => {
    const location = useLocation();
    const { isPro, isEnterprise } = useUiConfig();
    const navigate = useNavigate();

    const actionsEnabled = useUiFlag('automatedActions');

    const paidTabs = (...tabs: ITab[]) =>
        isPro() || isEnterprise() ? tabs : [];

    const tabs: ITab[] = [
        ...paidTabs(
            {
                id: '',
                label: 'Project settings',
            },
            {
                id: 'access',
                label: 'User access',
            },
        ),
        {
            id: 'api-access',
            label: 'API access',
        },
        {
            id: 'context',
            label: 'Context fields',
        },
        {
            id: 'segments',
            label: 'Segments',
        },
        {
            id: 'environments',
            label: 'Environments',
        },
        {
            id: 'default-strategy',
            label: 'Default strategy',
        },
        ...paidTabs({
            id: 'change-requests',
            label: 'Change request configuration',
            endIcon: isPro() ? (
                <StyledBadgeContainer>
                    <EnterpriseBadge />
                </StyledBadgeContainer>
            ) : undefined,
        }),
    ];

    if (actionsEnabled) {
        tabs.push({
            id: 'actions',
            label: 'Actions',
            endIcon: isPro() ? (
                <StyledBadgeContainer>
                    <EnterpriseBadge />
                </StyledBadgeContainer>
            ) : undefined,
        });
    }

    const onChange = (tab: ITab) => {
        navigate(tab.id);
    };

    return (
        <VerticalTabs
            tabs={tabs}
            value={
                tabs.find(
                    ({ id }) =>
                        id && location.pathname?.includes(`/settings/${id}`),
                )?.id || tabs[0].id
            }
            onChange={onChange}
        >
            <Outlet />
        </VerticalTabs>
    );
};

export const ProjectSettingsDefaultRedirect = () => {
    const { isPro, isEnterprise } = useUiConfig();
    const projectId = useRequiredPathParam('projectId');
    const defaultTab = isPro() || isEnterprise() ? '' : 'api-access';
    return (
        <Navigate
            replace
            to={`/projects/${projectId}/settings/${defaultTab}`}
        />
    );
};
