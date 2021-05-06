---
id: index
title: Introduction
---

In order to connect your application to Unleash you need to use a client SDK (software developer kit) for your programming language. The SDK will handle connecting to the Unleash server instance and retrieve feature toggles based upon your configuration. Both open-source and the Unleash enterprise offering utilize the same set of client SDKs.

If you are an Unleash customer, our hosted instances will always be a protected instance, you will therefore have to specify a client secret as the authorization header when you are connecting your client SDK, which you will receive from us when you sign up for one of our packages. In the open source version you must generate your own secret.

On this page you will find examples for connecting your application to the demo instance. If you are connecting to your own private instance you will have to remember to replace the client secret and the API url given in the examples.

We have examples for all official client SDKs:

- [Java SDK](./java_sdk)
- [Node.js SDK](./node_sdk)
- [Go SDK](./go_sdk)
- [Ruby SDK](./ruby_sdk)
- [Python SDK](./python_sdk)
- [.Net SDK](./dot_net_sdk)
- [Javascript SDK](https://github.com/unleash-hosted/unleash-proxy-client-js) (Used by single-page applications)

### Clients written by awesome enthusiasts:

- [cognitedata/unleash-client-rust](https://github.com/cognitedata/unleash-client-rust) (Rust)
- [silvercar/unleash-client-kotlin](https://github.com/silvercar/unleash-client-kotlin) (Kotlin)
- [uekoetter.dev/unleash-client-dart](https://pub.dev/packages/unleash) (Dart)
- [minds/unleash-client-php](https://gitlab.com/minds/unleash-client-php) (PHP)
- [Stogon/unleash-bundle](https://git.stogon.io/Stogon/unleash-bundle/) (PHP - Symfony)
- [afontaine/unleash_ex](https://gitlab.com/afontaine/unleash_ex) (Elixir)
- [mikefrancis/laravel-unleash](https://github.com/mikefrancis/laravel-unleash) (Laravel - PHP)
- [AppsFlyer/clojure-unleash](https://github.com/AppsFlyer/unleash-client-clojure) (Clojure)
- [pmb0/nestjs-unleash](https://github.com/pmb0/nestjs-unleash) (NestJS - Node.js)
- _...your implementation for your favorite language._


When you get access to your instance – [create a client secret](../api/token.md), and we will provide you with your API url for your instance.
