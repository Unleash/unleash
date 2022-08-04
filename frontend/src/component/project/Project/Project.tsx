import { useNavigate } from 'react-router';
import useProject from 'hooks/api/getters/useProject/useProject';
import useLoading from 'hooks/useLoading';
import ApiError from 'component/common/ApiError/ApiError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './Project.styles';
import { Tab, Tabs } from '@mui/material';
import { Edit } from '@mui/icons-material';
import useToast from 'hooks/useToast';
import useQueryParams from 'hooks/useQueryParams';
import { useEffect } from 'react';
import { ProjectAccess } from '../ProjectAccess/ProjectAccess';
import ProjectEnvironment from '../ProjectEnvironment/ProjectEnvironment';
import { ProjectFeaturesArchive } from './ProjectFeaturesArchive/ProjectFeaturesArchive';
import ProjectOverview from './ProjectOverview';
import ProjectHealth from './ProjectHealth/ProjectHealth';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Routes, Route, useLocation } from 'react-router-dom';

const Project = () => {
    const projectId = useRequiredPathParam('projectId');
    const params = useQueryParams();
    const { project, error, loading, refetch } = useProject(projectId);
    const ref = useLoading(loading);
    const { setToastData } = useToast();
    const { classes: styles } = useStyles();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { isOss } = useUiConfig();
    const basePath = `/projects/${projectId}`;
    const projectName = project?.name || projectId;

    const tabs = [
        {
            title: 'Overview',
            path: basePath,
            name: 'overview',
        },
        {
            title: 'Health',
            path: `${basePath}/health`,
            name: 'health',
        },
        {
            title: 'Access',
            path: `${basePath}/access`,
            name: 'access',
        },
        {
            title: 'Environments',
            path: `${basePath}/environments`,
            name: 'environments',
        },
        {
            title: 'Archive',
            path: `${basePath}/archive`,
            name: 'archive',
        },
    ];

    const activeTab = [...tabs]
        .reverse()
        .find(tab => pathname.startsWith(tab.path));

    useEffect(() => {
        const created = params.get('created');
        const edited = params.get('edited');

        if (created || edited) {
            const text = created ? 'Project created' : 'Project updated';
            setToastData({
                type: 'success',
                title: text,
            });
        }

        /* eslint-disable-next-line */
    }, []);

    const renderTabs = () => {
        return tabs.map(tab => {
            return (
                <Tab
                    data-loading
                    key={tab.title}
                    label={tab.title}
                    value={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={styles.tabButton}
                />
            );
        });
    };

    return (
        <div ref={ref}>
            <div className={styles.header}>
                <div className={styles.innerContainer}>
                    <h2 className={styles.title}>
                        <div className={styles.titleText} data-loading>
                            {projectName}
                        </div>
                        <PermissionIconButton
                            permission={UPDATE_PROJECT}
                            projectId={projectId}
                            sx={{ visibility: isOss() ? 'hidden' : 'visible' }}
                            onClick={() =>
                                navigate(`/projects/${projectId}/edit`)
                            }
                            tooltipProps={{ title: 'Edit project' }}
                            data-loading
                        >
                            <Edit />
                        </PermissionIconButton>
                    </h2>
                </div>
                <ConditionallyRender
                    condition={error}
                    show={
                        <ApiError
                            data-loading
                            style={{ maxWidth: '400px', margin: '1rem' }}
                            onClick={refetch}
                            text="Could not fetch project"
                        />
                    }
                />
                <div className={styles.separator} />
                <div className={styles.tabContainer}>
                    <Tabs
                        value={activeTab?.path}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        {renderTabs()}
                    </Tabs>
                </div>
            </div>
            <Routes>
                <Route path="health" element={<ProjectHealth />} />
                <Route path="access/*" element={<ProjectAccess />} />
                <Route path="environments" element={<ProjectEnvironment />} />
                <Route path="archive" element={<ProjectFeaturesArchive />} />
                <Route path="*" element={<ProjectOverview />} />
            </Routes>
        </div>
    );
};

export default Project;
