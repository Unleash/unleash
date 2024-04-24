export type LifecycleStage =
    | { name: 'initial' }
    | {
          name: 'pre-live';
          environments: Array<{ name: string; lastSeenAt: string }>;
      }
    | {
          name: 'live';
          environments: Array<{ name: string; lastSeenAt: string }>;
      }
    | {
          name: 'completed';
          environments: Array<{ name: string; lastSeenAt: string }>;
          status: 'kept' | 'discarded';
      }
    | { name: 'archived' };
