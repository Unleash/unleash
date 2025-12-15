import type { VFC } from 'react';
import type { InstanceInsightsSchemaMetricsSummaryTrendsItem } from 'openapi';
import { Box, Divider, Paper, styled, Typography } from '@mui/material';
import type { TooltipState } from 'component/insights/components/LineChart/ChartTooltip/ChartTooltip';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender.tsx';

const StyledTooltipItemContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const StyledItemHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

const InfoLine = ({
    iconChar,
    title,
    color,
}: {
    iconChar: string;
    title: string;
    color: 'info' | 'success' | 'error';
}) => (
    <Typography
        variant='body2'
        component='p'
        sx={{
            color: (theme) => theme.palette[color].main,
        }}
    >
        <Typography component='span'>{iconChar}</Typography>
        <strong>{title}</strong>
    </Typography>
);

export const InfoSummary = ({
    data,
}: {
    data: { key: string; value: string | number }[];
}) => (
    <Box display={'flex'} flexDirection={'row'}>
        {data.map(({ key, value }) => (
            <div style={{ flex: 1, flexDirection: 'column' }} key={key}>
                <div
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        marginBottom: '4px',
                    }}
                >
                    <Typography variant={'body1'} component={'p'}>
                        {key}
                    </Typography>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>{value}</div>
            </div>
        ))}
    </Box>
);

export const MetricsSummaryTooltip: VFC<{ tooltip: TooltipState | null }> = ({
    tooltip,
}) => {
    const data = tooltip?.dataPoints.map((point) => {
        return {
            label: point.label,
            title: point.dataset.label,
            color: point.dataset.borderColor,
            value: point.raw as InstanceInsightsSchemaMetricsSummaryTrendsItem & {
                total: number;
            },
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
                        <Typography variant='body2' component='span'>
                            <Typography
                                sx={{ color: point.color }}
                                component='span'
                            >
                                {'● '}
                            </Typography>
                            <strong>{point.title}</strong>
                        </Typography>
                        <Typography
                            variant='body2'
                            color='textSecondary'
                            component='span'
                        >
                            {point.label}
                        </Typography>
                    </StyledItemHeader>
                    <Divider
                        sx={(theme) => ({ margin: theme.spacing(1.5, 0) })}
                    />
                    <InfoLine
                        iconChar={'▣ '}
                        title={`Total requests: ${(point.value.totalRequests ?? 0).toLocaleString()}`}
                        color={'info'}
                    />
                    <InfoLine
                        iconChar={'▲ '}
                        title={`Exposed: ${(point.value.totalYes ?? 0).toLocaleString()}`}
                        color={'success'}
                    />
                    <InfoLine
                        iconChar={'▼ '}
                        title={`Not exposed: ${(point.value.totalNo ?? 0).toLocaleString()}`}
                        color={'error'}
                    />
                    <ConditionallyRender
                        condition={
                            Boolean(point.value.totalApps) &&
                            Boolean(point.value.totalEnvironments) &&
                            Boolean(point.value.totalFlags)
                        }
                        show={
                            <>
                                <Divider
                                    sx={(theme) => ({
                                        margin: theme.spacing(1.5, 0),
                                    })}
                                />
                                <InfoSummary
                                    data={[
                                        {
                                            key: 'Flags',
                                            value: point.value.totalFlags,
                                        },
                                        {
                                            key: 'Environments',
                                            value: point.value
                                                .totalEnvironments,
                                        },
                                        {
                                            key: 'Apps',
                                            value: point.value.totalApps,
                                        },
                                    ]}
                                />
                            </>
                        }
                    />
                </StyledTooltipItemContainer>
            )) || null}
        </Box>
    );
};
