---
title: Python Feature Flag Examples
slug: /guides/feature-flag-examples-python
---

In our [Python feature flag tutorial](/guides/implement-feature-flags-in-python), we implemented a simple feature flag that could be turned on and off. In the real world, many feature flag use cases have more nuance than this. This document will walk you through some common examples of using feature flags in Python with some of those more advanced use cases in mind.

We built multiple features into Unleash, an open-source feature flag platform, to address the complexities of releasing code and managing feature flags along the way. This tutorial will explore the following:

-   [Gradual Rollouts for Python Apps](#gradual-rollouts-for-python-apps)
-   [Canary Deployments in Python](#canary-deployments-in-python)
    -   [What is a canary deployment?](#what-is-a-canary-deployment)
    -   [How to do canary deployments with a Python feature flag?](#how-to-do-canary-deployments-with-a-python-feature-flag)
    -   [Configure strategy constraints for canary deployments](#configure-strategy-constraints-for-canary-deployments)
-   [Server-side A/B Testing in Python](#server-side-ab-testing-in-python)
-   [Feature Flag Analytics and Reporting in Python](#feature-flag-analytics-and-reporting-in-python)
    -   [Enable impression data events in Python](#enable-impression-data-events-in-python)
-   [Application Metrics \& Monitoring for Python](#application-metrics--monitoring-for-python)
-   [Feature Flag Audit Logs in Python](#feature-flag-audit-logs-in-python)
-   [Flag Automation \& Workflow Integration for Python Apps](#flag-automation--workflow-integration-for-python-apps)

## Gradual Rollouts for Python Apps

It is common to use feature flags to roll out changes to a percentage of users, and we can use Unleash to do a gradual rollout with a Python-based app.

In our Python tutorial, the flag controls the release of a feature allowing users to delete surveys they create. To further customize that, you can modify the basic setup to adjust the percentage of users who experience this feature with a gradual rollout. The users split between the delete button being visible or not is cached so their user experience will remain consistent.

Navigate to the gradual rollout page where you can edit your strategy.

![The "edit strategy" button uses a pencil icon and is located on every strategy.](/img/react-ex-grad-rollout-edit.png)

Adjust the percentage of users to 50% or whichever value you choose, and refresh your app in the browser to see if your user has the new feature experience. This might take 30 seconds for a server-side app to propagate.

![A gradual rollout form can allow you to customize your flag strategy.](/img/ex-grad-rollout-form.png)

You can achieve this same result using our API with the following code:

```py
import requests
import json

url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies"

payload = json.dumps({
  "name": "flexibleRollout",
  "disabled": False,
  "constraints": [],
  "variants": [],
  "parameters": {
    "groupId": "delete_survey_flag",
    "rollout": "50",
    "stickiness": "sessionId"
  },
  "segments": []
})

headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
```

Learn more about [gradual rollouts in our docs](/concepts/activation-strategies). Also, learn more about our [API for creating a new strategy](/api/update-feature-strategy) for your flag.

## Canary Deployments in Python

### What is a canary deployment?

Canary deployments are a foundational approach for deploying new software versions with high confidence and low risk by exposing the new version to a limited audience. Canary releases are a way to test and release code in different environments for a subset of your audience, which determines which features or versions of the platform people have access to.

### Why use canary deployments?

Canary deployments are a safer and more gradual way to make changes in software development. They help find any abnormalities and align with the agile process for faster releases and quick reversions.

### How to do canary deployments with a Python feature flag?

Feature flags provide the same benefits as canary deployments but with more granular control:

-   Precisely target specific user segments for feature rollouts.

-   Maintain session consistency (stickiness) if needed.

-   Test multiple features independently on different user groups simultaneously.

-   With feature flags, you can separate feature releases from deployments.

Often, canary deployments are managed at the load balancer level while feature flags act at the application level. In some instances, rolling out groups of features together behind a feature flag can serve the purpose of a canary deployment.

Unleash has a few ways to help manage canary deployments for Python apps at scale:

-   Using a [gradual rollout](/concepts/activation-strategies) (which we [implemented in a previous section](#gradual-rollouts-for-python-apps)) would be a simple use case but would reduce the amount of control you have over who gets the new feature.

-   Using either [constraints](/concepts/activation-strategies#constraints) or [segments](/concepts/segments) (which are a collection of constraints) for a subset of your users to get the new feature vs. the old feature, for _more_ control than a gradual rollout

-   [Strategy variants](/concepts/strategy-variants) are used to do the same canary deployment, but can be scaled to more _advanced_ cases. For example, if you have 2+ new features and are testing to see if they are better than the old one, you can use variants to split your population of users and conduct an A/B test with them.

Let’s walk through how to utilize **strategy constraints** in our Python app.

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

```py
import requests
import json

url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/strategies/:strategyId"

payload = json.dumps({
  "name": "flexibleRollout",
  "disabled": False,
  "constraints": [
    {
      "values": [
        "production"
      ],
      "inverted": false,
      "operator": "NOT_IN",
      "contextName": "environment",
      "caseInsensitive": false
    }
],
  "variants": [],
  "parameters": {
    "groupId": "delete_survey_flag",
    "rollout": "50",
    "stickiness": "sessionId"
  },
  "segments": []
})

headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = requests.request("PUT", url, headers=headers, data=payload)

print(response.text)
```

> Note:
> If you already have a gradual rollout strategy for your flag, use a PUT request to update it.
> If you’re creating a new strategy, use a POST request.

Check out our [API docs on updating flag strategies](/api/update-feature-strategy) to learn more.

Read our documentation for more context on [strategy constraint configurations](/concepts/activation-strategies#constraints) and use cases.

## Server-side A/B Testing in Python

A/B testing is a common way for teams to test out how users interact with two or more versions of a new feature that is released. Server-side A/B testing can help with making infrastructure improvements and comparing different versions of server-side methods. At Unleash, we call these [strategy variants](/concepts/strategy-variants).

When a feature flag is enabled, we can expose a particular version of a feature to select user bases. From there, we can use the variants to view the performance metrics in Unleash and see which is more efficient.

In the context of our [Python tutorial](/guides/implement-feature-flags-in-python), let’s say we want to test a new variation of the flag for deleting surveys. In this new variation, we want the UI to remain the same–a delete button that removes a survey–but server-side, we’d like to store the deleted surveys in a new database model so they can be restored if a user decides to.

While we won’t implement all the functionality required to save and restore deleted surveys in this example, we can walk through how to set up variants and where the server-side changes would take place in the Python app.

In Unleash, navigate to your gradual rollout strategy, then ‘Edit Strategy'.

![Add a variant to your gradual rollout strategy.](/img/ex-add-strategy-variant.png)

In the form, add 2 variants:

`store_deleted_surveys` <br /> `permanently_delete_surveys`

![Two variants can be configured in Unleash and saved to your strategy.](/img/python-ex-strategy-variants-form.png)

Alternatively, you can also use a `PATCH` request in Python using our API:

```py
import requests
import json

url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/variants"

payload = json.dumps([
 {
    "op": "replace",
    "path": "/1/name",
    "value": "permanently_delete_surveys"
  },
  {
    "op": "replace",
    "path": "/0/name",
    "value": "store_deleted_surveys"
  }
])
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = requests.request("PATCH", url, headers=headers, data=payload)

print(response.text)
```

Your strategy now has 2 new variants.

![View the 2 feature variants we created in a 50/50 split between your users in the development environment.](/img/python-ex-variants-in-strategy.png)

Now that we have configured our strategy variant, we can reference it in our Python code.

In the `routes.py` file, we can modify the `delete_survey` method to split the user traffic between the 2 variants.

```py
def delete_survey(survey_id):
   delete_survey_flag_variant = client.get_variant("delete_survey_flag")
   if not delete_survey_flag_variant.get("enabled"):
       abort(404, description="Resource not found")
   else:
       delete_survey_flag_variant_name = delete_survey_flag_variant.get("name")

       if delete_survey_flag_variant_name == "store_deleted_surveys":
           # do things here to store in a "deleted survey" table
           print("STATUS: storing in DeletedSurvey table....")
       elif delete_survey_flag_variant_name == "permanently_delete_surveys":
           # remove survey without storing
           print("STATUS: removing survey without storing it....")
           survey = db.get_or_404(Survey, survey_id)
           db.session.delete(survey)
           db.session.commit()

       return redirect(url_for("surveys.surveys_list_page"))
```

We have successfully configured our strategy variant and implemented them into our Python app for server-side A/B testing.

Now, some of the deleted surveys will be stored and the others will be permanently removed from your Survey table. This data can be collected over time for experiments like determining data storage costs and upticks in resource usage before committing to releasing new functionality to restore data that has been deleted.

Next, we can examine how Unleash can track the results and provide insights with data analytics.

## Feature Flag Analytics and Reporting in Python

Shipping code is one thing, but monitoring your applications is another aspect of managing code that developers must account for. Some things to consider would be:

-   Security concerns
-   Performance metrics
-   Tracking user behavior

Unleash was built with all these considerations in mind as part of our feature flag management approach. You can use feature flag events to send impression data to an analytics tool you choose to integrate. For example, a new feature you’ve released could be causing more autoscaling in your service resources than expected, and you can either view that in your Analytics tool or get notified from a Slack integration. Our impression data gives developers a full view of the activity that could raise alarms.

We make it easy to connect feature flag data, your application, and an analytics tool so you can collect, analyze, and report relevant data for your teams.

### Enable impression data events in Python

Let’s walk through how to enable impression data for the feature flag we created from the Python tutorial and capture the data in our app for analytics usage.

At the flag level in Unleash, navigate to the Settings view.

![From your flag page in Unleash, you go to Settings and edit the settings for your flag called 'feature information'.](/img/python-ex-flag-settings.png)

In the Settings view, there's an edit button with pencil icon. This will take us to the ‘Edit Feature flag’ form.

Turn on the impression data and then save it. Events will now be emitted every time the feature flag is triggered.

![There is a flag that turns on the impression data events in your flag form.](/img/python-ex-enable-impression-data.png)

You can also use our API command to enable the impression data:

```py
import requests
import json

url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName"

payload = json.dumps([
 {
    "op": "replace",
    "path": "/impressionData",
    "value": true
  }
])
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = requests.request("PATCH", url, headers=headers, data=payload)

print(response.text)
```

Take a look at our [API docs](/api/patch-feature) to learn more about how to change different flag properties right from your code.

You can use the impression events data from your flag and your strategy variants to send to analytics tools or data warehouses for further use.

You can find more information in our [impression data docs](/concepts/impression-data#impression-event-data).

## Application Metrics & Monitoring for Python

Under your feature flag’s Metrics tab in Unleash, you can see the general activity of the [Flask Surveys Container App](/guides/implement-feature-flags-in-python) tutorial in the development environment over different periods of time. If the app had a production environment enabled, we would also be able to view exposure (amount of users that are exposed to the flag by count and overall percentage) and requests the app is receiving over time.

![A Metrics graph provides the visualization of your flag being exposed in your environments for your connected application.](/img/python-ex-metrics.png)

Our metrics are great for understanding user traffic. You can get a better sense of:

-   What time(s) of the day or week are requests the highest?
-   Which feature flags are the most popular?

Another use case for reviewing metrics is verifying that the right users are being exposed to your feature based on how you’ve configured your strategies and/or variants.

Take a look at our [Metrics API documentation](/api/metrics) to understand how it works from a code perspective.

## Feature Flag Audit Logs in Python

Because a feature flag service controls how an application behaves in production, it can be highly important to have visibility into when changes have been made and by whom. This is especially true in highly regulated environments, such as health care, insurance, banking, and others. In these cases (or similar), you might find audit logging useful for:

1. Organizational compliance
2. Change control

Unleash provides the data to log any change over time at the flag level and at the project level. Logs are useful for downstream data warehouses or data lakes. Tools like [Splunk](https://www.splunk.com/) can help you combine logs and run advanced queries against them.

For our Python app, we can view events in [Event Log](/concepts/events#event-log) to monitor the changes to flag strategies and statuses we have made throughout our examples, such as:

-   When the flag was created
-   How the gradual rollout strategy was configured
-   When and how the variants were created and configured

![Event Log in Unleash tracks every single change made to flags, similar to Git commit history.](/img/python-ex-logs.png)

You can also retrieve events by using the API command below:

```py
import requests

url = "<your-unleash-url>/api/admin/events/:featureName"

payload={}
headers = {
  'Accept': 'application/json',
  'Authorization': '<API_KEY_VALUE>'
}

response = requests.request("GET", url, headers=headers, data=payload)

print(response.text)
```

Read our documentation on [Event Log](/concepts/events#event-log) and [APIs](/api/get-events-for-toggle) to learn more.

## Flag Automation & Workflow Integration for Python Apps

An advanced use case for leveraging feature flags at scale is flag automation in your development workflow. Many organizations use tools like Jira for managing projects and tracking releases across teams. Our [Unleash Jira plugin](/integrate/jira-cloud-plugin-installation) helps to manage feature flag lifecycles associated with your projects.

It’s common for teams to have a development phase, QA/testing, and then a production release. Let’s say the changes we’ve made in our Python project must go through a typical development workflow.

As your code progresses through development and Jira tickets are updated, the relevant flag can turn on in a development environment. The next stage could be Canary deployments for testing code quality in subsequent environments to certain groups, like a QA team or beta users. The flag could be automatically turned on in QA and/or roll out to target audiences in production.

Here’s how this can be done via our API:

1. Enable a flag.

    ```py
    import requests

    url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/on"

    payload={}
    headers = {
    'Accept': 'application/json',
    'Authorization': '<API_KEY_VALUE>'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.text)
    ```

    Review our [API docs on flag enablement](/api/toggle-feature-environment-on).

2. Update a flag.

    ```py
    import requests
    import json

    url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName"

    payload = json.dumps({
    "description": "Controls disabling of the comments section in case of an incident",
    "type": "kill-switch",
    "stale": True,
    "archived": True,
    "impressionData": False
    })
    headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': '<API_KEY_VALUE>'
    }

    response = requests.request("PUT", url, headers=headers, data=payload)

    print(response.text)
    ```

    Review our [API docs on updating feature flags](/api/update-feature).

3. Archive a flag.

    ```py
    import requests

    url = "<your-unleash-url>/api/admin/projects/:projectId/features/:featureName"

    payload={}
    headers = {
    'Authorization': '<API_KEY_VALUE>'
    }

    response = requests.request("DELETE", url, headers=headers, data=payload)

    print(response.text)
    ```

    Review [API docs on archiving flags](/api/archive-feature).

Learn more about different use cases in our [Python SDK documentation](/sdks/python).
