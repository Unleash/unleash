---
title: Implement A/B testing using feature flags
pagination_next: guides/manage-ai-models-with-feature-flags
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

Feature flags are a great way to run A/B or multivariate tests with minimal code modifications, and Unleash offers built-in features that make it easy to get started. In this tutorial, we will walk through how to do an A/B test using Unleash with your application.

## How to perform A/B testing with feature flags

To follow along with this tutorial, you need access to an Unleash instance to create and manage feature flags. Head over to our [Quick Start documentation](/get-started/quickstart) for options, including running locally or using an [Unleash SaaS instance](https://www.getunleash.io/pricing).

With Unleash set up, you can use your application to talk to Unleash through one of our [SDKs](/sdks).

In this tutorial, you will learn how to set up and run an A/B test using feature flags. You will learn:

1. [How to use feature flags to define variants of your application for testing](#create-a-feature-flag)
2. [Target specific users for each test variant](#target-users-for-ab-testing)
3. [Manage cross-session visibility of test variants](#manage-user-session-behavior)
4. [Connect feature flag impression data to conversion outcomes](#track-ab-testing-for-your-key-performance-metrics)
5. [Roll out the winning variant to all users](#roll-out-the-winning-variant-to-all-users)

You will also learn about how to [automate advanced A/B testing strategies](#multi-arm-bandit-tests-to-find-the-winning-variant) such as multi-arm bandit testing using feature flags.

### Create a feature flag

To do A/B testing, we'll create a feature flag to implement the rollout strategy. After that, we'll explore what strategies are and how they are configured in Unleash.

In the Unleash Admin UI, open a project and click **New feature flag**.

![Create a new feature flag in the Unleash Admin UI.](/img/use-case-new-flag.png)

Next, you will create a feature flag and turn it on.

Feature flags can be used for different purposes and we consider experimentation important enough to have its own flag type. Experimentation flags have a lifetime expectancy suited for running an experiment and gathering enough data to know whether the experiment was a success or not. The feature flag we are creating is considered an Experiment flag type.

![Create a feature flag by filling out the form fields.](/img/use-case-create-experiment-flag.png)

Once you have completed the form, click **Create feature flag**.

Your new feature flag is now ready to be used. Next, we will configure the A/B testing strategy for your flag.

### Target users for A/B testing

With an A/B testing strategy, you’ll be able to:

-   Determine the percentage of users exposed to the new feature
-   Determine the percentage of users that get exposed to each version of the feature

To target users accordingly, let's create an [activation strategy](/concepts/activation-strategies). This Unleash concept defines who will be exposed to a particular flag. Unleash comes pre-configured with multiple activation strategies that let you enable a feature only for a specified audience, depending on the parameters under which you would like to release a feature.

![Anatomy of an activation strategy](/img/anatomy-of-unleash-strategy.png)

In this tutorial, we'll use a gradual rollout strategy with the rollout percentage set to 100%, which means that the feature is enabled for all users.

:::note
Activation strategies are defined and configured on the Unleash server. Backend SDKs evaluate feature flags locally using the configuration retrieved from the server. For frontend SDKs, evaluation happens on the server side, and the results are delivered to the client by the Unleash server or Unleash Edge.
:::


Let's set up the strategy! Open your feature flag, and select an environment. Click **Add strategy**, select **Gradual rollout**, and click **Configure**.

![Add your first strategy from the flag view in Unleash.](/img/add-strategy.png)

The gradual rollout strategy form has multiple fields that control the rollout of your feature. You can name the strategy something relevant to the A/B test you’re creating, but this is an optional field.

![In the gradual rollout form, you can configure the parameters of your A/B tests and releases.](/img/use-case-experiment-gradual-rollout.png)

Next, configure the rollout percentage so only a certain portion of your users are targeted. For example, you can adjust the dial so that 35% of all users are targeted. The remaining percentage of users will not experience any variation of the new feature. Adjust the rollout dial to set the percentage of users the feature targets, or keep it at 100% to target all users.

There are two more advanced extensions of a default strategy that you will see available to customize in the form:

-   [Strategy variants](/concepts/strategy-variants)
-   [Strategy constraints](/concepts/activation-strategies#constraints)

With strategy variants and constraints, you can extend your overall strategy. They help you define more granular conditions for your feature beyond the rollout percentage. We recommend using strategy variants to configure an A/B test.

[Strategy variants](/concepts/strategy-variants) let you expose a particular version of a feature to select user bases when a flag is enabled. You can then collect data to determine which variant performs better, which we'll cover later in this tutorial.

Using strategy variants in your activation strategy is the canonical way to run A/B tests with Unleash and your application.

![This diagram breaks down how strategy variants sit on top activation strategies for flags in Unleash.](/img/tutorial-building-blocks-strategy-variants.png)

A variant has three components that define it:

-   a name: This must be unique among the strategy's variants. You typically use the name to identify the variant in your client.
-   a weight: The [variant weight](/concepts/strategy-variants#variant-weight) is the likelihood of any one user getting this specific variant.
-   an optional payload: A variant can also have an associated [payload](/concepts/strategy-variants#variant-payload) to deliver more data or context. Define this if you want to return data in addition to the `enabled`/`disabled` value of the flag. The payload has:
    - a type: This defines the data format of the payload and can be one of the following options: `string`, `json`, `csv`, or `number`.
    - a value: The payload data associated with the variant. The format of the data must correspond with the one specified in the type property.

Open the gradual rollout strategy, select the **Variants** tab, and click **Add variant**. Enter a unique name for the variant. For the purpose of this tutorial, we’ve created 2 variants: `variantA` and `variantB`. In a real-world use case, we recommend more specific names to be comprehensible and relevant to the versions of the feature you’re referencing. Create additional variants if you need to test more versions.

Next, decide the percentage of users to target for each variant, known as the variant weight. By default, 50% of users will be targeted between 2 variants. For example, 50% of users within the 35% of users targeted from the rollout percentage you defined earlier would experience `variantA`. Toggle **Custom percentage** to change the default variant weights.

![You can configure multiple strategy variants for A/B testing within the gradual rollout form.](/img/use-case-experiment-variants.png)

### Manage user session behavior

Unleash is built to give developers confidence in their ability to run A/B tests effectively. One critical component of implementing A/B testing strategies is maintaining a consistent experience for each user across multiple user sessions.

For example, user `uuid1234` should be the target of `variantA` regardless of their session. The original subset of users that get `variantA` will continue to experience that variation of the feature over time. At Unleash, we call this [stickiness](/concepts/stickiness). You can define the parameter of stickiness in the gradual rollout form. By default, stickiness is calculated by `sessionId` and `groupId`.

### Track A/B testing for your key performance metrics

An A/B testing strategy is most useful when you can track the results of a feature rollout to users. When your team has clearly defined the goals for your A/B tests, you can use Unleash to analyze how results tie back to key metrics, like conversion rates or time spent on a page. One way to collect this data is by enabling [impression data](/concepts/impression-data) per feature flag. Impression data contains information about a specific feature flag activation check.

To enable impression data for your rollout, navigate to your feature flag form and turn the toggle on.

![Enable impression data in the strategy rollout form for your flag.](/img/use-case-experiment-enable-impression-data.png)

Next, in your application code, use the SDK to capture the impression events as they are being emitted in real time.
Your client SDK will emit an impression event when it calls `isEnabled` or `getVariant`. Some front-end SDKs emit impression events only when a flag is enabled. You can define custom event types to track specific user actions. If you want to confirm that users from your A/B test have the new feature, Unleash will receive the `isEnabled` event. If you have created variants, the `getVariant` event type will be sent to Unleash.

Strategy variants are meant to work with impression data. You get the name of the variant sent to your analytics tool, which allows you a better understanding of what happened, rather than seeing a simple true/false from your logs.

The output from the impression data in your app may look like this code snippet:

```js
{
    "eventType": "getVariant",
    "eventId": "c41aa58b-d2c7-45cf-b668-7267f465e01a",
    "context": {
        "sessionId": 386689528,
        "appName": "my-example-app",
        "environment": "default"
    },
    "enabled": true,
    "featureName": "ab-testing-example",
    "impressionData": true,
    "variant": "variantA"
}
```

In order to capture impression events in your app, follow our [language and framework-specific tutorials](/guides/implement-feature-flags-in-react).

Now that your application is capturing impression events, you can configure the correct data fields and formatting to send to any analytics tool or data warehouse you use.

Here are two code examples of collecting impression data in an application to send to Google Analytics:

Example 1

```js
unleash.on(UnleashEvents.Impression, (e: ImpressionEvent) => {
    // send to google analytics, something like
    gtag("event", "screen_view", {
        app_name: e.context.appName,
        feature: e.featureName,
        treatment: e.enabled ? e.variant : "Control", // in case we use feature disabled for control
    });
});
```

Example 2

```js
unleash.on(UnleashEvents.Impression, (e: ImpressionEvent) => {
    if (e.enabled) {
        // send to google analytics, something like
        gtag("event", "screen_view", {
            app_name: e.context.appName,
            feature: e.featureName,
            treatment: e.variant, // in case we use a variant for the control treatment
        });
    }
});
```

In these example code snippets, `e` references the event object from the impression data output. Map these values to plug into the appropriate functions that make calls to your analytics tools and data warehouses.

In some cases, like in Example 1, you may want to use the "disabled feature" state as the "Control group".

Alternatively, in Example 2, you can expose the feature to 100% of users and use two variants: "Control" and "Test". In either case, the variants are always used for the "Test" group. The difference is determined by how you use the "Control" group.

An advantage of having your feature disabled for the Control group is that you can use metrics to see how many of the users are exposed to experiment(s) in comparison to the ones that are not. If you use only variants (for both the test and control group), you may see the feature metric as 100% exposed and would have to look deeper into the variant to know how many were exposed.

Here is an example of a payload that is returned from Google Analytics that includes impression event data:

```js
{
    "client_id": "unleash_client"
    "user_id": "uuid1234"
    "timestamp_micros": "1730407349525000"
    "non_personalized_ads": true
    "events": [
        {
            "name":"select_item"
            "params": {
                "items":[]
                "event":"screen_view"
                "app_name":"myAppName"
                "feature":"myFeatureName"
                "treatment":"variantValue"
            }
        }
    ]
}
```

By enabling impression data for your feature flag and listening to events within your application code, you can leverage this data flowing to your integrated analytics tools to make informed decisions faster and adjust your strategies based on real user behavior.

### Roll out the winning variant to all users

After you have implemented your A/B test and measured the performance of a feature to a subset of users, you can decide which variant is the most optimal experience to roll out to all users in production.

Unleash gives you control over which environments you release your feature to, when you release the feature, and to whom. Every team's release strategy may vary, but the overarching goal of A/B testing is to select the most effective experience for users, whether it be a change in your app's UI, a web performance improvement, or backend optimizations.

When rolling out the winning variant, your flag may already be on in your production environment. Adjust the rollout strategy configurations to release to 100% of your user base in the Unleash Admin.

After the flag has been available to 100% of users over time, archive the flag and clean up your codebase.

## A/B testing with enterprise automation

With Unleash, you can automate feature flags through APIs and even rely on [actions](/concepts/actions) and [signals](/concepts/signals) to enable and disable flags dynamically. When running A/B tests, you can configure your projects to execute tasks in response to application metrics and thresholds you define. For example, if an experimentation feature that targets a part of your user base logs errors, your actions can automatically disable the feature so your team is given the time to triage while still providing a seamless, alternative experience to users. Similarly, you can use the APIs to modify the percentage of users targeted for variations of a feature based off users engaging with one variation more than the other.

### Multi-arm bandit tests to find the winning variant

When running complex multivariate tests with numerous combinations, automating the process of finding the best variation of a feature is the most optimal, cost-effective approach for organizations with a large user base. [Multi-arm bandit tests](https://en.wikipedia.org/wiki/Multi-armed_bandit) are a powerful technique used in A/B testing to allocate traffic to different versions of a feature or application in a way that maximizes the desired outcome, such as conversion rate or click-through rate. This approach offers several advantages over traditional A/B testing and is a viable solution for large enterprise teams.

The variants you created with Unleash would be the "arms" in the multi-bandit context. You can use a multi-arm bandit algorithm, such as [epsilon-greedy](https://www.geeksforgeeks.org/epsilon-greedy-algorithm-in-reinforcement-learning/) or [Thompson sampling](https://en.wikipedia.org/wiki/Thompson_sampling), to dynamically allocate traffic based on the performance of each variant. Experiment with different variants to gather more information. Allocate more traffic to the variants that are performing better. As the test progresses, the algorithm will adjust the traffic allocation to favor the variants that are showing promising results. After completing the test, you can analyze the data to determine the winning variant. By dynamically allocating traffic based on performance, multi-arm bandit tests can identify the winning variant more quickly than traditional A/B testing.

![This is a graph comparing traditional A/B testing and multi-arm bandit selection.](/img/use-case-ab-testing-vs-bandit.png)

> [Image Source: Matt Gershoff](https://blog.conductrics.com/balancing-earning-with-learning-bandits-and-adaptive-optimization/)

To use Unleash to conduct a multi-arm bandit test, follow these steps:

1. Collect the necessary data from each variant’s performance by enabling impression data for your feature flag.
2. Capture impression events in your application code.
3. Funnel the impression events captured from your application code to an external analytics tool.
4. Use the Unleash API to dynamically adjust the traffic for each variant based on performance.

This approach minimizes the "regret" associated with allocating traffic to lower-performing variants. Multi-arm bandit tests using Unleash can adapt to changing conditions, such as seasonal fluctuations or user behavior changes. In some cases, they can be used to ensure that users are not exposed to suboptimal experiences for extended periods.

A/B tests are performed safely and strategically with extra safeguards when you automate your flags based on user activity and other metrics of your choice.
