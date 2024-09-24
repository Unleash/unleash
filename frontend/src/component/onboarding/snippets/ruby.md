1\. Install the SDK
```sh
gem install unleash
```

2\. Initialize Unleash
```rb
require 'unleash'

@unleash = Unleash::Client.new(
  url: "<YOUR_API_URL>",
  custom_http_headers: { 'Authorization': "<YOUR_API_TOKEN>" },
  app_name: 'unleash-onboarding-ruby',
  instance_id: 'unleash-onboarding-ruby',
  refresh_interval: 3, # In production use interval of >15s
  metrics_interval: 3, # In production use interval of >15s
)
```

3\. Check feature flag status
```rb
while true
  if @unleash.is_enabled?("<YOUR_FLAG>")
    puts "Flag is enabled"
  else
    puts "Flag is not enabled"
  end
  sleep 3
end

```
