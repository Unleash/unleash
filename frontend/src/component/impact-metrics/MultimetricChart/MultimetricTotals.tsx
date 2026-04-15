import type { FC } from 'react';
import { Box, styled, Typography, useTheme } from '@mui/material';
import { formatLargeNumbers } from '../metricsFormatters';
import { ConversionIndicator } from './ConversionIndicator';

export type MultimetricStep = {
    label: string;
    value: number;
    previousStepPercentage: number | null;
};

type MultimetricTotalsProps = {
    steps: MultimetricStep[];
    compact?: boolean;
};

// Stacked bar + legend layout

const StyledContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
});

const StyledStackedBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const StyledSegment = styled(Box)({
    height: '100%',
    flexShrink: 0,
    flexGrow: 0,
});

const StyledLegend = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledLegendItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
}));

const StyledColorDot = styled(Box)({
    borderRadius: '50%',
    flexShrink: 0,
});

const StyledStepName = styled(Typography)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
});

const StyledConversion = styled(Box)({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    whiteSpace: 'nowrap',
    justifyContent: 'flex-end',
    flexShrink: 0,
});

const StyledStepValue = styled(Typography)({
    fontWeight: 700,
    whiteSpace: 'nowrap',
    textAlign: 'right',
    flexShrink: 0,
});

export const MultimetricTotals: FC<MultimetricTotalsProps> = ({
    steps,
    compact,
}) => {
    const theme = useTheme();
    const seriesColors = theme.palette.charts.series;
    const getStepColor = (index: number): string =>
        seriesColors[index % seriesColors.length];

    if (steps.length === 0) {
        return null;
    }

    const totalValue = steps.reduce((sum, s) => sum + s.value, 0) || 1;

    const segmentWidths = steps.map((step) =>
        Math.max((step.value / totalValue) * 100, 1),
    );
    const segmentSum = segmentWidths.reduce((a, b) => a + b, 0);
    const normalizedWidths = segmentWidths.map((w) => (w / segmentSum) * 100);

    // Sizing based on compact vs full
    const barHeight = compact ? 12 : 24;
    const containerGap = compact ? 1.5 : 2.5;
    const containerPadding = compact ? '4px 0' : '16px 0';
    const legendGap = compact ? 0.5 : 1;
    const dotSize = compact ? 8 : 10;
    const nameFontSize = compact ? 'body2.fontSize' : 'body1.fontSize';
    const nameColor = compact ? 'text.secondary' : 'text.primary';
    const conversionWidth = compact ? 48 : 56;
    const valueWidth = compact ? 48 : 64;
    const valueFontSize = compact ? 'body2.fontSize' : 'body1.fontSize';

    return (
        <StyledContainer sx={{ gap: containerGap, padding: containerPadding }}>
            <StyledStackedBar sx={{ height: barHeight }}>
                {steps.map((step, index) => (
                    <StyledSegment
                        key={`bar-${step.label}-${index}`}
                        style={{
                            width: `${normalizedWidths[index]}%`,
                            backgroundColor: getStepColor(index),
                        }}
                    />
                ))}
            </StyledStackedBar>
            <StyledLegend sx={{ gap: legendGap }}>
                {steps.map((step, index) => (
                    <StyledLegendItem key={`label-${step.label}-${index}`}>
                        <StyledColorDot
                            sx={{
                                width: dotSize,
                                height: dotSize,
                                backgroundColor: getStepColor(index),
                            }}
                        />
                        <StyledStepName
                            sx={{
                                fontSize: nameFontSize,
                                color: nameColor,
                            }}
                        >
                            {step.label}
                        </StyledStepName>
                        <StyledConversion sx={{ width: conversionWidth }}>
                            {index > 0 &&
                                step.previousStepPercentage !== null && (
                                    <ConversionIndicator
                                        percentage={step.previousStepPercentage}
                                    />
                                )}
                        </StyledConversion>
                        <StyledStepValue
                            sx={{
                                fontSize: valueFontSize,
                                width: valueWidth,
                            }}
                        >
                            {formatLargeNumbers(Math.round(step.value))}
                        </StyledStepValue>
                    </StyledLegendItem>
                ))}
            </StyledLegend>
        </StyledContainer>
    );
};
