---
id: java_sdk
title: Java SDK
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

In this guide we explain how to use feature toggles in a Java application using Unleash-hosted. We will be using the open source Unleash [Java Client SDK](https://github.com/Unleash/unleash-client-java).

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

## Step 1: Install the client SDK {#step-1-install-the-client-sdk}

First we must add Unleash Client SDK as a dependency to your project. Below is an example of how you would add it to your pom.xml in Java:

```xml
<dependency>
    <groupId>io.getunleash</groupId>
    <artifactId>unleash-client-java</artifactId>
    <version>Latest version here</version>
</dependency>
```

## Step 2: Create a new Unleash Instance {#step-2-create-a-new-unleash-instance}

Next we must initialize a new instance of the Unleash Client.

:::tip Synchronous initialization

The client SDK will synchronize with the Unleash API on initialization, so it can take a few hundred milliseconds for the client to reach the correct state. You can use the `synchronousFetchOnInitialisation` option to block the client until it has successfully synced with the server.

:::

<Tabs>
  <TabItem value="async" label="Asynchronous initialization" default>

```java
UnleashConfig config = UnleashConfig.builder()
        .appName("my.java-app")
        .instanceId("your-instance-1")
        .environment(System.getenv("APP_ENV"))
        .unleashAPI("API URL")
        .customHttpHeader("Authorization", "API token")
        .build();

Unleash unleash = new DefaultUnleash(config);
```

  </TabItem>
  <TabItem value="sync" label="Synchronous initializiation">

```java
UnleashConfig config = UnleashConfig.builder()
        .appName("my.java-app")
        .instanceId("your-instance-1")
        .environment(System.getenv("APP_ENV"))
        .unleashAPI("API URL")
        .customHttpHeader("Authorization", "API token")
        .synchronousFetchOnInitialization(true)
        .build();

Unleash unleash = new DefaultUnleash(config);
```

  </TabItem>
</Tabs>

In your app you typically just want one instance of Unleash, and inject that where you need it. You will typically use a dependency injection frameworks such as Spring or Guice to manage this.

You should change the URL and the Authorization header (API token) with the correct values for your instance, which you may locate under “Instance admin” in the menu.

## Step 3: Use the feature toggle {#step-3-use-the-feature-toggle}

Now that we have initialized the client SDK we can start using feature toggles defined in Unleash in our application. To achieve this we have the “isEnabled” method available, which will allow us to check the value of a feature toggle. This method will return **true** or **false** based on whether the feature should be enabled or disabled for the current request.

```java
if(unleash.isEnabled("AwesomeFeature")) {
  //do some magic
} else {
  //do old boring stuff
}
```

Read more about the [Unleash architecture](https://www.unleash-hosted.com/articles/our-unique-architecture) to learn how it works in more details

## Step 4: Provide Unleash Context {#step-4-provide-unleash-context}

It is the client SDK that computes whether a feature toggle should be considered enabled or disabled for specific use request. This is the job of the [activation strategies](../user_guide/activation-strategies.md), which are implemented in the client SDK.

The activation strategies is an implementation of rules based on data, which you provide as part of the Unleash Context.

**a) As argument to the isEnabled call**

The simplest way to provide the Unleash Context is as part of the “isEnabled” call:

```java
UnleashContext context = UnleashContext.builder()
  .userId("user@mail.com").build();

unleash.isEnabled("someToggle", context);
```

**b) Via a UnleashContextProvider**

This is a bit more advanced approach, where you configure a unleash-context provider. By doing this you do not have to rebuild or to pass the unleash-context object to every place you are calling `unleash.isEnabled`.

The provider typically binds the context to the same thread as the request. If you are using Spring the UnleashContextProvider will typically be a ‘request scoped’ bean.

```java
UnleashContextProvider contextProvider = new MyAwesomeContextProvider();
UnleashConfig config = new UnleashConfig.Builder()
            .appName("java-test")
            .instanceId("instance x")
            .unleashAPI("http://unleash.herokuapp.com/api/")
            .unleashContextProvider(contextProvider)
            .build();

Unleash unleash = new DefaultUnleash(config);

// Anywhere in the code unleash will get the unleash context from your registered provider.
unleash.isEnabled("someToggle");
```
