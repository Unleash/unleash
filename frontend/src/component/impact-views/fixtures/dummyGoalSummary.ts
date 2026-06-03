import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { GoalSummary } from '../views/computeGoalSummary';

// Temporary dummy data so the goal summary panel can be previewed on the page
// before real data / the full goal view exist. Replaced by the real fixture +
// GoalTrackingViewChart wiring in a later PR. See ./../README.md.

export const DUMMY_GOAL_METRIC_LABEL = 'checkout_completed_total';

export const DUMMY_GOAL_TIME_LABEL = 'Last 30 days';

export const DUMMY_GOAL_SUMMARY: GoalSummary = {
    current: 18420,
    mode: 'latest',
    deltaAbs: 3260,
    deltaPct: 21.5,
};

const HOUR_SEC = 60 * 60;
const POINTS = 48;
const START_SEC = 1_717_200_000;

export const DUMMY_GOAL_SERIES: MultimetricStepSeries = {
    label: DUMMY_GOAL_METRIC_LABEL,
    data: Array.from({ length: POINTS }, (_, index) => {
        const timestamp = START_SEC + index * HOUR_SEC;
        const trend = 15_160 + (index / (POINTS - 1)) * 3_260;
        const wobble = Math.sin(index / 3) * 420;
        return [timestamp, Math.round(trend + wobble)];
    }),
};
