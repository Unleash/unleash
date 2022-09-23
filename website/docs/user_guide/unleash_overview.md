---
title: Unleash introductory overview
---

One of the most important aspects of the architecture to understand is that feature toggles _are evaluated in a client SDKs_ which runs as part of your application. This makes toggle evaluations super-fast (_we're talking nano-seconds_), scalable and resilient against network disturbances. In order to achieve this Unleash compromises a small update-delay when you change your toggle configurations until it is fully propagated to your application (in terms of seconds and is configurable).

If you want more details you can read about [our unique architecture](https://www.getunleash.io/blog/our-unique-architecture).

### Unleash Server {#unleash-server}

Before you can connect your application to Unleash you need a Unleash server. You have a few options available:

1. **Unleash Open-source**
   - [Docker](../deploy/getting-started.md)
   - [Helm Chart](https://github.com/unleash/helm-charts/)
   - [Click-to-deploy on Heroku](https://www.heroku.com/deploy/?template=https://github.com/Unleash/unleash)
   - [GitLab](https://docs.gitlab.com/ee/operations/feature_flags.html#choose-a-client-library)
2. **Unleash Enterprise**
   - [Hosted Plans](https://www.getunleash.io/plans)
   - [Self-hosted](https://www.getunleash.io/blog/self-host-your-feature-toggle-system)

### System Overview {#system-overview}

![A visual overview of an Unleash system as described in the following paragraph.](/img/unleash-architecture.svg 'System Overview')

- [**The Unleash API**](../api/index.md) - The Unleash instance. This is where you create feature toggles, configure activation strategies, and parameters, etc. The service holding all feature toggles and their configurations. Configurations declare which activation strategies to use and which parameters they should get.
- **The Unleash admin UI** - The bundled web interface for interacting with the Unleash instance. Manage toggles, define strategies, look at metrics, and much more. Use the UI to [create feature toggles](user_guide/create-feature-toggle.md), [manage project access roles](../how-to/how-to-create-and-assign-custom-project-roles.md), [create API tokens](token.mdx), and more.
- [**Unleash SDKs**](sdks/index.md) - Unleash SDKs integrate into your applications and get feature configurations from the Unleash API. Use them to check whether features are enabled or disabled and to send metrics to the Unleash API. [See all our SDKs](sdks/index.md)
- [**The Unleash proxy**](sdks/unleash-proxy.md) - The Unleash proxy sits between front-end and native applications and the Unleash API. You can scale it independently of the Unleash API to handle large request rates without causing issues for the Unleash API.

To be super fast (_we're talking nano-seconds_), the [client SDK](sdks/index.md) caches all feature toggles and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a toggle is on or off because it is just a simple function operating on local state, without the need to poll data from the database.
