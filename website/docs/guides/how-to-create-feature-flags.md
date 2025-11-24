---
title: Create and configure a feature flag
description: 'This guide shows you how to create feature flags in Unleash and how to add constraints, segments, variants, and more.'
pagination_next: guides/how-to-schedule-feature-releases
---

[Feature flags](../reference/feature-toggles) are a foundational component of Unleash, enabling you to manage features dynamically. This guide details the process of creating and configuring feature flags within Unleash. You'll learn how to create flags, define activation strategies, enable them, and optionally refine their behavior with constraints, segments, and variants.

This guide focuses on the Unleash Admin UI, but you can also use the [Admin API](/reference/api/unleash/create-feature) to create, update, and manage feature flags.

## Create a feature flag

To create a feature flag in the Admin UI, do the following:

1. Go to a project and click **Create feature flag**.
2. Enter a unique name for the flag and click **Create feature flag**.

## Add an activation strategy

[Activation strategies](/reference/activation-strategies) determine how and for whom a feature flag is enabled within a specific environment (for example, development, or production). To add an activation strategy to your feature flag in the Admin UI, do the following:

1. Go to a feature flag, and select the [environment](/reference/environments) where you want to configure the flag.
2. Click **Add strategy**, select **Gradual rollout**, and click **Configure**.
3. In the **General** tab, select your rollout percentage. Optionally, you can set the strategy status to **Inactive** if you don't yet want the strategy to be exposed.
4. Click **Save strategy**.

## Enable the feature flag in an environment

To enable the feature flag in an environment, use the main environment toggle to enable the flag in the environment. This ensures that the feature flag is evaluated using the rules of its activation strategies and the provided [Unleash context](/reference/unleash-context).

## Refine targeting with constraints and segments

[Strategy constraints](/reference/activation-strategies#constraints) and [segments](../reference/segments) allow you to apply fine-grained filters to your activation strategies, ensuring they only activate for users and applications matching specific criteria. You can add constraints or segments when creating or editing an existing activation strategy.

1. Go to the feature flag and the environment containing the strategy you want to modify and click the **Edit strategy**.
2. In the Targeting Tab, click **Add constraint**.
3. To define the constraint, add a context field, an operator, and values to compare against.
4. Add more constraints if needed, and click **Save strategy**.

[Segments](/reference/segments) work similarly to constraints, but they are a reusable set of constraints that you define once and can reuse across flags.

### Configure strategy variants

[Variants](../reference/feature-toggle-variants) give you the ability to further target your users and split them into groups of your choosing, such as for A/B testing.

1. Go to the feature flag and the environment containing the strategy you want to modify and click the **Edit strategy**.
2. In the **Variants** tab, click **Add variant**.
3. Enter the variant name and an optional payload.
4. Optionally, click **Add variant** again to add more variants.
5. Toggle **Custom percentage** for fixed weights, if required.
6. Click **Save strategy**.