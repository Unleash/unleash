import type { ProjectStatusSchemaLifecycleSummary } from 'openapi';

export const lifecycleMessages: Record<
    keyof ProjectStatusSchemaLifecycleSummary,
    string
> = {
    initial:
        'Feature flags in the Define stage are flags that have not yet received metrics from any environments. This might mean that the flags have not been used yet, or it could indicate integration issues.',
    preLive:
        'In the Develop stage, the feature is being developed and tested in controlled environments. Once the feature is ready, the flag can be enabled in production.',
    live: 'The feature is being rolled out in production according to its assigned strategies (targeting user segments and/or using percentage rollout).',
    completed:
        'Flags that are in the Cleanup stage still receive metrics in production. Consider archiving them to clean up your codebase to reduce technical debt.',
    archived:
        'Flags that have been archived and are no longer in use, but kept for future reference.',
};
