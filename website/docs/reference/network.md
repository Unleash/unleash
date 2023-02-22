---
title: Network view
---

:::info Availability

The network view was released in Unleash 4.21. It is available to Pro and Enterprise users.

:::

The **network** page enables customers to get a glance at the requests per second made by Unleash clients to the Unleash server.

It presents 2 different views of the same data helping you visualize how your applications are connected to Unleash and identify potential misconfigurations of your clients or sudden surges of requests. 

The two views are presented in two tabs:
## Network overview

It's a simplified view displaying the connected nodes at glance with their requests per second (req/s)

![Network overview showing 3 connected apps](/img/network-overview.png)

## Network traffic

Network traffic presents a breakdown by client and base url (we've chosen /admin and /client plus one additional level for the aggregation) in a line graph that shows the change over time. This can help you drill down into more details.

_Note that if the applications are not sending the application name they will be displayed as `unknown`._

![Network traffic showing 3 sources and unregistered apps as unknown](/img/network-traffic.png)
.
## Data source
The network view sources its data from an external Prometheus-like API, which is controlled by the environment variable `PROMETHEUS_API` that should point to the base path of the Prometheus installation. Prometheus has to be configured to get its data from Unleashe's [Internal Backstage API](https://docs.getunleash.io/reference/api/legacy/unleash/internal/prometheus), e.g. by defining a scraping job:

```yaml
  - job_name: unleash_internal_metrics
    metrics_path: /internal-backstage/prometheus
    static_configs:
      - targets: ['unleash-url']
```

How to set up Prometheus to collect metrics from that API is outside of the scope of this document.