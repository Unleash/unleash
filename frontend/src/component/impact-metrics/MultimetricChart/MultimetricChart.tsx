import type { FC } from 'react';
import { useRef, useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import type { Chart as ChartInstance } from 'chart.js';
import {
    LineChart,
    NotEnoughData,
} from '../../insights/components/LineChart/LineChart.tsx';
import { usePlaceholderData } from '../../insights/hooks/usePlaceholderData.js';
import type { MultimetricStepSeries, MultimetricFeatureEvent } from './types';
import {
    type ChartTimeRange,
    buildChartOptions,
    buildTimeSeriesChartData,
    parseVisibleWindow,
} from './chartConfig';
import { useChartPlotArea } from './useChartPlotArea';
import { StepLegend } from './StepLegend';
import {
    FeatureEventOverlay,
    buildEventAnnotations,
    groupEventsByProximity,
} from './FeatureEventOverlay/FeatureEventOverlay';

const StyledWrapper = styled(Box)({
    position: 'relative',
    height: '100%',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledChartArea = styled(Box)({
    position: 'relative',
    flex: 1,
    minHeight: 0,
    width: '100%',
});

// Forces the chart's wrapping div (which Chart.js sizes to its measured canvas)
// to fill the available space so the responsive resize observer keeps working.
const StyledChartFrame = styled(Box)({
    height: '100%',
    width: '100%',
    minHeight: 0,
    '& > div': {
        height: '100% !important',
        width: '100% !important',
    },
});

type MultimetricChartProps = {
    stepSeries: MultimetricStepSeries[];
    timeRange: ChartTimeRange;
    start: string;
    end: string;
    loading?: boolean;
    featureEvents?: MultimetricFeatureEvent[];
};

// Wires together the Chart.js line chart, the feature-event overlay (pills +
// annotation lines), and the clickable step legend.
export const MultimetricChart: FC<MultimetricChartProps> = ({
    stepSeries,
    timeRange,
    start,
    end,
    loading,
    featureEvents = [],
}) => {
    const theme = useTheme();
    const colors = theme.palette.charts.series;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<ChartInstance<'line'> | null>(null);
    const [hiddenSteps, setHiddenSteps] = useState<Set<number>>(new Set());

    const toggleStep = (index: number) => {
        setHiddenSteps((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const placeholderData = usePlaceholderData({
        fill: true,
        type: 'constant',
    });

    const plotArea = useChartPlotArea(wrapperRef, chartInstanceRef, [
        stepSeries,
        hiddenSteps,
    ]);

    const data = buildTimeSeriesChartData(stepSeries, colors, hiddenSteps);

    const hasNoData =
        !loading &&
        (stepSeries.length === 0 ||
            stepSeries.every((step) => step.data.length === 0));

    // `start`/`end` arrive as Unix-second strings; the chart and overlay both
    // need the visible window in milliseconds to place things along the x-axis.
    const visibleWindow = parseVisibleWindow(start, end);

    const eventGroups = visibleWindow
        ? groupEventsByProximity(
              featureEvents.filter(
                  (event) =>
                      event.timestamp >= visibleWindow.minMs &&
                      event.timestamp <= visibleWindow.maxMs,
              ),
              visibleWindow,
          )
        : [];

    const eventAnnotations = buildEventAnnotations(eventGroups, theme);
    const showPlaceholder = hasNoData || loading;

    const chartOptions = showPlaceholder
        ? {}
        : buildChartOptions(visibleWindow, timeRange, eventAnnotations);

    const showOverlay =
        !hasNoData && !loading && visibleWindow !== null && plotArea !== null;
    const showLegend = !hasNoData && !loading && stepSeries.length > 0;

    return (
        <StyledWrapper ref={wrapperRef}>
            <StyledChartArea>
                <StyledChartFrame>
                    <LineChart
                        data={hasNoData || loading ? placeholderData : data}
                        overrideOptions={chartOptions}
                        chartRef={(instance) => {
                            chartInstanceRef.current = instance;
                        }}
                        cover={
                            hasNoData ? (
                                <NotEnoughData description='Send impact metrics using Unleash SDK for these series to view the chart.' />
                            ) : (
                                loading
                            )
                        }
                    />
                </StyledChartFrame>
                {showOverlay && (
                    <FeatureEventOverlay
                        groups={eventGroups}
                        plotArea={plotArea}
                    />
                )}
            </StyledChartArea>
            {showLegend && (
                <StepLegend
                    stepSeries={stepSeries}
                    colors={colors}
                    hiddenSteps={hiddenSteps}
                    onToggle={toggleStep}
                />
            )}
        </StyledWrapper>
    );
};
