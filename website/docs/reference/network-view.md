---
title: Network view
---

import Figure from '@site/src/components/Figure/Figure.tsx'

:::info Availability

The network view was released in Unleash 4.21. It is available to Pro and Enterprise users.

You must configure the [data source](#data-source) to activate the feature.

:::

The Unleash admin UI contains a **network view** as part of the admin configuration pages. This network view was designed to give you an overview and understanding of incoming requests to your Unleash instance. It makes it possible to pinpoint sources of sudden request surges, and can therefore also help you identify issues with SDK setups[^1].

The network view offers two different visualizations of the same data, known as the [network overview](#network-overview) and the [network traffic](#network-traffic) views.

Because Unleash doesn't store this kind of data itself, the network view requires you to configure an [external data source](#data-source) for the network overview to work. The network view is only mad available if you tell Unleash where it can find the data (refer to the [data source section](#data-source)).

The network view is intended to provide a simple and Unleash-centric overview that serves basic use cases. If you need detailed metrics and connection graphs, you may be better off using specialized network monitoring tools.

## Applications

Both the network overview and the network traffic diagrams show you **applications** that have made requests to the Unleash instance. An **application** is defined as anything that sends requests to [Unleash client API](/reference/api/unleash/client), such as [Unleash SDKs](./sdks/index.md), [Unleash Edge](/docs/generated/unleash-edge), or the [Unleash proxy](/docs/generated/unleash-proxy).

### "unknown" applications

Requests that come from Unleash SDKs and other official Unleash applications will always have an application name defined. But you might sometimes see some applications listed as "unknown" in the diagram.

This happens when Unleash receives requests that don't contain an application name. This can happen, for instance, if you make HTTP requests from the command line to test Unleash connections or if you write your own HTTP client for Unleash that doesn't provide an application name.

Because Unleash can't separate these based on their application names, all "unknown" clients will get lumped together as one application in the overview.

## Network overview

The network overview is a diagram that shows the Unleash instance and all [applications](#applications) that have connected to it within the last X hours.

Each application shown on the diagram has:
- An application name
- the average number of requests per second (_req/s_) that we have registered over the last X hours.

<Figure caption="The network overview showing three different instances of the Unleash proxy connected to Unleash. Each application has an average of 20 req/s." img="/img/network-overview.png"/>

## Network traffic

The network traffic diagram is a line chart that presents requests that have used the most network traffic over the last six hours, grouped by client and base URL for the request. For legibility, this chart only shows the ten groups that have caused the most traffic over the last six hours.

Unleash aggregates requests by **client** (using application name) and **base URL**. Base URLs are batched together using the **first two** path segments following the `/api` part of the URL. In essence, that means:

1. Separate requests by API: Admin API requests are separate from client API requests.
2. Within each of these groups, group all requests by their next URL path segment. For instance: `/client/features` and `/client/features/feature-a` are grouped together, while `/client/register` and `/admin/features` are separate groups.


<Figure caption="The network traffic chart showing three different instances of the Unleash proxy connected to Unleash. Each application has an average of 20 req/s." img="/img/network-traffic.png"/>
![Network traffic showing 3 sources and unregistered apps as unknown](/img/network-traffic.png).

## Data source
The network view sources its data from an external Prometheus-like API, which is controlled by the environment variable `PROMETHEUS_API` that should point to the base path of the Prometheus installation. Prometheus has to be configured to get its data from Unleashe's [Internal Backstage API](https://docs.getunleash.io/reference/api/legacy/unleash/internal/prometheus), e.g. by defining a scraping job:

```yaml
  - job_name: unleash_internal_metrics
    metrics_path: /internal-backstage/prometheus
    static_configs:
      - targets: ['unleash-url']
```

How to set up Prometheus to collect metrics from that API is outside of the scope of this document.

[^1]: For instance: when using Unleash in an API setting, a common mistake is to instantiate a new SDK for every request instead of sharing a single instance across requests. This would be visible in the network overview graph as a large number of requests from the same app.
