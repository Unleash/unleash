---
id: ruby_sdk
title: Ruby SDK
---

> **Required details**
>
> - **API URL** – Where you should connect your client SDK
> - **API Secret** – [Your API secret required to connect to your instance](../api/token.md).
>
> You can find this information in the “Admin” section Unleash management UI.

```sh
    require 'unleash'

    @unleash = Unleash::Client.new(
      url: '<API url>',
      app_name: 'simple-test',
      custom_http_headers = {'Authorization': '<Client secret>'},
    )
```

Read more at [github.com/Unleash/unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby)
