import { Box, Link, styled, Typography, useTheme } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import {
    IntroImpactMetric,
    type IIntroImpactMetricEvent,
} from './IntroImpactMetric.tsx';
import { useEffect, useRef, useState } from 'react';
import { INTRO_SAFEGUARD_ERROR_THRESHOLD } from './IntroSafeguard.tsx';

const HISTORY_LENGTH = 40;
const EVENT_STEP = 100 / (HISTORY_LENGTH - 1);

const buildInitialSeries = (value: number, max: number) =>
    Array.from({ length: HISTORY_LENGTH }, (_, index) => {
        if (value === 0) return 0;
        const offset = ((index % 7) - 3) * max * 0.004;
        return Math.min(max, Math.max(0, value + offset));
    });

const StyledSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(1.5),
}));

interface IIntroImpactChartsProps {
    topicKey: 'impact' | 'safeguard';
    errorCount: number;
    environmentEnabled: boolean;
    safeguardTriggered?: boolean;
    sampleIndex: number;
    activeMilestoneIndex: number;
    activeMilestoneName: string;
}

interface IMetricTimeline {
    successfulSearches: number[];
    searchErrors: number[];
    events: IIntroImpactMetricEvent[];
}

/**
 * Real Unleash terminology around a deliberately small set of synthetic
 * signals. The info control is a popover (rather than a tooltip) because it
 * contains an interactive documentation link.
 */
export const IntroImpactCharts = ({
    topicKey,
    errorCount,
    environmentEnabled,
    safeguardTriggered = false,
    sampleIndex,
    activeMilestoneIndex,
    activeMilestoneName,
}: IIntroImpactChartsProps) => {
    const theme = useTheme();
    const isImpact = topicKey === 'impact';
    const successMax = 140;
    const errorMax = isImpact ? 20 : 8;
    const [timeline, setTimeline] = useState<IMetricTimeline>(() => ({
        successfulSearches: buildInitialSeries(128, successMax),
        searchErrors: buildInitialSeries(0, errorMax),
        events: [],
    }));
    const previousReleaseState = useRef({
        environmentEnabled,
        activeMilestoneIndex,
    });
    const nextEventId = useRef(0);
    const lastRenderedSampleIndex = useRef(sampleIndex);

    useEffect(() => {
        const previous = previousReleaseState.current;
        const environmentChanged =
            previous.environmentEnabled !== environmentEnabled;
        const milestoneAdvanced =
            environmentEnabled &&
            previous.environmentEnabled &&
            previous.activeMilestoneIndex !== activeMilestoneIndex;

        previousReleaseState.current = {
            environmentEnabled,
            activeMilestoneIndex,
        };
        if (!environmentChanged && !milestoneAdvanced) return;

        setTimeline((current) => ({
            ...current,
            events: [
                ...current.events,
                {
                    id: nextEventId.current++,
                    type: environmentChanged
                        ? environmentEnabled
                            ? 'enabled'
                            : topicKey === 'safeguard' && safeguardTriggered
                              ? 'automated-disabled'
                              : 'disabled'
                        : 'milestone',
                    position: 100,
                    label: milestoneAdvanced ? activeMilestoneName : undefined,
                },
            ],
        }));
    }, [
        activeMilestoneIndex,
        activeMilestoneName,
        environmentEnabled,
        safeguardTriggered,
        topicKey,
    ]);

    const visibleErrorCount = environmentEnabled ? errorCount : 0;
    const successfulSearches = Math.max(
        0,
        128 * (1 - visibleErrorCount / errorMax),
    );

    useEffect(() => {
        if (sampleIndex === lastRenderedSampleIndex.current) return;
        lastRenderedSampleIndex.current = sampleIndex;
        const addNoise = (value: number, max: number) =>
            value === 0
                ? 0
                : Math.min(
                      max,
                      Math.max(
                          0,
                          value + Math.sin(sampleIndex * 1.7) * max * 0.012,
                      ),
                  );
        setTimeline((current) => {
            const previousSuccessful =
                current.successfulSearches.at(-1) ?? successfulSearches;
            const previousErrors = current.searchErrors.at(-1) ?? 0;
            const nextSuccessful = environmentEnabled
                ? addNoise(successfulSearches, successMax)
                : addNoise(
                      previousSuccessful +
                          (successfulSearches - previousSuccessful) * 0.18,
                      successMax,
                  );
            const nextErrors = environmentEnabled
                ? addNoise(visibleErrorCount, errorMax)
                : Math.max(
                      0,
                      previousErrors - Math.max(1, previousErrors * 0.32),
                  );

            return {
                successfulSearches: [
                    ...current.successfulSearches.slice(1),
                    nextSuccessful,
                ],
                searchErrors: [...current.searchErrors.slice(1), nextErrors],
                events: current.events
                    .map((event) => ({
                        ...event,
                        position: event.position - EVENT_STEP,
                    }))
                    .filter((event) => event.position > 1),
            };
        });
    }, [
        environmentEnabled,
        errorMax,
        sampleIndex,
        successfulSearches,
        visibleErrorCount,
    ]);

    return (
        <StyledSection data-testid='QUICK_TOUR_INTRO_IMPACT_CHARTS'>
            <StyledHeader>
                <StyledTitle variant='body2'>Impact metrics</StyledTitle>
                <HelpIcon
                    htmlTooltip
                    tooltip={
                        <>
                            <Typography
                                variant='body2'
                                component='p'
                                sx={{ mb: 1 }}
                            >
                                Connect application data such as request counts,
                                errors, or latency to feature flags and release
                                plans.
                            </Typography>
                            <Link
                                href='https://docs.getunleash.io/concepts/impact-metrics'
                                target='_blank'
                                rel='noopener noreferrer'
                                variant='body2'
                            >
                                Read more in the documentation
                            </Link>
                        </>
                    }
                />
            </StyledHeader>

            <StyledGrid>
                <IntroImpactMetric
                    label='Successful searches'
                    metadata='last minute · count'
                    data={timeline.successfulSearches}
                    max={successMax}
                    testId='QUICK_TOUR_INTRO_SUCCESS_METRIC'
                    color={theme.palette.success.main}
                    formatValue={(value) => `${Math.round(value)}`}
                    events={timeline.events}
                />
                <IntroImpactMetric
                    label='Search errors'
                    metadata='last minute · count'
                    data={timeline.searchErrors}
                    max={errorMax}
                    testId='QUICK_TOUR_INTRO_ERROR_METRIC'
                    threshold={
                        isImpact ? undefined : INTRO_SAFEGUARD_ERROR_THRESHOLD
                    }
                    color={theme.palette.error.main}
                    formatValue={(value) => `${Math.round(value)}`}
                    events={timeline.events}
                />
            </StyledGrid>
        </StyledSection>
    );
};
