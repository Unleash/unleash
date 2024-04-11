import { Box, styled } from '@mui/material';
import { ChangeRequests } from './ChangeRequests/ChangeRequests';
import { LeadTimeForChanges } from './LeadTimeForChanges/LeadTimeForChanges';
import { ProjectHealth } from './ProjectHealth/ProjectHealth';
import { FlagTypesUsed } from './FlagTypesUsed/FlagTypesUsed';
import { ProjectInsightsStats } from './ProjectInsightsStats/ProjectInsightsStats';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectInsights } from 'hooks/api/getters/useProjectInsights/useProjectInsights';
import useLoading from 'hooks/useLoading';
import { ProjectMembers } from './ProjectMembers/ProjectMembers';

const Container = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const Grid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(10, 1fr)',
}));

const FullWidthContainer = styled(Box)(() => ({
    gridColumn: '1 / -1',
}));

const WideContainer = styled(Container)(() => ({
    gridColumn: 'span 6',
}));

const MediumWideContainer = styled(Container)(() => ({
    gridColumn: 'span 4',
}));

const NarrowContainer = styled(Container)(() => ({
    gridColumn: 'span 2',
}));

export const ProjectInsights = () => {
    const projectId = useRequiredPathParam('projectId');
    const { data, loading } = useProjectInsights(projectId);

    const ref = useLoading(loading);

    return (
        <Grid ref={ref}>
            <FullWidthContainer>
                <ProjectInsightsStats stats={data.stats} />
            </FullWidthContainer>
            <MediumWideContainer>
                <ProjectHealth health={data.health} />
            </MediumWideContainer>
            <WideContainer>
                <LeadTimeForChanges
                    leadTime={data.leadTime}
                    loading={loading}
                />
            </WideContainer>
            <NarrowContainer>
                <FlagTypesUsed featureTypeCounts={data.featureTypeCounts} />
            </NarrowContainer>
            <NarrowContainer sx={{ padding: 0 }}>
                <ProjectMembers projectId={projectId} members={data.members} />
            </NarrowContainer>
            <WideContainer>
                <ChangeRequests />
            </WideContainer>
        </Grid>
    );
};
