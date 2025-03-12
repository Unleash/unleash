---
title: Unleash architecture
---

Unleash is designed for privacy, speed, and resilience, enabling feature flag evaluations to happen locally within your applications. The architecture provides:
- **Fast feature flag evaluations**: Feature flags are evaluated within the [SDKs](/reference/sdks) running in your application, making evaluations incredibly fast (nanoseconds).
- **High reliability**: There is no dependency on network calls during evaluation, providing high reliability.
- **Privacy and security**: No user data is shared with the Unleash instance, ensuring [privacy and security](/understanding-unleash/data-collection).

## System Overview

The Unleash system consists of several key components.

![A visual overview of an Unleash system as described in the following paragraph.](/img/unleash-architecture-edge.png)

### The Unleash API

The Unleash API (or Unleash server) is the core service for managing feature flags, configurations, and related concepts. SDKs retrieve [feature flag](/reference/feature-toggles) configurations from the API, determining which flags are enabled and what [activation strategies](/reference/activation-strategies) apply.

### The Unleash Admin UI

A web interface for managing feature flags, defining activation strategies, viewing analytics, configuring access roles, generating API tokens, and more.

![A visual overview of an Unleash system as described in the following paragraph.](/img/unleash-admin-ui.png)

### Unleash SDKs

Unleash provides both [server-side](/reference/sdks#server-side-sdks) and [client-side SDKs](/reference/sdks#client-side-sdks) for integrating feature flagging into your applications. SDKs fetch feature configurations from the Unleash API to check which features are enabled and what activation strategy to use for each feature.

Server-side SDKs run in backend applications and retrieve feature flag configurations via the [Client API](#client-api). Supported languages include: [Node.js](/reference/sdks/node), [Go](/reference/sdks/go), [Java](/reference/sdks/java), [Python](/reference/sdks/python), [.NET](/reference/sdks/dotnet), [PHP](/reference/sdks/php), and more.

Client-side SDKs are used in frontend and mobile applications. They communicate with Unleash through the [Frontend API](#frontend-api). Supported platforms include: [JavaScript](/reference/sdks/javascript-browser), [React](/reference/sdks/react), [iOS](/reference/sdks/ios-proxy), [Android](/reference/sdks/android-proxy), and more.

For improved performance and scalability, SDKs can connect to the [Unleash service](#the-unleash-api) through [Unleash Edge](#unleash-edge) instead of directly using the Frontend and Client APIs.

SDKs cache all feature flag data in memory, applying activation strategies locally. This makes flag evaluation incredibly fast, as it is a simple function operating on local state, without the need to poll data from the database. This architecture results in a small delay (typically a few seconds, but configurable) when propagating configuration changes to your applications.

### Unleash Edge

Unleash Edge is a lightweight caching layer designed to improve scalability, performance, and resilience. It sits between your SDKs and the Unleash API and handles thousands of connected SDKs without increasing the number of requests you make to your Unleash instance.

### Unleash APIs

#### Client API

The [Client API](/reference/api/unleash/client) is the API used by server-side SDKs to fetch feature flag configurations and send usage metrics to Unleash.

#### Frontend API
The [Frontend API](/reference/api/unleash/frontend-api) is the API used by client-side SDKs to retrieve feature flag configurations and send usage metrics to Unleash.

#### Admin API
The [Admin API](/reference/api/unleash) is an API layer for managing all aspects of your Unleash instance, including creating, updating, and deleting resources, such as feature flags, activation strategies, and environments. This API is used by the [Unleash Admin UI](#the-unleash-admin-ui) and other tools and [integrations](/reference/integrations).


## Get started with Unleash

To integrate Unleash, you first need an [Unleash server](#the-unleash-api). You can choose from:
- Unleash Enterprise:
  - [Cloud-hosted plans](https://www.getunleash.io/pricing)
  - [Self-hosted plans](https://www.getunleash.io/pricing)
- Open-source deployment options:
  - [Docker](../using-unleash/deploy/getting-started)
  - [Helm Chart](https://github.com/unleash/helm-charts/)
  - [GitLab](https://docs.gitlab.com/ee/operations/feature_flags.html#choose-a-client-library)

For a deeper dive into Unleash’s architecture, check out this [blog post](https://www.getunleash.io/blog/our-unique-architecture).