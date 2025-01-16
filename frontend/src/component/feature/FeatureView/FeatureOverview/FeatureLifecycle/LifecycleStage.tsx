import type { Lifecycle } from 'interfaces/featureToggle';

type TimedStage = { enteredStageAt: string };
export type LifecycleStage = TimedStage & {
    name: Lifecycle['stage'];
    environments?: Array<{ name: string; lastSeenAt: string }>;
};
