---
id: index
title: Integrations
---

:::info Availability

Unleash integrations were introduced in _Unleash v3.11.0_.

Prior to Unleash 5.x, they were known as _addons_.

:::

Unleash integrations allows you to extend Unleash with new functionality. Currently, integrations allow you to listen to changes in Unleash and trigger updates in other systems, typical via a WebHook.

Currently Unleash support the following integrations out of the box:

- [Webhook](webhook.md) - A generic way to post messages from Unleash to third party services.
- [Slack](slack.md) - Allows Unleash to post updates to Slack.
- [Microsoft Teams](teams.md) - Allows Unleash to post updates to Microsoft Teams.
- [Datadog](datadog.md) -allows Unleash to post Updates to Datadog when a feature toggle is updated.

In future releases we plan to support community built integrations.

### Notes {#notes}

When updating or creating a new integration configuration it can take up to one minute before Unleash picks up the new config on all instances due to caching.
