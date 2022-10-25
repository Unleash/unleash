---
id: internal
title: /internal-backstage/prometheus
---

# Internal Backstage API

`GET http://unleash.host.com/internal-backstage/prometheus`

Unleash uses Prometheus internally to collect metrics. These are available on the given url if the `serverMetrics` option is enabled (default=true).

Note that it's not recomended to expose Prometheus metrics to the public. You should therefore drop all external access to `/internal-backstage/*` on the network layer to keep your instance secure. 

[Read more about Prometheus](https://prometheus.io/)

## Annotations {#annotations}

Unleash will automatically count all updates for all toggles under the metric name `feature_toggle_update_total`, and the toggle name is will be set as a label value. This information can be used to create annotations in grafana for everytime a feature toggle is changed.

You can use this query in grafana to achieve this:

```
delta(feature_toggle_update_total{toggle="Demo"}[1m]) != bool 0
```

Another useful counter is the `feature_toggle_usage_total` which will give you the numbers for how many times a feature toggle has been evaluated to `active` or not.
