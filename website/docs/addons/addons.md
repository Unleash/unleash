---
id: index
title: Addons
---

> This feature was introduced in _Unleash v3.11.0_.

Unleash Addons allows you to extend Unleash with new functionality. Currently, addons allow you to listen to changes in Unleash and trigger updates in other systems, typical via a WebHook.

Currently Unleash support the following Addons out of the box:

- [Webhook](webhook.md) - A generic way to post messages from Unleash to third party services.
- [Slack](slack.md) - Allows Unleash to post updates to Slack.
- [Microsoft Teams](teams.md) - Allows Unleash to post updates to Microsoft Teams.
- [Datadog](datadog.md) -allows Unleash to post Updates to Datadog when a feature toggle is updated.

In future releases we plan to support community built addons.

### Notes {#notes}

When updating or creating a new addon configuration it can take up to one minute before Unleash picks up the new config on all instances due to caching.
