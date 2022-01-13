---
id: ruby_sdk
title: Ruby SDK
---

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

```ruby
require 'unleash'

@unleash = Unleash::Client.new(
  url: '<API url>',
  app_name: 'simple-test',
  custom_http_headers: {'Authorization': '<API token>'},
)
```

### Sample usage {#sample-usage}

To evaluate a feature toggle, you can use:

```ruby
if @unleash.is_enabled? "AwesomeFeature", @unleash_context
  puts "AwesomeFeature is enabled"
end
```

If the feature is not found in the server, it will by default return false. However you can override that by setting the default return value to `true`:

```ruby
if @unleash.is_enabled? "AwesomeFeature", @unleash_context, true
  puts "AwesomeFeature is enabled by default"
end
```

Alternatively by using `if_enabled` you can send a code block to be executed as a parameter:

```ruby
@unleash.if_enabled "AwesomeFeature", @unleash_context, true do
  puts "AwesomeFeature is enabled by default"
end
```

### Variations {#variations}

If no variant is found in the server, use the fallback variant.

```ruby
fallback_variant = Unleash::Variant.new(name: 'default', enabled: true, payload: {"color" => "blue"})
variant = @unleash.get_variant "ColorVariants", @unleash_context, fallback_variant

puts "variant color is: #{variant.payload.fetch('color')}"
```

## Client methods {#client-methods}

| Method Name | Description | Return Type |
| --- | --- | --- |
| `is_enabled?` | Check if feature toggle is to be enabled or not. | Boolean |
| `enabled?` | Alias to the `is_enabled?` method. But more ruby idiomatic. | Boolean |
| `if_enabled` | Run a code block, if a feature is enabled. | `yield` |
| `get_variant` | Get variant for a given feature | `Unleash::Variant` |
| `shutdown` | Save metrics to disk, flush metrics to server, and then kill ToggleFetcher and MetricsReporter threads. A safe shutdown. Not really useful in long running applications, like web applications. | nil |
| `shutdown!` | Kill ToggleFetcher and MetricsReporter threads immediately. | nil |

Read more at [github.com/Unleash/unleash-client-ruby](https://github.com/Unleash/unleash-client-ruby)
