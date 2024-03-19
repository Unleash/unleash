import { Box, styled } from '@mui/material';
import { ChangeRequests } from './ChangeRequests/ChangeRequests';
import { LeadTimeForChanges } from './LeadTimeForChanges/LeadTimeForChanges';
import { ProjectHealth } from './ProjectHealth/ProjectHealth';

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

const Overview = styled(Box)(({ theme }) => ({
    gridColumn: '1 / -1',
}));

const HealthCard = styled(Container)(({ theme }) => ({
    gridColumn: 'span 4',
}));

const ToggleTypesUsedCard = styled(Container)(({ theme }) => ({
    gridColumn: 'span 2',
}));

const ProjectMembersCard = styled(Container)(({ theme }) => ({
    gridColumn: 'span 2',
}));

const ChangeRequestsCard = styled(Container)(({ theme }) => ({
    gridColumn: 'span 6',
}));

export const ProjectInsights = () => {
    return (
        <Grid>
            <Overview>
                Total changes / avg time to production / feature flags /stale
                flags
            </Overview>
            <HealthCard>
                <ProjectHealth />
            </HealthCard>
            <LeadTimeForChanges />
            <ToggleTypesUsedCard>Toggle types used</ToggleTypesUsedCard>
            <ProjectMembersCard>Project members</ProjectMembersCard>
            <ChangeRequestsCard>
                <ChangeRequests />
            </ChangeRequestsCard>
        </Grid>
    );
};
