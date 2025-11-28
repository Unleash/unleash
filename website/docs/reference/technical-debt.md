---
title: Technical debt
pagination_next: reference/insights
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

## Overview

Feature flag technical debt accumulates when you don’t manage or retire feature flags after their intended use. Over time, the codebase becomes cluttered with outdated flags, making the code more complex and harder to maintain. This can slow productivity as developers spend more time understanding and navigating the code.

[Stale feature flags](#stale-and-potentially-stale-flags) can also introduce risks, such as security vulnerabilities, by unintentionally exposing sensitive features or data. Additionally, the presence of stale or conflicting feature flags can lead to unexpected application behavior, increasing the risk of downtime and affecting overall stability. Managing feature flags effectively minimizes these risks and ensures a healthier development process.


## Stale and potentially stale flags

A feature flag can have one of the following states: _active_, _potentially stale_, or _stale_. Unleash marks all flags as potentially stale automatically once they pass their [expected lifetime](/reference/feature-toggles#feature-flag-types). This gives you an indication of when to review and clean up a feature flag in code.

You can also manually mark a feature flag as stale if you know it has served its intended purpose. To do so, click **Toggle stale state** on the flag's details page.

![Marking a feature flag as stale](/img/mark-flag-stale.png)

Alternatively, you can mark one or more flags as stale from the project overview page. In the **Feature flags** list, select the affected flags and click **Mark as stale**.

![Mark a flag as stale in a project](/img/stale-flag-project.png)

Marking a flag as stale allows you to deprecate a feature flag without removing the active configuration for connected applications. You can use this to signal to your team to stop using the feature in your applications. Stale flags will show as stale in the [project status dashboard](#project-status).

Marking a flag as stale generates a `feature-stale-on` [event](/reference/events#feature-stale-on). You can use [an integration](/integrate) to trigger automated workflows, such as posting notifications in a Slack channel, breaking project builds if the code contains stale flags, or automatically opening pull requests to remove stale flags from the code.

To find stale and potentially stale flags in a project, apply the **State** filter in the **Feature flags** list.

While a flag's state does not affect its behavior in applications, using states to manage flags helps reduce technical debt and maintain a cleaner codebase.

## Project status

Each project has a **Project status** dashboard, where you can view its technical debt rating—the percentage of healthy flags compared to stale or potentially stale flags. To keep your project's technical debt low, [archive stale feature flags](/reference/feature-toggles#archive-a-feature-flag) and remove them from your codebase. To view your project's technical debt rating over time, go to [Analytics](/reference/insights).

![Project status dashboard](/img/project-status.png)
