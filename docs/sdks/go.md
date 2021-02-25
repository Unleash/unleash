---
id: go_sdk
title: GO SDK
---


```golang
import (
  "github.com/Unleash/unleash-client-go/v3"
)
    
func init() {
  unleash.Initialize(
    unleash.WithAppName("my-node-app"),
    unleash.WithUrl("<API url>"),
    unleash.WithCustomHeaders(http.Header{"Authorization": {"<Client secret>"}}),
  )
}
```
Read more at [github.com/Unleash/unleash-client-go](https://github.com/Unleash/unleash-client-go)
