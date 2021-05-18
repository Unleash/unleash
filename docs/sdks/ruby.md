---
id: ruby_sdk
title: Ruby SDK
---

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

```sh
    require 'unleash'

    @unleash = Unleash::Client.new(
      url: '<API url>',
      app_name: 'simple-test',
      custom_http_headers = {'Authorization': '<API token>'},
    )
```

Read more at [github.com/Unleash/unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby)
