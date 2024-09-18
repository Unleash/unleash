---
title: How to Perform a Gradual Rollout
slug: /feature-flag-tutorials/use-cases/gradual-rollout
---

## What is a gradual rollout?

A gradual rollout is a controlled release strategy where a new feature is first released to a small subset of users. This allows for monitoring user behavior, identifying potential issues, and gathering feedback before a full-scale launch. It also allows us to experiment quickly and safely.

Unleash is a feature flag management platform that simplifies this process. This controlled approach allows development and operations teams to identify and mitigate risks. By exposing the new feature to a limited audience, potential issues, bugs, or performance bottlenecks can be detected and addressed early on, preventing widespread impact.

Developers also use gradual rollouts to gather user feedback. Early adopters provide valuable insights into user experience, usability, and feature effectiveness, enabling rapid improvements. Gradual rollouts are also significant for testing in production. Real-world usage patterns and performance can be monitored closely, helping to ensure the new release is ready for a broader user base. Managing traffic allows developers to control and gradually increase the number of users exposed to the new feature. This helps to manage system load and prevent performance degradation.

The key benefits of gradual rollouts are that you can experiment rapidly on a controlled group and roll back quickly if the experiment goes wrong. This reduces the risk of failure, improves software quality, improves user experience, and optimizes resource utilization.

## How to Perform a Gradual Rollout with Unleash

In order to set up a gradual rollout, you will need:

1. A place to host a feature flag management service
2. An API Token
3. An application & an Unleash SDK

We are going to walk through these steps to perform a gradual rollout.

## Hosting a feature flag management service

In order to set up your systems to create and manage a gradual rollout, you’ll need to decide where to host a feature flag management service. This is a critical component of creating features that will hide behind a feature flag for a gradual rollout.

There are two primary options for deciding where to host a service:

-   Self-hosted: Deploy Unleash on your infrastructure (e.g., Docker, Kubernetes).
-   Hosted by Unleash

Follow our documentation on [Self-Hosting with Unleash](/using-unleash/deploy/getting-started) to get started using your infrastructure. Alternatively, read our [Quickstart documentation](/quickstart) if you’d like your project to be hosted by Unleash.

With Unleash set up, you can use your application to talk to Unleash through one of our SDKs.

## Setting up your application and Unleash SDK

In order to connect your application to Unleash you will need an SDK (software developer kit) for your programming language. The SDK will handle connecting to the Unleash server instance and retrieving feature flags based on your configuration. All versions of Unleash (OSS, Pro, and Enterprise) use the same client SDKs. Unleash provides official client SDKs for a number of programming languages.

For example, if you are using a JavaScript-based client-side application, you’ll need the JavaScript SDK to install and reference in your application. The code block below displays how the code would look to reference a JavaScript Unleash SDK and a configuration object that includes the URL instance of your Unleash service and the API token that was generated in a previous section.

```javascript
import { Unleash } from "unleash-proxy-client";

const unleash = new Unleash({
    url: "http://localhost:4242/api/frontend",
    appName: "my-app",
    instanceId: "my-instance",
    clientKey: YOUR_API_KEY,
});
```

With your feature flag management service, your application, an API token, and an Unleash SDK added to your application, you are now able to set up and manage a gradual rollout with a feature flag.

## Configuring Gradual Rollouts in Unleash

To perform a gradual rollout, we will need to create the feature flag that will implement the rollout strategy. In the next section, we will explore what strategies are and how they are configured in Unleash.

In the projects view, the Unleash platform shows a list of feature flags that you’ve generated. Click on the ‘New Feature Flag' button to create a new feature flag.

![Create a new feature flag in Unleash for your gradual rollout strategy.](/img/react-tutorial-create-new-flag.png)

Next, you will create a feature flag on the platform and turn it on for your app.

The feature flag we are creating is considered a ‘Release’ flag type. The project will be ‘Default’ or the named project in which you are working in for the purpose of this tutorial. As the number of feature flags grows, you can organize them in your projects. Read our docs on [Projects](/reference/projects) to learn more about how to configure and manage them for your team/organization. A description of the flag can help properly identify its specific purposes. However, this field is optional.

The API Command bar is to the right of the flag form, which gives developers the option to use a curl command to create the flag with all the fields listed in the UI form straight from your terminal on your machine. If you wish to use the API command as an alternative, fill out the form before copying the command as it is automatically updated with the field inputs.

![Fill out the feature flag form.](/img/react-tutorial-create-flag-form.png)

Once you have completed the form, you can click ‘Create feature flag’.

Your new feature flag has been created and is ready to be used. Upon returning to your project’s view, enable the flag for your development environment, which makes it accessible to use in your app.

![Enable the development environment for your feature flag for use in your application.](/img/tutorial-enable-dev-env.png)

