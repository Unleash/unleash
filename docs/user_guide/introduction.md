---
id: introduction
title: Introduction
slug: /
---

Welcome to the Unleash getting started guides. We know that getting to know a new solution might be tedious. Our goal with this documentation is to guide you through the most essential concepts of Unleash.

One of the most important aspects of the architecture to understand is that feature toggles are evaluated in a client SDKs which runs as part of your application. This makes toggle evaluations super-fast, but of course it compromises a small update-delay when you change your toggle configurations (in terms of seconds and is configurable).

We recommend that you read about [our unique architecture](https://www.unleash-hosted.com/articles/our-unique-architecture) to understand some of the basics of the architecture.

## Unleash Server

Before you can connect your application to Unleash you need a Unleash server. You have a few options available.

1. [Unleash Open-source - Self-managed](/docs/deploy/getting_started)
2. [Unleash Enterprise - Cloud-hosted](https://www.unleash-hosted.com)
3. [Unleash Enterprise - Self-hosted](https://www.unleash-hosted.com)

## System Overview

Unleash is composed of three parts:

- **Unleash API** - The service holding all feature toggles and their configurations. Configurations declare which activation strategies to use and which parameters they should get.
- **Unleash UI** - The dashboard used to manage feature toggles, define new strategies, look at metrics, etc.
- **Unleash SDK** - Used by clients to check if a feature is enabled or disabled. The SDK also collects metrics and sends them to the Unleash API. Activation Strategies are also implemented in the SDK.

![system_overview](https://raw.githubusercontent.com/Unleash/unleash/master/docs/assets/unleash-diagram.png 'System Overview')

To be super fast (_we talk nano-seconds_), the client SDK caches all feature toggles and their current configuration in memory. The activation strategies are also implemented in the SDK. This makes it really fast to check if a toggle is on or off because it is just a simple function operating on local state, without the need to poll data from the database.
