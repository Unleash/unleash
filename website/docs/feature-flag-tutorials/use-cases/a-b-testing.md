---
title: How to do A/B Testing
slug: /feature-flag-tutorials/use-cases/a-b-testing
---

## What is A/B Testing?

**A/B testing** is a randomized controlled experiment where you test two or more versions of a feature to see which version performs better. If you have more than two versions, it's known as multivariate testing. Coupled with analytics, A/B and multivariate testing enable you to better understand your users and how to serve them better.

Feature flags are a great way to run A/B tests to decouple them from your code, and Unleash ships with features to make it easy to get started with. In this tutorial, we will walk through how to do an A/B test using Unleash with your application.

## How to Perform A/B Testing with Unleash

To follow along with this tutorial, you will need an Unleash instance. If you’d prefer to self-host Unleash, read our [Quick Start documentation](/reference/quickstart). Alternatively, if you’d like your project to be hosted by Unleash, go to [www.getunleash.io](https://www.getunleash.io/pricing?_gl=1*1ytmg93*_gcl_au*MTY3MTQxNjM4OS4xNzIxOTEwNTY5*_ga*OTkzMjI0MDMwLjE3MDYxNDc3ODM.*_ga_492KEZQRT8*MTcyNzQzNTQwOS4yMzcuMS4xNzI3NDM1NDExLjU4LjAuMA).

With Unleash set up, you can use your application to talk to Unleash through one of our SDKs.

To conduct an A/B test, we will need to create the feature flag that will implement an activation strategy. In the next section, we will explore what strategies are and how they are configured in Unleash.

In the projects view, the Unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Flag' button to create a new feature flag.

![Create a new feature flag in Unleash.](/img/react-tutorial-create-new-flag.png)

Next, you will create a feature flag on the platform and turn it on for your app.

Flags can be used with different purposes and we consider experimentation important enough to have its own flag type. Experimentation flags have a lifetime expectancy suited to let you run an experiment and gather enough data to know whether it was a success or not. Learn more about [feature flag types](/reference/feature-toggle-types) in our documentation.

The feature flag we are creating is considered an ‘Experimentation’ flag type. The project will be ‘Default’ or the named project in which you are working in for the purpose of this tutorial. As the number of feature flags grows, you can organize them in your projects.

Read our docs on [Projects](/reference/projects) to learn more about how to configure and manage them for your team/organization. A description of the flag can help properly identify its specific purposes. However, this field is optional.

![Create a feature flag by filling out the form fields.](/img/react-tutorial-create-flag-form.png)

Once you have completed the form, you can click ‘Create feature flag’.

Your new feature flag has been created and is ready to be used. Upon returning to your projects view, enable the flag for your development environment, which makes it accessible to use in your app.

![Enable the development environment for your feature flag for use in your application.](/img/tutorial-enable-dev-env.png)

Next, we will configure the A/B testing strategy for your new flag.

### Implementing a Default Activation Strategy for A/B Testing

An important Unleash concept that enables developers to perform an A/B test is an [activation strategy](/reference/activation-strategies). An activation strategy defines who will be exposed to a particular flag or flags. Unleash comes pre-configured with multiple activation strategies that let you enable a feature only for a specified audience, depending on the parameters under which you would like to release a feature.

![Anatomy of an activation strategy](/img/anatomy-of-unleash-strategy.png)

Different strategies use different parameters. Predefined strategies are bundled with Unleash. The default strategy is the gradual rollout strategy with 100% rollout, which basically means that the feature is enabled for all users. In this case, we have only enabled the flag in the development environment for all users in the previous section.

Activation strategies are defined on the server. For server-side SDKs, activation strategy implementation is done on the client side. For frontend SDKs, the feature is calculated on the server side.

There are two more advanced extensions of a default strategy that you will see available to customize in the form:

-   [Strategy Variants](/reference/strategy-variants)
-   [Strategy Constraints](/reference/strategy-constraints)

Variants and constraints are not required for A/B testing. These additional customizations can be built on top of the overall strategy should you need more granular conditions for your feature beyond the rollout percentage.

[Strategy variants](/reference/strategy-variants) can expose a particular version of a feature to select user bases when a flag is enabled. From there, a way to use the variants is to view the performance metrics and see which is more efficient. We can create several variations of this feature to release to users and gather performance metrics to determine which one yields better results.

For A/B testing, _strategy variants_ are most applicable for more granular conditions of a feature release. In the next section, we’ll explore how to apply a strategy variant on top of an A/B test for more advanced use cases.

### Applying Strategy Variants

Using strategy variants in your activation strategy is the canonical way to run A/B tests with Unleash and your application. You can expose a particular version of the feature to select user bases when a flag is enabled. From there, a way to use the variants is to view the performance metrics and see which is more efficient.

A variant has four components that define it:

-   **name**: This must be unique among the strategy's variants. When working with a feature with variants in a client, you will typically use the variant's name to find out which variant it is.
-   **weight**: The weight is the likelihood of any one user getting this specific variant. See the weights section for more info.
-   **value**
-   **(optional) payload**: A variant can also have an associated payload. Use this to deliver more data or context. See the payload section for more details.

While teams may have different goals for measuring performance, Unleash enables you to configure a strategy for the feature variants within your application/service and the platform.

## A/B Testing with Enterprise Security Automation

For large-scale organizations, managing feature flags across many teams can be complex and challenging. Unleash was architected for your feature flag management to be scalable and traceable for enterprises, which boosts overall internal security posture while delivering software efficiently.

After you have implemented an A/B test, we recommend managing it by:

-   Tracking performance of feature releases within your application
-   Reviewing audit logs of each change to your flag configurations over time by project collaborators within your organization, which is exportable for reporting
-   Reviewing and approving change requests to your flags and strategy configurations

Read our documentation on how to effectively manage [feature flags at scale](/topics/feature-flags/best-practices-using-feature-flags-at-scale) while reducing security risks. Let’s walk through these recommended Unleash features in the subsequent sections.

### Enabling Impression Data

Once you have created a feature flag and configured your A/B test, you can use Unleash to collect insights about the ongoing results of the test. One way to collect this data is through enabling [impression data](/reference/impression-data#impression-event-data) per feature flag. Impression data contains information about a specific feature flag activation check. It’s important to review data from an A/B test, as this could inform you on how (and if) users interact with the feature you have released.

Strategy variants are meant to work with impression data. You get the name of the variant to your analytics which allows you a better understanding of what happened, rather than seeing a simple true/false from your logs.

To enable impression data for your flag, navigate to your feature flag form and turn the toggle on.

Next, in your application code, use the SDK to capture the impression events as they are being emitted in real time. Follow [language and framework-specific tutorials](/languages-and-frameworks) to learn how to capture the events and send them to data analytics and warehouse platforms of your choice.

Now that the application is capturing impression events, you can configure the correct data fields and formatting to send to any analytics tool or data warehouse you use.

#### Collect Event Type Data

Your client SDK will emit an impression event when it calls `isEnabled` or `getVariant`. Some front-end SDKs emit impression events only when a flag is enabled.

You can define custom event types to track specific user actions. If you want to confirm that users from your A/B test have the new feature, Unleash will receive the `isEnabled` event. If you have created one or more variations of the same feature, known as strategy variants, the `getVariant` event type will be sent to Unleash.

### Automating A/B Tests with Actions & Signals

Unleash provides the ability to automate your feature flags using [actions](/reference/actions) and [signals](/reference/signals). When running A/B tests, you can configure your projects to execute tasks in response to application metrics and thresholds you define. If an experimentation feature that targets a part of your user base logs errors, your actions can automatically disable the feature so your team is given the time to triage while still providing a seamless, alternative experience to users. In another case, you can use actions to modify the percentage of users targeted for variations of a feature based off users engaging with one variation more than the other.

A/B tests are performed safely and strategically with extra safeguards when you automate your flags based on user activity and other metrics of your choice.

Learn how to configure [actions](/reference/actions) and [signals](/reference/signals) from our documentation to get started.
