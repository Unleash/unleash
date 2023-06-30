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
import { ProjectSegments } from './ProjectSegments/ProjectSegments';
import { ProjectDefaultStrategySettings } from './ProjectDefaultStrategySettings/ProjectDefaultStrategySettings';

export const ProjectSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
        },
        {
            id: 'change-requests',
            label: 'Change request configuration',
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
                    path="default-strategy/*"
                    element={<ProjectDefaultStrategySettings />}
                />
                <Route
                    path="*"
                    element={<Navigate replace to={tabs[0].id} />}
                />
            </Routes>
        </VerticalTabs>
    );
};
