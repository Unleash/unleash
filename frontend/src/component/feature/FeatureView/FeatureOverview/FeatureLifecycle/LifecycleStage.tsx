import type { Lifecycle } from 'interfaces/featureToggle';

type TimedStage = { enteredStageAt: string };
export type LifecycleStage = TimedStage &
    (
        | { name: 'initial' & Lifecycle['stage'] }
        | {
              name: 'pre-live' & Lifecycle['stage'];
              environments: Array<{ name: string; lastSeenAt: string }>;
          }
        | {
              name: 'live' & Lifecycle['stage'];
              environments: Array<{ name: string; lastSeenAt: string }>;
          }
        | {
              name: 'completed' & Lifecycle['stage'];
              environments: Array<{ name: string; lastSeenAt: string }>;
              status: 'kept' | 'discarded';
          }
        | { name: 'archived' & Lifecycle['stage'] }
    );
