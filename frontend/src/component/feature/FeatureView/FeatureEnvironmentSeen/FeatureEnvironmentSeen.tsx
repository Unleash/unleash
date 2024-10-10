import { LastSeenTooltip } from 'component/common/Table/cells/FeatureSeenCell/LastSeenTooltip';
import type React from 'react';
import type { FC, ReactElement } from 'react';
import type { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Box, Typography, styled, type SxProps } from '@mui/material';
import { ReactComponent as UsageLine } from 'assets/icons/usage-line.svg';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { useLastSeenColors } from './useLastSeenColors';
import { getLatestLastSeenAt } from './getLatestLastSeenAt';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';

interface IFeatureEnvironmentSeenProps {
    featureLastSeen: string | undefined;
    environments: ILastSeenEnvironments[];
    sx?: SxProps;
    showTimeAgo?: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1),
}));

const StyledBox = styled(Box)(({ theme }) => ({
    width: '28px',
    height: '28px',
    background: 'transparent',
    borderRadius: `${theme.shape.borderRadius}px`,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.body2.fontSize,
    margin: '0 auto',
}));

export const StyledIconWrapper = styled('div')(({ theme }) => ({
    width: '20px',
    height: '20px',
    background: theme.palette.background.paper,
    borderRadius: `${theme.shape.borderRadius}px`,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.body2.fontSize,
    margin: '0 auto',
}));

const StyledTooltipResolver = styled(TooltipResolver)(({ theme }) => ({
    maxWidth: theme.spacing(47.5),
}));

const TooltipContentWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(0.5),
    alignItems: 'center',
}));

const StyledNoUsage = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledTimeAgo = styled(TimeAgo)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

const TooltipContainer: FC<{
    color?: string;
    tooltip: ReactElement | string;
    sx?: SxProps;
    children?: React.ReactNode;
    timeAgo?: React.ReactNode;
}> = ({ sx, tooltip, color, children, timeAgo = <></> }) => {
    return (
        <StyledContainer sx={sx}>
            <StyledTooltipResolver
                variant='custom'
                titleComponent={tooltip}
                arrow
                describeChild
            >
                <TooltipContentWrapper>
                    <StyledBox sx={{ '&:hover': { background: color } }}>
                        <StyledIconWrapper style={{ background: color }}>
                            {children}
                        </StyledIconWrapper>
                    </StyledBox>
                    {timeAgo}
                </TooltipContentWrapper>
            </StyledTooltipResolver>
        </StyledContainer>
    );
};

const LineBox = styled(Box)({
    display: 'grid',
    placeItems: 'center',
});

export const FeatureEnvironmentSeen = ({
    featureLastSeen,
    environments,
    sx,
    showTimeAgo,
    ...rest
}: IFeatureEnvironmentSeenProps) => {
    const getColor = useLastSeenColors();

    const lastSeen = getLatestLastSeenAt(environments) || featureLastSeen;

    if (!lastSeen) {
        return (
            <TooltipContainer
                sx={sx}
                tooltip='No usage reported from connected applications'
                timeAgo={<StyledNoUsage>No usage</StyledNoUsage>}
            >
                <Box data-loading>
                    <LineBox>
                        <UsageLine />
                    </LineBox>
                </Box>
            </TooltipContainer>
        );
    }

    const { background, text } = getColor(lastSeen);

    return (
        <TooltipContainer
            sx={sx}
            tooltip={
                <LastSeenTooltip
                    featureLastSeen={lastSeen}
                    environments={environments}
                    {...rest}
                />
            }
            timeAgo={<StyledTimeAgo date={lastSeen} />}
            color={background}
        >
            <UsageRate stroke={text} />
        </TooltipContainer>
    );
};
