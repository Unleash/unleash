---
title: Flutter Proxy SDK
---

This guide shows you how to use feature toggles in a Flutter app with the [Unleash Proxy](../unleash-proxy.md) and the [Unleash front-end API](../front-end-api.md). You can also check out the source code for the [Flutter Proxy SDK](https://github.com/unleash/unleash_proxy_client_flutter) on GitHub for more details around the SDK.

## Introduction {#introduction}

The Flutter proxy client is a tiny Unleash client written in Dart. This client stores toggles relevant for the current user with [shared preferences library](https://pub.dev/packages/shared_preferences) and synchronizes with Unleash (the proxy _or_ the Unleash front-end API) in the background. Because toggles are stored in the user's device, the client can use them to bootstrap itself the next time the user visits the same web page.

## How to use the Flutter Proxy SDK

## Step 1: Install

```
flutter pub add unleash_proxy_client_flutter
```

## Step 2: Initialize the SDK

```dart
import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';

final unleash = UnleashClient(
    url: Uri.parse('https://app.unleash-hosted.com/demo/api/proxy'),
    clientKey: 'proxy-123',
    appName: 'my-app');

// Use `updateContext` to set Unleash context fields.
unleash.updateContext(UnleashContext(userId: '1233'));

// Start the background polling
unleash.start();
```

### Option A: Connecting to the Unleash proxy

:::tip Prerequisites

To connect to an Unleash proxy, you need to have an instance of the proxy running.

:::

Add the proxy's URL and a [proxy client key](../api-tokens-and-client-keys.mdx#proxy-client-keys). The [_configuration_ section of the Unleash proxy docs](../unleash-proxy.md#configuration-variables) contains more info on how to configure client keys for your proxy.

### Option B: Connecting directly to Unleash

Use the url to your Unleash instance's front-end API (`<unleash-url>/api/frontend`) as the `url` parameter. For the `clientKey` parameter, use a `FRONTEND` token generated from your Unleash instance. Refer to the [_how to create API tokens_](/how-to/how-to-create-api-tokens) guide for the necessary steps.

### Step 3: Check if feature toggle is enabled

```dart
unleash.isEnabled('proxy.demo');
```

...or get toggle variant:

```dart
final variant = unleash.getVariant('proxy.demo');

if(variant.name == 'blue') {
// something with variant blue...
}
```

## Listen for updates via the EventEmitter

The client is also an event emitter. This means that your code can subscribe to updates from the client. This is a neat way to update your app when toggle state updates.

```dart
unleash.on('update', (_) {
    final myToggle = unleash.isEnabled('proxy.demo');
    //do something useful
});
```
