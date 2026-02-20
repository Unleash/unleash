import { type FC, useMemo } from 'react';
import { styled, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { sub } from 'date-fns';
import { FeatureTimelineEventGroup } from './FeatureTimelineEventGroup';
import type { FeatureTimelineEvent, FeatureTimelineEventGroupType } from './FeatureTimeline';
import type { TimeRange } from '../FeatureImpactOverview';

const StyledContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const StyledTitle = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
}));

const StyledEventCount = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
}));

const StyledTimelineBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5, 0),
}));

const StyledTimelineContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    height: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 0),
}));

const StyledTimeline = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.divider,
    height: theme.spacing(0.5),
    width: '100%',
}));

const StyledMarker = styled('div')(({ theme }) => ({
    position: 'absolute',
    height: theme.spacing(1),
    width: theme.spacing(0.25),
    backgroundColor: theme.palette.text.secondary,
}));

const StyledStart = styled(StyledMarker)({
    left: 0,
});

const StyledEnd = styled(StyledMarker)({
    right: 0,
});

const StyledRow = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

const StyledMarkerLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledMiddleMarkerContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
});

const StyledMiddleMarker = styled(StyledMarker)(({ theme }) => ({
    top: theme.spacing(-2),
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    padding: theme.spacing(0.5, 1.5),
    fontSize: theme.fontSizes.smallBody,
    textTransform: 'none',
}));

const TIME_RANGE_CONFIG: Record<
    TimeRange,
    { value: Duration; markers: string[] }
> = {
    hour: {
        value: { hours: 1 },
        markers: ['-1h', '-30m', 'now'],
    },
    day: {
        value: { days: 1 },
        markers: ['-24h', '-12h', 'now'],
    },
    week: {
        value: { weeks: 1 },
        markers: ['-7d', '-3d', 'now'],
    },
    month: {
        value: { months: 1 },
        markers: ['-30d', '-15d', 'now'],
    },
};

// Generate mock events based on time range
const generateMockEvents = (
    startTime: number,
    endTime: number,
): FeatureTimelineEvent[] => {
    const duration = endTime - startTime;

    return [
        {
            id: 1,
            timestamp: startTime + duration * 0.1,
            type: 'feature-created',
            label: 'Feature created',
            summary: '**admin** created the feature flag',
            environment: undefined,
        },
        {
            id: 2,
            timestamp: startTime + duration * 0.25,
            type: 'feature-environment-enabled',
            label: 'Enabled in development',
            summary: '**admin** enabled the feature in development',
            environment: 'development',
        },
        {
            id: 3,
            timestamp: startTime + duration * 0.4,
            type: 'feature-strategy-add',
            label: 'Strategy added',
            summary: '**admin** added a gradual rollout strategy',
            environment: 'production',
        },
        {
            id: 4,
            timestamp: startTime + duration * 0.5,
            type: 'feature-environment-enabled',
            label: 'Enabled in production',
            summary: '**admin** enabled the feature in production',
            environment: 'production',
        },
        {
            id: 5,
            timestamp: startTime + duration * 0.65,
            type: 'feature-strategy-update',
            label: 'Rollout increased',
            summary: '**admin** increased rollout to 50%',
            environment: 'production',
        },
        {
            id: 6,
            timestamp: startTime + duration * 0.8,
            type: 'feature-strategy-update',
            label: 'Rollout increased',
            summary: '**admin** increased rollout to 100%',
            environment: 'production',
        },
        {
            id: 7,
            timestamp: startTime + duration * 0.85,
            type: 'feature-variants-updated',
            label: 'Variants updated',
            summary: '**admin** updated feature variants',
            environment: 'production',
        },
    ];
};

interface DemoFeatureTimelineProps {
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
}

export const DemoFeatureTimeline: FC<DemoFeatureTimelineProps> = ({
    timeRange,
    onTimeRangeChange,
}) => {
    const config = TIME_RANGE_CONFIG[timeRange];
    const endDate = new Date();
    const startDate = sub(endDate, config.value);
    const endTime = endDate.getTime();
    const startTime = startDate.getTime();

    const events = useMemo(
        () => generateMockEvents(startTime, endTime),
        [startTime, endTime],
    );

    const timespanInMs = endTime - startTime;
    const groupingThresholdInMs = useMemo(
        () => timespanInMs * 0.02,
        [timespanInMs],
    );

    const groups = useMemo(
        () =>
            events.reduce(
                (groups: FeatureTimelineEventGroupType[], event) => {
                    if (groups.length === 0) {
                        groups.push([event]);
                    } else {
                        const lastGroup = groups[groups.length - 1];
                        const lastEventInGroup =
                            lastGroup[lastGroup.length - 1];

                        if (
                            event.timestamp - lastEventInGroup.timestamp <=
                            groupingThresholdInMs
                        ) {
                            lastGroup.push(event);
                        } else {
                            groups.push([event]);
                        }
                    }
                    return groups;
                },
                [],
            ),
        [events, groupingThresholdInMs],
    );

    const handleTimeRangeChange = (
        _: React.MouseEvent<HTMLElement>,
        newRange: TimeRange | null,
    ) => {
        if (newRange) {
            onTimeRangeChange(newRange);
        }
    };

    return (
        <StyledContainer>
            <StyledHeader>
                <div>
                    <StyledTitle>Feature Events</StyledTitle>
                    <StyledEventCount>({events.length} events)</StyledEventCount>
                </div>
                <ToggleButtonGroup
                    size='small'
                    value={timeRange}
                    exclusive
                    onChange={handleTimeRangeChange}
                >
                    <StyledToggleButton value='hour'>Hour</StyledToggleButton>
                    <StyledToggleButton value='day'>Day</StyledToggleButton>
                    <StyledToggleButton value='week'>Week</StyledToggleButton>
                    <StyledToggleButton value='month'>Month</StyledToggleButton>
                </ToggleButtonGroup>
            </StyledHeader>
            <StyledTimelineBody>
                <StyledTimelineContainer>
                    <StyledTimeline />
                    <StyledStart />
                    {groups.map((group) => (
                        <FeatureTimelineEventGroup
                            key={group[0].id}
                            group={group}
                            startTime={startTime}
                            endTime={endTime}
                        />
                    ))}
                    <StyledEnd />
                </StyledTimelineContainer>
                <StyledRow>
                    <StyledMarkerLabel>{config.markers[0]}</StyledMarkerLabel>
                    {config.markers.slice(1, -1).map((marker) => (
                        <StyledMiddleMarkerContainer key={marker}>
                            <StyledMiddleMarker />
                            <StyledMarkerLabel>{marker}</StyledMarkerLabel>
                        </StyledMiddleMarkerContainer>
                    ))}
                    <StyledMarkerLabel>
                        {config.markers[config.markers.length - 1]}
                    </StyledMarkerLabel>
                </StyledRow>
            </StyledTimelineBody>
        </StyledContainer>
    );
};
