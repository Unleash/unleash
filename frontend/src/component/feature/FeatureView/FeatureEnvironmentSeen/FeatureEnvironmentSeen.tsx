import TimeAgo from 'react-timeago';
import { LastSeenTooltip } from 'component/common/Table/cells/FeatureSeenCell/LastSeenTooltip';
import { FC, ReactElement } from 'react';
import { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Box, styled, SxProps } from '@mui/material';
import { ReactComponent as UsageLine } from 'assets/icons/usage-line.svg';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { useLastSeenColors } from './useLastSeenColors';
import { getLatestLastSeenAt } from './getLatestLastSeenAt';

interface IFeatureEnvironmentSeenProps {
    featureLastSeen: string | undefined;
    environments: ILastSeenEnvironments[];
    sx?: SxProps;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1.5),
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

const StyledIconWrapper = styled('div')(({ theme }) => ({
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

const TooltipContainer: FC<{
    color?: string;
    tooltip: ReactElement | string;
    sx?: SxProps;
}> = ({ sx, tooltip, color, children }) => {
    return (
        <StyledContainer sx={sx}>
            <TooltipResolver
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
            </TooltipResolver>
        </StyledContainer>
    );
};

export const FeatureEnvironmentSeen = ({
    featureLastSeen,
    environments,
    sx,
    ...rest
}: IFeatureEnvironmentSeenProps) => {
    const getColor = useLastSeenColors();

    const lastSeen = getLatestLastSeenAt(environments) || featureLastSeen;

    return (
        <>
            {lastSeen ? (
                <TimeAgo
                    date={lastSeen}
                    title=''
                    live={false}
                    formatter={(value: number, unit: string) => {
                        const [color, textColor] = getColor(unit);
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
                                color={color}
                            >
                                <UsageRate stroke={textColor} />
                            </TooltipContainer>
                        );
                    }}
                />
            ) : (
                <TooltipContainer
                    sx={sx}
                    tooltip='No usage reported from connected applications'
                >
                    <Box data-loading>
                        <Box>
                            <UsageLine />
                        </Box>
                    </Box>
                </TooltipContainer>
            )}
        </>
    );
};
