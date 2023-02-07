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
import { ProjectApiAccess } from './ProjectApiAccess';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';

export const ProjectSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const { showProjectApiAccess } = uiConfig.flags;

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
            id: 'change-requests',
            label: 'Change request configuration',
        },
    ];

    if (Boolean(showProjectApiAccess)) {
        tabs.push({
            id: 'api-access',
            label: 'Api access',
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
                <Route
                    path="change-requests/*"
                    element={<ChangeRequestConfiguration />}
                />
                {Boolean(showProjectApiAccess) && (
                    <Route path="api-access/*" element={<ProjectApiAccess />} />
                )}
                <Route
                    path="*"
                    element={<Navigate replace to={tabs[0].id} />}
                />
            </Routes>
        </VerticalTabs>
    );
};
