---
title: Effective A/B Testing using Feature Flags
slug: /feature-flag-tutorials/use-cases/a-b-testing
---

## What is A/B Testing?

**A/B testing** is a randomized controlled experiment where you test two or more versions of a feature to see which version performs better. If you have more than two versions, it's known as **A/B/n testing**. Coupled with analytics, A/B testing enables you to better understand your users and how to serve them better.

Multivariate testing is used to test multiple variables simultaneously to determine the optimal combination of elements that will produce the best results. Different combinations of variables such as design, content, and functionality can be tested to measure which combination has the greatest impact on user behavior or conversion rates.

Feature flags are a great way to run A/B or multivariate tests with minimal code modifications, and Unleash offers built-in features that make it easy to get started. In this tutorial, we will walk through how to do an A/B test using Unleash with your application.

## How to Perform A/B Testing with Feature Flags

<<<<<<< HEAD
<<<<<<< HEAD
To follow along with this tutorial, you will need an Unleash instance. If you’d prefer to self-host Unleash, read our [Quickstart guide](/quickstart). Alternatively, if you’d like your project to be hosted by Unleash, go to [www.getunleash.io](https://www.getunleash.io/pricing?_gl=1*1ytmg93*_gcl_au*MTY3MTQxNjM4OS4xNzIxOTEwNTY5*_ga*OTkzMjI0MDMwLjE3MDYxNDc3ODM.*_ga_492KEZQRT8*MTcyNzQzNTQwOS4yMzcuMS4xNzI3NDM1NDExLjU4LjAuMA).
=======
To follow along with this tutorial, you will need access to an Unleash Instance. Head over to our [Quick Start documentation](/quickstart) for options, including running locally, or using an [Unleash SaaS instance](https://www.getunleash.io/pricing?).
>>>>>>> 471f6a231 (updating a/b testing doc: v2)
=======
To follow along with this tutorial, you will need access to an Unleash Instance which will be used to create and manage feature flags. Head over to our [Quick Start documentation](/quickstart) for options, including running locally, or using an [Unleash SaaS instance](https://www.getunleash.io/pricing?).
>>>>>>> 7db166905 (update official getting started intro)

With Unleash set up, you can use your application to talk to Unleash through one of our SDKs.

To do A/B testing, we will need to create the feature flag that will implement the rollout strategy. After that, we will explore what strategies are and how they are configured in Unleash.

In the projects view, the Unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Flag' button to create a new feature flag.

![Create a new feature flag in Unleash.](/img/react-tutorial-create-new-flag.png)

Next, you will create a feature flag on the platform and turn it on for your app.

Flags can be used with different purposes and we consider experimentation important enough to have its own flag type. Experimentation flags have a lifetime expectancy suited to let you run an experiment and gather enough data to know whether it was a success or not. Learn more about [feature flag types](/reference/feature-toggles#feature-flag-types) in our documentation.

The feature flag we are creating is considered an ‘Experimentation’ flag type. The project will be ‘Default’ or the named project in which you are working in for the purpose of this tutorial. As the number of feature flags grows, you can organize them in your projects.

Read our docs on [Projects](/reference/projects) to learn more about how to configure and manage them for your team/organization. A description of the flag can help properly identify its specific purposes. However, this field is optional.

![Create a feature flag by filling out the form fields.](/img/use-case-create-experiment-flag.png)

Once you have completed the form, you can click ‘Create feature flag’.

Your new feature flag has been created and is ready to be used. Next, we will configure the A/B testing strategy for your new flag.

### Target Users for A/B Testing

With an A/B testing strategy, you’ll be able to:

-   Determine the percentage of users exposed to the new feature
-   Determine the percentage of users that get exposed to each version of the feature

To target users accordingly, we will create an [activation strategy](/reference/activation-strategies). This Unleash concept defines who will be exposed to a particular flag or flags. Unleash comes pre-configured with multiple activation strategies that let you enable a feature only for a specified audience, depending on the parameters under which you would like to release a feature.

![Anatomy of an activation strategy](/img/anatomy-of-unleash-strategy.png)

Different strategies use different parameters. Predefined strategies are bundled with Unleash. The default strategy is the gradual rollout strategy with 100% rollout, which basically means that the feature is enabled for all users. In this tutorial, we will adjust the percentage of users who have access to the feature.

:::note
Activation strategies are defined on the server. For server-side SDKs, activation strategy implementation is done on the client side. For frontend SDKs, the feature is calculated on the server side.
:::

On the feature flag view in Unleash, click on the ‘Add your first strategy’ button to navigate to a (default) gradual rollout strategy form.

![Add your first strategy from the flag view in Unleash.](/img/use-case-add-new-strategy.png)

The gradual rollout strategy form has multiple fields that control the rollout of your feature. You can name the strategy something relevant to the A/B test you’re creating, but this is an optional field.

![In the gradual rollout form, you can configure the parameters of your A/B tests and releases.](/img/use-case-gradual-rollout.png)

In this form, you can configure the rollout percentage so only a certain portion of your users are targeted. For example, you can adjust the dial so that 35% of all users are targeted. The remaining percentage of users will not experience any variation of the new feature. Decide on the percentage of users that the feature will target by adjusting the rollout dial or keep it at 100% to target all users.

There are two more advanced extensions of a default strategy that you will see available to customize in the form:

-   [Strategy Variants](/reference/strategy-variants)
-   [Strategy Constraints](/reference/strategy-constraints)

Variants and constraints are additional Unleash customizations that can be built on top of the overall strategy should you need more granular conditions for your feature beyond the rollout percentage. We **recommend** using strategy variants to configure an A/B test.

[Strategy variants](/reference/strategy-variants) can expose a particular version of a feature to select user bases when a flag is enabled. From there, a way to use the variants is to collect data to see which is one yields better results, which we will cover later in the tutorial.

Using strategy variants in your activation strategy is the canonical way to run A/B tests with Unleash and your application.

![This diagram breaks down how strategy variants sit on top activation strategies for flags in Unleash.](/img/tutorial-building-blocks-strategy-variants.png)

A variant has four components that define it:

-   **a name**: This must be unique among the strategy's variants. When working with a feature with variants in a client, you will typically use the variant's name to find out which variant it is.
-   **a weight**: The weight is the likelihood of any one user getting this specific variant. See the [weights section](/reference/strategy-variants#variant-weight) for more info.
-   **an optional payload**: A variant can also have an associated payload. Use this to deliver more data or context. See the [payload section](/reference/strategy-variants#variant-payload) for more details.
-   **a value**

While teams may have different goals for measuring performance, Unleash enables you to configure strategy variants within your application/service and the platform.

![You can review the anatomy of an Unleash strategy variants in relation to other Unleash features.](/img/anatomy-of-unleash-variants.png)

In your gradual rollout form, there is a ‘Variants’ section. Click on the ‘Add variant’ button. A form will appear where you can provide a unique name for the variant. For the purpose of this tutorial, we’ve created 2 variants shown in the image below: `variantA` and `variantB`. In a real world use case, we recommend more specific names to be comprehensible and relevant to the versions of the feature you’re referencing. Create additional variants if you need to test more versions.

Next, decide the percentage of users to target for each variant, known as the variant weight. By default, 50% of users will be targeted between 2 variants. For example, 50% of users within the 35% of users targeted from the rollout percentage you defined earlier would experience `variantA`. Toggle **Custom percentage** to change the default variant weights.

![You can configure multiple strategy variants for A/B testing within the gradual rollout form.](/img/use-case-variants.png)


### Manage User Session Behavior

Unleash is built to give developers confidence in their ability to run A/B tests effectively. One critical component of implementing A/B testing strategies is maintaining a consistent experience for each user across multiple user sessions.

For example, user `uuid1234` should be the target of `variantA` regardless of their session. The original subset of users that get `variantA` will continue to experience that variation of the feature over time. At Unleash, we call this [stickiness](/reference/stickiness). You can define the parameter of stickiness in the gradual rollout form. By default, stickiness is calculated by `sessionId` and `groupId`.

### Track A/B Testing for your Key Performance Metrics

An A/B testing strategy is most useful when you can track the results of a feature rollout to users. When your team has clearly defined the goals for your A/B tests, you can use Unleash to analyze how results tie back to key metrics, like conversion rates or time spent on a page. One way to collect this data is through enabling impression data per feature flag. [Impression data](/reference/impression-data) contains information about a specific feature flag activation check.

To enable impression data for your rollout, navigate to your feature flag form and turn the toggle on.

![Enable impression data in the strategy rollout form for your flag.](/img/enable-impression-data.png)

Next, in your application code, use the SDK to capture the impression events as they are being emitted in real time.

Now that the application is capturing impression events, you can configure the correct data fields and formatting to send to any analytics tool or data warehouse you use.

Strategy variants are meant to work with impression data. You get the name of the variant sent to your analytics tool, which allows you a better understanding of what happened, rather than seeing a simple true/false from your logs.

Next, in your application code, use the SDK to capture the impression events as they are being emitted in real time. Follow [language and framework-specific tutorials](/languages-and-frameworks) to learn how to capture the events and send them to data analytics and warehouse platforms of your choice. Your client SDK will emit an impression event when it calls `isEnabled` or `getVariant`. Some front-end SDKs emit impression events only when a flag is enabled. You can define custom event types to track specific user actions. If you want to confirm that users from your A/B test have the new feature, Unleash will receive the `isEnabled` event. If you have created variants, the `getVariant` event type will be sent to Unleash.

By enabling impression data for your feature flag and listening to events within your application code, you can leverage this data flowing to your integrated analytics tools to make informed decisions faster and adjust your strategies based on real user behavior.

## A/B Testing with Enterprise Automation

Unleash provides the ability to automate your feature flags using [actions](/reference/actions) and [signals](/reference/signals). When running A/B tests, you can configure your projects to execute tasks in response to application metrics and thresholds you define. If an experimentation feature that targets a part of your user base logs errors, your actions can automatically disable the feature so your team is given the time to triage while still providing a seamless, alternative experience to users. In another case, you can use actions to modify the percentage of users targeted for variations of a feature based off users engaging with one variation more than the other.

A/B tests are performed safely and strategically with extra safeguards when you automate your flags based on user activity and other metrics of your choice.

Learn how to configure [actions](/reference/actions) and [signals](/reference/signals) from our documentation to get started.

### Multi-arm bandit tests to find the winning variant

When running complex multivariate tests with numerous combinations, automating the process of finding the best variation of a feature is the most optimal, cost-effective approach for organizations with a large user base. [Multi-arm bandit tests](https://en.wikipedia.org/wiki/Multi-armed_bandit) are a powerful technique used in A/B testing to allocate traffic to different versions of a feature or application in a way that maximizes the desired outcome, such as conversion rate or click-through rate. This approach offers several advantages over traditional A/B testing, and is a viable solution for large enterprise teams.

The variants you created with Unleash would be the “arms” in the multi-bandit context. You can use a multi-arm bandit algorithm, such as [epsilon-greedy](https://www.geeksforgeeks.org/epsilon-greedy-algorithm-in-reinforcement-learning/) or [Thompson sampling](https://en.wikipedia.org/wiki/Thompson_sampling), to dynamically allocate traffic based on the performance of each variant. Experiment with different variants to gather more information. Allocate more traffic to the variants that seem to be performing better. As the test progresses, the algorithm will adjust the traffic allocation to favor the variants that are showing promising results. Once the test is complete, you can analyze the data to determine the winning variant. By dynamically allocating traffic based on performance, multi-arm bandit tests can identify the winning variant more quickly than traditional A/B testing.

![This is a graph comparing traditional A/B testing and multi-arm bandit selection.](/img/use-case-abvbandit.png)

> [Image Source: Matt Gershoff](https://blog.conductrics.com/balancing-earning-with-learning-bandits-and-adaptive-optimization/)

To use Unleash to conduct a multi-arm bandit test, you will need to:

-   collect the necessary data from each variant’s performance by enabling impression data for your feature flag
-   capture impression events in your application code
-   funnel the impression events captured from your application code to an external analytics tool
-   create signal endpoint(s) in Unleash that will point to your external analytics tools
-   create actions in Unleash that will react to your signals that were integrated

This approach minimizes the "regret" associated with allocating traffic to lower-performing variants. Multi-arm bandit tests using Unleash can adapt to changing conditions, such as seasonal fluctuations or user behavior changes. In some cases, they can be used to ensure that users are not exposed to suboptimal experiences for extended periods.

A/B tests are performed safely and strategically with extra safeguards when you automate your flags based on user activity and other metrics of your choice.

Learn how to configure [actions](/reference/actions) and [signals](/reference/signals) from our documentation to get started.
