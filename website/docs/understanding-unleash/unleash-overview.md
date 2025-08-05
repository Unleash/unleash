---
title: Unleash architecture overview
pagination_next: understanding-unleash/the-anatomy-of-unleash
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

Unleash is designed for privacy, speed, and resilience, enabling feature flag evaluations to occur locally within your applications. The architecture provides:
- **Fast feature flag evaluations**: Feature flags are evaluated within the [SDKs](#unleash-sdks) or [Unleash Edge](#unleash-edge), making evaluations incredibly fast (nanoseconds).
- **Privacy and security**: No user data is shared with the Unleash server, ensuring [privacy and security](/understanding-unleash/data-collection).
- **High reliability**: SDKs cache feature flag data in memory, providing high reliability.

## System Overview

The Unleash system consists of several key components.

![A visual overview of an Unleash system as described in the following paragraph.](/img/unleash-architecture-edge.png)

### The Unleash API server

The Unleash API server is the core service for managing feature flags, configurations, and related concepts. It provides SDKs with all the data needed to work with feature flags and their [activation strategies](/reference/activation-strategies).

### The Unleash Admin UI

A web interface for managing feature flags, defining activation strategies, viewing analytics, configuring access roles, generating API tokens, and more.

![A visual overview of an Unleash system as described in the following paragraph.](/img/unleash-admin-ui.png)

### Unleash SDKs

Unleash provides both [backend](/reference/sdks#backend-sdks) and [frontend SDKs](/reference/sdks#frontend-sdks) for integrating feature flagging into your applications. SDKs fetch data from the Unleash API to check which feature flags are enabled. Backend SDKs fetch all feature flag configuration data and perform the evaluation locally, while frontend SDKs fetch evaluated feature flags only.

#### Backend SDKs

Backend SDKs run in backend applications and retrieve feature flag configurations using the [Client API](#client-api) either from Unleash server or [Unleash Edge](#unleash-edge).

Backend SDKs cache all feature flag data in memory, applying activation strategies locally. This makes flag evaluation incredibly fast, as it is a simple function operating on local state, without the need to poll data from the database. This architecture results in a small delay (typically a few seconds, but configurable) when propagating configuration changes to your applications.

Supported languages include: [Node.js](/reference/sdks/node), [Go](/reference/sdks/go), [Java](/reference/sdks/java), [Python](/reference/sdks/python), [.NET](/reference/sdks/dotnet), [PHP](/reference/sdks/php), and more.

#### Frontend SDKs

Frontend SDKs are used in frontend and mobile applications. They communicate with Unleash or [Unleash Edge](#unleash-edge) through the [Frontend API](#frontend-api). 

Unlike backend SDKs, frontend SDKs do not perform the flag evaluation locally. Instead, they fetch all enabled feature flags for a given [Unleash Context](/reference/unleash-context). The flag evaluation happens inside [Unleash Edge](#unleash-edge), or within the Unleash server. Frontend SDKs cache evaluated feature flags in memory using a single evaluation call to the server, making flag evaluation secure, fast, and efficient.

Supported platforms include: [JavaScript](/reference/sdks/javascript-browser), [React](/reference/sdks/react), [iOS](/reference/sdks/ios), [Android](/reference/sdks/android), and more.

### Flag evaluation

The following table outlines where flag evaluation happens with different SDK setups.

| SDK setup                          | Feature flag evaluation                                      |
|------------------------------------|--------------------------------------------------|
| Backend SDK + Unleash      | Performed **locally** within the SDK. |
| Backend SDK + Unleash Edge | Performed **locally** within the SDK. |
| Frontend SDK + Unleash      | Performed by the **Unleash server**. |
| Frontend SDK + Unleash Edge | Performed by **Unleash Edge**. |

Flag evaluation relies on the [Unleash Context](/reference/unleash-context) and may involve user data. Since backend SDKs always perform local evaluation, your user data remains within your application and is never shared with the Unleash server.

For frontend SDKs, you can use Unleash Edge for flag evaluation to ensure that user data is not shared with the Unleash server. You have different [hosting options](/understanding-unleash/hosting-options) for both Unleash and Unleash Edge allowing you to meet any privacy requirements.

### Unleash Edge

Unleash Edge is a lightweight caching layer designed to improve scalability, performance, and resilience. It sits between your SDKs and the Unleash API and handles thousands of connected SDKs without increasing the number of requests you make to your Unleash instance.

Beyond scalability, Unleash Edge also offers privacy and security benefits for frontend SDKs by performing flag evaluations without exposing sensitive data to end-users or to Unleash. 

### Unleash APIs

#### Client API

The [Client API](/api-overview) is the API used by backend SDKs to fetch feature flag configurations and send SDK usage metrics to Unleash.

#### Frontend API
The [Frontend API](/api-overview) is the API used by frontend SDKs to retrieve all enabled feature flags for a given [Unleash Context](/reference/unleash-context) and send SDK usage metrics to Unleash.

#### Admin API
The [Admin API](/api-overview) is an API layer for managing all aspects of your Unleash instance, including creating, updating, and deleting resources, such as feature flags, activation strategies, and environments. This API is used by the [Unleash Admin UI](#the-unleash-admin-ui) and other tools and [integrations](/reference/integrations).

| API            | Used by | Available endpoints |
|---------------|---------|---|
| Client API | Backend SDKs | Get all enabled feature flags for a given context, register an SDK, send SDK usage metrics. |
| Frontend API | Frontend SDKs | Get a feature flag by name, get all feature flags, register an SDK, send SDK usage metrics. |
| Admin API | Admin UI, internal tooling, third-party integrations | Access and manage all resources within Unleash, such as context, environments, events, metrics, and users. |

## Get started with Unleash

To integrate Unleash, you first need an [Unleash server](#the-unleash-api-server). You can choose from:
- Unleash Enterprise:
  - [Cloud-hosted plans](https://www.getunleash.io/pricing)
  - [Self-hosted plans](https://www.getunleash.io/pricing)
- Open-source deployment options:
  - [Docker](../using-unleash/deploy/getting-started)
  - [Helm Chart](https://github.com/unleash/helm-charts/)
  - [GitLab](https://docs.gitlab.com/ee/operations/feature_flags.html#choose-a-client-library)

For a deeper dive into Unleash’s architecture, check out this [blog post](https://www.getunleash.io/blog/our-unique-architecture).