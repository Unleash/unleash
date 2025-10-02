import { styled, Box, Typography } from '@mui/material';
import { PercentageDonut } from 'component/common/PercentageCircle/PercentageDonut';
import type { UsageMetric } from '../types.ts';
import { formatCurrency } from '../types.ts';

const Row = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '40% 20% 15% 25%',
    alignItems: 'center',
    columnGap: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '45% 20% 15% 20%',
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
        rowGap: theme.spacing(0.5),
        alignItems: 'start',
    },
}));

export const UsageRow = ({ metric }: { metric: UsageMetric }) => {
    const includedLabel = `${metric.includedCurrent}/${metric.includedMax} ${metric.includedUnit}`;
    const pct =
        metric.includedMax === 0
            ? 0
            : (metric.includedCurrent / metric.includedMax) * 100;
    return (
        <Row>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {metric.label}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'primary.main',
                }}
            >
                <PercentageDonut
                    percentage={pct}
                    size={'1.25rem'}
                    strokeRatio={0.3}
                />
                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                    {includedLabel}
                </Typography>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {metric.actual || ''}
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
                <Typography
                    variant='body2'
                    sx={{
                        color:
                            metric.amount === 0
                                ? 'text.secondary'
                                : 'text.primary',
                        fontWeight: metric.amount === 0 ? 400 : 600,
                    }}
                >
                    {formatCurrency(metric.amount)}
                </Typography>
            </Box>
        </Row>
    );
};
