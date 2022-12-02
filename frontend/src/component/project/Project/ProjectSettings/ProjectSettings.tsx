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
            id: 'change-requests',
            label: 'Change request configuration',
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
                    path={`${tabs[0].id}/*`}
                    element={<ProjectEnvironmentList />}
                />
                <Route path={`${tabs[1].id}/*`} element={<ProjectAccess />} />
                <Route
                    path={`${tabs[2].id}/*`}
                    element={<ChangeRequestConfiguration />}
                />
                <Route
                    path="*"
                    element={<Navigate replace to={tabs[0].id} />}
                />
            </Routes>
        </VerticalTabs>
    );
};
