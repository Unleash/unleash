---
title: How to perform a gradual rollout
pagination_next: guides/a-b-testing
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

## What is a gradual rollout?

A **gradual rollout** is a controlled release strategy where a new feature is first released to a small subset of users. This allows for monitoring user behavior, identifying potential issues, and gathering feedback before a full-scale launch. It also allows us to experiment quickly and safely.

By exposing the new feature to a limited audience, potential issues, bugs, or performance bottlenecks can be detected and addressed early on, preventing widespread impact.

Developers also use gradual rollouts to gather user feedback. Early adopters provide valuable insights into user experience, usability, and feature effectiveness, enabling rapid improvements. Gradual rollouts are also significant for testing in production. Real-world usage patterns and performance can be monitored closely, helping to ensure the new release is ready for a broader user base.

The key benefits of gradual rollouts are that you can experiment rapidly on a controlled group and roll back quickly if the experiment goes wrong. This reduces the risk of failure, improves software quality, improves user experience, and optimizes resource utilization.

## How to perform a gradual rollout with Unleash

To follow along with this tutorial, you will need an Unleash instance. If you’d prefer to self-host Unleash, read our [Quickstart guide](/get-started/quickstart). Alternatively, if you’d like your project to be hosted by Unleash, go to [getunleash.io](https://www.getunleash.io/pricing).

With Unleash set up, you can use your application to talk to Unleash through one of our SDKs.

To perform a gradual rollout, we will need to create the feature flag that will implement the rollout strategy. In the next section, we will explore what strategies are and how they are configured in Unleash.

In the projects view, the Unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Flag' button to create a new feature flag.

![Create a new feature flag in Unleash.](/img/react-tutorial-create-new-flag.png)

Next, you will create a feature flag on the platform and turn it on for your app.

The feature flag we are creating is considered a ‘Release’ flag type. The project will be ‘Default’ or the named project in which you are working in for the purpose of this tutorial. As the number of feature flags grows, you can organize them in your projects. Read our docs on [Projects](/reference/projects) to learn more about how to configure and manage them for your team/organization. A description of the flag can help properly identify its specific purposes. However, this field is optional.

The API Command bar is to the right of the flag form, which gives developers the option to use a curl command to create the flag with all the fields listed in the UI form straight from your terminal on your machine. If you wish to use the API command as an alternative, fill out the form before copying the command, as it is automatically updated with the field inputs.

![Create a feature flag by filling out the form fields.](/img/react-tutorial-create-flag-form.png)

Once you have completed the form, you can click ‘Create feature flag’.

Your new feature flag has been created and is ready to be used. Upon returning to your project’s view, enable the flag for your development environment, which makes it accessible to use in your app.

![Enable the development environment for your feature flag for use in your application.](/img/tutorial-enable-dev-env.png)

Next, we will configure the gradual rollout strategy for your new flag.

## Implementing a gradual rollout activation strategy

An important Unleash concept that enables developers to perform a gradual rollout is an [activation strategy](/reference/activation-strategies). An activation strategy defines who will be exposed to a particular flag or flags. Unleash comes pre-configured with multiple activation strategies that let you enable a feature only for a specified audience, depending on the parameters under which you would like to release a feature.

![Anatomy of an activation strategy](/img/anatomy-of-unleash-strategy.png)

Different strategies use different parameters. Predefined strategies are bundled with Unleash. The default strategy is the gradual rollout strategy with 100% rollout, which basically means that the feature is enabled for all users. In this case, we have only enabled the flag in the development environment for all users in the previous section.

Activation strategies are defined on the server. For backend SDKs, activation strategy implementation is done on the client side. For frontend SDKs, the feature is calculated on the server side.

You can configure your gradual rollout strategy using the following parameters in Unleash:

-   **rollout percentage** (0-100%) determines the number of users you want to enable the feature flag for
-   **stickiness** is how Unleash guarantees that the same user gets the same features every time. Stickiness is useful when you want to show a feature to only a subset of users. The same `userId` and the same rollout percentage should give predictable results. Paramers that are supported:
    -   **default** - Unleash chooses the first value present on the context in defined order `userId`, `sessionId`, `random`.
    -   **userId** - guaranteed to be sticky on `userId`. If `userId` is not present, the behavior would be `false`
    -   **sessionId** - guaranteed to be sticky on `sessionId`. If `sessionId` not present the behavior would be `false`.
    -   **random** - no stickiness guaranteed. For every `isEnabled` call it will yield a random `true`/`false` based on the selected rollout percentage.
    -   You can also enable **custom stickiness** by creating a context field for it to use in your gradual rollout. Learn more about [custom stickiness](/reference/stickiness#enabling-custom-stickiness).
    -   **groupId** is used to ensure that different flags will be evaluated differently. The `groupId` defaults to feature flag name, but the user can override it to _correlate rollout_ of multiple feature flags.

![Image of a gradual rollout form in Unleash](/img/tutorial-grad-rollout-form.png)

There are two more advanced extensions of the gradual rollout strategy that you can customize in the gradual rollout form:

-   [Strategy Constraints](/reference/activation-strategies#constraints)
-   [Strategy Variants](/reference/strategy-variants)

Constraints and variants are not required for a gradual rollout. These additional customizations can be built on top of the overall rollout strategy should you need more granular conditions for your feature beyond the rollout percentage.

[Strategy variants](/reference/strategy-variants) can expose a particular version of a feature to select user bases when a flag is enabled. From there, a way to use the variants is to view the performance metrics and see which is more efficient. We can create several variations of this feature to release to users and gather performance metrics to determine which one yields better results.

For gradual rollouts, _strategy constraints_ are most applicable for more granular conditions of a feature release. In the next section, we’ll explore how to apply a strategy constraint on top of a gradual rollout for more advanced use cases.

## Applying strategy constraints

When utilizing an activation strategy such as a gradual rollout, it may be necessary to further define which subset of users get access to a feature and when the rollout takes place, depending on the complexity of your use case. Unleash provides [strategy constraints](/reference/activation-strategies#constraints) as a way to fine-tune conditions under which a feature flag is evaluated.

![This diagram breaks down how strategy constraints sit on top activation strategies for flags in Unleash.](/img/tutorial-building-blocks-strategy-constraints.png)

Within a gradual rollout activation strategy, you can use strategy constraints to, for example:

-   roll out a feature only to users in a specific region
-   schedule a feature to be released at a specific time
-   make a feature available for a limited time only
-   release a feature to users with one of a set of email addresses
-   and any other targeting based on information you know about the user

![You can configure your strategy constraints in the gradual rollout form.](/img/tutorial-constraints-form.png)

Add [constraints](/reference/activation-strategies#constraints) to refine the rollout based on user attributes, segments, or conditions.


### Define custom context fields for strategy constraints

If you want to create new types of constraints that are not built into Unleash, you can create [custom context fields](/reference/unleash-context#custom-context-fields) to use in your gradual rollout for more advanced use cases.

## Using segments

A [segment](/reference/segments) is a reusable collection of [strategy constraints](/reference/activation-strategies#constraints). Like with strategy constraints, you apply segments to feature flag activation strategies.

You can apply the same segment to multiple activation strategies. If you update the segment, the changes will affect every strategy that uses that segment.

![The anatomy of an Unleash segment in relation to a flag and associated strategy.](/img/anatomy-of-unleash-segments.png)

Segments let you create user groups based on data available in the Unleash context. These groups can be as simple or as complex as you want to make them. For example, you could use segments to target:

-   Users in a specific region
-   Users on a specific device type
-   Users who signed up before a specific point in time

![In the top navigation menu in Unleash, go to Configure and then 'Segments' to manage your segments.](/img/segments.png)

Because segments stay in sync across strategies, any changes will propagate to all the activation strategies that use them. This also makes them ideal for use cases such as activating or deactivating multiple feature flags at the same time. You can use segments to:

-   target a consistent group of users across multiple flags based on specific context
-   release one or more new features at a specified time
-   create events with start and end times and guarantee that features will only be active during that period
    -   target the feature flag to specific segments

You must pass the relevant fields in your context in the SDK in order for gradual rollout to work in a predictable way and for any of your constraints or segments to function the way you expect. Learn more about [configuring Unleash contexts](/reference/unleash-context) correctly for your app in our documentation.

By following these steps and leveraging Unleash's features, you can effectively execute and refine gradual rollouts to minimize risks and optimize feature delivery.

## Managing gradual rollouts with enterprise security in mind

For large-scale organizations, managing feature flags across many teams can be complex and challenging. Unleash was architected for your feature flag management to be scalable and traceable for enterprises, which boosts overall internal security posture while delivering software efficiently.

After you have implemented a gradual rollout strategy, we recommend managing them by:

-   Tracking performance of feature releases within your application
-   Reviewing audit logs of each change to your flag configurations over time by project collaborators within your organization, which is exportable for reporting
-   Reviewing and approving change requests to your flags and strategy configurations

Read our documentation on how to effectively manage [feature flags at scale](/guides/best-practices-using-feature-flags-at-scale) while reducing security risks. Let’s walk through these recommended Unleash features in the subsequent sections.

### Reviewing application metrics

[Unleash metrics](/api/metrics) are a great way to understand user traffic. With your application using feature flags, you can review:

-   How many requests for a specific feature per application environment are being made over periods of time
-   How much exposure to users a feature has
-   What time of day do requests increase

![We have a Metrics graph in Unleash to review flag exposure and request rates.](/img/react-ex-metrics.png)

When managing a gradual rollout, leverage metrics to gain deeper insight into flag usage against your application over time. For large-scale organizations with many feature flags to manage, this can be a useful monitoring tool for individual flags you would like to keep track of.

### Reviewing audit logs

Because a feature flag service controls the way an application behaves in production, it can be highly important to have visibility into when changes have been made and by whom. This is especially true in highly regulated environments. In these cases, you might find audit logging useful for:

-   Organizational compliance
-   Change control

Fortunately, this is straightforward in Unleash Enterprise.

Unleash provides the data to log any change that has happened over time, at the flag level from a global level. In conjunction with Unleash, tools like Splunk can help you combine logs and run advanced queries against them. Logs are useful for downstream data warehouses or data lakes.

![Events for a feature flag. The Event log tab is highlighted and the UI shows the most recent changes, including a JSON diff and the change details.](/img/unleash-toggle-history.png)

Learn more about [Event Log](/reference/events#event-log) in our documentation.

### Managing change requests

You can use Unleash's [change request](/reference/change-requests) feature to propose and review modifications to feature flags. This gives developers complete control over your production environment. In large scale organizations and heavily regulated industries, we want to help developers reduce risk of errors in production or making unwanted changes by team members that have not been properly reviewed and approved.

The [change request](/reference/change-requests) configuration can be set up per project, per environment. This means that you can have different change request configurations for different environments, such as production and development. This is useful because different environments may have different requirements, so you can customize the change request configuration to fit those requirements.

Currently, there are two configuration options for change requests:

-   **Enable change requests** - This boolean value enables or disables change requests for the project and environment.
-   **Required approvals** - This is an integer value that indicates how many approvals are required before a change request can be applied. Specific permissions are required to approve and apply change requests.

The change request configuration can be set up in the project settings page:

![Change request configuration page under project settings.](/img/react-ex-project-settings.png)

Learn more about all of the functionality available with [Change Requests](/reference/change-requests) in our documentation.

By following these steps and leveraging Unleash's features, you can effectively execute and refine gradual rollouts to minimize risks and optimize feature delivery.
