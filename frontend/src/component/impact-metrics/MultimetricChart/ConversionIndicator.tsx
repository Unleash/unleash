import type { FC } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

type ConversionIndicatorProps = {
    /** Percentage of the previous step (e.g. 59.8 means 59.8% of the prior value). */
    percentage: number;
};

type Trend = 'increase' | 'decrease' | 'flat';

const trendOf = (percentage: number): Trend => {
    if (percentage > 100) return 'increase';
    if (percentage < 100) return 'decrease';
    return 'flat';
};

const TREND_TOOLTIP: Record<Trend, string> = {
    increase: 'This step has more events than the previous one',
    decrease: 'Conversion from previous step',
    flat: 'Same number of events as the previous step',
};

const formatPct = (pct: number): string =>
    Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;

export const ConversionIndicator: FC<ConversionIndicatorProps> = ({
    percentage,
}) => {
    const trend = trendOf(percentage);

    return (
        <Tooltip title={TREND_TOOLTIP[trend]} arrow>
            <Box
                sx={(theme) => ({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    color:
                        trend === 'increase'
                            ? theme.palette.success.main
                            : theme.palette.text.secondary,
                    fontSize: theme.typography.caption.fontSize,
                })}
            >
                {trend === 'increase' && (
                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                )}
                {trend === 'decrease' && (
                    <TrendingDownIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                )}
                {trend === 'flat' && (
                    <TrendingFlatIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                )}
                <Typography
                    component='span'
                    sx={{ fontSize: 'caption.fontSize', color: 'inherit' }}
                >
                    {formatPct(percentage)}
                </Typography>
            </Box>
        </Tooltip>
    );
};
