import { useHistory, useParams } from 'react-router';
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
import { TabPanel } from 'component/common/TabNav/TabPanel/TabPanel';

const Project = () => {
    const { id, activeTab } = useParams<{ id: string; activeTab: string }>();
    const params = useQueryParams();
    const { project, error, loading, refetch } = useProject(id);
    const ref = useLoading(loading);
    const { setToastData } = useToast();
    const { classes: styles } = useStyles();
    const history = useHistory();

    const basePath = `/projects/${id}`;
    const tabData = [
        {
            title: 'Overview',
            component: <ProjectOverview projectId={id} />,
            path: basePath,
            name: 'overview',
        },
        {
            title: 'Health',
            component: <ProjectHealth projectId={id} />,
            path: `${basePath}/health`,
            name: 'health',
        },
        {
            title: 'Access',
            component: <ProjectAccess />,
            path: `${basePath}/access`,
            name: 'access',
        },
        {
            title: 'Environments',
            component: <ProjectEnvironment projectId={id} />,
            path: `${basePath}/environments`,
            name: 'environments',
        },
        {
            title: 'Archive',
            component: <ProjectFeaturesArchive projectId={id} />,
            path: `${basePath}/archive`,
            name: 'archive',
        },
    ];

    const activeTabIdx = activeTab
        ? tabData.findIndex(tab => tab.name === activeTab)
        : 0;

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

        // @ts-expect-error
        tabData.filter(tab => !tab.disabled);

        /* eslint-disable-next-line */
    }, []);

    const renderTabs = () => {
        return tabData.map((tab, index) => {
            return (
                <Tab
                    data-loading
                    key={tab.title}
                    id={`tab-${index}`}
                    aria-controls={`tabpanel-${index}`}
                    label={tab.title}
                    onClick={() => history.push(tab.path)}
                    className={styles.tabButton}
                />
            );
        });
    };

    const renderTabContent = () => {
        return tabData.map((tab, index) => {
            return (
                <TabPanel value={activeTabIdx} index={index} key={tab.path}>
                    {tab.component}
                </TabPanel>
            );
        });
    };

    return (
        <div ref={ref}>
            <div className={styles.header}>
                <div className={styles.innerContainer}>
                    <h2
                        data-loading
                        className={styles.title}
                        style={{ margin: 0 }}
                    >
                        <div className={styles.titleText}>{project?.name}</div>
                        <PermissionIconButton
                            permission={UPDATE_PROJECT}
                            projectId={project?.id}
                            onClick={() => history.push(`/projects/${id}/edit`)}
                            tooltip="Edit project"
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
                            style={{ maxWidth: '400px', marginTop: '1rem' }}
                            onClick={refetch}
                            text="Could not fetch project"
                        />
                    }
                />
                <div className={styles.separator} />
                <div className={styles.tabContainer}>
                    <Tabs
                        value={activeTabIdx}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        {renderTabs()}
                    </Tabs>
                </div>
            </div>
            {renderTabContent()}
        </div>
    );
};

export default Project;