Next, we will configure the gradual rollout strategy for your new flag.

## Implementing Gradual Rollout Activation Strategy

Activation strategies let you enable a feature only for a specified audience.

Different strategies use different parameters. Predefined strategies are bundled with Unleash. The default strategy is the gradual rollout strategy with 100% rollout, which basically means that the feature is enabled for all users. In this case, we have only enabled the flag in the development environment for all users in the previous section.

Activation strategies are defined on the server. For server-side SDKs, activation strategy implementation is done on the client side. For frontend SDKs, the feature is calculated on the server side.

You can configure your gradual rollout strategy using the following parameters in Unleash:

-   **rollout percentage** (0-100%) determines the number of users you want to enable the feature flag for
-   **stickiness** is how Unleash guarantees that the same user gets the same features every time. Stickiness is useful when you want to show a feature to only a subset of users. The same `userId` and the same rollout percentage should give predictable results. Configuration that should be supported:
    -   **default** - Unleash chooses the first value present on the context in defined order `userId`, `sessionId`, `random`.
    -   **userId** - guaranteed to be sticky on `userId`. If `userId` is not present, the behavior would be `false`
    -   **sessionId** - guaranteed to be sticky on `sessionId`. If `sessionId` not present the behavior would be `false`.
    -   **random** - no stickiness guaranteed. For every `isEnabled` call it will yield a random `true`/`false` based on the selected rollout percentage.
    -   You can also enable **custom stickiness** by creating a context field for it to use in your gradual rollout. Learn more about [custom stickiness](/reference/stickiness#enabling-custom-stickiness).
    -   **groupId** is used to ensure that different flags will be evaluated differently. The `groupId` defaults to feature flag name, but the user can override it to _correlate rollout_ of multiple feature flags.

![](/img/tutorial-grad-rollout-form.png)

There are two more advanced extensions of the gradual rollout strategy that you will see available to customize in the gradual rollout form:

-   [Strategy Constraints](/reference/strategy-constraints)
-   [Strategy Variants](/reference/strategy-variants)

Constraints and variants are not required for a gradual rollout. These additional customizations can be built on top of the overall rollout strategy should you need more granular conditions for your feature beyond the rollout percentage.

For gradual rollouts, _strategy constraints_ are most applicable for more granular conditions of a feature release.

In the next section, we’ll explore how to apply a strategy constraint on top of a gradual rollout for more advanced use cases.

## Applying Strategy Constraints

When utilizing an activation strategy such as a gradual rollout, it may be necessary to further define which subset of users get access to a feature and when the rollout takes place, depending on the complexity of your use case. Unleash provides [Strategy Constraints](/reference/strategy-constraints) as a way to fine-tune conditions under which a feature flag is evaluated. Within a gradual rollout activation strategy, you can use strategy constraints to, for example:

-   roll out a feature only to users in a specific region
-   schedule a feature to be released at a specific time
-   make a feature available for a limited time only
-   release a feature to users with one of a set of email addresses
-   and any other targeting based on information you know about the user

![](/img/tutorial-constraints-form.png)

Add constraints to refine the rollout based on user attributes, segments, or conditions.

To learn more, read our docs on:

1.  [Strategy Constraints](/reference/strategy-constraints)
2.  [How to add strategy constraints](/how-to/how-to-add-strategy-constraints)

### Define Custom Context Fields for Strategy Constraints

If you want to create new types of constraints that are not built into Unleash, you can create custom context fields and apply them to your constraints. Follow our [how-to guide on creating custom context fields](/how-to/how-to-define-custom-context-fields) to use in your gradual rollout for more advanced use cases.

## Leverage Segments

A segment is a reusable collection of strategy constraints. Like with strategy constraints, you apply segments to feature flag activation strategies.

You can apply the same segment to multiple activation strategies. If you update the segment, the changes will affect every strategy that uses that segment.

Segments let you create user groups based on data available in the Unleash context. These groups can be as simple or as complex as you want to make them. For example, you could use segments to target:

-   Users in a specific region
-   Users on a specific device type
-   Users who signed up before a specific point in time

![](/img/segments-page.png)

Because segments stay in sync across strategies, any changes will propagate to all the activation strategies that use them. This also makes them ideal for use cases such as activating or deactivating multiple feature flags at the same time. You can use segments to:

-   target a consistent group of users across multiple flags based on specific context
-   release one or more new features at a specified time
-   create events with start and end times and guarantee that features will only be active during that period
    -   target the feature flag to specific segments

You must pass the relevant fields in your context in the SDK in order for gradual rollout to work in a predictable way and for any of your constraints or segments to function the way you expect.

By following these steps and leveraging Unleash's features, you can effectively execute and refine gradual rollouts to minimize risks and optimize feature delivery.
