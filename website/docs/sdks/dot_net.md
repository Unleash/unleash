---
id: dot_net_sdk
title: .NET SDK
---

import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

In this guide we explain how to use feature toggles in a .NET application using Unleash-hosted. We will be using the open source Unleash [.net Client SDK](https://github.com/Unleash/unleash-client-dotnet).

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

## Step 1: Install client SDK {#step-1-install-client-sdk}

First we must add Unleash Client SDK as a dependency to your project. Below is an example of how you would add it via the .NET cli. Please see [NuGet](https://www.nuget.org/packages/Unleash.Client/) for other alternatives.

```sh
dotnet add package unleash.client
```

## Step 2: Create a new Unleash Instance {#step-2-create-a-new-unleash-instance}

Next we must initialize a new instance of the Unleash Client.

:::tip Synchronous initialization

By default, the client SDK asynchronously fetches toggles from the Unleash API on initialization. This means it can take a few hundred milliseconds for the client to reach the correct state.

You can use the `synchronousInitialization` option of the `UnleashClientFactory` class's `CreateClientAsync` method to block the client until it has successfully synced with the server. See the following "synchronous initialization" code sample.

Read more about the [Unleash architecture](https://www.getunleash.io/blog/our-unique-architecture) to learn how it works.

:::

<Tabs>
  <TabItem value="async" label="Asynchronous initialization" default>

```csharp
var settings = new UnleashSettings()
{
  AppName = "dot-net-client",
  Environment = "local",
  UnleashApi = new Uri("API URL"),
  CustomHttpHeaders = new Dictionary()
  {
    {"Authorization","API token" }
  }
};

IUnleash unleash = new DefaultUnleash(settings);
```

  </TabItem>
  <TabItem value="sync" label="Synchronous initializiation">

```csharp
var settings = new UnleashSettings()
{
  AppName = "dot-net-client",
  Environment = "local",
  UnleashApi = new Uri("API URL"),
  CustomHttpHeaders = new Dictionary()
  {
    {"Authorization","API token" }
  }
};

var unleashFactory = new UnleashClientFactory();

// this `unleash` will fetch feature toggles and write them to its cache before returning from the await call.
// if network errors or disk permissions prevent this from happening, the await will throw an exception.
IUnleash unleash = await unleashFactory.CreateClientAsync(settings, synchronousInitialization: true);
```

  </TabItem>
</Tabs>

In your app you typically just want one instance of Unleash, and inject that where you need it.

You should change the URL and the Authorization header (API token) with the correct values for your instance, which you may locate under “Instance admin” in the menu.

## Step 3: Use the feature toggle {#step-3-use-the-feature-toggle}

Now that we have initialized the client SDK we can start using feature toggles defined in Unleash in our application. To achieve this we have the “isEnabled” method available, which will allow us to check the value of a feature toggle. This method will return true or false based on whether the feature should be enabled or disabled for the current request.

```csharp
if (unleash.IsEnabled("Demo"))
{
  //do some magic
}
else
{
  //do old boring stuff
}
```

## Step 4: Provide Unleash Context {#step-4-provide-unleash-context}

It is the client SDK that computes whether a feature toggle should be considered enabled or disabled for specific use request. This is the job of the activation strategies, which are implemented in the client SDK.

The activation strategies is an implementation of rules based on data, which you provide as part of the Unleash Context.

**a) As argument to the isEnabled call**

The simplest way to provide the Unleash Context is as part of the “isEnabled” call:

```csharp
var context = new UnleashContext
{
  UserId = "61"
};

unleash.IsEnabled("someToggle", context);
```

b) Via a UnleashContextProvider

This is a bit more advanced approach, where you configure an unleash-context provider. By doing this, you do not have to rebuild or to pass the unleash-context object to every place you are calling `unleash.IsEnabled`. You can read more, and get [examples about this option on GitHub](https://github.com/Unleash/unleash-client-dotnet#unleashcontextprovider).
