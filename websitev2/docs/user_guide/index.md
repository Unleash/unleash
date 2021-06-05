---
id: index
title: Introduction
slug: /
sidebar_position: 1
---

Welcome to the Unleash documentation. We know that getting to know a new solution might be tedious. Our goal with our documentation is to guide you through the most essential concepts of Unleash.

One of the most important aspects of the architecture to understand is that feature toggles _are evaluated in a client SDKs_ which runs as part of your application. This makes toggle evaluations super-fast, but of course it compromises a small update-delay when you change your toggle configurations (in terms of seconds and is configurable).

If you want more details you cam read about [our unique architecture](https://www.unleash-hosted.com/articles/our-unique-architecture).

## Unleash Server {#unleash-server}

Before you can connect your application to Unleash you need a Unleash server. You have a few options available:

1. [Unleash Open-source - Self-managed](deploy/getting_started)
2. [Unleash Enterprise - Cloud-hosted](https://www.getunleash.io/plans)
3. [Unleash Enterprise - Self-hosted](https://www.getunleash.io)

## System Overview {#system-overview}

Unleash is composed of the following parts:

- **Unleash API** - The service holding all feature toggles and their configurations. Configurations declare which activation strategies to use and which parameters they should get.
- **Unleash UI** - The dashboard used to manage feature toggles, define new strategies, look at metrics, etc.
- **Unleash SDK** - Used by clients to check if a feature is enabled or disabled. The SDK also collects metrics and sends them to the Unleash API. Activation Strategies are also implemented in the SDK.
- **Unleash Proxy** - Sits between frontend/native applications and the Unleash API. Ensures high performance and that you don't expose the full feature toggle configuration to end-users. [Read more about Unleash Proxy](/sdks/unleash-proxy)

![system_overview](/img/unleash-diagram.png 'System Overview')

To be super fast (_we talk nano-seconds_), the [client SDK](/sdks/index) caches all feature toggles and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a toggle is on or off because it is just a simple function operating on local state, without the need to poll data from the database.
