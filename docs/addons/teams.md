---
id: teams
title: Microsoft Teams
---

> This feature was introduced in _Unleash v4.0.0_.

The MicrosoftTeams addon allows Unleash to post Updates when a feature toggle is updated. To set up this addon, you need to set up a webhook connector for your channel. You can follow [Creating an Incoming Webhook for a channel](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) on how to do that.

The Microsoft Teams addon will perform a single retry if the HTTP POST against the Microsoft Teams Webhook URL fails (either a 50x or network error). Duplicate events may happen, and you should never assume events always comes in order.

## Configuration

#### Events

You can choose to trigger updates for the following events (we might add more event types in the future):

- feature-created
- feature-updated
- feature-archived
- feature-revived
- feature-stale-on
- feature-stale-off

#### Parameters

Unleash Microsoft Teams addon takes the following parameters.

- **Microsoft Teams Webhook URL** - This is the only required property.

#### Tags

Microsoft teams's incoming webhooks are channel specific. You will be able to create multiple addons to support messaging on multiple channels.
