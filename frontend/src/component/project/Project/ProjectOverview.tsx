import React, { useEffect, useRef, useState } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, Button, Typography, styled } from '@mui/material';
import { ProjectFeatureToggles as LegacyProjectFeatureToggles } from './ProjectFeatureToggles/LegacyProjectFeatureToggles';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ProjectStats } from './ProjectStats/ProjectStats';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { PaginatedProjectFeatureToggles } from './ProjectFeatureToggles/PaginatedProjectFeatureToggles';
import { useSearchParams } from 'react-router-dom';
import { Sticky } from 'component/common/Sticky/Sticky';
import {
    ArrowLeft,
    ArrowRight,
    ArrowRightAltOutlined,
    ArrowRightOutlined,
} from '@mui/icons-material';

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

const PAGE_LIMIT = 25;

const PaginatedProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const [searchParams, setSearchParams] = useSearchParams();
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });
    const [currentOffset, setCurrentOffset] = useState(0);

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || '',
    );

    const {
        features: searchFeatures,
        total,
        refetch,
        loading,
    } = useFeatureSearch(currentOffset, PAGE_LIMIT, projectId, searchValue, {
        refreshInterval,
    });

    const { members, features, health, description, environments, stats } =
        project;
    const fetchNextPage = () => {
        if (!loading) {
            setCurrentOffset(Math.min(total, currentOffset + PAGE_LIMIT));
        }
    };
    const fetchPrevPage = () => {
        setCurrentOffset(Math.max(0, currentOffset - PAGE_LIMIT));
    };

    const hasPreviousPage = currentOffset > 0;
    const hasNextPage = currentOffset + PAGE_LIMIT < total;

    const calculatePageOffset = () => {
        if (total === 0) return '0-0';

        const start = currentOffset + 1;
        const end = Math.min(total, currentOffset + 25);

        return `${start}-${end}`;
    };

    const calculateTotalPages = () => {
        return Math.ceil(total / 25);
    };

    const calculateCurrentPage = () => {
        return Math.floor(currentOffset / 25) + 1;
    };

    return (
        <StyledContainer>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                features={features}
                stats={stats}
            />
            <StyledContentContainer>
                <ProjectStats stats={project.stats} />
                <StyledProjectToggles>
                    <PaginatedProjectFeatureToggles
                        key={
                            loading && searchFeatures.length === 0
                                ? 'loading'
                                : 'ready'
                        }
                        features={searchFeatures}
                        environments={environments}
                        loading={loading && searchFeatures.length === 0}
                        onChange={refetch}
                        total={total}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        paginationBar={
                            <StickyPaginationBar>
                                <StyledTypography>
                                    Showing {calculatePageOffset()} out of{' '}
                                    {total}
                                </StyledTypography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ConditionallyRender
                                        condition={hasPreviousPage}
                                        show={
                                            <StyledPaginationButton
                                                variant='outlined'
                                                color='primary'
                                                onClick={fetchPrevPage}
                                            >
                                                <ArrowLeft />
                                            </StyledPaginationButton>
                                        }
                                    />
                                    <StyledTypography
                                        sx={(theme) => ({
                                            marginLeft: '12px',
                                            marginRight: '12px',
                                            color: theme.palette.text.primary,
                                        })}
                                    >
                                        Page {calculateCurrentPage()} of{' '}
                                        {calculateTotalPages()}
                                    </StyledTypography>
                                    <ConditionallyRender
                                        condition={hasNextPage}
                                        show={
                                            <StyledPaginationButton
                                                onClick={fetchNextPage}
                                                variant='outlined'
                                                color='primary'
                                            >
                                                <ArrowRightOutlined />
                                            </StyledPaginationButton>
                                        }
                                    />
                                </Box>
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
    marginLeft: '16px',
    zIndex: theme.zIndex.mobileStepper,
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

const StyledPaginationButton = styled(Button)(({ theme }) => ({
    fontWeight: 600,
    padding: '0 8px',
    minWidth: 'auto',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StickyPaginationBar = ({ children }) => {
    return (
        <StyledStickyBar>
            <StyledStickyBarContentContainer>
                {children}
                <>
                    <StyledTypography>Show rows</StyledTypography>
                </>
            </StyledStickyBarContentContainer>
        </StyledStickyBar>
    );
};

/**
 * @deprecated remove when flag `featureSearchFrontend` is removed
 */
const ProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { project, loading, refetch } = useProject(projectId, {
        refreshInterval,
    });
    const { members, features, health, description, environments, stats } =
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
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                features={features}
                stats={stats}
            />
            <StyledContentContainer>
                <ProjectStats stats={project.stats} />
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

export default ProjectOverview;
