import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import {
    type ITab,
    VerticalTabs,
} from 'component/common/VerticalTabs/VerticalTabs';
import { ProjectAccess } from 'component/project/ProjectAccess/ProjectAccess';
import ProjectEnvironmentList from 'component/project/ProjectEnvironment/ProjectEnvironment';
import { ChangeRequestConfiguration } from './ChangeRequestConfiguration/ChangeRequestConfiguration.tsx';
import { ProjectApiAccess } from 'component/project/Project/ProjectSettings/ProjectApiAccess/ProjectApiAccess';
import { ProjectSegments } from './ProjectSegments/ProjectSegments.tsx';
import { ProjectDefaultStrategySettings } from './ProjectDefaultStrategySettings/ProjectDefaultStrategySettings.tsx';
import { Settings } from './Settings/Settings.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { Box, styled } from '@mui/material';
import { ProjectActions } from './ProjectActions/ProjectActions.tsx';
import { useUiFlag } from 'hooks/useUiFlag';
import { ProjectContextFields } from './ProjectContextFields.tsx';

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
            id: 'context-fields',
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
            <Routes>
                <Route path='/*' element={<Settings />} />
                <Route
                    path='environments/*'
                    element={<ProjectEnvironmentList />}
                />
                <Route path='access/*' element={<ProjectAccess />} />
                <Route
                    path='context-fields/*'
                    element={<ProjectContextFields />}
                />
                <Route path='segments/*' element={<ProjectSegments />} />
                <Route
                    path='change-requests/*'
                    element={<ChangeRequestConfiguration />}
                />
                <Route path='api-access/*' element={<ProjectApiAccess />} />
                <Route
                    path='default-strategy/*'
                    element={<ProjectDefaultStrategySettings />}
                />
                <Route path='actions/*' element={<ProjectActions />} />
                <Route
                    path='*'
                    element={<Navigate replace to={tabs[0].id} />}
                />
            </Routes>
        </VerticalTabs>
    );
};
