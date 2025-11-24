---
title: React Feature Flag Examples
slug: /guides/feature-flag-examples-react
---

In our [React tutorial](/guides/implement-feature-flags-in-react), we implemented a simple on/off feature flag. In the real world, many feature flag use cases have more nuance than this. This document will walk you through some common examples of using feature flags in React with some of those more advanced use cases in mind.

Applications evolve, and teams must manage all aspects of this evolution, including the flags used to control the application. We built multiple features into Unleash to address the complexities of releasing code and managing feature flags along the way:

-   [Gradual Rollouts for React Apps](#gradual-rollouts-for-react-apps)
-   [Canary Deployments in React](#canary-deployments-in-react)
    -   [What is a canary deployment?](#what-is-a-canary-deployment)
    -   [Why use canary deployments?](#why-use-canary-deployments)
    -   [How to leverage feature flags for canary deployments in React?](#how-to-leverage-feature-flags-for-canary-deployments-in-react)
    -   [Configure strategy constraints for canary deployments](#configure-strategy-constraints-for-canary-deployments)
-   [A/B Testing in React](#ab-testing-in-react)
-   [Feature Flag Analytics and Reporting in React](#feature-flag-analytics-and-reporting-in-react)
    -   [Enable feature flag impression data](#enable-feature-flag-impression-data)
    -   [Capture impression data for flag analytics](#capture-impression-data-for-flag-analytics)
    -   [Application Metrics \& Monitoring](#application-metrics--monitoring)
-   [Feature Flag Audit Logs in React](#feature-flag-audit-logs-in-react)
-   [Change Management \& Feature Flag Approvals in React](#change-management--feature-flag-approvals-in-react)
-   [Flag Automation \& Workflow Integration for React Apps](#flag-automation--workflow-integration-for-react-apps)
-   [Common Usage Examples of React Feature Flags](#common-usage-examples-of-react-feature-flags)
    -   [`useFlag` example](#useflag-example)
    -   [`useVariant` example](#usevariant-example)
    -   [`useUnleashClient` example](#useunleashclient-example)
    -   [`useUnleashContext` example](#useunleashcontext-example)
    -   [`useFlags` example](#useflags-example)
    -   [`useFlagsStatus` example](#useflagsstatus-example)
-   [Additional Examples](#additional-examples)

## Gradual Rollouts for React Apps

It’s common to use feature flags to roll out changes to a percentage of users. Flags allow you to monitor your application and infrastructure for undesired behavior (such as errors, memory bottlenecks, etc.) and to see if the changes improve the outcomes for your application (to increase sales, reduce support requests, etc.)

Doing a gradual rollout for a React-based application with Unleash is very straightforward. To see this in action, follow our [How to Implement Feature Flags in React](/guides/implement-feature-flags-in-react) tutorial, which implements a notification feature using feature flags.

Once you have completed the tutorial, you can modify the basic setup to adjust the percentage of users who experience this feature with a gradual rollout. The experience that the user is exposed to is cached for consistency.

Navigate to the Gradual Rollout form in Unleash by using the "Edit strategy" button.

![The "edit strategy" button uses a pencil icon and is located on every strategy.](/img/react-ex-grad-rollout-edit.png)

Adjust the percentage of users to 50% or whichever value you choose, and refresh your app in the browser to see if your user has the new feature experience.

![A gradual rollout form can allow you to customize your flag strategy.](/img/ex-grad-rollout-form.png)

You can achieve this same result using our API with the following code:

```
curl --location --request PUT 'http://localhost:4242/api/admin/projects/default/features/newNotificationsBadge/environments/development/strategies/{STRATEGY_ID}' \
    --header 'Authorization: INSERT_API_KEY' \
    --header 'Content-Type: application/json' \
    --data-raw '{
  "name": "flexibleRollout",
  "title": "",
  "constraints": [],
  "parameters": {
    "rollout": "50",
    "stickiness": "default",
    "groupId": "newNotificationsBadge"
  },
  "variants": [],
  "segments": [],
  "disabled": false
}'

```

Learn more about [gradual rollouts in our docs](/reference/activation-strategies.md).

## Canary Deployments in React

### What is a canary deployment?

Canary deployments are a foundational approach for deploying new software versions with high confidence and low risk by exposing the new version to a limited audience. Canary releases are a way to test and release code in different environments for a subset of your audience, which determines which features or versions of the platform people have access to.

### Why use canary deployments?

Canary deployments are a safer and more gradual way to make changes in software development. They help find any abnormalities and align with the agile process for faster releases and quick reversions.

### How to leverage feature flags for canary deployments in React?

Feature flags provide the same benefits as canary deployments but with more granular control:

-   Precisely target specific user segments for feature rollouts.

-   Maintain session consistency (stickiness) if needed.

-   Test multiple features independently on different user groups simultaneously.

-   With feature flags, you can separate feature releases from deployments.

Often, canary deployments are managed at the load balancer level while feature flags act at the application level. In some instances, rolling out groups of features together behind a feature flag can serve the purpose of a canary deployment.

Unleash has a few ways to help manage canary deployments for React apps at scale:

-   Using a [gradual rollout](/reference/activation-strategies) (which we [implemented in a previous section](#gradual-rollouts-for-react-apps)) would be a simple use case but would reduce the amount of control you have over who gets the new feature.

-   Using either [constraints](/reference/activation-strategies#constraints) or [segments](/reference/segments) (which are a collection of constraints) for a subset of your users to get the new feature vs. the old feature, for _more_ control than a gradual rollout

-   [Strategy variants](/reference/strategy-variants) are used to do the same canary deployment, but can be scaled to more _advanced_ cases. For example, if you have 2+ new features and are testing to see if they are better than the old one, you can use variants to split your population of users and conduct an A/B test with them.

Let’s walk through how to utilize strategy constraints in our React app through the Unleash platform.

### Configure strategy constraints for canary deployments

We will build a strategy constraint on top of our existing gradual rollout strategy. This will allow us to target a subset of users to rollout to.

In Unleash, start from the feature flag view and edit your Gradual Rollout strategy from your development environment.

![Configure your gradual rollout strategy with a constraint.](/img/react-ex-grad-rollout-edit.png)

This will take you to the gradual rollout form. Click on the ‘Add constraint’ button.

![You can add a constraint to your flag in the constraints form.](/img/react-ex-add-constraint-btn.png)

Let’s say we are experimenting with releasing the notifications feature for a limited time. We want to release it to **all users**, capture some usage data to compare it to the old experience, and then automatically turn it off.

We can configure the constraint in the form to match these requirements:

![A constraint form has a context field and operator with options to base your context field off of.](/img/react-ex-constraint-form.png)

-   The context field is set to **currentTime**
-   The operator is set to **DATE_BEFORE**
-   The date time is set to any time in the future

Once you’ve filled out the proper constraint fields, click ‘Done’ and save the strategy.

![Your strategy has a constraint saved to it.](/img/react-ex-rollout-with-constraint.png)

Your release process is now configured with a datetime-based strategy constraint.

Alternatively, you can send an API command to apply the same requirements:

```
curl --location --request PUT 'http://localhost:4242/api/admin/projects/default/features/newNotificationsBadge/environments/development/strategies/806ebcbd-bb03-4713-8081-7dca3905e612' \
    --header 'Authorization: INSERT_API_KEY' \
    --header 'Content-Type: application/json' \
    --data-raw '{
  "name": "flexibleRollout",
  "title": "",
  "constraints": [
    {
      "value": "2024-02-27T17:00:00.000Z",
      "values": [],
      "inverted": false,
      "operator": "DATE_BEFORE",
      "contextName": "currentTime",
      "caseInsensitive": false
    }
  ],
  "parameters": {
    "rollout": "50",
    "stickiness": "default",
    "groupId": "newNotificationsBadge"
  },
  "variants": [],
  "segments": [],
  "disabled": false
}'
```

Read our documentation for more context on the robustness of [strategy constraint configurations](/reference/activation-strategies#constraints) and use cases.

## A/B Testing in React

A/B testing is a common way for teams to test out how users interact with two or more versions of a new feature that is released. At Unleash, we call these [variants](/reference/feature-toggle-variants).

We can expose a particular version of the feature to select user bases when a flag is enabled. From there, a way to use the variants is to view the performance metrics and see which is more efficient.

We can create several variations of this feature to release to users and gather performance metrics to determine which one yields better results. While teams may have different goals for measuring performance, Unleash enables you to configure strategy for the feature variants within your application/service and the platform.

In the context of our [React tutorial](/guides/implement-feature-flags-in-react), we have a notifications badge feature that displays in the top navigation menu. To implement feature flag variants for an A/B Test in React, we will set up a variant in the feature flag and use an announcement icon from Material UI to render a different version.

In Unleash, navigate to the feature flag’s Variants tab and add a variant.

![We point to the button in Unleash to add a variant, labeled "add variant".](/img/react-ex-add-variant.png)

In the Variants form, add two variants that will reference the different icons we will render in our app. Name them ‘notificationsIcon’ and ‘announcementsIcon’.

Note: We won’t use any particular payload from these variants other than their default returned objects. For this example, we can keep the variant at 50% weight for each variant, meaning there is a 50% chance that a user will see one icon versus the other. You can adjust the percentages based on your needs, such as making one icon a majority of users would see by increasing its weight percentage. Learn more about [feature flag variant properties](/reference/feature-toggle-variants).

![The form allows you to configure your variant.](/img/react-ex-variant-form.png)

Once you click 'Save variants' at the bottom of the form, your view will display the list of variants in the development environment with their respective metadata.

![Your feature flag view shows that a variant has been added.](/img/react-ex-variant-added.png)

Alternatively, we can create new variants via an API command below:

```
curl --location --request PATCH 'http://localhost:4242/api/admin/projects/default/features/newNotificationsBadge/environments/development/variants' \
    --header 'Authorization: INSERT_API_KEY' \
    --header 'Content-Type: application/json' \
    --data-raw '[
  {
    "op": "replace",
    "path": "/1/name",
    "value": "announcementsIcon"
  },
  {
    "op": "replace",
    "path": "/0/name",
    "value": "notificationsIcon"
  }
]'
```

Now that we have configured our feature flag variants, we can reference them in the React code.

In `NavBar.tsx`, import the Announcements icon at the top of the file from Material UI, just like the Notifications icon.

```js
Announcement as AnnouncementsIcon,
```

The full import line now looks like this:

```js
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Announcement as AnnouncementsIcon,
    AttachMoney as AttachMoneyIcon,
} from "@material-ui/icons";
```

Unleash has a built-in React SDK hook called [useVariant](/reference/sdks/react#check-variants) to retrieve variant data and perform different tasks against them.

Next, import the `useVariant` hook from the React SDK:

```js
import { useFlag, useVariant } from "@unleash/proxy-client-react";
```

`useVariant` returns the name of the specific flag variant your user experiences, if it’s enabled, and if the overarching feature flag is enabled as well.

Within the `NavBar` component itself, we will:

-   Reference the flag that holds the variants
-   Reference the two variants to conditionally check that their enabled status for rendering

Next, we can modify what is returned in the `NavBar` component to account for the two variants the user might see on render.

Previously, we toggled the `NotificationsIcon` component based on whether or not the feature flag was enabled. We’ll take it one step further and conditionally display the icon components based on the feature flag’s variant status:

With our new variants implemented, 50% of users will see the announcements icon. The differences in the UI would look like this:

![We can compare two variations of an icon in the app browser.](/img/react-ex-compare-icons.png)

We have successfully configured our flag variants and implemented them into our React app for A/B testing in our development environment. Next, we can take a look at how Unleash can track the results of A/B testing and provide insights with data analytics.

## Feature Flag Analytics and Reporting in React

Shipping code is one thing, but monitoring our applications is another thing we all have to account for. Some things to consider would be:

-   Security concerns
-   Performance metrics
-   Tracking user behavior

Unleash was built with all of these considerations in mind as part of our feature flag management approach. You can use feature flag events to send impression data to an analytics tool you choose to integrate. For example, a new feature you’ve released could be causing more autoscaling in your service resources than expected and you either can view that in your Analytics tool or get notified from a Slack integration. Our impression data gives developers a full view of the activity that could raise any alarms.

We make it easy to get our data, your application, and an analytics tool connected so you can collect, analyze, and report relevant data for your teams.

Let’s walk through how to enable impression data for the feature flag we created from the React tutorial and capture the data in our app for analytics usage.

### Enable feature flag impression data

At the flag level in Unleash, navigate to the Settings view.

![Editing feature flag settings in Unleash.](/img/react-ex-edit-settings.png)

In the Settings view, click on the edit button. This will take us to the ‘Edit feature flag' form.

![Enabling impression data for a feature flag.](/img/react-ex-enable-impression-data.png)

Turn on the impression data and hit ‘Save’. Events will now be emitted every time the feature flag is triggered.

You can also use our API command to enable the impression data:

```
curl --location --request PATCH 'http://localhost:4242/api/admin/projects/default/features/newNotificationsBadge' \
    --header 'Authorization: INSERT_API_KEY' \
    --header 'Content-Type: application/json' \
    --data-raw '[
  {
    "op": "replace",
    "path": "/impressionData",
    "value": true
  }
]'
```

### Capture impression data for flag analytics

Next, let’s configure our React app to capture the impression events that are emitted when our flag is triggered. To do this, we can import the [useUnleashClient hook from the React SDK](https://github.com/Unleash/proxy-client-react/blob/main/src/useUnleashClient.ts) into our app. This hook allows us to interact directly with the Unleash client to listen for events and log them.

In `NavBar.tsx`, pull in `useUnleashClient`. Our updated import line should look like this:

```js
import {
    useFlag,
    useVariant,
    useUnleashClient,
} from "@unleash/proxy-client-react";
```

Next, within the `NavBar` component itself, call `useUnleashClient` and wrap a `useEffect` hook around our function calls to grab impression data with this code snippet:

```js
const unleashClient = useUnleashClient();

useEffect(() => {
    unleashClient.start();

    unleashClient.on("ready", () => {
        const enabledImpression = unleashClient.isEnabled(
            "newNotificationsBadge"
        );
        console.log(enabledImpression);
    });

    unleashClient.on("impression", (impressionEvent: object) => {
        console.log(impressionEvent);
        // Capture the event here and pass it internal data lake or analytics provider
    });
}, [unleashClient]);
```

This code snippet starts the Unleash client, checks that our flag is enabled, and then stores impression events for your use.

> **Note:** We are passing in unleashClient into the dependency array in useEffect to prevent the app from [unnecessarily mounting the component](https://react.dev/reference/react/useEffect#parameters) if the state of the data it holds has not changed.

Our flag impression data is now being logged!

In your browser, you can view the output for `isEnabled`:

```js
{
    "eventType": "isEnabled",
    "eventId": "b4455218-4a88-43aa-8712-b99186f46548",
    "context": {
        "sessionId": 386689528,
        "appName": "cypress-realworld-app",
        "environment": "default"
    },
    "enabled": true,
    "featureName": "newNotificationsBadge",
    "impressionData": true
}
```

And the console.log for `getVariant` returns:

```js
{
    "eventType": "getVariant",
    "eventId": "c41aa58b-d2c7-45cf-b668-7267f465e01a",
    "context": {
        "sessionId": 386689528,
        "appName": "cypress-realworld-app",
        "environment": "default"
    },
    "enabled": true,
    "featureName": "newNotificationsBadge",
    "impressionData": true,
    "variant": "announcementsIcon"
}
```

You can find more information on `isEnabled` and `getVariant` in our [impression data docs](/reference/impression-data#impression-event-data).

Now that the application is capturing impression events, you can configure the correct data fields and formatting to send to any analytics tool or data warehouse you use.

### Application Metrics & Monitoring

Under the Metrics tab, you can see the general activity of the [Cypress Real World App from our React tutorial](/guides/implement-feature-flags-in-react) in the development environment over different periods of time. If the app had a production environment enabled, we would also be able to view the amount of exposure and requests the app is receiving over time.

![We have a Metrics graph in Unleash to review flag exposure and request rates.](/img/react-ex-metrics.png)

Our metrics are great for understanding user traffic. You can get a better sense of:

-   What time(s) of the day or week are requests the highest?
-   Which feature flags are the most popular?

Another use case for reviewing metrics is verifying that the right users are being exposed to your feature based on how you’ve configured your strategies and/or variants.

Take a look at our [Metrics API documentation](/reference/api/unleash/metrics) to understand how it works from a code perspective.

## Feature Flag Audit Logs in React

Because a Feature Flag service controls the way an application behaves in production, it can be highly important to have visibility into when changes have been made and by whom. This is especially true in highly regulated environments, such as health care, insurance, banking, and others. In these cases (or similar), you might find audit logging useful for:

1. Organizational compliance
2. Change control

Fortunately, this is straightforward in Unleash Enterprise.

Unleash provides the data to log any change that has happened over time, at the flag level from a global level. In conjunction with Unleash, tools like [Splunk](https://www.splunk.com/) can help you combine logs and run advanced queries against them. Logs are useful for downstream data warehouses or data lakes.

For our React tutorial application, we can view events in [Event Log](/reference/events#event-log) to monitor the changes to flag strategies and statuses we have made throughout our examples, such as:

-   When the `newNotificationsBadge` flag was created
-   How the gradual rollout strategy was configured
-   When and how the variants were created and configured

![Feature flag events showing that the flag's variants have been updated.](/img/react-ex-event-log.png)

You can also retrieve events by using the API command below:

```
curl -L -X GET '<your-unleash-url>/api/admin/events/:featureName' \
-H 'Accept: application/json' \
-H 'Authorization: <API_KEY_VALUE>'
```

Read our documentation on [Event Log](/reference/events#event-log) and [APIs](/reference/api/unleash/events) to learn more.

## Change Management & Feature Flag Approvals in React

Unleash makes it easy to toggle a feature. But the more users you have, the more risk with unexpected changes occurring. That’s why we implemented an approval workflow within Unleash Enterprise for making a change to a feature flag. This functions similar to GitHub's pull requests, and models a Git review workflow. You could have one or more approvals required to reduce risk of someone changing something they shouldn’t. It helps development teams to have access only to what they _need_. For example, you can use Unleash to track changes to your React feature flag’s configuration.

In Unleash Enterprise, we have a change request feature in your project settings to manage your feature flag approvals. When someone working in a project needs to update the status of a flag or strategy, they can follow our approval workflow to ensure that one or more team members review the change request.

![Change request configuration page under project settings.](/img/react-ex-project-settings.png)

We have several statuses that indicate the stages a feature flag could be in as it progresses through the workflow. This facilitates collaboration on teams while reducing risk in environments like production. For larger scale change management, you can ensure the correct updates are made while having full visibility into who made the request for change and when.

![Change request waiting for approval. Disables flag CR-toggle-3.](/img/react-ex-change-requests.png)

Learn more about [how to configure your change requests](/reference/change-requests) and our [project collaboration mode](/reference/project-collaboration-mode).

## Flag Automation & Workflow Integration for React Apps

An advanced use case for leveraging feature flags at scale is flag automation in your development workflow. Many organizations use tools like Jira for managing projects and tracking releases across teams. Our [Unleash Jira plugin](/reference/integrations/jira-cloud-plugin-installation) helps to manage feature flag lifecycles associated with your projects.

Let’s say the changes we’ve made in our React tutorial project need to go through a typical development workflow.

As your code progresses through development and Jira tickets are updated, the relevant flag can turn on in a development environment. The next stage could be canary deployments for testing code quality in subsequent environments to certain groups, like a QA team or beta users. The flag could be automatically turned on in QA and rollout and/or rollout to target audiences in production.

You can write your own integration to your own ticketing tool if you don't use Jira. And [join our Slack](https://slack.unleash.run/) to discuss this if you're not sure how to proceed.

Here’s how this can be done via our API:

1. Enable a flag.

    ```
    curl -L -X POST '<your-unleash-url>/api/admin/projects/:projectId/features/:featureName/environments/:environment/on' \
    -H 'Accept: application/json' \
    -H 'Authorization: <API_KEY_VALUE>'
    ```

    Review our [API docs on flag enablement](/reference/api/unleash/toggle-feature-environment-on).

2. Update a flag.

    ```
    curl -L -X PUT '<your-unleash-url>/api/admin/projects/:projectId/features/:featureName' \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Authorization: <API_KEY_VALUE>' \
    --data-raw '{
    "description": "Controls disabling of the comments section in case of an incident",
    "type": "kill-switch",
    "stale": true,
    "archived": true,
    "impressionData": false
    }'
    ```

    And the required body field object would look like this:

    ```js
    {
    "description": "Controls disabling of the comments section in case of an incident",
    "type": "kill-switch",
    "stale": true,
    "archived": true,
    "impressionData": false
    }
    ```

    Review our [API docs on updating feature flags](/reference/api/unleash/update-feature).

3. Archive a flag.

    ```
    curl -L -X DELETE '<your-unleash-url>/api/admin/projects/:projectId/features/:featureName' \
    -H 'Authorization: <API_KEY_VALUE>'
    ```

    Review [API docs on archiving flags](/reference/api/unleash/archive-feature).

## Common Usage Examples of React Feature Flags

To take full advantage of our React SDK, we’ve compiled a list of the most common functions to call in a React app.

| Function                                          | Description                                                                                                                                           | Parameters                 | Output                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------- |
| [`useFlag`](#useflag-example)                     | determines whether or not the flag is enabled                                                                                                         | feature flag name (string) | true, false (boolean)               |
| [`useVariant`](#usevariant-example)               | returns the flag variant that the user falls into                                                                                                     | feature flag name (string) | flag and flag variant data (object) |
| [`useUnleashClient`](#useunleashclient-example)   | listens to client events and performs actions against them                                                                                            | none                       |                                     |
| [`useUnleashContext`](#useunleashcontext-example) | retrieves information related to current flag request for you to update                                                                               | none                       |                                     |
| [`useFlags`](#useflags-example)                   | retrieves a list of all flags within your project                                                                                                     | none                       | an array of each flag object data   |
| [`useFlagsStatus`](#useflagsstatus-example)       | retrieves status information of al flags within your project; tells you whether they have been successfully fetched and whether there were any errors | none                       | an object of flag data              |

### `useFlag` example

```js
const newFeature = useFlag(“newFeatureFlag”);

// output
true
```

### `useVariant` example

```js
const variant = useVariant(“newFeatureFlag”);

// output
{ enabled: true, feature_enabled: true, name: “newVariant” }
```

### `useUnleashClient` example

```js
const unleashClient = useUnleashClient();

unleashClient.start();

unleashClient.on(“ready”, () => {
const impressionEnabled = unleashClient.isEnabled(“newFeatureFlag”);
	// do something here
});

unleashClient.on(“impression”, (events) => {
	console.log(events);
	// do something with impression data here
});
```

### `useUnleashContext` example

```js
const updateContext = useUnleashContext();

useEffect(() => {
    // context is updated with userId
    updateContext({ userId });
}, [userId]);
```

Read more on [Unleash Context](/reference/unleash-context) and the fields you can request and update.

### `useFlags` example

```js
const allFlags = useFlags();

// output
[
    {
        name: "string",
        enabled: true,
        variant: {
            name: "string",
            enabled: false,
        },
        impressionData: false,
    },
    {
        name: "string",
        enabled: true,
        variant: {
            name: "string",
            enabled: false,
        },
        impressionData: false,
    },
];
```

### `useFlagsStatus` example

```js
const flagsStatus = useFlagsStatus();

// output
{ flagsReady: true, flagsError: null }
```

## Additional Examples

Many additional use cases exist for React, including [deferring client start](/reference/sdks/react#deferring-client-start), [usage with class components](/reference/sdks/react#usage-with-class-components), [React Native](/reference/sdks/react#react-native), and more, all of which can be found in our [React SDK documentation](/reference/sdks/react).
