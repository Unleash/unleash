import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { ITab, VerticalTabs } from 'component/common/VerticalTabs/VerticalTabs';
import { ProjectAccess } from 'component/project/ProjectAccess/ProjectAccess';
import ProjectEnvironmentList from 'component/project/ProjectEnvironment/ProjectEnvironment';
import { ChangeRequestConfiguration } from './ChangeRequestConfiguration/ChangeRequestConfiguration';
import { ProjectApiAccess } from 'component/project/Project/ProjectSettings/ProjectApiAccess/ProjectApiAccess';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectSegments } from './ProjectSegments/ProjectSegments';

export const ProjectSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const { projectScopedSegments } = uiConfig.flags;

    const tabs: ITab[] = [
        {
            id: 'environments',
            label: 'Environments',
        },
        {
            id: 'access',
            label: 'Access',
        },
        {
            id: 'segments',
            label: 'Segments',
            hidden: !Boolean(projectScopedSegments),
        },
        {
            id: 'change-requests',
            label: 'Change request configuration',
        },
        {
            id: 'api-access',
            label: 'API access',
        },
    ];

    const onChange = (tab: ITab) => {
        navigate(tab.id);
    };

    return (
        <VerticalTabs
            tabs={tabs}
            value={
                tabs.find(
                    ({ id }) => id && location.pathname?.includes(`/${id}`)
                )?.id || tabs[0].id
            }
            onChange={onChange}
        >
            <Routes>
                <Route
                    path="environments/*"
                    element={<ProjectEnvironmentList />}
                />
                <Route path="access/*" element={<ProjectAccess />} />
                <Route path="segments/*" element={<ProjectSegments />} />
                <Route
                    path="change-requests/*"
                    element={<ChangeRequestConfiguration />}
                />
                <Route path="api-access/*" element={<ProjectApiAccess />} />
                <Route
                    path="*"
                    element={<Navigate replace to={tabs[0].id} />}
                />
            </Routes>
        </VerticalTabs>
    );
};
