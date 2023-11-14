import React, { useEffect, useState } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles as LegacyProjectFeatureToggles } from '../ProjectFeatureToggles/LegacyProjectFeatureToggles';
import { ProjectFeatureToggles } from '../ProjectFeatureToggles/ProjectFeatureToggles';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { PaginatedProjectFeatureToggles } from '../ProjectFeatureToggles/PaginatedProjectFeatureToggles';
import { useSearchParams } from 'react-router-dom';

import { PaginationBar } from 'component/common/PaginationBar/PaginationBar';

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
    const [searchParams] = useSearchParams();
    const { project, } = useProject(projectId, {
        refreshInterval,
    });
    const [pageLimit, setPageLimit] = useState(25);
    const [currentOffset, setCurrentOffset] = useState(0);

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const {
        features: searchFeatures,
        total,
        refetch,
        loading,
        initialLoad,
    } = useFeatureSearch(currentOffset, pageLimit, projectId, searchValue, {
        refreshInterval,
    });

    const { environments } =
        project;
    const fetchNextPage = () => {
        if (!loading) {
            setCurrentOffset(Math.min(total, currentOffset + pageLimit));
        }
    };
    const fetchPrevPage = () => {
        setCurrentOffset(Math.max(0, currentOffset - pageLimit));
    };

    const hasPreviousPage = currentOffset > 0;
    const hasNextPage = currentOffset + pageLimit < total;

    return (
        <StyledContainer>
            <StyledContentContainer>
                <StyledProjectToggles>
                    <PaginatedProjectFeatureToggles
                        key={
                            loading && searchFeatures.length === 0
                                ? 'loading'
                                : 'ready'
                        }
                        features={searchFeatures}
                        environments={environments}
                        initialLoad={initialLoad && searchFeatures.length === 0}
                        loading={loading && searchFeatures.length === 0}
                        onChange={refetch}
                        total={total}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        style={{ width: '100%', margin: 0 }}
                        paginationBar={
                            <StickyPaginationBar>
                                <PaginationBar
                                    total={total}
                                    hasNextPage={hasNextPage}
                                    hasPreviousPage={hasPreviousPage}
                                    fetchNextPage={fetchNextPage}
                                    fetchPrevPage={fetchPrevPage}
                                    currentOffset={currentOffset}
                                    pageLimit={pageLimit}
                                    setPageLimit={setPageLimit}
                                />
                            </StickyPaginationBar>
                        }
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

const StyledStickyBar = styled('div')(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    zIndex: 9999,
    borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: `0px -2px 8px 0px rgba(32, 32, 33, 0.06)`,
    height: '52px',
}));

const StyledStickyBarContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
}));

const StickyPaginationBar: React.FC = ({ children }) => {
    return (
        <StyledStickyBar>
            <StyledStickyBarContentContainer>
                {children}
            </StyledStickyBarContentContainer>
        </StyledStickyBar>
    );
};

/**
 * @deprecated remove when flag `featureSearchFrontend` is removed
 */
export const ProjectFeaturesExperimental = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { project, loading, refetch } = useProject(projectId, {
        refreshInterval,
    });
    const {  features, environments } =
        project;
    usePageTitle(`Project overview – ${projectName}`);
    const { setLastViewed } = useLastViewedProject();
    const featureSwitchRefactor = useUiFlag('featureSwitchRefactor');
    const featureSearchFrontend = useUiFlag('featureSearchFrontend');

    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    if (featureSearchFrontend) return <PaginatedProjectOverview />;

    return (
        <StyledContainer>
            <StyledContentContainer>
                <StyledProjectToggles>
                    <ConditionallyRender
                        condition={Boolean(featureSwitchRefactor)}
                        show={() => (
                            <ProjectFeatureToggles
                                key={loading ? 'loading' : 'ready'}
                                features={features}
                                environments={environments}
                                loading={loading}
                                onChange={refetch}
                                style={{ width: '100%', margin: 0}}
                            />
                        )}
                        elseShow={() => (
                            <LegacyProjectFeatureToggles
                                key={loading ? 'loading' : 'ready'}
                                features={features}
                                environments={environments}
                                loading={loading}
                            />
                        )}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
    );
};

