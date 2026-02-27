import { useCallback, useEffect } from 'react';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ApiError from 'component/common/ApiError/ApiError';
import { styled, useMediaQuery } from '@mui/material';
import theme from 'themes/theme';
import { Search } from 'component/common/Search/Search';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { ProjectGroup } from './ProjectGroup.tsx';
import { ProjectsListSort } from './ProjectsListSort/ProjectsListSort.tsx';
import { useProjectsListState } from './hooks/useProjectsListState.ts';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ProjectCreationButton } from './ProjectCreationButton/ProjectCreationButton.tsx';
import { useGroupedProjects } from './hooks/useGroupedProjects.ts';
import { useProjectsSearchAndSort } from './hooks/useProjectsSearchAndSort.ts';
import { ProjectArchiveLink } from './ProjectArchiveLink/ProjectArchiveLink.tsx';
import { ProjectsListHeader } from './ProjectsListHeader/ProjectsListHeader.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { TablePlaceholder } from 'component/common/Table/index.ts';
import { ProjectsListViewToggle } from './ProjectsListViewToggle/ProjectsListViewToggle.tsx';

const StyledApiError = styled(ApiError)(({ theme }) => ({
    maxWidth: '500px',
    marginBottom: theme.spacing(2),
}));

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const projectCardDisplayLimit = 500;

export const ProjectList = () => {
    const { projects, loading, error, refetch } = useProjects();
    const { isOss } = useUiConfig();

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [state, setState] = useProjectsListState();

    const forceListView = projects.length > projectCardDisplayLimit;
    useEffect(() => {
        if (forceListView && state.view !== 'list') {
            setState({ view: 'list' });
        }
    }, [forceListView, state.view]);

    const showViewToggleButton = !(isOss() || forceListView);
    const safeView = forceListView ? 'list' : state.view;

    const myProfileProjects = new Set(useProfile().profile?.projects || []);

    const setSearchValue = useCallback(
        (value: string) => setState({ query: value || undefined }),
        [setState],
    );

    const sortedProjects = useProjectsSearchAndSort(
        projects,
        state.query,
        state.sortBy,
    );
    const groupedProjects = useGroupedProjects(
        sortedProjects,
        myProfileProjects,
    );

    const projectCount =
        sortedProjects.length < projects.length
            ? `${sortedProjects.length} of ${projects.length}`
            : projects.length;

    const myProjects = isOss() ? sortedProjects : groupedProjects.myProjects;

    const otherProjects = isOss() ? [] : groupedProjects.otherProjects;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Projects (${projectCount})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isOss() && !isSmallScreen}
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

                            {!isOss() && <ProjectArchiveLink />}
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
                    {myProjects.length > 0 && (
                        <div>
                            <ProjectsListHeader
                                helpText='Favorite projects, projects you own, and projects you are a member of'
                                actions={
                                    <>
                                        {showViewToggleButton && (
                                            <ProjectsListViewToggle
                                                view={state.view}
                                                setView={(view) =>
                                                    setState({ view })
                                                }
                                            />
                                        )}
                                        <ProjectsListSort
                                            sortBy={state.sortBy}
                                            setSortBy={(sortBy) =>
                                                setState({
                                                    sortBy: sortBy as typeof state.sortBy,
                                                })
                                            }
                                        />
                                    </>
                                }
                            >
                                My projects
                            </ProjectsListHeader>
                            <ProjectGroup
                                loading={loading}
                                view={safeView}
                                projects={
                                    isOss()
                                        ? sortedProjects
                                        : groupedProjects.myProjects
                                }
                            />
                        </div>
                    )}
                    {otherProjects.length > 0 && (
                        <div>
                            <ProjectsListHeader helpText='Projects in Unleash that you have access to.'>
                                Other projects
                            </ProjectsListHeader>
                            <ProjectGroup
                                loading={loading}
                                view={safeView}
                                projects={otherProjects}
                            />
                        </div>
                    )}
                    {!loading &&
                        !myProjects.length &&
                        !otherProjects.length && (
                            <>
                                {state.query?.length ? (
                                    <TablePlaceholder>
                                        No projects found matching &ldquo;
                                        {state.query}
                                        &rdquo;
                                    </TablePlaceholder>
                                ) : (
                                    <TablePlaceholder>
                                        No projects available.
                                    </TablePlaceholder>
                                )}
                            </>
                        )}
                </SearchHighlightProvider>
            </StyledContainer>
        </PageContent>
    );
};
