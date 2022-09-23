---
id: go_sdk
title: GO SDK
---

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

### 1. Install unleash-client-go {#1-install-unleash-client-go}

To install the latest version of the client use:

```bash
go get github.com/Unleash/unleash-client-go/v3
```

If you are still using Unleash Server v2.x.x, then you should use:

```bash
go get github.com/Unleash/unleash-client-go
```

### 2. Initialize unleash {#2-initialize-unleash}

The easiest way to get started with Unleash is to initialize it early in your application code:

```go
import (
	"github.com/Unleash/unleash-client-go/v3"
)

func init() {
	unleash.Initialize(
		unleash.WithListener(&unleash.DebugListener{}),
		unleash.WithAppName("my-application"),
		unleash.WithUrl("http://unleash.herokuapp.com/api/"),
        unleash.WithCustomHeaders(http.Header{"Authorization": {"<API token>"}}),
	)
}
```

### 3. Use unleash {#3-use-unleash}

After you have initialized the unleash-client you can easily check if a feature toggle is enabled or not.

```go
unleash.IsEnabled("app.ToggleX")
```

### 4. Stop unleash {#4-stop-unleash}

To shut down the client (turn off the polling) you can simply call the destroy-method. This is typically not required.

unleash.Close()

### Built-in activation strategies {#built-in-activation-strategies}

The Go client comes with implementations for the built-in activation strategies provided by unleash.

- DefaultStrategy
- UserIdStrategy
- FlexibleRolloutStrategy
- GradualRolloutUserIdStrategy
- GradualRolloutSessionIdStrategy
- GradualRolloutRandomStrategy
- RemoteAddressStrategy
- ApplicationHostnameStrategy

Read more about the strategies in [the activation strategies document](../user_guide/activation_strategy).

### Unleash context {#unleash-context}

In order to use some of the common activation strategies you must provide an [_Unleash context_](../user_guide/unleash-context.md). This client SDK allows you to send in the unleash context as part of the `isEnabled` call:

```go
ctx := context.Context{
    UserId: "123",
    SessionId: "some-session-id",
    RemoteAddress: "127.0.0.1",
}

unleash.IsEnabled("someToggle", unleash.WithContext(ctx))
```

Read more at [github.com/Unleash/unleash-client-go](https://github.com/Unleash/unleash-client-go)
