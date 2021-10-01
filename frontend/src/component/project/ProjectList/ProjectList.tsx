import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { mutate } from 'swr';
import { getProjectFetcher } from '../../../hooks/api/getters/useProject/getProjectFetcher';
import useProjects from '../../../hooks/api/getters/useProjects/useProjects';
import ConditionallyRender from '../../common/ConditionallyRender';
import ProjectCard from '../ProjectCard/ProjectCard';
import { useStyles } from './ProjectList.styles';
import { IProjectCard } from '../../../interfaces/project';

import loadingData from './loadingData';
import useLoading from '../../../hooks/useLoading';
import PageContent from '../../common/PageContent';
import AccessContext from '../../../contexts/AccessContext';
import HeaderTitle from '../../common/HeaderTitle';
import ResponsiveButton from '../../common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from '../../AccessProvider/permissions';

import { Add } from '@material-ui/icons';
import ApiError from '../../common/ApiError/ApiError';
import useToast from '../../../hooks/useToast';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';

type projectMap = {
    [index: string]: boolean;
};

function resolveCreateButtonData(isOss: boolean, hasAccess: boolean) {
    if(isOss) {
        return {
            title: 'You must be on a paid subscription to create new projects',
            disabled: true
        }
    } else if (!hasAccess) {
        return {
            title: 'You do not have permissions create new projects',
            disabled: true
        }
    } else {
        return {
            title: 'Click to create a new project',
            disabled: false
        }
    }
}

const ProjectListNew = () => {
    const { hasAccess } = useContext(AccessContext);
    const history = useHistory();
    const { toast, setToastData } = useToast();
    const styles = useStyles();
    const { projects, loading, error, refetch } = useProjects();
    const [fetchedProjects, setFetchedProjects] = useState<projectMap>({});
    const ref = useLoading(loading);
    const { isOss } = useUiConfig();

    const handleHover = (projectId: string) => {
        if (fetchedProjects[projectId]) {
            return;
        }

        const { KEY, fetcher } = getProjectFetcher(projectId);
        mutate(KEY, fetcher);
        setFetchedProjects(prev => ({ ...prev, [projectId]: true }));
    };

    const createButtonData = resolveCreateButtonData(isOss(), hasAccess(CREATE_PROJECT));

    const renderError = () => {
        return (
            <ApiError
                onClick={refetch}
                className={styles.apiError}
                text="Error fetching projects"
            />
        );
    };

    const renderProjects = () => {
        if (loading) {
            return renderLoading();
        }

        return projects.map((project: IProjectCard) => {
            return (
                <Link
                    key={project.id}
                    to={{
                        pathname: `/projects/${project.id}`,
                        state: {
                            projectName: project.name,
                        },
                    }}
                    className={styles.cardLink}
                >
                    <ProjectCard
                        onHover={() => handleHover(project?.id)}
                        name={project?.name}
                        memberCount={project?.memberCount}
                        health={project?.health}
                        id={project?.id}
                        featureCount={project?.featureCount}
                        setToastData={setToastData}
                    />
                </Link>
            );
        });
    };

    const renderLoading = () => {
        return loadingData.map((project: IProjectCard) => {
            return (
                <ProjectCard
                    data-loading
                    onHover={() => {}}
                    key={project.id}
                    name={project.name}
                    id={project.id}
                    memberCount={2}
                    health={95}
                    featureCount={4}
                    setToastData={setToastData}
                />
            );
        });
    };

    return (
        <div ref={ref}>
            <PageContent
                headerContent={
                    <HeaderTitle
                        title="Projects"
                        actions={
                            <ConditionallyRender
                                condition={hasAccess(CREATE_PROJECT)}
                                show={
                                    <ResponsiveButton
                                        Icon={Add}
                                        onClick={() =>
                                            history.push('/projects/create')
                                        }
                                        maxWidth="700px"
                                        tooltip={createButtonData.title}
                                        disabled={createButtonData.disabled}
                                    >
                                        Add new project
                                    </ResponsiveButton>
                                }
                            />
                        }
                    />
                }
            >
                <ConditionallyRender condition={error} show={renderError()} />
                <div className={styles.container}>
                    <ConditionallyRender
                        condition={projects.length < 1 && !loading}
                        show={<div>No projects available.</div>}
                        elseShow={renderProjects()}
                    />
                </div>
                {toast}
            </PageContent>
        </div>
    );
};

export default ProjectListNew;
