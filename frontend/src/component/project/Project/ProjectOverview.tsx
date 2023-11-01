import React, { useEffect, useState } from 'react';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Box, styled } from '@mui/material';
import { ProjectFeatureToggles as LegacyProjectFeatureToggles } from './ProjectFeatureToggles/LegacyProjectFeatureToggles';
import { ProjectFeatureToggles } from './ProjectFeatureToggles/ProjectFeatureToggles';
import ProjectInfo from './ProjectInfo/ProjectInfo';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useLastViewedProject } from 'hooks/useLastViewedProject';
import { ProjectStats } from './ProjectStats/ProjectStats';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeatureSearch } from '../../../hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { useOnVisible } from '../../../hooks/useOnVisible';
import { IFeatureToggleListItem } from '../../../interfaces/featureToggle';

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

const InfiniteProjectOverview = () => {
    const projectId = useRequiredPathParam('projectId');
    const { project, loading: projectLoading } = useProject(projectId, {
        refreshInterval,
    });
    const [cursor, setCursor] = useState('');
    const {
        features: searchFeatures,
        nextCursor,
        total,
        refetch,
        loading,
    } = useFeatureSearch(cursor, projectId, { refreshInterval });

    const { members, features, health, description, environments, stats } =
        project;
    const fetchNextPageRef = useOnVisible<HTMLDivElement>(() => {
        if(!loading && nextCursor !== cursor && nextCursor !== '') {
            setCursor(nextCursor);
        }
    });
    const [dataList, setDataList] = useState<IFeatureToggleListItem[]>([]);

    useEffect(() => {
        setDataList((prev) => [...prev, ...searchFeatures]);
    }, [JSON.stringify(searchFeatures)]);

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
                    <ProjectFeatureToggles
                        key={loading && dataList.length === 0 ? 'loading' : 'ready'}
                        features={dataList}
                        environments={environments}
                        loading={loading && dataList.length === 0}
                        onChange={refetch}
                        total={total}
                    />
                    <div ref={fetchNextPageRef}/>
                </StyledProjectToggles>
            </StyledContentContainer>

        </StyledContainer>
    );
};

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

    if (featureSearchFrontend) return <InfiniteProjectOverview />;

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
