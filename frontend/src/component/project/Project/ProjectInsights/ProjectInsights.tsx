import { Box, styled } from '@mui/material';
import { ChangeRequests } from './ChangeRequests/ChangeRequests';
import { LeadTimeForChanges } from './LeadTimeForChanges/LeadTimeForChanges';
import { ProjectHealth } from './ProjectHealth/ProjectHealth';
import { FlagTypesUsed } from './FlagTypesUsed/FlagTypesUsed';

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

const FullWidthContainer = styled(Container)(() => ({
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
    return (
        <Grid>
            <FullWidthContainer>
                Total changes / avg time to production / feature flags /stale
                flags
            </FullWidthContainer>
            <MediumWideContainer>
                <ProjectHealth />
            </MediumWideContainer>
            <WideContainer>
                <LeadTimeForChanges />
            </WideContainer>
            <NarrowContainer>
                <FlagTypesUsed />
            </NarrowContainer>
            <NarrowContainer>Project members</NarrowContainer>
            <WideContainer>
                <ChangeRequests />
            </WideContainer>
        </Grid>
    );
};
