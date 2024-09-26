1\. Install the SDK
```sh
go get github.com/Unleash/unleash-client-go/v3
```

2\. Initialize Unleash
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
        unleash.WithMetricsInterval(5*time.Second),
    )
}
```

3\. Check feature flag status
```go
func main() {
    for {
        unleash.IsEnabled("<YOUR_FLAG>")
        time.Sleep(time.Second)
    }
}
```
