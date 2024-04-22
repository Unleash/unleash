import { Box, styled, Typography } from '@mui/material';
import { Badge } from '../../../../common/Badge/Badge';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import type { FC } from 'react';
import type * as React from 'react';

const TimeLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const InfoText = styled('p')(({ theme }) => ({
    paddingBottom: theme.spacing(1),
}));

const MainLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
}));

const TimeLifecycleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
}));

export const FeatureLifecycleTooltip: FC<{
    children: React.ReactElement<any, any>;
}> = ({ children }) => (
    <HtmlTooltip
        maxHeight={800}
        arrow
        title={
            <Box>
                <Box sx={(theme) => ({ padding: theme.spacing(2) })}>
                    <MainLifecycleRow>
                        <Typography variant='h3'>Lifecycle</Typography>
                        <Badge>Initial</Badge>
                    </MainLifecycleRow>
                    <TimeLifecycleRow>
                        <TimeLabel>Stage entered at</TimeLabel>
                        <span>14/01/2024</span>
                    </TimeLifecycleRow>
                    <TimeLifecycleRow>
                        <TimeLabel>Time spent in stage</TimeLabel>
                        <span>3 days</span>
                    </TimeLifecycleRow>
                </Box>
                <Box
                    sx={(theme) => ({
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderRadius: theme.spacing(0, 0, 1, 1), // has to match the parent tooltip container
                        margin: theme.spacing(-1, -1.5), // has to match the parent tooltip container
                        p: theme.spacing(2, 3),
                    })}
                >
                    <InfoText>
                        This feature toggle is currently in the initial phase of
                        it's life cycle.
                    </InfoText>
                    <InfoText>
                        This means that the flag has been created, but it has
                        not yet been seen in any environment.
                    </InfoText>
                    <InfoText>
                        Once we detect metrics for a non-production environment
                        it will move into pre-live.
                    </InfoText>
                </Box>
            </Box>
        }
    >
        {children}
    </HtmlTooltip>
);
