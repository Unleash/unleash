import { useEffect } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles } from '../ProjectFeatureToggles/ProjectFeatureToggles';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';

import { useUiFlag } from 'hooks/useUiFlag';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    PaginatedProjectFeatureToggles,
    ProjectTableState,
} from '../ProjectFeatureToggles/PaginatedProjectFeatureToggles';
import { useTableState } from 'hooks/useTableState';

const refreshInterval = 15 * 1000;

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledProjectToggles = styled('div')(() => ({
    width: '100%',
    minWidth: 0,
}));

const StyledContentContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
}));

const PaginatedProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });

    const [tableState, setTableState] = useTableState<ProjectTableState>(
        {},
        `project-features-${projectId}`,
    );

    const page = parseInt(tableState.page || '1', 10);
    const pageSize = tableState?.pageSize
        ? parseInt(tableState.pageSize, 10) || DEFAULT_PAGE_LIMIT
        : DEFAULT_PAGE_LIMIT;

    const {
        features: searchFeatures,
        total,
        refetch,
        loading,
        initialLoad,
    } = useFeatureSearch(
        {
            offset: `${(page - 1) * pageSize}`,
            limit: `${pageSize}`,
            sortBy: tableState.sortBy || 'createdAt',
            sortOrder: tableState.sortOrder === 'desc' ? 'desc' : 'asc',
            favoritesFirst: tableState.favorites,
            project: projectId ? `IS:${projectId}` : '',
            query: tableState.search,
        },
        {
            refreshInterval,
        },
    );

    const { environments } = project;

    return (
        <StyledContainer>
            <StyledContentContainer>
                <StyledProjectToggles>
                    <PaginatedProjectFeatureToggles
                        key={
                            (loading || projectLoading) &&
                            searchFeatures.length === 0
                                ? 'loading'
                                : 'ready'
                        }
                        style={{ width: '100%', margin: 0 }}
                        features={searchFeatures || []}
                        environments={environments}
                        initialLoad={initialLoad && searchFeatures.length === 0}
                        loading={loading && searchFeatures.length === 0}
                        onChange={refetch}
                        total={total}
                        tableState={tableState}
                        setTableState={setTableState}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

/**
 * @deprecated remove when flag `featureSearchFrontend` is removed
 */
export const ExperimentalProjectFeatures = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { project, loading, refetch } = useProject(projectId, {
        refreshInterval,
    });
    const { features, environments } = project;
    usePageTitle(`Project overview – ${projectName}`);
    const { setLastViewed } = useLastViewedProject();
    const featureSearchFrontend = useUiFlag('featureSearchFrontend');

    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    if (featureSearchFrontend) return <PaginatedProjectOverview />;

    return (
        <StyledContainer>
            <StyledContentContainer>
                <StyledProjectToggles>
                    <ProjectFeatureToggles
                        style={{ width: '100%', margin: 0 }}
                        key={loading ? 'loading' : 'ready'}
                        features={features}
                        environments={environments}
                        loading={loading}
                        onChange={refetch}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};
