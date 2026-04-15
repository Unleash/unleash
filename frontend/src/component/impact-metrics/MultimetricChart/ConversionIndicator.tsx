import type { FC } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

type ConversionIndicatorProps = {
    percentage: number;
};

const formatPct = (pct: number): string =>
    Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;

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
