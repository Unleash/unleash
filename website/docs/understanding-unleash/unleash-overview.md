---
title: Unleash introductory overview
---

One of the most important aspects of the architecture to understand is that feature flags are evaluated in client SDKs which runs as part of your application. This makes flag evaluations super-fast (_we're talking nano-seconds_), scalable and resilient against network disturbances. In order to achieve this Unleash incurs a small update-delay when you change your flag configurations until it is fully propagated to your application (in terms of seconds and is configurable).

If you want more details you can read about [our unique architecture](https://www.getunleash.io/blog/our-unique-architecture).

### Unleash Server {#unleash-server}

Before you can connect your application to Unleash you need a Unleash server. You have a few options available:

1. **Unleash Open-Source**
   - [Docker](../using-unleash/deploy/getting-started.md)
   - [Helm Chart](https://github.com/unleash/helm-charts/)
   - [GitLab](https://docs.gitlab.com/ee/operations/feature_flags.html#choose-a-client-library)
2. **Unleash Enterprise**
   - [Hosted Plans](https://www.getunleash.io/plans)
   - [Self-hosted](https://www.getunleash.io/blog/self-host-your-feature-toggle-system)

### System Overview {#system-overview}

![A visual overview of an Unleash system as described in the following paragraph.](/img/unleash-architecture-edge.png 'System Overview')

- [**The Unleash API**](/reference/api/unleash) - The Unleash instance. This is where you create feature flags, configure activation strategies, and parameters, etc. The service holding all feature flags and their configurations. Configurations declare which activation strategies to use and which parameters they should get.
- **The Unleash admin UI** - The bundled web interface for interacting with the Unleash instance. Manage flags, define strategies, look at metrics, and much more. Use the UI to [create feature flags](how-to/how-to-create-feature-toggles.md), [manage project access roles](../how-to/how-to-create-and-assign-custom-project-roles.md), [create API tokens](how-to/how-to-create-api-tokens.mdx), and more.
- [**Unleash SDKs**](../reference/sdks/index.md) - Unleash SDKs integrate into your applications and get feature configurations from the Unleash API. Use them to check whether features are enabled or disabled and to send metrics to the Unleash API. [See all our SDKs](../reference/sdks/index.md)
- [**The Unleash Edge**](../generated/unleash-edge.md) - The Unleash Edge sits between front-end and native applications and the Unleash API, it can also sit between server-side SDKs and the Unleash API as well. You can scale it independently of the Unleash API to handle large request rates without causing issues for the Unleash API. Edge has all endpoints for the client API, frontend API, and proxy API. 

To be super fast (_we're talking nano-seconds_), the [client SDK](../reference/sdks/index.md) caches all feature flags and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a flag is on or off because it is just a simple function operating on local state, without the need to poll data from the database.
