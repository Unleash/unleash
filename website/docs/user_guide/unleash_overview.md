---
title: Unleash introductory overview
---

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
