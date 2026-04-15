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
};

const StyledContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: 12,
    padding: '4px 0',
});

const StyledStackedBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    width: '100%',
    height: 12,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const StyledSegment = styled(Box)({
    height: '100%',
    flexShrink: 0,
    flexGrow: 0,
});

const StyledLegend = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledLegendItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
}));

const StyledColorDot = styled(Box)({
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
});

const StyledStepName = styled(Typography)(({ theme }) => ({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledConversion = styled(Box)({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    width: 48,
    whiteSpace: 'nowrap',
    justifyContent: 'flex-end',
    flexShrink: 0,
});

const StyledStepValue = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    width: 48,
    whiteSpace: 'nowrap',
    textAlign: 'right',
    flexShrink: 0,
    fontSize: theme.typography.body2.fontSize,
}));

export const MultimetricTotals: FC<MultimetricTotalsProps> = ({ steps }) => {
    const theme = useTheme();
    const seriesColors = theme.palette.charts.series;
    const getStepColor = (index: number): string =>
        seriesColors[index % seriesColors.length];

    if (steps.length === 0) {
        return null;
    }

    const totalValue = steps.reduce((sum, step) => sum + step.value, 0) || 1;

    const segmentWidths = steps.map((step) =>
        Math.max((step.value / totalValue) * 100, 1),
    );
    const segmentSum = segmentWidths.reduce((acc, width) => acc + width, 0);
    const normalizedWidths = segmentWidths.map(
        (width) => (width / segmentSum) * 100,
    );

    return (
        <StyledContainer>
            <StyledStackedBar>
                {steps.map((step, index) => (
                    <StyledSegment
                        key={step.label}
                        style={{
                            width: `${normalizedWidths[index]}%`,
                            backgroundColor: getStepColor(index),
                        }}
                    />
                ))}
            </StyledStackedBar>
            <StyledLegend>
                {steps.map((step, index) => (
                    <StyledLegendItem key={step.label}>
                        <StyledColorDot
                            sx={{ backgroundColor: getStepColor(index) }}
                        />
                        <StyledStepName>{step.label}</StyledStepName>
                        <StyledConversion>
                            {index > 0 &&
                                step.previousStepPercentage !== null && (
                                    <ConversionIndicator
                                        percentage={step.previousStepPercentage}
                                    />
                                )}
                        </StyledConversion>
                        <StyledStepValue>
                            {formatLargeNumbers(Math.round(step.value))}
                        </StyledStepValue>
                    </StyledLegendItem>
                ))}
            </StyledLegend>
        </StyledContainer>
    );
};
