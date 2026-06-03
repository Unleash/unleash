import type {
    MultimetricStepSeries,
    MultimetricFeatureEvent,
} from 'component/impact-metrics/MultimetricChart/types';
import type { MultimetricStep } from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import { computeGoalSummary } from '../views/computeGoalSummary';

// Temporary dummy data so the chart card (with the goal summary panel in its
// header slot) can be previewed on the page before real data / the full goal
// view exist. Replaced by the real fixture + GoalTrackingViewChart wiring in a
// later PR. See ./../README.md.

export const DUMMY_GOAL_METRIC_LABEL = 'checkout_completed_total';
export const DUMMY_GOAL_TIME_LABEL = 'Last 30 days';

const HOUR_SEC = 60 * 60;
const POINTS = 48;
const START_SEC = 1_717_200_000;
const END_SEC = START_SEC + (POINTS - 1) * HOUR_SEC;

export const DUMMY_START = String(START_SEC);
export const DUMMY_END = String(END_SEC);

export const DUMMY_GOAL_SERIES: MultimetricStepSeries = {
    label: DUMMY_GOAL_METRIC_LABEL,
    data: Array.from({ length: POINTS }, (_, index) => {
        const timestamp = START_SEC + index * HOUR_SEC;
        const trend = 15_160 + (index / (POINTS - 1)) * 3_260;
        const wobble = Math.sin(index / 3) * 420;
        return [timestamp, Math.round(trend + wobble)];
    }),
};

export const DUMMY_STEP_SERIES: MultimetricStepSeries[] = [DUMMY_GOAL_SERIES];

const lastValue = DUMMY_GOAL_SERIES.data[DUMMY_GOAL_SERIES.data.length - 1][1];

export const DUMMY_STEP_TOTALS: MultimetricStep[] = [
    {
        id: DUMMY_GOAL_METRIC_LABEL,
        label: DUMMY_GOAL_METRIC_LABEL,
        value: lastValue,
        previousStepPercentage: null,
    },
];

export const DUMMY_FEATURE_EVENTS: MultimetricFeatureEvent[] = [
    {
        id: 1,
        timestamp: (START_SEC + 18 * HOUR_SEC) * 1000,
        type: 'feature-environment-enabled',
        label: 'new-checkout-flow enabled',
        createdBy: 'demo@getunleash.io',
    },
];

export const DUMMY_GOAL_SUMMARY = computeGoalSummary(
    DUMMY_GOAL_SERIES,
    'avg',
    lastValue,
);
