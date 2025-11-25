---
title: Unleash Edge quickstart

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This document helps you get started with [Unleash Edge](/reference/unleash-edge) locally.

## Why Unleash Edge

Unleash Edge is a lightweight layer between your SDKs and your Unleash instance.
It exposes the same HTTP interface as the main [Unleash API](/get-started/api-overview) but is built for higher throughput and lower latency.

<Tabs>

  <TabItem value="performance" label="Performance & UX" default>
    Unleash Edge helps you reduce latency for flag resolution by running closer to your users. For example, Unleash Edge could run on a global content-delivery network (CDN) or as part of your cloud or on-premises infrastructure.

    Setting up one or more Edge nodes helps you distribute traffic and reduce the load on your Unleash instance. By default, Unleash Edge relies on in-memory caching, but you can configure it to use Redis or the local filesystem.
  </TabItem>

  <TabItem value="security" label="Security & resilience">
    From a security standpoint, Unleash Edge lets you expose a single, SDK-compatible endpoint without opening your Unleash instance to the public, thus reducing the attack surface.

    At the same time, Unleash Edge provides an additional layer of resilience, so brief upstream hiccups don't disrupt feature delivery.

    Optionally, you can set up multiple layers between your application and the Unleash instance (daisy-chaining). This lets you define the optimal configuration for caching and resilience, while adapting Unleash Edge to your architecture's topology.
  </TabItem>

  <TabItem value="offline" label="Offline mode">
    Unleash Edge can also run in [offline mode](https://github.com/Unleash/unleash-edge/tree/main/examples), so it doesn't need a connection to an upstream Unleash instance. This simplifies local development and helps in environments with limited connectivity.
  </TabItem>

</Tabs>

## Prerequisites

Here's what you need before getting started:

1. An [Unleash instance](/get-started/quickstart) running locally or remotely (version `4.15` or later)
2. A valid [API token](/reference/api-tokens-and-client-keys) for your Unleash instance
3. [Docker](https://www.docker.com/get-started/) installed and running
4. Your preferred Unleash SDK in a [sample app](https://github.com/Unleash/unleash-sdk-examples)


## Run Unleash Edge locally

First, make sure your Unleash instance is running (locally or remotely) and generate a new backend API token.

<Tabs groupId="method">

  <TabItem value="github-release" label="GitHub Release installer" default>
    You can install prebuilt binaries for your OS directly from GitHub Releases:

    ```shell
    curl --proto '=https' --tlsv1.2 -LsSf https://github.com/Unleash/unleash-edge/releases/download/<version>/unleash-edge-installer.sh | sh
    ```

    :::info[GitHub Releases versioning]

    Make sure to replace `<version>` with a valid GitHub Release tag such as `v20.1.0`.

    You can pick a valid version from the list of [releases on GitHub](https://github.com/Unleash/unleash-edge/releases).

    :::

    Then launch it:

    ```shell
    unleash-edge edge \
      --strict \
      --upstream-url <your_unleash_instance> \
      --tokens '<your_backend_token>'
    ```

  </TabItem>

  <TabItem value="rust" label="Rust toolchain">
    If you're comfortable with the Rust toolchain, install the CLI with [cargo binstall](https://github.com/cargo-bins/cargo-binstall?tab=readme-ov-file#installation) (or [from source](https://github.com/Unleash/unleash-edge/blob/main/docs/development-guide.md)):

    ```shell
    cargo binstall unleash-edge
    ```

    Then launch it:

    ```shell
    unleash-edge edge \
      --strict \
      --upstream-url <your_unleash_instance> \
      --tokens '<your_backend_token>'
    ```

  </TabItem>

  <TabItem value="docker" label="Docker">
    Launch Unleash Edge locally with Docker:

    ```shell
    docker run -it \
      -p 3063:3063 \
      -e STRICT=true \
      -e UPSTREAM_URL=<your_unleash_instance> \
      -e TOKENS='<your_backend_token>' \
      unleashorg/unleash-edge \
      edge
    ```

    :::info[Docker Image versioning]

    By default, the command above uses the latest `unleashorg/unleash-edge` tag.

    You can also pick a specific version from the list of [tags on Docker Hub](https://hub.docker.com/r/unleashorg/unleash-edge).

    :::

  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    Launch the [examples/docker-compose.yml](https://github.com/Unleash/unleash-edge/blob/main/examples/docker-compose.yml) file:

    ```shell
    git clone https://github.com/unleash/unleash-edge/
    cd unleash-edge/examples
    docker compose up
    ```

    :::info[Docker Compose services]

    Please note that the sample Docker Compose file includes a Redis service for caching.
    In case you want to run Unleash Edge without Redis, make sure to remove the `REDIS_URL` environment variable and the Redis service.

    :::

  </TabItem>
</Tabs>

### Required parameters

Let's break down the parameters you need to replace in the launch command.

#### `<your_unleash_instance>`


<Tabs groupId="method">

  <TabItem value="github-release" label="GitHub Release installer" default>
    This is the URL of your Unleash instance.

    Use the base URL, e.g. `https://app.unleash-hosted.com/testclient` or `http://localhost:4242`.
  </TabItem>

  <TabItem value="rust" label="Rust toolchain">
    This is the URL of your Unleash instance.

    Use the base URL, e.g. `https://app.unleash-hosted.com/testclient` or `http://localhost:4242`.
  </TabItem>

  <TabItem value="docker" label="Docker">
    This is the URL of your Unleash instance.

    Use the base URL, e.g. `https://app.unleash-hosted.com/testclient`.

    :::warning[Important note about Docker and localhost]

    When using Docker with a local Unleash instance, `localhost` refers to the container itself, so you cannot reference your Unleash instance with `http://localhost:4242`.
    You'll need to use a different hostname, depending on where the Unleash instance is running.

    <Tabs>

      <TabItem value="host-docker-internal" label="Solution 1: use host.docker.internal" default>
        The easiest solution when using Docker Desktop is to reference the host as `host.docker.internal`.

        On Linux, you also need to define the host with `--add-host=host.docker.internal:host-gateway`, or just use `--network=host`.

        Then you can set your upstream URL to `http://host.docker.internal:4242`.
      </TabItem>

      <TabItem value="custom-network" label="Solution 2: use a custom network">
        If Unleash runs locally on Docker as well, you could run both containers on the same network.

        When launching Unleash with `docker compose up`, you could use the [default Compose network](https://docs.docker.com/compose/how-tos/networking/) named `unleash_default` and reference the instance as `web`.

        Your launch command becomes `--network unleash_default -e UPSTREAM_URL=http://web:4242`.

        If you prefer decoupling the network and service names, create a custom network:

        ```shell
        # define custom network
        docker network create unleash-net

        # launch Unleash
        docker run -d --name unleash --network unleash-net ....

        # launch Unleash Edge
        docker run -it --network unleash-net -e UPSTREAM_URL=http://unleash:4242 ....
        ```
      </TabItem>

    </Tabs>

    :::
  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    This parameter is managed for you in the Docker Compose file.

    Both containers run on the same network, therefore the instance is referenced using the service name: `http://unleash:4242`.
  </TabItem>
</Tabs>

---

#### `<your_backend_token>`

<Tabs groupId="method">

  <TabItem value="github-release" label="GitHub Release installer" default>
    This API token is required in strict mode, which is recommended since `v19.2`.

    You can generate a new API token by visiting your Unleash instance, under **Admin settings > Access control > API access**. Click **New API token**, give it a name, and confirm the default values.

    Note: make sure you keep the single quotes in `--tokens '...'` so the `*` isn't expanded by your shell.
  </TabItem>

  <TabItem value="rust" label="Rust toolchain">
    This API token is required in strict mode, which is recommended since `v19.2`.

    You can generate a new API token by visiting your Unleash instance, under **Admin settings > Access control > API access**. Click **New API token**, give it a name, and confirm the default values.

    Note: make sure you keep the single quotes in `--tokens '...'` so the `*` isn't expanded by your shell.
  </TabItem>

  <TabItem value="docker" label="Docker">
    This API token is required in strict mode, which is recommended since `v19.2`.

    You can generate a new API token by visiting your Unleash instance, under **Admin settings > Access control > API access**. Click **New API token**, give it a name, and confirm the default values.

    Note: make sure you keep the single quotes in `-e TOKENS='...'` so the `*` isn't expanded by your shell.
  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    This parameter is managed for you in the Docker Compose file.

    You can customize the default tokens by editing the Unleash environment variables:

    ```yaml
    services:
      unleash:
        environment:
          INIT_FRONTEND_API_TOKENS: "default:development.unleash-insecure-frontend-api-token"
          INIT_CLIENT_API_TOKENS: "default:development.unleash-insecure-api-token"
    ```

    Unleash Edge is automatically configured with the same backend token.

  </TabItem>

</Tabs>

## Update your application code

Before you continue, make sure Unleash Edge is running on port `3063`.

You can verify this by fetching `http://localhost:3063/internal-backstage/health`. This endpoint should respond with `{"status":"OK"}`.

Then you can start updating your application:

1. Identify the code or configuration file where the Unleash instance URL is defined.
2. Update the SDK configuration to use `http://localhost:3063`.
3. Make sure the SDK configuration includes a valid API token.
4. Restart your app and test it.

<Tabs>
  <TabItem value=".net" label=".NET" default>
    For example, if you're using the [.NET example](https://github.com/Unleash/unleash-sdk-examples/tree/main/.NET), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="android" label="Android">
    For example, if you're using the [Android example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Android):

    ```kotlin title="app/src/main/java/com/example/myapplication/MyApplication.kt"
      val instance = DefaultUnleash(
          androidContext = this,
          unleashConfig = UnleashConfig.newBuilder(appName = "codesandbox-android")
              // highlight-next-line
              .proxyUrl("http://10.0.2.2:3063/api/frontend/")
              // highlight-next-line
              .clientKey("<your_frontend_token>")
              .build()
      )
    ```

    :::warning[Important note about localhost and device emulators]

    Please note that you need to use the `10.0.2.2` IP address from the Android emulator to access `localhost`.

    :::
  </TabItem>

  <TabItem value="flutter" label="Flutter">
    For example, if you're using the [Flutter example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Flutter):

    ```dart title="unleash_example/lib/main.dart"
      var unleash = UnleashClient(
        // highlight-next-line
        url: Uri.parse('http://localhost:3063/api/frontend/'),
        // highlight-next-line
        clientKey: '<your_frontend_token>',
        refreshInterval: 5,
        appName: 'local-flutter',
      );
    ```

    :::warning[Important note about localhost and device emulators]

    Please note that you need to use the `10.0.2.2` IP address from the Android emulator to access `localhost`.

    You can use `localhost` from the iOS emulator without issues.

    When using a real iOS device, you need to use your computer's IP address. Run `ipconfig` on Windows or `ifconfig` on Linux/macOS to identify your IP address.

    :::
  </TabItem>

  <TabItem value="go" label="Go">
    For example, if you're using the [Go example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Go), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="java" label="Java">
    For example, if you're using the [Java example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Java):

    ```java title="src/main/java/Main.java"
      var flag = "example-flag";
      // highlight-next-line
      var url = "http://localhost:3063/api/";
      // highlight-next-line
      var token = "<your_backend_token>";

    ```
  </TabItem>

  <TabItem value="javascript" label="JavaScript">
    For example, if you're using the [JavaScript example](https://github.com/Unleash/unleash-sdk-examples/tree/main/JavaScript):

    ```javascript title="src/index.js"
    const unleash = new UnleashClient({
        // highlight-next-line
        url: "http://localhost:3063/api/frontend/",
        // highlight-next-line
        clientKey: "<your_frontend_token>",
        appName: "javascript-codesandbox",
    });
    ```
  </TabItem>

  <TabItem value="next.js" label="Next.js">
    For example, if you're using the [Next.js example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Next.js), update the API URL and token in your `.env` file:

    ```text title=".env"
    NEXT_PUBLIC_UNLEASH_SERVER_API_URL=http://localhost:3063/api
    NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN=<your_frontend_token>
    ```
  </TabItem>

  <TabItem value="node.js" label="Node.js">
    For example, if you're using the [Node.js example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Node.js), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="php" label="PHP">
    For example, if you're using the [PHP example](https://github.com/Unleash/unleash-sdk-examples/tree/main/PHP), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="python" label="Python">
  For example, if you're using the [Python example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Python), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="react" label="React">
    For example, if you're using the [React example](https://github.com/Unleash/unleash-sdk-examples/tree/main/React):

    ```tsx title="src/index.tsx"
    <FlagProvider
      config={{
        // highlight-next-line
        url: "http://localhost:3063/api/frontend/", // Unleash Edge running locally
        // highlight-next-line
        clientKey: "<your_frontend_token>",
        refreshInterval: 15,
        appName: "codesandbox-react",
      }}
    >
    ```
  </TabItem>

  <TabItem value="ruby" label="Ruby">
    For example, if you're using the [Ruby example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Ruby), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="rust" label="Rust">
    For example, if you're using the [Rust example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Rust), update the API URL and token in your `.env` file:

    ```text title=".env"
    UNLEASH_API_URL=http://localhost:3063/api
    UNLEASH_API_TOKEN=<your_backend_token>
    ```
  </TabItem>

  <TabItem value="svelte" label="Svelte">
    For example, if you're using the [Svelte example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Svelte):

    ```javascript title="src/routes/+layout.svelte"
    const config = {
      // highlight-next-line
      url: 'http://localhost:3063/api/frontend/',
      // highlight-next-line
      clientKey: '<your_frontend_token>',
      refreshInterval: 5,
      metricsInterval: 5,
      appName: 'codesandbox-svelte'
    };
    ```
  </TabItem>

  <TabItem value="swift" label="Swift">
    For example, if you're using the [Swift example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Swift):

    ```swift title="Sources/UnleashExample/main.swift"
    var unleashClient =  UnleashProxyClientSwift.UnleashClientBase(
        // highlight-next-line
        unleashUrl: "http://localhost:3063/api/frontend/",
        // highlight-next-line
        clientKey: "<your_frontend_token>",
        refreshInterval: 15,
        appName: "codesandbox-swift",
        context: [:]
    )
    ```

    :::warning[Important note about localhost and device emulators]

    Please note that you can use `localhost` from the iOS emulator without issues.

    When using a real iOS device, you need to use your computer's IP address. Run `ipconfig` on Windows or `ifconfig` on Linux/macOS to identify your IP address.

    :::
  </TabItem>

  <TabItem value="vue" label="Vue">
    For example, if you're using the [Vue example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Vue):

    ```javascript title="src/App.vue"
    const config = {
      // highlight-next-line
      url: 'http://localhost:3063/api/frontend/',
      // highlight-next-line
      clientKey: '<your_frontend_token>',
      refreshInterval: 5,
      metricsInterval: 5,
      appName: 'codesandbox-vue'
    }
    ```
  </TabItem>

</Tabs>


## Verify your setup

If you run into issues while connecting your SDK to Unleash Edge, the following commands can help you identify the problem.

```shell
# is the local Unleash instance running correctly?
curl http://localhost:4242/health

# is the local Unleash Edge instance running correctly?
curl http://localhost:3063/internal-backstage/health
# or via CLI
unleash-edge health

# is data going through? is my token valid?
curl -H "Authorization: <your_backend_token>" http://localhost:3063/api/client/features
```

You might encounter some of these common issues:

- If Unleash Edge logs show *"connection refused"* to `127.0.0.1:4242` within Docker, you're pointing at `localhost` inside the container. Use `host.docker.internal` or a shared Docker network instead.
- If Unleash Edge logs show *"Edge was not able to validate any of the tokens configured at startup"* make sure you're using a valid backend token in your startup command.
- If your SDK logs show *"401/invalid token"* ensure you're using a valid token from your Unleash instance that matches the environment and project you expect.

## Next steps

Congratulations, you've successfully set up Unleash Edge locally!

Unleash Edge offers a lot of flexibility and advanced configuration options worth exploring:

1. [Offline mode](/reference/unleash-edge/concepts#offline) - Learn how to configure Unleash Edge to work without an Unleash instance, using a local features file.
2. [Pretrusted tokens](/reference/unleash-edge#pretrusted-tokens) - Learn how to explicitly authorize known frontend tokens without upstream validation.
3. [Security considerations in production](/reference/unleash-edge/deploying) - Learn how to run Unleash Edge in production with best practices for CORS, health checks, and sensitive endpoints.
4. [Persistent cache storage](/reference/unleash-edge/cli#unleash-edge-edge) - Learn how to enable persistent cache storage with options such as `--backup-folder` and `--redis-url`.
5. [Advanced CLI configuration](/reference/unleash-edge/cli) - Learn how to customize the CLI behavior with options such as `--base-path`, `--workers`, `--allow-list`, `--edge-request-timeout`, and `--edge-auth-header`.
