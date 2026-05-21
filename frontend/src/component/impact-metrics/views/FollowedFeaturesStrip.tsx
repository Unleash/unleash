import { useMemo, type FC } from 'react';
import { Box, Chip, Tooltip, Typography, styled } from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

const StyledRoot = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginRight: theme.spacing(0.5),
}));

const StyledCount = styled('span')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    padding: theme.spacing(0, 0.5),
    borderRadius: 999,
    marginLeft: theme.spacing(0.5),
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: theme.palette.background.elevation2,
    color: theme.palette.text.primary,
}));

const StyledEnvBadge = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

export type FollowedFeaturesStripProps = {
    featureNames: string[];
    environment: string;
    featureEvents: MultimetricFeatureEvent[];
};

const tooltipText = (count: number, environment: string): string => {
    if (count === 0) {
        return `No toggle events in ${environment} during this time window.`;
    }
    return `${count} toggle event${count === 1 ? '' : 's'} in ${environment} during this time window.`;
};

export const FollowedFeaturesStrip: FC<FollowedFeaturesStripProps> = ({
    featureNames,
    environment,
    featureEvents,
}) => {
    const eventCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const event of featureEvents) {
            if (!event.featureName) continue;
            counts.set(
                event.featureName,
                (counts.get(event.featureName) ?? 0) + 1,
            );
        }
        return counts;
    }, [featureEvents]);

    if (featureNames.length === 0) {
        return (
            <StyledRoot>
                <StyledLabel>Following</StyledLabel>
                <Typography
                    sx={{
                        fontSize: (theme) => theme.fontSizes.smallBody,
                        color: 'text.secondary',
                    }}
                >
                    No features yet — edit the view to start following flags.
                </Typography>
            </StyledRoot>
        );
    }

    return (
        <StyledRoot>
            <StyledLabel>Following</StyledLabel>
            {featureNames.map((name) => {
                const count = eventCounts.get(name) ?? 0;
                return (
                    <Tooltip
                        key={name}
                        arrow
                        title={tooltipText(count, environment)}
                    >
                        <Chip
                            size='small'
                            variant='outlined'
                            icon={<FlagOutlinedIcon />}
                            label={
                                <Box
                                    component='span'
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {name}
                                    <StyledCount aria-label='event count'>
                                        {count}
                                    </StyledCount>
                                </Box>
                            }
                        />
                    </Tooltip>
                );
            })}
            <StyledEnvBadge>· {environment}</StyledEnvBadge>
        </StyledRoot>
    );
};
