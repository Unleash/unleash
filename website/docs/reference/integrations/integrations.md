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

- [Datadog](datadog.md) - Allows Unleash to post Updates to Datadog when a feature toggle is updated.
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

## Notes {#notes}

When updating or creating a new integration configuration it can take up to one minute before Unleash picks up the new config on all instances due to caching.

## Integration pages

<DocCardList />
