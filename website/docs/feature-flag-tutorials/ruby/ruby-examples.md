---
title: Ruby Feature Flag Examples
slug: /feature-flag-tutorials/ruby/examples
---

In our [Ruby feature flag tutorial](/feature-flag-tutorials/ruby), we implemented a simple feature flag that could be turned on and off. This document will walk you through some common examples of using feature flags in Ruby.

We built many features into Unleash, our open-source feature flag platform, to address the complexities of releasing code. This tutorial will explore the following:

- [Gradual Rollouts for Ruby Apps](#gradual-rollouts-for-ruby-apps)
- [Canary Deployments in Ruby](#canary-deployments-in-ruby)
  - [What is a canary deployment?](#what-is-a-canary-deployment)
  - [How to do canary deployments with a feature flag in Ruby?](#how-to-do-canary-deployments-with-a-feature-flag-in-ruby)
  - [Configure strategy constraints for canary deployments](#configure-strategy-constraints-for-canary-deployments)
- [Server-side A/B Testing in Ruby](#server-side-ab-testing-in-ruby)
- [Feature Flag Analytics and Reporting in Ruby](#feature-flag-analytics-and-reporting-in-ruby)
  - [Enable impression data events in Ruby](#enable-impression-data-events-in-ruby)
- [Application Metrics \& Monitoring for Ruby apps](#application-metrics--monitoring-for-ruby-apps)
- [Feature Flag Audit Logs in Ruby](#feature-flag-audit-logs-in-ruby)
- [Flag Automation \& Workflow Integration for Ruby Apps](#flag-automation--workflow-integration-for-ruby-apps)
- [Common Usage Examples for Ruby Feature Flags](#common-usage-examples-for-ruby-feature-flags)
  - [`is_enabled` example](#is_enabled-example)
  - [`get_variant` example](#get_variant-example)
  - [Initialization](#initialization)

> Note:
> We're using the `httpx` gem to make sending requests easier.

## Gradual Rollouts for Ruby Apps

It is common to use feature flags to roll out changes to a percentage of users, and we can use Unleash to do that too.

Navigate to the gradual rollout page where you can edit your strategy.

![The "edit strategy" button uses a pencil icon and is located on every strategy.](/img/react-ex-grad-rollout-edit.png)

Adjust the percentage of users to 50% or whichever value you choose, and refresh your app in the browser to see if your user has the new feature experience. This might take 30 seconds for a server-side app to propagate.

![A gradual rollout form can allow you to customize your flag strategy.](/img/ex-grad-rollout-form.png)

You can achieve the same result using our API with the following code:

```ruby
require 'json'
require 'httpx'

url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies"
payload = {
  name: "flexibleRollout",
  disabled: false,
  constraints: [],
  variants: [],
  parameters: {
    groupId: "delete_survey_flag",
    rollout: "50",
    stickiness: "sessionId"
  },
  segments: []
}.to_json

headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = HTTPX.post(url, headers: headers, body: payload)
puts response.body
```

Learn more about [gradual rollouts in our docs](/reference/activation-strategies). Also, learn more about our [API for creating a new strategy](/reference/api/unleash/update-feature-strategy) for your flags.

## Canary Deployments in Ruby

### What is a canary deployment?

Canary deployments are a way to test and release code in different environments for a subset of your audience.

### How to do canary deployments with a feature flag in Ruby?

Canary deployments help find abnormalities, and align with the agile process for faster releases. And quick reversions, if necessary.

Unleash has a few ways to help manage canary deployments for Ruby apps at scale:

-   Using a [gradual rollout](/reference/activation-strategies#gradual-rollout) (which we implemented in the [previous section](#gradual-rollouts-for-ruby-apps)) would be a simple use case but would reduce the amount of control you have over who gets the new feature.

-   [Strategy constraints](/reference/strategy-constraints) or [segments](/reference/segments) (which are a collection of constraints) to determine which user receives which version for more control than a gradual rollout.

-   [Strategy variants](/reference/strategy-variants) for more advanced use cases. For example, if you want to test 2 different versions of a feature, you can use a strategy variant to split your population of users and conduct an A/B test with them.

Let’s walk through how to utilize **strategy constraints** in our Ruby app.

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

```ruby
require 'json'
require 'httpx'

url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId"
payload = {
  name: "flexibleRollout",
  disabled: false,
  constraints: [
    {
      values: ["production"],
      inverted: false,
      operator: "NOT_IN",
      contextName: "environment",
      caseInsensitive: false
    }
  ],
  variants: [],
  parameters: {
    groupId: "delete_survey_flag",
    rollout: "50",
    stickiness: "sessionId"
  },
  segments: []
}.to_json

headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = HTTPX.put(url, headers: headers, body: payload)
puts response.body
```

> Note:
> If you already have a gradual rollout strategy for your flag, use a PUT request to update it.
> If you’re creating a new strategy, use a POST request.

Check out our [API docs on updating flag strategies](/reference/api/unleash/update-feature-strategy) to learn more.

Read our documentation for more context on [strategy constraint configurations](/reference/strategy-constraints) and use cases.

## Server-side A/B Testing in Ruby

A/B testing is a common way for teams to test out how users interact with two or more versions of a new feature that is released. At Unleash, we call these [strategy variants](/reference/strategy-variants).

When a feature flag is enabled, we can expose a particular version of a feature to a select user base. From there, we can use the variants to view the performance metrics in Unleash and see which is more efficient.

In Unleash, navigate go to a feature flag, then click on an environment to open your strategy.

![Open the strategy menu](./strategy.png)

Click ‘Edit Strategy'

![Add a variant to your gradual rollout strategy.](/img/ex-add-strategy-variant.png)

Only enable your flag for 50% of users.

![The slider that controls the graduality of the rollout is set to 50%](./50-gradual.png)

Alternatively, you can do that with a `PUT` request in Ruby using our API:

```ruby
require 'json'
require 'httpx'

url = "<your-unleash-url>/api/admin/projects/<your-project-id>/features/<your-feature-flag>/environments/<your-environment>/strategies/3a76899f-582b-422f-be72-34c995388f77"
payload = {
  name: "flexibleRollout",
  title: "",
  constraints: [],
  parameters: {
    rollout: "50",
    stickiness: "default",
    groupId: ""
  },
  variants: [],
  segments: [],
  disabled: false
}.to_json

headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = HTTPX.put(url, headers: headers, body: payload)
puts response.body
```

Now you can do for server-side A/B testing in your Ruby app.

Next, we can examine how Unleash can track the results and provide insights with data analytics.

## Feature Flag Analytics and Reporting in Ruby

Shipping code is one thing, but monitoring your applications is another aspect of managing code to account for. Some things to monitor could be:

-   Security vulnerabilities
-   Performance metrics
-   Tracking user behavior

Unleash was built with all these considerations in mind. You can use our feature flag events to send impression data to an analytics tool of your choice. For example, if new feature you’ve released causing more autoscaling in your service than expected, then you can either view that in your Analytics tool or get notified from a Slack integration. Our impression data gives developers a full view of the activity that could raise alarms.

We make it easy to connect feature flag data, your application, and an analytics tool so you can collect, analyze, and report relevant data for your teams.

### Enable impression data events in Ruby

Let’s walk through how to enable impression data for a feature flag.

At the flag level in Unleash, navigate to the Settings view.

![From your flag page in Unleash, you go to Settings and edit the settings for your flag called 'feature information'.](./flag-settings.png)

In the Settings view, there's an edit button with pencil icon. This will take us to the ‘Edit Feature toggle’ form.

Turn on the impression data and then save it. Events will now be emitted every time the feature flag is triggered.

![There is a toggle that turns on the impression data events in your flag form.](./enable-impression-data.png)

You can also use our API command to enable the impression data:

```ruby
require 'json'
require 'httpx'

url = "<your-unleash-url>/api/admin/projects/<your-project-id>/features/<your-feature-flag>"

payload = [
  {
    op: "replace",
    path: "/impressionData",
    value: true
  }
].to_json

headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = HTTPX.patch(url, headers: headers, body: payload)
puts response.body
```

Take a look at our [API docs](/reference/api/unleash/patch-feature) to learn more about how to change different flag properties right from your code.

You can find more information in our [impression data docs](/reference/impression-data#impression-event-data).

## Application Metrics & Monitoring for Ruby apps

Under your feature flag’s Metrics tab in Unleash, you can see the general activity of a flag in the development environment over different periods of time.

If the app had a production environment enabled, we would also be able to view exposure (amount of users that are exposed to the flag by count and overall percentage) and requests the app is receiving over time.

![A Metrics graph provides the visualization of your flag being exposed in your environments for your connected application.](/img/python-ex-metrics.png)

Our metrics are great for understanding user traffic. You can get a better sense of:

-   What time(s) of the day or week are requests the highest?
-   Which feature flags are the most popular?

Another use case for reviewing metrics is verifying that the right users are being exposed to your feature based on how you’ve configured your strategies and/or variants.

Take a look at our [Metrics API documentation](/reference/api/unleash/metrics) to understand how it works from a code perspective.

## Feature Flag Audit Logs in Ruby

Because a feature flag service controls how an application behaves in production, it's important to have visibility into when changes have been made and by whom.

This is especially true in very regulated environments like health care, insurance, banking, and others. In these cases (or similar), you might find our audit logs useful for:

1. Organizational compliance
2. Change control

Unleash provides the data to log any change over time at the flag level and at the project level. Logs are useful for downstream data warehouses or data lakes.

You can view Event logs to monitor the changes to flag strategies and statuses, like:

-   When the flag was created
-   How the gradual rollout strategy was configured
-   When and how the variants were created and configured

![Event logs in Unleash track every single change made to flags, similar to Git commit history.](./event-logs.png)

You can also retrieve event logs by using an API command, like below:

```ruby
require 'httpx'

url = "<your-unleash-url>/api/admin/events/:featureName"
payload = {}
headers = {
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = HTTPX.get(url, headers: headers)
puts response.body
```

Read our documentation on [Event logs](/reference/event-log) and [APIs](/reference/api/unleash/get-events-for-toggle) to learn more.

## Flag Automation & Workflow Integration for Ruby Apps

An advanced use case for leveraging feature flags at scale is automating them as part of your development workflow.

It’s common for teams to have a development phase, then QA/testing, and then a production release. Our [Unleash Jira plugin](https://marketplace.atlassian.com/apps/1227377/unleash-for-jira?tab=overview&hosting=datacenter) can connect to your Jira server or cloud to create feature flags automatically during the project phases.

As your code progresses through development and Jira tickets are updated, the relevant flag can turn on in a development environment. The next stage could be Canary deployments for testing with certain groups, like a QA team or beta users. The flag could be automatically turned on in QA and/or rolled out to target audiences in production.

Here’s how this can be done via our API:

1. Enable a flag.

    ```ruby
      require 'httpx'

      url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/on"
      payload = {}
      headers = {
        'Accept': 'application/json',
        'Authorization': '<API_KEY_VALUE>'
      }

      response = HTTPX.post(url, headers: headers)
      puts response.body
    ```

    Review our [API docs on flag enablement](/reference/api/unleash/toggle-feature-environment-on).

2. Update a flag.

    ```ruby
    require 'json'
    require 'httpx'

    url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName"
    payload = {
      description: "Controls disabling of the comments section in case of an incident",
      type: "kill-switch",
      stale: true,
      archived: true,
      impressionData: false
    }.to_json

    headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': '<API_KEY_VALUE>'
    }

    response = HTTPX.put(url, headers: headers, body: payload)
    puts response.body
    ```

    Review our [API docs on updating feature flags](/reference/api/unleash/update-feature).

3. Archive a flag.

    ```ruby
    require 'httpx'

    url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName"
    payload = {}
    headers = {
      'Authorization': '<API_KEY_VALUE>'
    }

    response = HTTPX.delete(url, headers: headers)
    puts response.body
    ```

    Review [API docs on archiving flags](/reference/api/unleash/archive-feature).

## Common Usage Examples for Ruby Feature Flags

We’ve compiled a list of the most common functions to call with our Ruby SDK.

| Method                                            | Description                                       | Parameters                 | Output                         |
| ------------------------------------------------- | ------------------------------------------------- | -------------------------- | ------------------------------ |
| [`is_enabled`](#is_enabled-example)               | determines whether or not the flag is enabled     | feature flag name (string) | `True`, `False` (Boolean)      |
| [`get_variant`](#get_variant-example)             | returns the flag variant that the user falls into | feature flag name (string) | flag and variant data (object) |
| [`initialize_client`](#initialize_client-example) | starts UnleashClient                              | none                       |                                |

### `is_enabled` example

```ruby
flag = client.is_enabled?("feature_flag_name")
return flag

# output
true
```

### `get_variant` example

```ruby
variant = client.get_variant?("feature_flag_name")
return variant

# output
{'name': 'feature_flag_name', 'weightType': 'fix', 'enabled': true, 'feature_enabled': true}
```

### Initialization

```ruby
client = Unleash::Client.new(
    url="<your-unleash-url>",
    app_name="APP NAME",
    custom_http_headers:{'Authorization': '<API_TOKEN>'})
```

Learn more about different use cases in our [Ruby SDK documentation](/reference/sdks/ruby).
