import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import TimeAgo from 'react-timeago';
import { LastSeenTooltip } from 'component/common/Table/cells/FeatureSeenCell/LastSeenTooltip';
import React, { FC, ReactElement } from 'react';
import { IEnvironments, IFeatureEnvironment } from 'interfaces/featureToggle';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { Box, styled, SxProps } from '@mui/material';
import { ReactComponent as UsageLine } from 'assets/icons/usage-line.svg';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { useLastSeenColors } from './useLastSeenColors';

interface IFeatureEnvironmentSeenProps {
    featureLastSeen: string | undefined;
    environments: IEnvironments[] | IFeatureEnvironment[];
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
}: IFeatureEnvironmentSeenProps) => {
    const getColor = useLastSeenColors();
    return (
        <ConditionallyRender
            condition={Boolean(featureLastSeen)}
            show={
                featureLastSeen && (
                    <TimeAgo
                        date={featureLastSeen}
                        title=''
                        live={false}
                        formatter={(value: number, unit: string) => {
                            const [color, textColor] = getColor(unit);
                            return (
                                <TooltipContainer
                                    sx={sx}
                                    tooltip={
                                        <LastSeenTooltip
                                            featureLastSeen={featureLastSeen}
                                            environments={environments}
                                        />
                                    }
                                    color={color}
                                >
                                    <UsageRate stroke={textColor} />
                                </TooltipContainer>
                            );
                        }}
                    />
                )
            }
            elseShow={
                <TooltipContainer
                    sx={sx}
                    tooltip='No usage reported from connected applications'
                >
                    <UsageLine />
                </TooltipContainer>
            }
        />
    );
};
