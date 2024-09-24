1\. Install the SDK
```sh
// Instructions to add the Swift SDK can be found at the provided URL:
https://github.com/Unleash/unleash-proxy-client-swift.git
```

2\. Initialize Unleash
```swift
import Foundation
import UnleashProxyClientSwift

var unleash = UnleashProxyClientSwift.UnleashClient(
   unleashUrl: "<YOUR_API_URL>",
   clientKey: "<YOUR_API_TOKEN>",
   refreshInterval: 15,
   appName: "unleash-onboarding-swift",
   context: [:])

unleash.start()
```

3\. Check feature flag status
```swift
Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
    print("Is enabled", unleash.isEnabled(name: "<YOUR_FLAG>"))
}
```
