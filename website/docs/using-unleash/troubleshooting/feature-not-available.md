---
title: I don't see a documented Unleash feature in my admin UI
---

Occasionally, users might come across a situation where a documented Unleash feature isn't visible in their admin UI. Here's how to troubleshoot this issue.

You can usually find availability information in the feature's documentation page, displayed in a box like this:

:::info Availability

**Cool new feature** was introduced as a beta feature in **Unleash 5.5** and is only available in Unleash Enterprise. We plan to make this feature generally available to all Enterprise users in **Unleash 5.6**.

:::

1. Check that the feature is available in your current Unleash version. For example, [Service accounts](/reference/service-accounts) are available in **Unleash 4.21** and later. If you're running a previous version, you'll need to update your Unleash instance.
2. Make sure the feature is available for your plan, as you may need to [upgrade your plan](https://www.getunleash.io/pricing) to access the feature.
3. If this is a beta feature, it may not be enabled for your Unleash instance. Here's how you can enable it:
    - If you have a **hosted** Unleash instance and you'd like early access to the new feature, reach out to us so we can enable it for you.
    - If you're running a **self-hosted** Unleash instance, make sure you've enabled the feature in your Unleash configuration. Usually, this involves setting the correct environment variable. You can check the current flags and respective environment variables in your version's [src/lib/types/experimental.ts](https://github.com/Unleash/unleash/blob/main/src/lib/types/experimental.ts). Setting this variable may look something like `UNLEASH_EXPERIMENTAL_NEW_FEATURE=true`.

If you've followed the above steps and still can't access the feature, please [contact us](https://slack.unleash.run) for further assistance.

If you're currently using a beta feature, please [reach out to us](https://slack.unleash.run)! We would be thrilled if you could provide some feedback.
