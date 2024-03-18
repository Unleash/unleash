import { Box, styled } from '@mui/material';
import { LeadTimeForChanges } from './LeadTimeForChanges/LeadTimeForChanges';

const Grid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(10, 1fr)',
}));

const Overview = styled(Box)(({ theme }) => ({
    gridColumn: '1 / -1',
}));

const Health = styled(Box)(({ theme }) => ({
    gridColumn: 'span 5',
}));

const ToggleTypesUsed = styled(Box)(({ theme }) => ({
    gridColumn: 'span 2',
}));

const ProjectMembers = styled(Box)(({ theme }) => ({
    gridColumn: 'span 2',
}));

const ChangeRequests = styled(Box)(({ theme }) => ({
    gridColumn: 'span 5',
}));

export const ProjectInsights = () => {
    return (
        <Grid>
            <Overview>
                Total changes / avg time to production / feature flags /stale
                flags
            </Overview>
            <Health>Project Health</Health>
            <LeadTimeForChanges />
            <ToggleTypesUsed>Toggle types used</ToggleTypesUsed>
            <ProjectMembers>Project members</ProjectMembers>
            <ChangeRequests>Change Requests</ChangeRequests>
        </Grid>
    );
};
