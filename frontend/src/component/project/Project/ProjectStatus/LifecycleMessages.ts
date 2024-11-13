import type { ProjectStatusSchemaLifecycleSummary } from 'openapi';

const genericMessages: Record<
    keyof ProjectStatusSchemaLifecycleSummary,
    string
> = {
    initial:
        'Feature flags in the initial phase indicate you have created flags that is not detected in any environments which mean either integration issues or unused flags',
    preLive:
        'In the pre-live phase the feature is being developed and tested in controlled environments. Once the feature is ready the flag can be enabled in production.',
    live: 'The feature is being rolled out in production according to the decided strategy targeting user segments and/or using percentage rollout. ',
    completed:
        'Flags that are in cleanup are potentially stale flags. View the flags to evaluate whether you should archive them in Unleash and clean up your codebase to reduce technical debt',
    archived:
        'Flags that have been archived and are no longer in use, but kept for future reference.',
};

const mostTimeMessages: Partial<
    Record<keyof ProjectStatusSchemaLifecycleSummary, string>
> = {
    initial:
        'You spend most of your time the initial phase. This indicates you have created flags that is not detected in any environments which mean either integration issues or unused flags',
    preLive:
        'You spend most of your time in the pre-live phase. This indicates time is spent on development and testing, but the feature has not been rolled out in production. ',
};

export const getLifecycleMessages = (
    spendsMostTimeIn: Array<keyof ProjectStatusSchemaLifecycleSummary>,
) => {
    const messages = Object.entries(genericMessages).map(([stage, message]) => {
        const stageKey = stage as keyof ProjectStatusSchemaLifecycleSummary;
        if (
            spendsMostTimeIn.includes(stageKey) &&
            stageKey in mostTimeMessages
        ) {
            return [stageKey, mostTimeMessages[stageKey]];
        }
        return [stage, message];
    });

    return Object.fromEntries(messages);
};
