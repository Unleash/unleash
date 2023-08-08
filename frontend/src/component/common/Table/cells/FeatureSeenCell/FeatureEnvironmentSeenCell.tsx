import React, { FC, ReactElement, VFC } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipResolver } from 'component/common/TooltipResolver/TooltipResolver';
import { LastSeenTooltip } from './LastSeenTooltip';
import {
    IEnvironments,
    IFeatureToggleListItem,
} from 'interfaces/featureToggle';
import { ReactComponent as UsageLine } from 'assets/icons/usage-line.svg';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import TimeAgo from 'react-timeago';

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

interface IFeatureSeenCellProps {
    feature: IFeatureToggleListItem;
}

const Wrapper: FC<{
    color?: string;
    tooltip: ReactElement | string;
}> = ({ tooltip, color, children }) => {
    return (
        <StyledContainer>
            <TooltipResolver
                variant="custom"
                titleComponent={tooltip}
                arrow
                describeChild
            >
                <StyledBox sx={{ '&:hover': { background: color } }}>
                    <StyledIconWrapper
                        style={{ background: color }}
                        data-loading
                    >
                        {children}
                    </StyledIconWrapper>
                </StyledBox>
            </TooltipResolver>
        </StyledContainer>
    );
};

const useFeatureColor = () => {
    const theme = useTheme();

    return (unit?: string): [string, string] => {
        switch (unit) {
            case 'second':
                return [theme.palette.seen.recent, theme.palette.success.main];
            case 'minute':
                return [theme.palette.seen.recent, theme.palette.success.main];
            case 'hour':
                return [theme.palette.seen.recent, theme.palette.success.main];
            case 'day':
                return [theme.palette.seen.recent, theme.palette.success.main];
            case 'week':
            case 'weeks':
                return [
                    theme.palette.seen.inactive,
                    theme.palette.warning.main,
                ];
            case 'month':
                return [theme.palette.seen.abandoned, theme.palette.error.main];
            case 'year':
                return [theme.palette.seen.abandoned, theme.palette.error.main];
            default:
                return [theme.palette.seen.unknown, theme.palette.grey.A400];
        }
    };
};

export const FeatureEnvironmentSeenCell: VFC<IFeatureSeenCellProps> = ({
    feature,
}) => {
    const getColor = useFeatureColor();
    const environments = Object.values(feature.environments);
    const environmentWithMetrics = environments.filter(
        (environment: IEnvironments) => environment.lastSeenAt != null
    );
    console.log(feature.name);
    return (
        <ConditionallyRender
            condition={Boolean(environmentWithMetrics)}
            show={
                <TimeAgo
                    date={feature.lastSeenAt!}
                    title=""
                    live={false}
                    formatter={(unit: string) => {
                        const [color, textColor] = getColor(unit);
                        return (
                            <Wrapper
                                tooltip={
                                    <LastSeenTooltip
                                        environments={environments}
                                    />
                                }
                                color={color}
                            >
                                <UsageRate stroke={textColor} />
                            </Wrapper>
                        );
                    }}
                />
            }
            elseShow={
                <Wrapper tooltip="No usage reported from connected applications">
                    <UsageLine />
                </Wrapper>
            }
        />
    );
};
