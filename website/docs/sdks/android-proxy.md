---
id: android_proxy_sdk
title: Android Proxy SDK
---

In this guide we'll explain how to use feature toggles in an Android application using Unleash's [Android Proxy SDK](https://github.com/Unleash/unleash-android-proxy-sdk) and the [Unleash Proxy](https://github.com/Unleash/unleash-proxy).

:::note The Android proxy SDK requires the Unleash Proxy or _Unleash v4.16 or later_. Refer to the [Unleash front-end API documentation](/reference/front-end-api.md) guide for simple setup. For large-scale, deployments refer to the [proxy documentation](/sdks/unleash-proxy) for how to set it up and [how to configure the proxy secrets](/sdks/unleash-proxy#configuration-variables). :::

## How to use the Android Proxy SDK

### Step 1: Install the proxy SDK

First we must add unleash-android-proxy-sdk as a dependency to our project.

In gradle

```kotlin
implementation("io.getunleash:unleash-android-proxy-sdk:LATEST_VERSION")
```

In maven

```xml
<dependency>
    <groupId>io.getunleash</groupId>
    <artifactId>unleash-android-proxy-sdk</artifactId>
    <version>Latest version here</version>
</dependency>
```

### Step 2: Enable internet

> NB - Your app will need internet permission in order to reach the proxy. So in your manifest add

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Step 3: Configure Context

Since the proxy works by evaluating all feature toggles server side and returning the evaluated toggles back to the client, we'll need to configure the context to send to the proxy for evaluation.

```kotlin
import io.getunleash.UnleashContext

val myAppContext = UnleashContext.newBuilder()
    .appName("Your AppName")
    .userId("However you resolve your userid")
    .sessionId("However you resolve your session id")
    .build()
```

### Step 4: Configure the Client

To create a client, use the `UnleashConfig.newBuilder` method. When building a configuration, you'll need to provide it with:

- `proxyUrl`: the URL your proxy is available at
- `clientKey`: the [proxy client key](/sdks/unleash-proxy#configuration-variables) you wish to use (this method was known as `clientSecret` prior to version 0.4.0)
- `pollMode`: how you want to load the toggle status

As of v0.1 the SDK supports an automatic polling with an adjustable poll period or loading the state from disk. Most users will probably want to use the polling client, but it's nice to know that you can instantiate your client without actually needing Internet if you choose loading from File

#### Step 4a: Configure client polling proxy

Configuring a client with a 60 seconds poll interval

```kotlin
import io.getunleash.UnleashConfig
import io.getunleash.polling.PollingModes

val unleashConfig = UnleashConfig.newBuilder()
    .proxyUrl("URL to your proxy installation")
    .clientKey("yourProxySecret")
    .pollMode(PollingModes.autoPoll(Duration.ofSeconds(60)) {
        // This lambda will be called every time polling the server updates the toggle state
        featuresUpdated()
    })
    .build()
```

#### Step 4b: Configure client loading toggles from a file

If you need to have a known state for your UnleashClient, you can perform a query against the proxy using your HTTP client of choice and save the output as a json file. Then you can tell Unleash to use this file to setup toggle states.

```kotlin
import io.getunleash.UnleashConfig
import io.getunleash.polling.PollingModes

val toggles = File("/tmp/proxyresponse.json")
val pollingMode = PollingModes.fileMode(toggles)

val unleashConfig = UnleashConfig.newBuilder()
    .proxyUrl("Doesn't matter since we don't use it when sent a file")
    .clientKey("Doesn't matter since we don't use it when sent a file")
    .pollMode(pollingMode)
    .build()
```

### Step 5: Instantiate the client

Having created your `UnleashContext` and your `UnleashConfig` you can now instantiate your client. Make sure you only do this once, and pass the instantiated client to classes/functions that need it.

```kotlin
import io.getunleash.UnleashClient

val unleashClient = UnleashClient(config = unleashConfig, context = myAppContext)
```

### Step 6: Use the feature toggle

Now that we have initialized the proxy SDK we can start using feature toggles defined in Unleash in our application. To achieve this we have the “isEnabled” method available, which will allow us to check the value of a feature toggle. This method will return true or false based on whether the feature should be enabled or disabled for the current state.

```kotlin
if (unleashClient.isEnabled("AwesomeFeature")) {
    //do some magic
} else {
    //do old boring stuff
}
```

## Updates

When using the AutoPoll mode you are able to pass in a listener which will get notified everytime our toggles changes, allowing you to recheck your toggles. For an example, see our [android-sample-app](https://github.com/Unleash/unleash-android-proxy-sdk/blob/main/samples/android/app/src/main/java/com/example/unleash/MainActivity.kt)

## KDoc

KDoc for the api is available at [https://docs.getunleash.io/unleash-android-proxy-sdk](https://docs.getunleash.io/unleash-android-proxy-sdk)

## Github

Readme for the client and source code is available at [https://github.com/Unleash/unleash-android-proxy-sdk](https://github.com/Unleash/unleash-android-proxy-sdk)
