import { useCallback } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ApiError from 'component/common/ApiError/ApiError';
import { styled, useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { ProjectGroup } from './ProjectGroup';
import { ProjectsListSort } from './ProjectsListSort/ProjectsListSort';
import { useProjectsListState } from './hooks/useProjectsListState';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ProjectCreationButton } from './ProjectCreationButton/ProjectCreationButton';
import { useGroupedProjects } from './hooks/useGroupedProjects';
import { useProjectsSearchAndSort } from './hooks/useProjectsSearchAndSort';
import { ProjectArchiveLink } from './ProjectArchiveLink/ProjectArchiveLink';
import { ProjectsListHeader } from './ProjectsListHeader/ProjectsListHeader';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledApiError = styled(ApiError)(({ theme }) => ({
    maxWidth: '500px',
    marginBottom: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
}));

export const ProjectList = () => {
    const { projects, loading, error, refetch } = useProjects();
    const { isOss } = useUiConfig();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [state, setState] = useProjectsListState();

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
                                condition={!isOss && !isSmallScreen}
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

                            <ProjectArchiveLink />
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
                        condition={!isOss() && isSmallScreen}
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
                <SearchHighlightProvider value={state.query || ''}>
                    <div>
                        <ProjectsListHeader
                            subtitle='Favorite projects, projects you own, and projects you are a member of'
                            actions={
                                <ProjectsListSort
                                    sortBy={state.sortBy}
                                    setSortBy={(sortBy) =>
                                        setState({
                                            sortBy: sortBy as typeof state.sortBy,
                                        })
                                    }
                                />
                            }
                        >
                            My projects
                        </ProjectsListHeader>
                        <ProjectGroup
                            loading={loading}
                            projects={
                                isOss()
                                    ? sortedProjects
                                    : groupedProjects.myProjects
                            }
                        />
                    </div>
                    {!isOss() ? (
                        <div>
                            <ProjectsListHeader subtitle='Projects in Unleash that you have access to.'>
                                Other projects
                            </ProjectsListHeader>
                            <ProjectGroup
                                loading={loading}
                                projects={groupedProjects.otherProjects}
                            />
                        </div>
                    ) : null}
                </SearchHighlightProvider>
            </StyledContainer>
        </PageContent>
    );
};
