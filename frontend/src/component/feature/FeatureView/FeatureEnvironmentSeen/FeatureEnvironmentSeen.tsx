import { LastSeenTooltip } from 'component/common/Table/cells/FeatureSeenCell/LastSeenTooltip';
import type React from 'react';
import type { FC, ReactElement } from 'react';
import type { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Box, styled, type SxProps } from '@mui/material';
import UsageLine from 'assets/icons/usage-line.svg?react';
import UsageRate from 'assets/icons/usage-rate.svg?react';
import { useLastSeenColors } from './useLastSeenColors.ts';
import { getLatestLastSeenAt } from './getLatestLastSeenAt.ts';

interface IFeatureEnvironmentSeenProps {
    featureLastSeen: string | undefined;
    environments: ILastSeenEnvironments[];
    sx?: SxProps;
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

const TooltipContainer: FC<{
    color?: string;
    tooltip: ReactElement | string;
    sx?: SxProps;
    children?: React.ReactNode;
}> = ({ sx, tooltip, color, children }) => {
    return (
        <StyledContainer sx={sx}>
            <StyledTooltipResolver
                variant='custom'
                titleComponent={tooltip}
                arrow
                describeChild
            >
                <StyledBox sx={{ '&:hover': { background: color } }}>
                    <StyledIconWrapper style={{ background: color }}>
                        {children}
                    </StyledIconWrapper>
                </StyledBox>
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
    ...rest
}: IFeatureEnvironmentSeenProps) => {
    const getColor = useLastSeenColors();

    const lastSeen = getLatestLastSeenAt(environments) || featureLastSeen;

    if (!lastSeen) {
        return (
            <TooltipContainer
                sx={sx}
                tooltip='No usage reported from connected applications'
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
            color={background}
        >
            <UsageRate stroke={text} />
        </TooltipContainer>
    );
};
