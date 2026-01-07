---
title: How to Implement Feature Flags in Go
description: "How to use Unleash feature flags with Go."
slug: /guides/implement-feature-flags-in-golang
---

import VideoContent from '@site/src/components/VideoContent.jsx';

Hello! In this tutorial we'll show you how to add feature flags to your Go app, using [Unleash](https://www.getunleash.io/) and the official [Unleash Go SDK](/sdks/go). With Unleash, an open-source feature flag service, you can add feature flags to your application to release new features faster.

In this tutorial, we'll get information about a country from the [REST Countries API](https://restcountries.com/), and its [GraphQL counterpart](https://countries.trevorblades.com/) using Go. We'll use feature flags to decide whether to call the REST or the GraphQL version of the API.

## Prerequisites

For this tutorial, you'll need the following:

-   Go v1.16+
-   Git
-   Docker and Docker Compose
-   Go Modules, to manage your dependencies

![architecture diagram for our implementation](/img/golang-guide-diagram.png)

The Unleash Server is a **Feature Flag Control Service**, which manages your feature flags and lets you retrieve flag data. Unleash has a UI for creating and managing projects and feature flags. You can perform the same actions straight from your CLI or server-side app using the [Unleash API](/api).

## Best practices for back-end apps with Unleash

Go is a back-end language, so there are special considerations to plan around when implementing feature flags.

Most importantly, you must:

-   Limit feature flag payloads for scalability, security, and efficiency.
-   Use graceful degradation where possible to improve the resiliency of your architecture.

![A gradual rollout form can allow you to customize your flag strategy.](/img/go-example-rollout.png)

For a complete list of architectural guidelines, including caching strategies, see our [best practices for building and scaling feature flag systems](/guides/feature-flag-best-practices).

## Install a local feature flag provider

In this section, we'll install Unleash, run the instance locally, log in, and create a feature flag. If you prefer, you can use other tools instead of Unleash, but you'll need to update the code accordingly.

Use Git to clone the Unleash repository and Docker to build and run it. Open a terminal window and run the following commands:

```
git clone https://github.com/unleash/unleash.git
cd unleash
docker compose up -d
```

You will now have Unleash installed onto your machine and running in the background. You can access this instance in your web browser at [http://localhost:4242](http://localhost:4242).

Log in to the platform using these credentials:

```
Username: admin
Password: unleash4all
```

Click **New feature flag** to create a new feature flag.

![Create a new feature flag](/img/go-new-feature-flag.png)

Call it `graphql-api` and enable it in the `development` environment.

![A feature flag called `graphql-api` is now enabled in development.](/img/go-enable-development.png)

Everything's now set up on the Unleash side. Let's go to the code now.

## Grab country information from the REST Countries API

We'll use the standard `net/http` package to make our HTTP requests and the Unleash SDK to connect to your local Unleash instance and retrieve your feature flag.

Open a new tab in your terminal, and create a new folder (outside of the unleash folder).

```sh
mkdir unleash-go
cd unleash-go
go mod init unleash-demo
```

Install dependencies:

```sh
go get github.com/Unleash/unleash-go-sdk/v5
```

Next, let's make sure our setup is working. Make a call to the REST API to retrieve information about a country using its country code. Create a file named `main.go`:

```go
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
)

type Country struct {
    Name    string `json:"name"`
    Capital string `json:"capital"`
}

func main() {
    resp, err := http.Get("https://restcountries.com/v2/alpha/no")
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    var country Country
    json.Unmarshal(body, &country)

    fmt.Printf("Country: %s, Capital: %s\n", country.Name, country.Capital)
}
```

Run the code:

```sh
go run main.go
```

You should see `Country: Norway, Capital: Oslo` in your terminal.

## Add the GraphQL endpoint

The point of this tutorial is to mimic a real-world scenario where, based on a boolean feature flag, you would migrate from a REST API to a GraphQL one. So far, we've just used REST.

Let's create a static feature flag, for now, just to test that we can call both versions successfully. Update `main.go`:

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
)

type Country struct {
    Name string `json:"name"`
    Capital string `json:"capital"`
}

func main() {
    // Define a static feature flag
    isGraphQL := true

    var country Country
    if isGraphQL {
        // Call the GraphQL API
        query := `{"query": "query { country(code: \"NO\") { name capital } }"}`
        req, err := http.NewRequest("POST", "https://countries.trevorblades.com/", bytes.NewBuffer([]byte(query)))
        if err != nil {
            log.Fatal(err)
        }
        req.Header.Set("Content-Type", "application/json")

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
            log.Fatal(err)
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        var response struct {
            Data struct {
                Country Country `json:"country"`
            } `json:"data"`
        }
        json.Unmarshal(body, &response)

        country = response.Data.Country
        fmt.Println("Hello GraphQL")
    } else {
        // Call the REST API
        resp, err := http.Get("https://restcountries.com/v2/alpha/no")
        if err != nil {
            log.Fatal(err)
        }
        defer resp.Body.Close()

        body, _ := io.ReadAll(resp.Body)
        var countries []Country
        json.Unmarshal(body, &countries)
        country = countries[0]
    }

    fmt.Printf("Country: %s, Capital: %s\n", country.Name, country.Capital)
}
```

Run the code again:

```sh
go run main.go
```

You should see `Hello GraphQL`, followed by `Country: Norway, Capital: Oslo` in your terminal.

## 5. Add Unleash to your Go app

Now, let's connect our project to Unleash so that you can toggle that feature flag at runtime. If you wanted to, you could also do a [gradual rollout](/guides/gradual-rollout) or use the flag for [A/B testing](/guides/a-b-testing).

You'll need 2 things:

-   The URL of your Unleash instance's API. It's `http://localhost:4242/api/` for your local version.
-   The API token we created on our Unleash instance, feel free to create another one if you can't find it.

With these 2, you can initialize your Unleash client as follows:

```go
unleash.Initialize(
    unleash.WithUrl("http://localhost:4242/api/"),
    unleash.WithAppName("country_go"),
    unleash.WithCustomHeaders(http.Header{"Authorization": {"YOUR_API_KEY"}}),
)
```

Now, let's add our client to our project, grab the feature flag from Unleash, and update our conditional statement. Don't forget to also update the config with your API key:

```diff
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"

+	"github.com/Unleash/unleash-go-sdk/v5"
)

// ... rest of the types ...

func main() {
+	// Initialize Unleash client
+	unleash.Initialize(
+		unleash.WithUrl("http://localhost:4242/api/"),
+		unleash.WithAppName("country_go"),
+		unleash.WithCustomHeaders(http.Header{"Authorization": {"YOUR_API_KEY"}}),
+	)
+
+	unleash.WaitForReady()

+	isGraphQL := unleash.IsEnabled("graphql-api")
-	// Define a static feature flag
-	isGraphQL := true

    // ... rest of the code ...
}
```

See additional use cases in our [Backend SDK with Go](/sdks/go) documentation.

## 6. Verify the toggle experience

Now that we've connected our project to Unleash and grabbed our feature flag, we can verify that if you disable that flag in your development environment, you stop seeing the `Hello GraphQL` message and only get the country information from the REST API.

> **Note:** An update to a feature flag may take 30 seconds to propagate.

## Conclusion

All done! Now you know how to add feature flags with Unleash in Go. You've learned how to:

-   Toggle between a REST and a GraphQL endpoint based on a feature flag
-   Install Unleash and create/enable a feature flag
-   Grab the value of a feature flag with the Go SDK

Feel free to have a look at our [Go Examples page](/guides/feature-flag-examples-golang) for more.

Thank you
