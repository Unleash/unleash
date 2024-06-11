---
title: .NET Feature Flag Examples
slug: /feature-flag-tutorials/dotnet/examples
---

In our [.NET feature flag tutorial](/feature-flag-tutorials/dotnet), we implemented a simple feature flag that could be turned on and off. This document will walk you through some common examples of using feature flags in .NET.

We built many features into Unleash, our open-source feature flag platform, to address the complexities of releasing code. This tutorial will explore the following:

-   [Gradual Rollouts for .NET Apps](#gradual-rollouts-for-net-apps)
-   [Canary Deployments in .NET](#canary-deployments-in-net)
    -   [What is a canary deployment?](#what-is-a-canary-deployment)
    -   [How to do canary deployments with a feature flag in .NET?](#how-to-do-canary-deployments-with-a-feature-flag-in-net)
    -   [Configure strategy constraints for canary deployments](#configure-strategy-constraints-for-canary-deployments)
-   [Server-side A/B Testing in .NET](#server-side-ab-testing-in-net)
-   [Feature Flag Analytics and Reporting in .NET](#feature-flag-analytics-and-reporting-in-net)
    -   [Enable impression data events in .NET](#enable-impression-data-events-in-net)
-   [Application Metrics and Monitoring for .NET apps](#application-metrics-and-monitoring-for-net-apps)
-   [Feature Flag Audit Logs in .NET](#feature-flag-audit-logs-in-net)
-   [Flag Automation and Workflow Integration for .NET Apps](#flag-automation-and-workflow-integration-for-net-apps)

## Gradual Rollouts for .NET Apps

It is common to use feature flags to roll out changes to a percentage of users, and we can use Unleash to do that too.

Navigate to the gradual rollout page where you can edit your strategy.

![The "edit strategy" button uses a pencil icon and is located on every strategy.](/img/react-ex-grad-rollout-edit.png)

Adjust the percentage of users to 50% or whichever value you choose, and refresh your app in the browser to see if your user has the new feature experience. This might take 30 seconds for a server-side app to propagate.

![A gradual rollout form can allow you to customize your flag strategy.](/img/ex-grad-rollout-form.png)

You can achieve the same result using our API with the following code:

```csharp
HttpClient client = new HttpClient();

string url = $"{unleashUrl}/api/admin/projects/:{projectId}/features/:{featureName}/environments/:{environment}/strategies";
var payload = new
{
    name = "flexibleRollout",
    disabled = false,
    constraints = new object[] { },
    variants = new object[] { },
    parameters = new
    {
        groupId = "delete_survey_flag",
        rollout = "50",
        stickiness = "sessionId"
    },
    segments = new object[] { }
};

client.DefaultRequestHeaders.Add("Accept", "application/json");
client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

var response = await client.PostAsJsonAsync(url, payload);
var responseBody = await response.Content.ReadAsStringAsync();

Console.WriteLine(responseBody);
```

Learn more about [gradual rollouts in our docs](/reference/activation-strategies). Also, learn more about our [API for creating a new strategy](/reference/api/unleash/update-feature-strategy) for your flags.

## Canary Deployments in .NET

### What is a canary deployment?

Canary deployments are a foundational approach for deploying new software versions with high confidence and low risk by exposing the new version to a limited audience. Canary releases are a way to test and release code in different environments for a subset of your audience, which determines which features or versions of the platform people have access to.

### Why use canary deployments?

Canary deployments are a safer and more gradual way to make changes in software development. They help find any abnormalities and align with the agile process for faster releases and quick reversions.

### How to do canary deployments with a feature flag in .NET?

Feature flags provide the same benefits as canary deployments but with more granular control:

-   Precisely target specific user segments for feature rollouts.

-   Maintain session consistency (stickiness) if needed.

-   Test multiple features independently on different user groups simultaneously.

-   With feature flags, you can separate feature releases from deployments.

Often, canary deployments are managed at the load balancer level while feature flags act at the application level. In some instances, rolling out groups of features together behind a feature flag can serve the purpose of a canary deployment.

Unleash has a few ways to help manage canary deployments for .NET apps at scale:

-   Using a [gradual rollout](/reference/activation-strategies#gradual-rollout) (which we [implemented in a previous section](#gradual-rollouts-for-net-apps)) would be a simple use case but would reduce the amount of control you have over who gets the new feature.

-   Using either [constraints](/reference/strategy-constraints) or [segments](/reference/segments) (which are a collection of constraints) for a subset of your users to get the new feature vs. the old feature, for _more_ control than a gradual rollout

-   [Strategy variants](/reference/strategy-variants) are used to do the same canary deployment, but can be scaled to more _advanced_ cases. For example, if you have 2+ new features and are testing to see if they are better than the old one, you can use variants to split your population of users and conduct an A/B test with them.

Let’s walk through how to utilize **strategy constraints** in our .NET app.

### Configure strategy constraints for canary deployments

We will build a strategy constraint on our existing gradual rollout strategy. This will allow us to target a subset of users for the rollout.

In Unleash, start from the feature flag view and edit your Gradual Rollout strategy from your development environment.

![Edit your gradual rollout strategy by selecting the 'edit strategy' button.](/img/ex-edit-strategy.png)

This will take you to the gradual rollout form. Next, add a new constraint.

![Add a constraint to your strategy.](/img/ex-add-constraint.png)

Let’s say we are experimenting with releasing the “delete” feature to all environments except production to test it with internal users before releasing it to all users.

![The new constraint form includes a context field, operator, and values field to customize the conditions under which a user will be exposed to the flag](/img/ex-constraint-page.png)

We can configure the constraint in the form to match these requirements:

-   The context field is set to **environment**
-   The operator is set to **NOT_IN**
-   The value added is **production**

Once you’ve filled out the proper constraint fields, select ‘Done’ and save the strategy.

![Once you add a constraint, you can see it listed underneath your strategy in Unleash.](/img/python-ex-constraint-added.png)

Your release process is now configured with an environment-dependent strategy constraint. Since we've set the rollout to 100%, the feature will be released to all users that are not in the `production` environment.

Alternatively, you can send an API command to apply the same requirements:

```csharp
HttpClient client = new HttpClient();

string url = $"{unleashUrl}/api/admin/projects/{projectId}/features/{featureName}/environments/{environment}/strategies/{strategyId}";;

var payload = new
{
    name = "flexibleRollout",
    disabled = false,
    constraints = new[]
    {
        new
        {
            values = new[] { "production" },
            inverted = false,
            @operator = "NOT_IN",
            contextName = "environment",
            caseInsensitive = false
        }
    },
    variants = new object[] { },
    parameters = new
    {
        groupId = "delete_survey_flag",
        rollout = "50",
        stickiness = "sessionId"
    },
    segments = new object[] { }
};

client.DefaultRequestHeaders.Add("Accept", "application/json");
client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

var response = await client.PutAsJsonAsync(url, payload);
var responseBody = await response.Content.ReadAsStringAsync();

Console.WriteLine(responseBody);
```

> Note:
> If you already have a gradual rollout strategy for your flag, use a PUT request to update it.
> If you’re creating a new strategy, use a POST request.

Check out our [API docs on updating flag strategies](/reference/api/unleash/update-feature-strategy) to learn more.

Read our documentation for more context on [strategy constraint configurations](/reference/strategy-constraints) and use cases.

## Server-side A/B Testing in .NET

A/B testing is a common way for teams to test out how users interact with two or more versions of a new feature that is released. At Unleash, we call these [strategy variants](/reference/strategy-variants).

When a feature flag is enabled, we can expose a particular version of a feature to a select user base. From there, we can use the variants to view the performance metrics in Unleash and see which is more efficient.

In Unleash, navigate go to a feature flag, then click on an environment to open your strategy.

![Open the strategy menu](../ruby/strategy.png)

Click ‘Edit Strategy'

![Add a variant to your gradual rollout strategy.](/img/ex-add-strategy-variant.png)

Only enable your flag for 50% of users.

![The slider that controls the graduality of the rollout is set to 50%](../ruby/50-gradual.png)

Alternatively, you can do that with a `PUT` request in .NET using our API:

```csharp
HttpClient client = new HttpClient();

string url = $"{unleashUrl}/api/admin/projects/{projectId}/features/{featureName}/environments/{environment}/strategies/{strategyId}";
var payload = new
{
    name = "flexibleRollout",
    title = "",
    constraints = new object[] { },
    parameters = new
    {
        rollout = "50",
        stickiness = "default",
        groupId = ""
    },
    variants = new object[] { },
    segments = new object[] { },
    disabled = false
};

client.DefaultRequestHeaders.Add("Accept", "application/json");
client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

var response = await client.PutAsJsonAsync(url, payload);
var responseBody = await response.Content.ReadAsStringAsync();

Console.WriteLine(responseBody);
```

Now you can do for server-side A/B testing in your .NET app.

Next, we can examine how Unleash can track the results and provide insights with data analytics.

## Feature Flag Analytics and Reporting in .NET

Shipping code is one thing, but monitoring your applications is another aspect of managing code to account for. Some things to monitor could be:

-   Performance metrics
-   Tracking user behavior

Unleash was built with all these considerations in mind. You can use our feature flag events to send impression data to an analytics tool of your choice. For example, if new feature you’ve released causing more autoscaling in your service than expected, then you can either view that in your Analytics tool or get notified from a Slack integration. Our impression data gives developers a full view of the activity that could raise alarms.

We make it easy to connect feature flag data, your application, and an analytics tool so you can collect, analyze, and report relevant data for your teams.

### Enable impression data events in .NET

Let’s walk through how to enable impression data for a feature flag.

At the flag level in Unleash, navigate to the Settings view.

![From your flag page in Unleash, you go to Settings and edit the settings for your flag called 'feature information'.](../ruby/flag-settings.png)

In the Settings view, there's an edit button with pencil icon. This will take us to the ‘Edit Feature flag’ form.

Turn on the impression data and then save it. Events will now be emitted every time the feature flag is triggered.

![There is a flag that turns on the impression data events in your flag form.](../ruby/enable-impression-data.png)

You can also use our API command to enable the impression data:

```csharp
HttpClient client = new HttpClient();

string url = $"{unleashUrl}/api/admin/projects/{projectId}/features/{featureName}";
var payload = new[]
{
    new
    {
        op = "replace",
        path = "/impressionData",
        value = true
    }
};

var jsonPayload = JsonSerializer.Serialize(payload);
var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

client.DefaultRequestHeaders.Add("Accept", "application/json");
client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

var response = await client.PatchAsync(url, content);
var responseBody = await response.Content.ReadAsStringAsync();

Console.WriteLine(responseBody);
```

Take a look at our [API docs](/reference/api/unleash/patch-feature) to learn more about how to change different flag properties right from your code.

You can find more information in our [impression data docs](/reference/impression-data#impression-event-data).

## Application Metrics and Monitoring for .NET apps

Under your feature flag’s Metrics tab in Unleash, you can see the general activity of a flag in the development environment over different periods of time.

If the app had a production environment enabled, we would also be able to view exposure (amount of users that are exposed to the flag by count and overall percentage) and requests the app is receiving over time.

![A Metrics graph provides the visualization of your flag being exposed in your environments for your connected application.](/img/python-ex-metrics.png)

Our metrics are great for understanding user traffic. You can get a better sense of:

-   What time(s) of the day or week are requests the highest?
-   Which feature flags are the most popular?

Another use case for reviewing metrics is verifying that the right users are being exposed to your feature based on how you’ve configured your strategies and/or variants.

Take a look at our [Metrics API documentation](/reference/api/unleash/metrics) to understand how it works from a code perspective.

## Feature Flag Audit Logs in .NET

Because a feature flag service controls how an application behaves in production, it's important to have visibility into when changes have been made and by whom.

This is especially true in very regulated environments like health care, insurance, banking, and others. In these cases (or similar), you might find our audit logs useful for:

1. Organizational compliance
2. Change control

Unleash provides the data to log any change over time at the flag level and at the project level. Logs are useful for downstream data warehouses or data lakes.

You can view Event logs to monitor the changes to flag strategies and statuses, like:

-   When the flag was created
-   How the gradual rollout strategy was configured
-   When and how the variants were created and configured

![Event logs in Unleash track every single change made to flags, similar to Git commit history.](../ruby/event-logs.png)

You can also retrieve event logs by using an API command, like below:

```csharp
HttpClient client = new HttpClient();

string url = $"{unleashUrl}/api/admin/events/:{featureName}";

client.DefaultRequestHeaders.Add("Accept", "application/json");
client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

var response = await client.GetAsync(url);
var responseBody = await response.Content.ReadAsStringAsync();

Console.WriteLine(responseBody);
```

Read our documentation on [Event logs](/reference/event-log) and [APIs](/reference/api/unleash/get-events-for-toggle) to learn more.

## Flag Automation and Workflow Integration for .NET Apps

An advanced use case for leveraging feature flags at scale is automating them as part of your development workflow.

It’s common for teams to have a development phase, then QA/testing, and then a production release. Our [Unleash Jira plugin](https://docs.getunleash.io/reference/integrations/jira-cloud-plugin-installation) can connect to your Jira server or cloud to create feature flags automatically during the project phases.

As your code progresses through development and Jira tickets are updated, the relevant flag can turn on in a development environment. The next stage could be Canary deployments for testing with certain groups, like a QA team or beta users. The flag could be automatically turned on in QA and/or rolled out to target audiences in production.

Here’s how this can be done via our API:

1. Enable a flag.

    ```csharp
        HttpClient client = new HttpClient();
        string url = $"{unleashUrl}/api/admin/projects/:{projectId}/features/:{featureName}/environments/:{environment}/on";

        client.DefaultRequestHeaders.Add("Accept", "application/json");
        client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

        var response = await client.PostAsync(url, null);
        var responseBody = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseBody);
    ```

    Review our [API docs on flag enablement](/reference/api/unleash/toggle-feature-environment-on).

2. Update a flag.

    ```csharp
        HttpClient client = new HttpClient();

        string url = $"{unleashUrl}/api/admin/projects/:{projectId}/features/:{featureName}";
        var payload = new
        {
            description = "Controls disabling of the comments section in case of an incident",
            type = "kill-switch",
            stale = true,
            archived = true,
            impressionData = false
        };

        client.DefaultRequestHeaders.Add("Accept", "application/json");
        client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

        var response = await client.PutAsJsonAsync(url, payload);
        var responseBody = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseBody);
    ```

    Review our [API docs on updating feature flags](/reference/api/unleash/update-feature).

3. Archive a flag.

    ```csharp
        HttpClient client = new HttpClient();

        string url = $"{unleashUrl}/api/admin/projects/:{projectId}/features/:{featureName}";

        client.DefaultRequestHeaders.Add("Authorization", "<API_KEY_VALUE>");

        var response = await client.DeleteAsync(url);
        var responseBody = await response.Content.ReadAsStringAsync();

        Console.WriteLine(responseBody);
    ```

    Review [API docs on archiving flags](/reference/api/unleash/archive-feature).

Learn more about different use cases in our [.NET SDK documentation](/reference/sdks/dotnet).
