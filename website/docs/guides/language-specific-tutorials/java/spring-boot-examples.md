---
title: Java Spring Boot Feature Flag Examples
slug: /guides/feature-flag-examples-spring-boot
---

In our [Java Spring Boot feature flag tutorial](/guides/implement-feature-flags-in-spring-boot), we implemented a simple feature flag that could be turned on and off. In the real world, many feature flag use cases have more nuance than this. This document will walk you through some common examples of using feature flags in Java Spring Boot with some of those more advanced use cases in mind.

We built multiple features into Unleash, an open-source feature flag platform, to address the complexities of releasing code and managing feature flags along the way. This tutorial will explore the following:

-   [Gradual Rollouts for Java Spring Boot Apps](#gradual-rollouts-for-java-spring-boot-apps)
-   [Canary Deployments in Java](#canary-deployments-in-java)
    -   [What is a canary deployment?](#what-is-a-canary-deployment)
    -   [How to do canary deployments with a feature flag in Java?](#how-to-do-canary-deployments-with-a-feature-flag-in-java)
    -   [Configure strategy constraints for canary deployments](#configure-strategy-constraints-for-canary-deployments)
-   [Server-side A/B Testing in Java Spring Boot](#server-side-ab-testing-in-java-spring-boot)
-   [Feature Flag Analytics and Reporting in Java](#feature-flag-analytics-and-reporting-in-java)
-   [Application Metrics \& Monitoring](#application-metrics--monitoring)
-   [Feature Flag Audit Logs in Java](#feature-flag-audit-logs-in-java)
-   [Flag Automation \& Workflow Integration for Java Apps](#flag-automation--workflow-integration-for-java-apps)

## Gradual Rollouts for Java Spring Boot Apps

It is common to use feature flags to roll out changes to a percentage of users, and we can use Unleash to do a gradual rollout with a Java-based app.

In our Spring Boot tutorial, the flag controls the release of a new service implementation on a product page. To further customize that, you can modify the basic setup to adjust the percentage of users who experience this feature with a gradual rollout.

Navigate to the Gradual Rollout page of a flag in Unleash by clicking "Edit strategy".

![Edit your gradual rollout strategy by selecting the 'edit strategy' button.](/img/ex-edit-strategy.png)

Adjust the percentage of users to 50% or whichever value you choose, and refresh your app in the browser to see if your user has the new feature experience. This might take 30 seconds to propagate.

![A gradual rollout form can allow you to customize your flag strategy.](/img/ex-grad-rollout-form.png)

You can achieve this same result using our API:

```java
OkHttpClient client = new OkHttpClient().newBuilder()
  .build();
MediaType mediaType = MediaType.parse("application/json");
RequestBody body = RequestBody.create("{\n  \"name\": \"flexibleRollout\",\n  \"title\": \"",\n  \"disabled\": false,\n  \"sortOrder\": 9999,\n  \"constraints\": [\n    {\n      \"values\": [\n        \"1\",\n        \"2\"\n      ],\n      \"inverted\": false,\n      \"operator\": \"IN\",\n      \"contextName\": \"appName\",\n      \"caseInsensitive\": false\n    }\n  ],\n  \"variants\": [\n    {\n      \"name\": \"blue_group\",\n      \"weight\": 0,\n      \"weightType\": \"fix\",\n      \"stickiness\": \"custom.context.field\",\n      \"payload\": {\n        \"type\": \"json\",\n        \"value\": \"{\\\"color\\\": \\\"red\\\"}\"\n      }\n    }\n  ],\n  \"parameters\": {\n    \"groupId\": \"some_new\",\n    \"rollout\": \"25\",\n    \"stickiness\": \"sessionId\"\n  },\n  \"segments\": [\n    1,\n    2\n  ]\n}", mediaType);
Request request = new Request.Builder()
  .url("<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies")
  .method("POST", body)
  .addHeader("Content-Type", "application/json")
  .addHeader("Accept", "application/json")
  .addHeader("Authorization", "<API_KEY_VALUE>")
  .build();
Response response = client.newCall(request).execute();
```

Learn more about [gradual rollouts in our docs](/reference/activation-strategies). Also, learn more about our [API for creating a new strategy](/api/update-feature-strategy) for your flag.

## Canary Deployments in Java

### What is a canary deployment?

Canary deployments are a foundational approach for deploying new software versions with high confidence and low risk by exposing the new version to a limited audience. Canary releases are a way to test and release code in different environments for a subset of your audience, which determines which features or versions of the platform people have access to.

### Why use canary deployments?

Canary deployments are a safer and more gradual way to make changes in software development. They help find any abnormalities and align with the agile process for faster releases and quick reversions.

### How to do canary deployments with a feature flag in Java?

Feature flags provide the same benefits as canary deployments but with more granular control:

-   Precisely target specific user segments for feature rollouts.

-   Maintain session consistency (stickiness) if needed.

-   Test multiple features independently on different user groups simultaneously.

-   With feature flags, you can separate feature releases from deployments.

Often, canary deployments are managed at the load balancer level while feature flags act at the application level. In some instances, rolling out groups of features together behind a feature flag can serve the purpose of a canary deployment.

Unleash has a few ways to help manage canary deployments for Java apps at scale:

-   Using a [gradual rollout](/reference/activation-strategies) (which we [implemented in a previous section](#gradual-rollouts-for-java-spring-boot-apps)) would be a simple use case but would reduce the amount of control you have over who gets the new feature.

-   Using either [constraints](/reference/activation-strategies#constraints) or [segments](/reference/segments) (which are a collection of constraints) for a subset of your users to get the new feature vs. the old feature, for _more_ control than a gradual rollout

-   [Strategy variants](/reference/strategy-variants) are used to do the same canary deployment, but can be scaled to more _advanced_ cases. For example, if you have 2+ new features and are testing to see if they are better than the old one, you can use variants to split your population of users and conduct an A/B test with them.

Let’s walk through how to use strategy constraints in our Java app.

### Configure strategy constraints for canary deployments

We will build a strategy constraint on our existing gradual rollout strategy. This will allow us to target a subset of users for the rollout.

In Unleash, start from the feature flag view and edit your Gradual Rollout strategy from your development environment.

![Edit your gradual rollout strategy by selecting the 'edit strategy' button.](/img/ex-edit-strategy.png)

This will take you to the gradual rollout form. Next, add a new constraint.

![Add a constraint to your strategy.](/img/ex-add-constraint.png)

Let’s say we are experimenting with releasing the new service implementation to all environments except production to test it with internal users before releasing it to **all** users.

![The new constraint form includes a context field, operator, and values field to customize the conditions under which a user will be exposed to the flag](/img/ex-constraint-page.png)

We can configure the constraint in the form to match these requirements:

-   The context field is set to **environment**
-   The operator is set to **NOT_IN**
-   The value added is **production**

Once you’ve filled out the proper constraint fields, select ‘Done’ and save the strategy.

![Once you add a constraint, you can see it listed underneath your strategy in Unleash.](/img/python-ex-constraint-added.png)

Your release process is now configured with an environment-dependent strategy constraint.

```java
OkHttpClient client = new OkHttpClient().newBuilder()
  .build();
MediaType mediaType = MediaType.parse("application/json");
RequestBody body = RequestBody.create(mediaType, "{\n  \"name\": \"string\",\n  \"sortOrder\": 0,\n  \"constraints\": [\n    {\n      \"contextName\": \"appName\",\n      \"operator\": \"IN\",\n      \"caseInsensitive\": false,\n      \"inverted\": false,\n      \"values\": [\n        \"my-app\",\n        \"my-other-app\"\n      ],\n      \"value\": \"my-app\"\n    }\n  ],\n  \"title\": \"Gradual Rollout 25-Prod\",\n  \"disabled\": false,\n  \"parameters\": {}\n}");
Request request = new Request.Builder()
  .url("<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId")
  .method("PUT", body)
  .addHeader("Content-Type", "application/json")
  .addHeader("Accept", "application/json")
  .addHeader("Authorization", "<API_KEY_VALUE>")
  .build();
Response response = client.newCall(request).execute();
```

> Note:
> If you already have a gradual rollout strategy for your flag, use a PUT request to update it.
> If you’re creating a new strategy, use a POST request.

Check out our [API docs on updating flag strategies](/api/update-feature-strategy) to learn more.

Read our documentation for more context on [strategy constraint configurations](/reference/activation-strategies#constraints) and use cases.

## Server-side A/B Testing in Java Spring Boot

A/B testing is a common way for teams to test out how users interact with two or more versions of a new feature that is released. Server-side A/B testing can help with making infrastructure improvements and comparing different versions of server-side methods. At Unleash, we call these strategy [variants](/reference/feature-toggle-variants).

When a feature flag is enabled, we can expose a particular version of a feature to select user bases. From there, we can use the variants to view the performance metrics in Unleash and see which is more efficient.

In the context of our Java Spring Boot tutorial, we’re going to create a flag and two variants that represent different design implementations of the product page we created in the Pet Clinic application.

In Unleash, navigate to the feature flag Variants tab, then ‘Add variant’.

![Add a variant to your gradual rollout strategy.](/img/ex-add-strategy-variant.png)

In the form, add 2 variants: `productTableVariant` and `productGridVariant`.

![Two variants can be configured in Unleash and saved to your strategy.](/img/spring-boot-ex-variants-form.png)

Your Variant tab now has the new variants we just created with their respective metadata.

![Add a variant to your gradual rollout strategy.](/img/spring-boot-ex-variants.png)

Now that we have configured our variants, we can reference it in our Java code.

We have successfully configured our flag variant and implemented them into our app for server-side A/B testing.

Next, we can examine how Unleash can track the results and provide insights with data analytics.

## Feature Flag Analytics and Reporting in Java

Shipping code is one thing, but monitoring your applications is another aspect of managing code that developers must account for. Some things to consider would be:

-   Security concerns
-   Performance metrics
-   Tracking user behavior

Unleash was built with all these considerations in mind as part of our feature flag management approach. You can use feature flag events to send impression data to an analytics tool.

For example, if a new feature you’ve released causes more autoscaling in your service resources than expected, you can either view that in your analytics tool or get notified from a Slack integration. Our impression data gives developers a full view of the activity that could raise alarms.

Let’s walk through how to enable impression data for the feature flag we created from the Spring Boot tutorial and capture the data in our app for analytics usage.

At the flag level in Unleash, navigate to the Settings view.

![From your flag page in Unleash, you go to Settings and edit the settings for your flag called 'feature information'.](/img/spring-boot-ex-edit-flag.png)

In the Settings view, click on the edit button. This will take us to the ‘Edit Feature flag’ form.

![Enable impression data by turning switching it on in the form.](/img/spring-boot-ex-enable-impression-data.png)

Turn on the impression data and then save it. Events will now be emitted every time the feature flag is triggered.

Take a look at our API docs to learn more about how to change different flag properties right from your code.

You can send the impression events data from your flag and flag variants to analytics tools or data warehouses for further use.

You can find more information in our [impression data docs](/reference/impression-data#impression-event-data).

## Application Metrics & Monitoring

Under your feature flag’s Metrics tab in Unleash, you can see the general activity from the Pet Clinic app tutorial in the development environment over different periods of time. If the app had a production environment enabled, we would also be able to view exposure (amount of users that are exposed to the flag by count and overall percentage) and requests the app is receiving over time.

![A Metrics graph provides the visualization of your flag being exposed in your environments for your connected application.](/img/spring-boot-ex-metrics.png)

Our metrics are great for understanding user traffic. You can get a better sense of:

-   What time(s) of the day or week are requests the highest?
-   Which feature flags are the most popular?

Another use case for reviewing metrics is verifying that the right users are being exposed to your feature based on how you’ve configured your strategies and/or variants.

Take a look at our [Metrics API documentation](/api/metrics) to understand how it works from a code perspective.

## Feature Flag Audit Logs in Java

Because a feature flag service controls how an application behaves in production, it can be important to have visibility into when changes have been made and by whom. This is especially true in highly regulated environments, such as health care, insurance, banking, and others. In these cases (or similar), you might find audit logging useful for:

1. Organizational compliance
2. Change control

Unleash provides the data to log any change over time at the flag level and the project level. Logs are useful for downstream data warehouses or data lakes. Tools like Splunk can help you combine logs and run advanced queries against them.

For our Spring Boot app, we can view events in [Event Log](/reference/events#event-log) to monitor the changes to flag strategies and statuses we have made throughout our examples, such as:

-   When the flag was created
-   How the gradual rollout strategy was configured
-   When and how the variants were created and configured

![Event Log in Unleash tracks every single change made to flags, similar to Git commit history.](/img/spring-boot-events-log.png)

You can also retrieve events by using an API command. Read our documentation on [Event Log](/reference/events#event-log) and [APIs](/api/get-events-for-toggle) to learn more.

## Flag Automation & Workflow Integration for Java Apps

An advanced use case for leveraging feature flags at scale is flag automation in your development workflow. Many organizations use tools like Jira for managing projects and tracking releases across teams. Our [Unleash Jira plugin](/reference/integrations/jira-cloud-plugin-installation) helps to manage feature flag lifecycles associated with your projects.

It’s common for teams to have a development phase, QA/testing, and then a production release. Let’s say the changes we’ve made in our Java project must go through a typical development workflow.

As your code progresses through development and Jira tickets are updated, the relevant flag can turn on in a development environment. The next stage could be Canary deployments for testing code quality in subsequent environments to certain groups, like a QA team or beta users. The flag could be automatically turned on in QA and/or roll out to target audiences in production.

Here’s how this can be done via our API:

1. Enable a flag

```java
OkHttpClient client = new OkHttpClient().newBuilder()
  .build();
MediaType mediaType = MediaType.parse("text/plain");
RequestBody body = RequestBody.create(mediaType, "");
Request request = new Request.Builder()
  .url("<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/on")
  .method("POST", body)
  .addHeader("Accept", "application/json")
  .addHeader("Authorization", "<API_KEY_VALUE>")
  .build();
Response response = client.newCall(request).execute();
```

Review our [API docs on flag enablement](/api/toggle-feature-environment-on).

2. Update a flag

```java
OkHttpClient client = new OkHttpClient().newBuilder()
  .build();
MediaType mediaType = MediaType.parse("application/json");
RequestBody body = RequestBody.create(mediaType, "{\n  \"description\": \"Controls disabling of the comments section in case of an incident\",\n  \"type\": \"kill-switch\",\n  \"stale\": true,\n  \"archived\": true,\n  \"impressionData\": false\n}");
Request request = new Request.Builder()
  .url("<your-unleash-url>/api/admin/projects/:projectId/features/:featureName")
  .method("PUT", body)
  .addHeader("Content-Type", "application/json")
  .addHeader("Accept", "application/json")
  .addHeader("Authorization", "<API_KEY_VALUE>")
  .build();
Response response = client.newCall(request).execute();
```

Review our [API docs on updating feature flags](/api/update-feature).

3. Archive a flag

```java
OkHttpClient client = new OkHttpClient().newBuilder()
  .build();
MediaType mediaType = MediaType.parse("text/plain");
RequestBody body = RequestBody.create(mediaType, "");
Request request = new Request.Builder()
  .url("<your-unleash-url>/api/admin/projects/:projectId/features/:featureName")
  .method("DELETE", body)
  .addHeader("Authorization", "<API_KEY_VALUE>")
  .build();
Response response = client.newCall(request).execute();
```

Review [API docs on archiving flags](/api/archive-feature).

Learn more about different use cases in our [Spring Boot Starter Kit](https://github.com/Unleash/unleash-spring-boot-starter) and [Java SDK](/reference/sdks/java).
