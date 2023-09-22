---
title: Slack App
---

import Figure from '@site/src/components/Figure/Figure.tsx'

:::info Availability

The Slack App integration was introduced in **Unleash 5.5**.

:::

The Slack App integration posts messages to a specified set of channels in your Slack workspace. The channels can be public or private, and can be specified on a per-flag basis by using [Slack tags](#tags).

## Installation {#installation}

To install the Slack App integration, follow these steps:

1. Navigate to the *integrations* page in the Unleash admin UI (available at the URL `/integrations`) and select "configure" on the Slack App integration.
2. On the integration configuration form, use the "install & connect" button.
3. A new tab will open, asking you to select the Slack workspace where you'd like to install the app.
4. After successful installation of the Unleash Slack App in your chosen Slack workspace, you'll be automatically redirected to a page displaying a newly generated access token.
5. Copy this access token and paste it into the `Access token` field within the integration settings.

By default, the Unleash Slack App is granted access to public channels. If you want the app to post messages to private channels, you'll need to manually invite it to each of those channels.

## Configuration {#configuration}

The configuration settings allow you to choose the events you're interested in and whether you want to filter them by projects and environments. You can configure a comma-separated list of channels to post the configured events to. These channels are always notified, regardless of the event type or the presence of [Slack tags](#tags).

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
- feature-environment-variants-updated
- feature-potentially-stale-on

#### Parameters {#parameters}

The Unleash Slack App integration takes the following parameters.

- **Access token** - This is the only required property. After successful installation of the Unleash Slack App in your chosen Slack workspace, you'll be automatically redirected to a page displaying a newly generated access token. You should copy this access token and paste it into this field.
- **Channels** - A comma-separated list of channels to post the configured events to. These channels are always notified, regardless of the event type or the presence of a Slack tag.

## Tags {#tags}

Besides the configured channels, you can choose to notify other channels by tagging your feature flags with Slack-specific tags. For instance, if you want the Unleash Slack App to send notifications to the `#general` channel, add a Slack-type tag with the value "general" (or "#general"; both will work) to your flag. This will ensure that any configured events related to that feature flag will notify the tagged channel in addition to any channels configured on the integration-level.

To exclusively use tags for determining notification channels, you can leave the "channels" field blank in the integration configuration. Since you can have multiple configurations for the integration, you're free to mix and match settings to meet your precise needs. Before posting a message, all channels for that event, both configured and tagged, are combined and duplicates are removed.

<Figure caption="We have defined two Slack tags for the &quot;new-payment-system&quot; flag. In this example Unleash will post updates to the #notifications and #random channels, along with any channels defined in the integration configuration." img="/img/slack-addon-tags.png"/>
