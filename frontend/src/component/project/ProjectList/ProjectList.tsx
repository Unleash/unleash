import { useContext, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { mutate } from 'swr';
import { getProjectFetcher } from 'hooks/api/getters/useProject/getProjectFetcher';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import ConditionallyRender from 'component/common/ConditionallyRender/ConditionallyRender';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { useStyles } from './ProjectList.styles';
import { IProjectCard } from 'interfaces/project';
import loadingData from './loadingData';
import useLoading from 'hooks/useLoading';
import PageContent from 'component/common/PageContent';
import AccessContext from 'contexts/AccessContext';
import HeaderTitle from 'component/common/HeaderTitle';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { Add } from '@material-ui/icons';
import ApiError from 'component/common/ApiError/ApiError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { SearchField } from 'component/common/SearchField/SearchField';
import classnames from 'classnames';

type projectMap = {
    [index: string]: boolean;
};

function resolveCreateButtonData(isOss: boolean, hasAccess: boolean) {
    if (isOss) {
        return {
            title: 'You must be on a paid subscription to create new projects',
            disabled: true,
        };
    } else if (!hasAccess) {
        return {
            title: 'You do not have permission to create new projects',
            disabled: true,
        };
    } else {
        return {
            title: 'Click to create a new project',
            disabled: false,
        };
    }
}

export const ProjectListNew = () => {
    const { hasAccess } = useContext(AccessContext);
    const history = useHistory();
    const styles = useStyles();
    const { projects, loading, error, refetch } = useProjects();
    const [fetchedProjects, setFetchedProjects] = useState<projectMap>({});
    const ref = useLoading(loading);
    const { isOss } = useUiConfig();
    const [filter, setFilter] = useState('');

    const filteredProjects = useMemo(() => {
        const regExp = new RegExp(filter, 'i');
        return filter
            ? projects.filter(project => regExp.test(project.name))
            : projects;
    }, [projects, filter]);

    const handleHover = (projectId: string) => {
        if (fetchedProjects[projectId]) {
            return;
        }

        const { KEY, fetcher } = getProjectFetcher(projectId);
        mutate(KEY, fetcher);
        setFetchedProjects(prev => ({ ...prev, [projectId]: true }));
    };

    const createButtonData = resolveCreateButtonData(
        isOss(),
        hasAccess(CREATE_PROJECT)
    );

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

        return filteredProjects.map((project: IProjectCard) => {
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
                />
            );
        });
    };

    return (
        <div ref={ref}>
            <div className={styles.searchBarContainer}>
                <SearchField
                    initialValue={filter}
                    updateValue={setFilter}
                    showValueChip
                    className={classnames(styles.searchBar, {
                        skeleton: loading,
                    })}
                />
            </div>
            <PageContent
                headerContent={
                    <HeaderTitle
                        title="Projects"
                        actions={
                            <ResponsiveButton
                                Icon={Add}
                                onClick={() => history.push('/projects/create')}
                                maxWidth="700px"
                                permission={CREATE_PROJECT}
                                tooltip={createButtonData.title}
                                disabled={createButtonData.disabled}
                            >
                                New project
                            </ResponsiveButton>
                        }
                    />
                }
            >
                <ConditionallyRender condition={error} show={renderError()} />
                <div className={styles.container}>
                    <ConditionallyRender
                        condition={filteredProjects.length < 1 && !loading}
                        show={<div>No projects available.</div>}
                        elseShow={renderProjects()}
                    />
                </div>
            </PageContent>
        </div>
    );
};
