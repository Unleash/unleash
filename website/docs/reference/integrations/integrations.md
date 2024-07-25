---
id: index
title: Integrations
---
import DocCardList from '@theme/DocCardList';

:::info Availability

Unleash integrations were introduced in _Unleash v3.11.0_.

Integrations were previously known as _addons_.

:::

Unleash integrations allows you to extend Unleash with new functionality and to connect to external applications.

Unleash has two types of integrations: Integrations that allow you to listen to changes in Unleash and trigger updates in other systems (for instance via webhooks or direct integrations) and integrations that communicate with Unleash (such as the Jira integrations).

## Official integrations

Unleash currently supports the following integrations out of the box:

- [Datadog](datadog.md) - Allows Unleash to post Updates to Datadog when a feature flag is updated.
- [Jira Cloud](jira-cloud-plugin-usage.md) - Allows you to create, view and manage Unleash feature flags directly from a Jira Cloud issue
- [Jira Server](jira-server-plugin-usage.md) - Allows you to create and link Unleash feature flags directly from a Jira Server issue
- [Microsoft Teams](teams.md) - Allows Unleash to post updates to Microsoft Teams.
- [Slack App](slack-app.md) - The Unleash Slack App posts messages to the selected channels in your Slack workspace.
- [Webhook](webhook.md) - A generic way to post messages from Unleash to third party services.

:::tip Missing an integration? Request it!

If you're looking for an integration that Unleash doesn't have at the moment, you can fill out this [integration request form](https://docs.google.com/forms/d/e/1FAIpQLScR1_iuoQiKq89c0TKtj0gM02JVWyQ2hQ-YchBMc2GRrGf7uw/viewform) to register it with us.

:::

## Deprecated integrations

These integrations are deprecated and will be removed in a future release:

- [Slack](slack.md) - Allows Unleash to post updates to Slack. Please try the new [Slack App](slack-app.md) integration instead.

## Community integrations

Our wonderful community has also created the following integrations:

- [Fastify feature flags plugin](https://gitlab.com/m03geek/fastify-feature-flags#unleash-provider)
- [Quarkus](https://github.com/quarkiverse/quarkus-unleash)
- [Vue Unleash plugin](https://github.com/crishellco/vue-unleash)

## Integration events

:::info Availability

Integration events were introduced as a beta feature in **Unleash 6.1**.

:::

Integration events in Unleash provide a streamlined way to debug integrations by logging their executions and offering a visual interface for administrators to monitor these events. This feature enhances visibility into the functioning of various integrations, helping to quickly identify and resolve issues.

Integration events are logged for all outgoing integrations configured in Unleash. This includes integrations that send information from Unleash to other systems. Currently supported integrations include:

 - [Datadog](./datadog.md)
 - [Microsoft Teams](./teams.md)
 - New Relic
 - [Slack (deprecated)](./slack.md)
 - [Slack App](./slack-app.md)
 - [Webhook](./webhook.md)

### Viewing integration events

:::info Permissions

Viewing integration events requires the `ADMIN` permission.

:::

On the Integrations page, administrators will notice a new icon at the bottom right of each integration card. This icon indicates the status of the latest integration event:

 - **Green Check Mark**: The event was successful.
 - **Red Exclamation Mark**: The event failed.
 - **Yellow Exclamation Mark**: The event encountered some errors.

Hovering over this icon provides more detailed information about the event. If the icon is not visible, it might be because the integration has not executed yet.

![Icon representing the latest integration event for a specific integration configuration.](/img/integration-events/integration-events-latest.png)

Administrators will also find a new "View events" option in the action menu of the integration cards. Selecting this option displays a list of the latest events, sorted from most recent to oldest. Clicking on an event in the list will display its details on the right side.

Each integration event's detailed view includes comprehensive information about the event's status. This helps administrators investigate and troubleshoot issues effectively. The detailed view encompasses:

 - Details about the integration execution result, which vary depending on the integration. For example, this might include HTTP response status codes from the requests made by the integration.
 - The underlying Unleash event that triggered the integration, which can be expanded to show detailed information.
 - Specific details about the integration execution, which vary depending on the integration. For example, Slack integrations show the message that was sent and the target channels.

Unleash retains only the most recent event for each integration configuration, along with the last 100 events from the past two hours. All other events are automatically deleted.

![Integration events view, with the sorted list on the left side and the detailed view on the right side.](/img/integration-events/integration-events-list-details.png)

## Notes {#notes}

When updating or creating a new integration configuration it can take up to one minute before Unleash picks up the new config on all instances due to caching.

## Integration pages

<DocCardList />
