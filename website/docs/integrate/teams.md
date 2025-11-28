---
id: teams
title: Microsoft Teams
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

:::note Availability

**Version**: `4.0+`

:::


The MicrosoftTeams integration allows Unleash to post Updates when a feature flag is updated. To set up this integration, you need to set up a webhook connector for your channel. You can follow [Creating an Incoming Webhook for a channel](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) on how to do that.

The Microsoft Teams integration will perform a single retry if the HTTP POST against the Microsoft Teams Webhook URL fails (either a 50x or network error). Duplicate events may happen, and you should never assume events always comes in order.

## Configuration {#configuration}

#### Events {#events}

You can choose to trigger updates for the following events:

- feature-created
- feature-metadata-updated
- feature-project-change
- feature-archived
- feature-revived
- feature-strategy-update
- feature-strategy-add
- feature-strategy-remove
- feature-stale-on
- feature-stale-off
- feature-environment-enabled
- feature-environment-disabled
- feature-updated (deprecated in v4.3)

#### Parameters {#parameters}

Unleash Microsoft Teams integration takes the following parameters.

- **Microsoft Teams Webhook URL** - This is the only required property.

#### Tags {#tags}

Microsoft teams's incoming webhooks are channel specific. You will be able to create multiple integrations to support messaging on multiple channels.
