1\. Install the SDK
```sh
gem install unleash
```

2\. Run Unleash
```rb
require 'unleash'

@unleash = Unleash::Client.new(
  url: "<YOUR_API_URL>",
  custom_http_headers: { 'Authorization': "<YOUR_API_TOKEN>" },
  app_name: 'unleash-onboarding-ruby',
  instance_id: 'unleash-onboarding-ruby',
  metrics_interval: 3, # In production use interval of >15s
)

while true
  if @unleash.is_enabled?("<YOUR_FLAG>")
    puts "Flag is enabled"
  else
    puts "Flag is not enabled"
  end
  sleep 3
end

```
---
```rb
@unleash = Unleash::Client.new(
  url: "<YOUR_API_URL>",
  custom_http_headers: { 'Authorization': ENV['UNLEASH_API_TOKEN'] },
  app_name: 'unleash-onboarding-ruby',
  instance_id: 'unleash-onboarding-ruby',
)
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-ruby)
- [Ruby example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Ruby)
- [How to Implement Feature Flags in Ruby](https://docs.getunleash.io/feature-flag-tutorials/ruby)
