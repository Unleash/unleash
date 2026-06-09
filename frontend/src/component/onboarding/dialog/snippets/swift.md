1\. Install the SDK
```swift
.package(url: "https://github.com/Unleash/unleash-ios-sdk.git", from: "0.0.0")
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
    if unleash.isEnabled(name: "<YOUR_FLAG>") {
        print("<YOUR_FLAG> is enabled")
    } else {
        print("<YOUR_FLAG> is disabled")
    }
}
```
ℹ️ **Info:** The Swift SDK takes at least 60 seconds to post metrics to Unleash.
---
---
- [SDK repository with documentation](https://github.com/Unleash/unleash-ios-sdk)
---

```swift
if unleash.isEnabled(name: "<YOUR_FLAG>") {
    print("<YOUR_FLAG> is enabled")
} else {
    print("<YOUR_FLAG> is disabled")
}
```

ℹ️ **Info:** The Swift SDK takes at least 60 seconds to post metrics to Unleash.
