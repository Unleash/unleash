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
import { ChangeRequestConfiguration } from './ChangeRequestConfiguration/ChangeRequestConfiguration';
import { ProjectApiAccess } from 'component/project/Project/ProjectSettings/ProjectApiAccess/ProjectApiAccess';
import { ProjectSegments } from './ProjectSegments/ProjectSegments';
import { ProjectDefaultStrategySettings } from './ProjectDefaultStrategySettings/ProjectDefaultStrategySettings';
import { Settings } from './Settings/Settings';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { Box, styled } from '@mui/material';
import { ProjectActions } from './ProjectActions/ProjectActions';
import { useUiFlag } from 'hooks/useUiFlag';

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

    const tabs: ITab[] = [
        ...(isPro() || isEnterprise()
            ? [
                  {
                      id: '',
                      label: 'Settings',
                  },
                  {
                      id: 'access',
                      label: 'Access',
                  },
                  {
                      id: 'segments',
                      label: 'Segments',
                  },
                  {
                      id: 'change-requests',
                      label: 'Change request configuration',
                      icon: isPro() ? (
                          <StyledBadgeContainer>
                              <EnterpriseBadge />
                          </StyledBadgeContainer>
                      ) : undefined,
                  },
              ]
            : []),
        {
            id: 'environments',
            label: 'Environments',
        },
        {
            id: 'api-access',
            label: 'API access',
        },
        {
            id: 'default-strategy',
            label: 'Default strategy',
        },
    ];

    if (actionsEnabled) {
        tabs.push({
            id: 'actions',
            label: 'Actions',
            icon: isPro() ? (
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
