---
id: ruby_sdk
title: Ruby SDK
---

```sh
    require 'unleash'
  
    @unleash = Unleash::Client.new(
      url: '<API url>',
      app_name: 'simple-test',
      custom_http_headers = {'Authorization': '<Client secret>'},
    )
```

Read more at [github.com/Unleash/unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby)