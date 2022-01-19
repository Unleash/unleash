import { useHistory, useParams } from 'react-router';
import { useCommonStyles } from '../../../common.styles';
import useProject from '../../../hooks/api/getters/useProject/useProject';
import useLoading from '../../../hooks/useLoading';
import ApiError from '../../common/ApiError/ApiError';
import ConditionallyRender from '../../common/ConditionallyRender';
import { useStyles } from './Project.styles';
import { Tab, Tabs } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import useToast from '../../../hooks/useToast';
import useQueryParams from '../../../hooks/useQueryParams';
import { useEffect } from 'react';
import useTabs from '../../../hooks/useTabs';
import TabPanel from '../../common/TabNav/TabPanel';
import ProjectAccess from '../access-container';
import ProjectEnvironment from '../ProjectEnvironment/ProjectEnvironment';
import ProjectOverview from './ProjectOverview';
import ProjectHealth from './ProjectHealth/ProjectHealth';
import { UPDATE_PROJECT } from '../../../store/project/actions';
import PermissionIconButton from '../../common/PermissionIconButton/PermissionIconButton';

const Project = () => {
    const { id, activeTab } = useParams<{ id: string; activeTab: string }>();
    const params = useQueryParams();
    const { project, error, loading, refetch } = useProject(id);
    const ref = useLoading(loading);
    const { setToastData } = useToast();
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const history = useHistory();

    const { a11yProps, activeTabIdx, setActiveTab } = useTabs(0);

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
            component: <ProjectAccess projectId={id} />,
            path: `${basePath}/access`,
            name: 'access',
        },
        {
            title: 'Environments',
            component: <ProjectEnvironment projectId={id} />,
            path: `${basePath}/environments`,
            name: 'environments',
        },
    ];

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

        tabData.filter(tab => !tab.disabled);

        /* eslint-disable-next-line */
    }, []);

    useEffect(() => {
        const tabIdx = tabData.findIndex(tab => tab.name === activeTab);
        if (tabIdx > 0) {
            setActiveTab(tabIdx);
        } else {
            setActiveTab(0);
        }

        /* eslint-disable-next-line */
    }, []);

    const renderTabs = () => {
        return tabData.map((tab, index) => {
            return (
                <Tab
                    data-loading
                    key={tab.title}
                    label={tab.title}
                    {...a11yProps(index)}
                    onClick={() => {
                        setActiveTab(index);
                        history.push(tab.path);
                    }}
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
                        className={commonStyles.title}
                        style={{ margin: 0 }}
                    >
                        Project: {project?.name}{' '}
                        <PermissionIconButton
                            permission={UPDATE_PROJECT}
                            tooltip="Edit"
                            projectId={project?.id}
                            onClick={() => history.push(`/projects/${id}/edit`)}
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
                        onChange={(_, tabId) => {
                            setActiveTab(tabId);
                        }}
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
