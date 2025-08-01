---
id: slack
title: Slack (deprecated)
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="noindex" />

:::caution Deprecation notice

This Slack integration is deprecated and will be removed in a future release. We recommend using the new [App for Slack](./slack-app) integration instead.

:::

:::note Availability

**Version**: `3.11+`

:::


The Slack integration allows Unleash to post Updates when a feature flag is updated. To set up Slack, you need to configure an incoming Slack webhook URL. You can follow [Sending messages using Incoming Webhooks](https://api.slack.com/incoming-webhooks) on how to do that. You can also choose to [create a slack app for Unleash](https://api.slack.com/apps), which will provide you with additional functionality to control how Unleash communicates messages on your Slack workspace.

The Slack integration will perform a single retry if the HTTP POST against the Slack Webhook URL fails (either a 50x or network error). Duplicate events may happen. You should never assume events always comes in order.

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

Unleash Slack integration takes the following parameters.

- **Slack Webhook URL** - This is the only required property. If you are using a Slack Application you must also make sure your application is allowed to post to the channel you want to post to.
- **Username** - Used to override the username used to post the update to a Slack channel.
- **Emoji Icon** - Used to override the emoji icon used to post the update to a Slack channel.
- **Default channel** - Where to post the message if the feature flags has not overridden the channel via the slack tags.

#### Global configuration

- **Unleash URL** - The slack plugin uses the `server.unleashUrl` property to create the link back to Unleash in the posts. This can be set using the **UNLEASH_URL** environment variable or the `server.unleashUrl` property when starting the server from node.

#### Tags {#tags}

The Slack integration also defined the Tag type "slack". You may use this tag to override which Slack channel Unleash should post updates to for this feature flag.

![Slack Tags](/img/slack-addon-tags.png)

In the picture you can see we have defined two slack tags for the "new-payment-system" flag. In this example Unleash will post updates to the **#notifications** and **#random** channel.
