1\. Install the SDK
```sh
// Instructions to add the Swift SDK can be found at the provided URL:
https://github.com/Unleash/unleash-proxy-client-swift.git
```

2\. Run Unleash
```swift
import Foundation
import UnleashProxyClientSwift

var unleash = UnleashProxyClientSwift.UnleashClient(
   unleashUrl: "<YOUR_API_URL>",
   clientKey: "<YOUR_API_TOKEN>", // in production use environment variable
   appName: "unleash-onboarding-swift",
   context: [:])

unleash.start()

Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
    print("Is enabled", unleash.isEnabled(name: "<YOUR_FLAG>"))
}
```
ℹ️ **Info:** The Swift SDK takes at least 60 seconds to post metrics to Unleash.
