# Internal Backstage API

`GET http://unleash.host.com/internal-backstage/prometheus`

Unleash uses prometheus internally to collect metrics. These are
available on the given url if the `serverMetrics` option is enabled (default=true).

[Read more about Prometheus](https://prometheus.io/) 