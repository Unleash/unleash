1\. Install the SDK
```sh
go get github.com/Unleash/unleash-go-sdk/v6@latest
```

2\. Run Unleash
```go
package main

import (
    unleash "github.com/Unleash/unleash-go-sdk/v6"
    "net/http"
)

func main() {
    unleash.Initialize(
        unleash.WithAppName("unleash-onboarding-golang"),
        unleash.WithUrl("<YOUR_API_URL>"),
        unleash.WithCustomHeaders(http.Header{"Authorization": {"<YOUR_API_TOKEN>"}}), // in production use environment variable
    )
    defer unleash.Close()
    
    unleash.WaitForReady()

    if unleash.IsEnabled("<YOUR_FLAG>", unleash.FeatureOptions{}) {
        // New behaviour
    }
}
```

---
```go
package main

import (
    unleash "github.com/Unleash/unleash-go-sdk/v6"
    "net/http"
    "os"
)

func main() {
    unleash.Initialize(
        unleash.WithAppName("unleash-onboarding-golang"),
        unleash.WithUrl("<YOUR_API_URL>"),
        unleash.WithCustomHeaders(http.Header{
            "Authorization": {os.Getenv("UNLEASH_API_KEY")},
        }),
    )
    defer unleash.Close()

    unleash.WaitForReady()

    if unleash.IsEnabled("<YOUR_FLAG>", unleash.FeatureOptions{}) {
        // New behaviour
    }
}
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-go-sdk)
- [Go SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Go)

---

```go
if unleash.IsEnabled("<YOUR_FLAG>", unleash.FeatureOptions{}) {
    fmt.Println("<YOUR_FLAG> is enabled")
} else {
    fmt.Println("<YOUR_FLAG> is disabled")
}
```
