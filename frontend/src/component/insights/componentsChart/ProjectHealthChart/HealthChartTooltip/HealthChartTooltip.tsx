import type { FC } from 'react';
import type { InstanceInsightsSchemaProjectFlagTrendsItem } from 'openapi';
import { Box, Divider, Paper, Typography, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { HorizontalDistributionChart } from 'component/insights/components/HorizontalDistributionChart/HorizontalDistributionChart';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { getTechnicalDebtColor } from 'utils/getTechnicalDebtColor.ts';

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledItemHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

const getTechnicalDebtBadgeColor = (technicalDebt?: number | null) => {
    if (technicalDebt === undefined || technicalDebt === null) {
        return 'info';
    }
    return getTechnicalDebtColor(technicalDebt);
};

const Distribution = ({ stale = 0, potentiallyStale = 0, total = 0 }) => {
    const healthyFlagCount = total - stale - potentiallyStale;

    return (
        <>
            <HorizontalDistributionChart
                sections={[
                    {
                        type: 'error',
                        value: (stale / total) * 100,
                    },
                    {
                        type: 'warning',
                        value: (potentiallyStale / total) * 100,
                    },
                    {
                        type: 'success',
                        value: (healthyFlagCount / total) * 100,
                    },
                ]}
                size='small'
            />
            <Typography
                variant='body2'
                component='p'
                sx={(theme) => ({ marginTop: theme.spacing(0.5) })}
            >
                <Typography
                    component='span'
                    sx={(theme) => ({
                        color: theme.palette.error.border,
                    })}
                >
                    {'● '}
                </Typography>
                Stale flags: {stale}
            </Typography>
            <Typography variant='body2' component='p'>
                <Typography
                    component='span'
                    sx={(theme) => ({
                        color: theme.palette.warning.border,
                    })}
                >
                    {'● '}
                </Typography>
                Potentially stale flags: {potentiallyStale}
            </Typography>
            <Typography variant='body2' component='p'>
                <Typography
                    component='span'
                    sx={(theme) => ({
                        color: theme.palette.success.border,
                    })}
                >
                    {'● '}
                </Typography>
                Healthy flags: {healthyFlagCount}
            </Typography>
        </>
    );
};

export const HealthTooltip: FC<{ tooltip: TooltipState | null }> = ({
    tooltip,
}) => {
    const data = tooltip?.dataPoints.map((point) => {
        return {
            label: point.label,
            title: point.dataset.label,
            color: point.dataset.borderColor,
            value: point.raw as InstanceInsightsSchemaProjectFlagTrendsItem,
        };
    });

    const limitedData = data?.slice(0, 5);

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(2),
                width: '300px',
            })}
        >
            {limitedData?.map((point, index) => (
                <StyledTooltipItemContainer
                    elevation={3}
                    key={`${point.title}-${index}`}
                >
                    <StyledItemHeader>
                        <Typography
                            variant='body2'
                            color='textSecondary'
                            component='span'
                        >
                            {point.label}
                        </Typography>
                        <Typography
                            variant='body2'
                            color='textSecondary'
                            component='span'
                        >
                            Technical debt
                        </Typography>
                    </StyledItemHeader>
                    <StyledItemHeader>
                        <Typography variant='body2' component='span'>
                            <Typography
                                sx={{ color: point.color }}
                                component='span'
                            >
                                {'● '}
                            </Typography>
                            <strong>{point.title}</strong>
                        </Typography>
                        <Badge
                            color={getTechnicalDebtBadgeColor(
                                point.value.technicalDebt,
                            )}
                        >
                            {point.value.technicalDebt}%
                        </Badge>
                    </StyledItemHeader>{' '}
                    <Divider
                        sx={(theme) => ({ margin: theme.spacing(1.5, 0) })}
                    />
                    <Typography
                        variant='body2'
                        component='p'
                        sx={(theme) => ({
                            marginBottom: theme.spacing(0.5),
                        })}
                    >
                        Total flags: {point.value.total}
                    </Typography>
                    <ConditionallyRender
                        condition={Boolean(
                            point.value.stale || point.value.potentiallyStale,
                        )}
                        show={<Distribution {...point.value} />}
                    />
                </StyledTooltipItemContainer>
            )) || null}
        </Box>
    );
};
