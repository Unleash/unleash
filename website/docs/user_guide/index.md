---
id: index
title: Introduction
slug: /
sidebar_position: 1
---

:::note
The docs are currently undergoing some heavy restructuring and development 👷‍♀️👷🏽 If something is unclear, don't hesitate to [let us know on Slack](https://join.slack.com/t/unleash-community/shared_invite/enQtNjUxMjU2MDc0MTAxLTJjYmViYjkwYmE0ODVlNmY1YjcwZGRmZWU5MTU1YTQ1Nzg5ZWQ2YzBlY2U1MjlmZDg5ZDRmZTMzNmQ5YmEyOGE)!
:::

Welcome to the Unleash documentation, your one-stop shop to everything Unleash. Whether you're just getting started or have been using Unleash for years, you should be able to find answers to all your questions here.

## Getting help

Have questions that you can't find the answer to in these docs? You can always turn to [the Unleash Slack community](https://join.slack.com/t/unleash-community/shared_invite/enQtNjUxMjU2MDc0MTAxLTJjYmViYjkwYmE0ODVlNmY1YjcwZGRmZWU5MTU1YTQ1Nzg5ZWQ2YzBlY2U1MjlmZDg5ZDRmZTMzNmQ5YmEyOGE) and ask us questions directly (or just come and hang out 😄).

## Documentation structure

Our documentation is split into four parts, using the [Diataxis documentation framework](https://diataxis.fr/): documentation, how-to guides, topic guides, and reference documentation.

### Tutorials

New to Unleash? Not sure where to get started? The tutorials guide you through taking your first steps with Unleash.

### How-to guides

Our how-to guides show you how to perform a number of common tasks that you'll want to do. Think of them as recipes. They are more advanced than the tutorials and assume you have some working knowledge of Unleash.

### Topic guides

Topic guides discuss high-level concepts related to Unleash and provide extra background information and explanations around these concepts.

### Reference documentation

The reference docs contain technical reference for Unleash and the API. Go here to find out how Unleash works and what configuration options are available. They're like an Unleash encyclopedia and assume you have a grip on key Unleash concepts.

## Other resources and communities

💻 The core of Unleash is all open source and [hosted on GitHub](https://www.heroku.com/deploy/?template=https://github.com/Unleash/unleash "Unleash on GitHub").

💬 If you've got questions or just wanna chat to the team and other Unleash users, come [join our Slack community](https://join.slack.com/t/unleash-community/shared_invite/enQtNjUxMjU2MDc0MTAxLTJjYmViYjkwYmE0ODVlNmY1YjcwZGRmZWU5MTU1YTQ1Nzg5ZWQ2YzBlY2U1MjlmZDg5ZDRmZTMzNmQ5YmEyOGE)

🐦 You can also follow us [on Twitter](https://twitter.com/getunleash "Unleash on Twitter"), [LinkedIn](https://www.linkedin.com/company/getunleash/ "Unleash on LinkedIn"), or [Instagram](https://www.instagram.com/getunleash/ "Unleash on Instagram") for more updates and extra content.

Our goal with our documentation is to guide you through the most essential concepts of Unleash.

One of the most important aspects of the architecture to understand is that feature toggles _are evaluated in a client SDKs_ which runs as part of your application. This makes toggle evaluations super-fast (_we're talk nano-seconds_), scalable and resilient against network disturbances. In order to achieve this Unleash compromises a small update-delay when you change your toggle configurations until it is fully propagated to your application (in terms of seconds and is configurable).

If you want more details you can read about [our unique architecture](https://www.getunleash.io/blog/our-unique-architecture).

### Unleash Server {#unleash-server}

Before you can connect your application to Unleash you need a Unleash server. You have a few options available:

1. **Unleash Open-source**
   - [Docker](deploy/getting_started)
   - [Helm Chart](https://github.com/unleash/helm-charts/)
   - [Click-to-deploy on Heroku](https://www.heroku.com/deploy/?template=https://github.com/Unleash/unleash)
2. **Unleash Enterprise**
   - [Hosted Plans](https://www.getunleash.io/plans)
   - [Self-hosted](https://www.getunleash.io/blog/self-host-your-feature-toggle-system)

### System Overview {#system-overview}

![system_overview](/img/Unleash_architecture.svg 'System Overview')

- **Unleash API** - The service holding all feature toggles and their configurations. Configurations declare which activation strategies to use and which parameters they should get. [API documentation](/api)
- **Unleash Admin UI** - The dashboard used to manage feature toggles, define new strategies, look at metrics, etc. [Create your first feature toggle](user_guide/create-feature-toggle.md)
- **Unleash SDK** - Used by clients to check if a feature is enabled or disabled. The SDK also collects metrics and sends them to the Unleash API. [See all our SDKs](sdks/index.md)
- **Unleash Proxy** - Sits between frontend/native applications and the Unleash API. Ensures high performance and that you don't expose the full feature toggle configuration to end-users. [Read more about Unleash Proxy](sdks/unleash-proxy.md)

To be super fast (_we're talking nano-seconds_), the [client SDK](sdks/index.md) caches all feature toggles and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a toggle is on or off because it is just a simple function operating on local state, without the need to poll data from the database.
