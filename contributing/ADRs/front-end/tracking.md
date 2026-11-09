---
title: "ADR: Tracking user journeys and actions"
---

## Context

We use Plausible with one-off events to record user interactions and see which features are used and what we need to improve. We would like to start using the Flight Recorder SDK with more structured recording of frontend events. Each feature currently chooses its own event name and props, so events from different features have little in common, are difficult to compare, and lack a cohesive story. A consistent convention across the application will address this.

## Decision

We have decided to standardise tracking and represent user interactions as a **journey**: one thing a user set out to do. A journey can be a single event, such as expanding an accordion, or multiple events from the first step to the last, such as creating a flag (which involves opening a dialog, confirming it and getting the success or failed result).

Every journey is described by three things, all of them required:

* the **event**: the area of the application it belongs to, such as `flag-actions` or `flag-creation`. The list is the `CustomEvents` type in `utils/trackingEvents.ts`.
* the **type**: the specific thing the user wants to do there, named `<verb>-<object>`, such as `create-flag`. The verbs are the `TrackingVerb` type in `utils/trackingEvents.ts`.
* the **action**: how far the user got: `opened`, `submitted`, `succeeded`, `failed` or `dismissed`. This is the `TrackingAction` type in `utils/trackingEvents.ts`.

All journeys use the same five actions and therefore we can compare them consistently across different features. Eg: which journeys are abandoned the most often? Adding a new action should be carefully considered and be a team decision.

Props hold additional facts about the journey, such as the method used to perform an action or any other relevant context. They never carry customer data. This can help us understand user behavior in more detail without compromising privacy. Examples include `{ method: 'cancel-button' }` on a `dismissed` event of `create-flag`, or `{ blockedBy: 'limit', scope: 'project' }` when the flag limit is hit.

```tsx
export const archiveFlagTracking: Tracking = {
    event: 'flag-actions',
    type: 'archive-flag',
};

const trackArchiveFlag = useTracking(archiveFlagTracking);

trackArchiveFlag('succeeded', { method: 'kebab-menu' });    // one off action
await trackArchiveFlag.mutation(() => archive(id));         // submitted, then succeeded or failed. This tracks the intent (which is the user's attempt to perform the action as well as the result)

<Dialogue tracking={archiveFlagTracking} onSubmit={...} />  // opened, submitted, succeeded or failed, dismissed
```

The how-to lives as comments in the code: on the tracking types, on `useTracking` and on the `tracking` prop of `Dialogue`.

## Alternatives

* Keep one-off events. No migration, but tracking is less cohesive and harder to analyze across features.
* Use only the audit event log. Shows what happened but it doesn't show what users tried to do and abandoned. Lacks insight into user intent.

## Consequences

* Renaming an event or type splits its history. Do it in its own PR and ensure that any query tool is updated with the date from which the series splits.
* The compiler only checks the event name and the verb. Whether a journey is named well, whether a prop leaks customer data, and whether a rename kept its history, is only caught in review.