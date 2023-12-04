import React, { FC, useEffect } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ProjectStats } from './ProjectStats/ProjectStats';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    // ProjectTableState,
    PaginatedProjectFeatureToggles,
} from './ProjectFeatureToggles/PaginatedProjectFeatureToggles';

import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { FeatureTypeCount } from '../../../interfaces/project';

const refreshInterval = 15 * 1000;

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
    },
}));

const StyledProjectToggles = styled('div')(() => ({
    width: '100%',
    minWidth: 0,
}));

const StyledContentContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    minWidth: 0,
}));

const PaginatedProjectOverview: FC<{
    fullWidth?: boolean;
    storageKey?: string;
}> = ({ fullWidth, storageKey = 'project-overview' }) => {
    const projectId = useRequiredPathParam('projectId');
    const { project } = useProjectOverview(projectId, {
        refreshInterval,
    });

    const {
        members,
        featureTypeCounts,
        health,
        description,
        environments,
        stats,
    } = project;

    return (
        <StyledContainer key={projectId}>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                featureTypeCounts={featureTypeCounts}
                stats={stats}
            />
            <StyledContentContainer>
                <ProjectStats stats={project.stats} />
                <StyledProjectToggles>
                    <PaginatedProjectFeatureToggles
                        style={
                            fullWidth ? { width: '100%', margin: 0 } : undefined
                        }
                        environments={environments}
                        refreshInterval={refreshInterval}
                        storageKey={storageKey}
                    />
                </StyledProjectToggles>
            </StyledContentContainer>
        </StyledContainer>
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
    const featureSearchFrontend = useUiFlag('featureSearchFrontend');

    useEffect(() => {
        setLastViewed(projectId);
    }, [projectId, setLastViewed]);

    if (featureSearchFrontend) return <PaginatedProjectOverview />;

    const featureTypeCounts = features.reduce(
        (acc: FeatureTypeCount[], feature) => {
            const existingEntry = acc.find(
                (entry) => entry.type === feature.type,
            );
            if (existingEntry) {
                existingEntry.count += 1;
            } else {
                acc.push({ type: feature.type, count: 1 });
            }
            return acc;
        },
        [],
    );

    return (
        <StyledContainer>
            <ProjectInfo
                id={projectId}
                description={description}
                memberCount={members}
                health={health}
                featureTypeCounts={featureTypeCounts}
                stats={stats}
            />
            <StyledContentContainer>
                <ProjectStats stats={project.stats} />
                <StyledProjectToggles>
                    <ProjectFeatureToggles
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

export default ProjectOverview;
