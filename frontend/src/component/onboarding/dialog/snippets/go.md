1\. Install the SDK
```sh
go get github.com/Unleash/unleash-client-go/v3
```

2\. Run Unleash
```go
import (
    "github.com/Unleash/unleash-client-go/v3"
    "net/http"
    "time"
)

func init() {
    unleash.Initialize(
        unleash.WithListener(&unleash.DebugListener{}),
        unleash.WithAppName("unleash-onboarding-golang"),
        unleash.WithUrl("<YOUR_API_URL>"),
        unleash.WithCustomHeaders(http.Header{"Authorization": {"<YOUR_API_TOKEN>"}}),
        unleash.WithMetricsInterval(1*time.Second),
    )
}

func main() {
    for {
        unleash.IsEnabled("<YOUR_FLAG>")
        time.Sleep(time.Second)
    }
}
```

---
```go
import (
    "github.com/Unleash/unleash-client-go/v3"
    "net/http"
    "time"
)

func init() {
    unleash.Initialize(
        unleash.WithListener(&unleash.DebugListener{}),
        unleash.WithAppName("unleash-onboarding-golang"),
        unleash.WithUrl("<YOUR_API_URL>"),
        unleash.WithCustomHeaders(http.Header{
            "Authorization": {os.Getenv("UNLEASH_API_KEY")},
        })
    )
}
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-go)
- [Go SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Go)
