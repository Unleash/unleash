---
title: /internal-backstage/prometheus
---

# Internal Backstage API

`GET http://unleash.host.com/internal-backstage/prometheus`

Unleash uses Prometheus internally to collect metrics. By default, the metrics are available at `/internal-backstage/prometheus`. You can disable this endpoint by setting the `serverMetrics` option to `false`.

Note that it's not recommended to expose Prometheus metrics to the public as of the [Prometheus pentest-report](https://prometheus.io/assets/downloads/2018-06-11--cure53_security_audit.pdf) issue PRM-01-002. Thus, if you want to keep metrics enabled, you should block all external access to `/internal-backstage/*` on the network layer to keep your instance secure.

[Read more about Prometheus](https://prometheus.io/)

## Annotations {#annotations}

Unleash will automatically count all updates for all toggles under the metric name `feature_toggle_update_total`, and the toggle name is will be set as a label value. This information can be used to create annotations in grafana for everytime a feature toggle is changed.

You can use this query in grafana to achieve this:

```
delta(feature_toggle_update_total{toggle="Demo"}[1m]) != bool 0
```

Another useful counter is the `feature_toggle_usage_total` which will give you the numbers for how many times a feature toggle has been evaluated to `active` or not.
