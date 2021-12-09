---
id: index
title: Introduction
slug: /sdks
---

In order to connect your application to Unleash you need to use a client SDK (software developer kit) for your programming language. In addition you will need a [API token](../user_guide/api-token). The SDK will handle connecting to the Unleash server instance and retrieve feature toggles based upon your configuration. Both open-source and the Unleash enterprise offering utilize the same set of client SDKs.

On this page you will find examples for connecting your application to the demo instance. If you are connecting to your own private instance you will have to remember to replace the `API token` and the `API url` given in the examples.

**Official Server SDKs**:

- [Java SDK](/sdks/java_sdk)
- [Node.js SDK](/sdks/node_sdk)
- [Go SDK](/sdks/go_sdk)
- [Ruby SDK](/sdks/ruby_sdk)
- [Python SDK](/sdks/python_sdk)
- [.Net SDK](/sdks/dot_net_sdk)
- [PHP SDK](/sdks/php_sdk)

**Official Frontend Unleash Proxy SDKs:**

- [Javascript SDK](/sdks/proxy-javascript)
- [Android SDK](/sdks/android_proxy_sdk)
- [iOS Proxy SDK](/sdks/proxy-ios)
- [React Proxy SDK](/sdks/proxy-react)


## SDK compatibility

...

**Legend**:

- ✅: Implemented
- ⭕: Not yet implemented, but we're looking into it
- ❌: Not implemented, not planned
- **N/A**: Not applicable to this SDK

If you see an item marked with a ❌ that you would find useful, feel free to reach out to us with your use case. It may not be something we can prioritize right now, but if you'd like to contribute it back to the community, we'd love to help you build it.

### Server SDKs

Some of

| Capability                               | Java | Node.js | Go  | Python | Ruby | .Net | PHP | Unleash Proxy Server |
|------------------------------------------|------|---------|-----|--------|------|------|-----|----------------------|
| **Initialization**                       |      |         |     |        |      |      |     |                      |
| Async initialization                     | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | N/A                  |
| Can block until synchronized             | ✅   | ✅      | ⭕  | ⭕     | ⭕   | ✅   | ⭕  | N/A                  |
| Refresh interval - default               | 10s  | 15s     | 15s | 15s    | 15s  | 30s  | 30s | 5s                   |
| Metrics interval - default               | 60s  | 60s     | 60s | 60s    | 30s  | 60s  | 30s | 30s                  |
| Context provider                         | ✅   | N/A     | N/A | N/A    | N/A  | ✅   | ✅  | N/A                  |
| Global fallback function                 | ✅   | ✅      | ✅  | ✅     | ❌   | ❌   | ❌  | N/A                  |
| Toggle Query: `namePrefix`               | ✅   | ✅      | ❌  | ❌     | ❌   | ❌   | ❌  | ✅                   |
| Toggle Query: `tags`                     | ✅   | ✅      | ❌  | ❌     | ❌   | ❌   | ❌  | ✅                   |
| Toggle Query: `project_name`             | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | N/A | ✅                   |
| **Custom Headers**                       |      |         |     |        |      |      |     |                      |
| static                                   | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | N/A                  |
| function                                 | ✅   | ✅      | ⭕  | ✅     | ⭕   | ✅   | ⭕  | N/A                  |
| **Built-in strategies**                  |      |         |     |        |      |      |     |                      |
| standard                                 | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| `flexibleRollout`                        | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| `flexibleRollout`: custom stickiness     | ✅   | ✅      | ⭕  | ✅     | ⭕   |      | ✅  | ✅                   |
| `userWithID`                             | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| `remoteAddress`                          | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| `remoteAddress`: CIDR syntax             | ✅   | ✅      | ✅  | ✅     | ⭕   | ⭕   | ⭕  | ✅                   |
| `applicationHostname`                    | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| **Custom strategies**                    |      |         |     |        |      |      |     |                      |
| Basic support                            | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| **Strategy constraints**                 |      |         |     |        |      |      |     |                      |
| Basic support (`IN`, `NOT_IN` operators) | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| **Unleash Context**                      |      |         |     |        |      |      |     |                      |
| Static fields (`environment`, `appName`) | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Defined fields                           | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Custom properties                        | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| **`isEnabled`**                          |      |         |     |        |      |      |     |                      |
| Can take context                         | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Override fallback value                  | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Fallback function                        | ✅   | ✅      | ✅  | ✅     | ✅   | ⭕   | ⭕  | ✅                   |
| **Variants**                             |      |         |     |        |      |      |     |                      |
| Basic support                            | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Custom fallback variant                  | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Custom weight                            | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Custom stickiness (beta)                 | ✅   | ✅      | ⭕  | ✅     | ⭕   | ⭕   | ✅  | ✅                   |
| **Local backup**                         |      |         |     |        |      |      |     |                      |
| File based backup                        | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| **Usage metrics**                        |      |         |     |        |      |      |     |                      |
| Can disable metrics                      | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Client registration                      | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| Basic usage metrics (yes/no)             | ✅   | ✅      | ✅  | ✅     | ✅   | ✅   | ✅  | ✅                   |
| **Bootstrap (beta)**                     |      |         |     |        |      |      |     |                      |
| Bootstrap from file                      | ✅   | ⭕      | ⭕  | ⭕     | ⭕   | ⭕   | ⭕  | ⭕                   |
| Custom Bootstrap implementation          | ✅   | ⭕      | ⭕  | ⭕     | ⭕   | ⭕   | ⭕  | ⭕                   |

## Clients written by awesome enthusiasts: {#clients-written-by-awesome-enthusiasts}

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

When you get access to your instance – [create a client secret](../user_guide/api-token), and we will provide you with your API url for your instance.
