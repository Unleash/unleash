import type { FC } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

type ConversionIndicatorProps = {
    /** Percentage of the previous step (e.g. 59.8 means 59.8% of the prior value) */
    percentage: number;
};

const formatPct = (pct: number): string =>
    Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;

/**
 * Small inline indicator showing the conversion rate from the previous step.
 * Green up-arrow for >100% (later step has more events), muted down-arrow for
 * normal drop-off. The tooltip explains the direction.
 */
export const ConversionIndicator: FC<ConversionIndicatorProps> = ({
    percentage,
}) => {
    const isIncrease = percentage > 100;

    return (
        <Tooltip
            title={
                isIncrease
                    ? 'This step has more events than the previous one'
                    : 'Conversion from previous step'
            }
            arrow
        >
            <Box
                sx={(theme) => ({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    color: isIncrease
                        ? theme.palette.success.main
                        : theme.palette.text.secondary,
                    fontSize: theme.typography.caption.fontSize,
                })}
            >
                {isIncrease ? (
                    <TrendingUpIcon sx={{ fontSize: 14 }} />
                ) : (
                    <TrendingDownIcon sx={{ fontSize: 14, opacity: 0.6 }} />
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
