import { Box, styled } from '@mui/material';
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

const SpanFull = styled(Container)(() => ({
    gridColumn: '1 / -1',
}));

const Span2 = styled(Container)(() => ({
    gridColumn: 'span 2',
}));

const Span4 = styled(Container)(() => ({
    gridColumn: 'span 4',
}));

const Span6 = styled(Container)(() => ({
    gridColumn: 'span 6',
}));

export const ProjectInsights = () => {
    return (
        <Grid>
            <SpanFull>
                Total changes / avg time to production / feature flags /stale
                flags
            </SpanFull>
            <Span4>
                <ProjectHealth />
            </Span4>
            <Span6>
                <LeadTimeForChanges />
            </Span6>
            <Span2>
                <FlagTypesUsed />
            </Span2>
            <Span2>Project members</Span2>
            <Span6>Change Requests</Span6>
        </Grid>
    );
};
