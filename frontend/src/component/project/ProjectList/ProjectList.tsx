import { type FC, useCallback } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ApiError from 'component/common/ApiError/ApiError';
import { Link, styled, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { ProjectGroup } from './ProjectGroup';
import { useUiFlag } from 'hooks/useUiFlag';
import { ProjectsListSort } from './ProjectsListSort/ProjectsListSort';
import { useProjectsListState } from './hooks/useProjectsListState';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ProjectList as LegacyProjectList } from './LegacyProjectList';
import { ProjectCreationButton } from './ProjectCreationButton/ProjectCreationButton';
import { useGroupedProjects } from './hooks/useGroupedProjects';
import { useProjectsSearchAndSort } from './hooks/useProjectsSearchAndSort';

const StyledApiError = styled(ApiError)(({ theme }) => ({
    maxWidth: '500px',
    marginBottom: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const NewProjectList = () => {
    const { projects, loading, error, refetch } = useProjects();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [state, setState] = useProjectsListState();
    const archiveProjectsEnabled = useUiFlag('archiveProjects');

    const myProjects = new Set(useProfile().profile?.projects || []);

    const setSearchValue = useCallback(
        (value: string) => setState({ query: value || undefined }),
        [setState],
    );

    const sortedProjects = useProjectsSearchAndSort(
        projects,
        state.query,
        state.sortBy,
    );
    const groupedProjects = useGroupedProjects(sortedProjects, myProjects);

    const projectCount =
        sortedProjects.length < projects.length
            ? `${sortedProjects.length} of ${projects.length}`
            : projects.length;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Projects (${projectCount})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            initialValue={state.query || ''}
                                            onChange={setSearchValue}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <ConditionallyRender
                                condition={Boolean(archiveProjectsEnabled)}
                                show={
                                    <>
                                        <Link
                                            component={RouterLink}
                                            to='/projects-archive'
                                        >
                                            Archived projects
                                        </Link>
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <ProjectCreationButton
                                isDialogOpen={Boolean(state.create)}
                                setIsDialogOpen={(create) =>
                                    setState({
                                        create: create ? 'true' : undefined,
                                    })
                                }
                            />
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={state.query || ''}
                                onChange={setSearchValue}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <StyledContainer>
                <ConditionallyRender
                    condition={error}
                    show={() => (
                        <StyledApiError
                            onClick={refetch}
                            text='Error fetching projects'
                        />
                    )}
                />
                <ProjectsListSort
                    sortBy={state.sortBy}
                    setSortBy={(sortBy) =>
                        setState({ sortBy: sortBy as typeof state.sortBy })
                    }
                />
                <SearchHighlightProvider value={state.query || ''}>
                    <ProjectGroup
                        sectionTitle='My projects'
                        loading={loading}
                        projects={groupedProjects.myProjects}
                    />

                    <ProjectGroup
                        sectionTitle='Other projects'
                        loading={loading}
                        projects={groupedProjects.otherProjects}
                    />
                </SearchHighlightProvider>
            </StyledContainer>
        </PageContent>
    );
};

export const ProjectList: FC = () => {
    const projectListImprovementsEnabled = useUiFlag('projectListImprovements');

    if (projectListImprovementsEnabled) {
        return <NewProjectList />;
    }

    return <LegacyProjectList />;
};
