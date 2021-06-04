<div align="center">

![Build & Tests](https://github.com/Unleash/unleash/workflows/Build%20%26%20Tests/badge.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/Unleash/unleash/badge.svg?branch=master)](https://coveralls.io/github/Unleash/unleash?branch=master)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/Unleash/unleash)

<a href="https://getunleash.io" title="Unleash - Create with freedom. Release with confidence">
    <img src="./.github/Logo_DarkBlue_Transparent_Portrait.svg" width="250">
</a>
</div>

Unleash the open-source feature management platform. It provides a great overview over all feature toggles/flags across all your applications and services. Unleash enables software teams all over the world to take full control on how they enabled new functionality to end users.

Unleash comes with [official client SDKs](https://docs.getunleash.io/sdks) for all the popular languages.

## Features

- Boolean feature toggles (on/off)
- Canary release (Gradual rollout)
- Targeted release
- Experimentation (A/B testing)
- Kill Switches
- Custom activation strategies
- Privacy first (GDPR) where end-user data never leaves your application
- Audit logs
- Addons integrating with other popular tools (Slack, Teams, Datadog, etc.)
- It is secure (Enable Secure Headers with strict HTTPS only mode)
- High performance with evaluations on the client side [read more in our docs](https://docs.getunleash.io/)
- Dashboard to manage technical debt
- Admin APIs

In addition we have built [Unleash Enterprise](https://www.getunleash.io/plans) with additional advanced functionality:

- Project support
- Advanced segmentation
- Support
- SSO (SAML 2.0, OpenID Connect, etc)
- A Hosted offering where the Unleash team host, monitor, scale, upgrades and take full backups for your.

## Client SDKs

In order to connect your application to Unleash you need to use a client SDK for your programming language.

**Official Server SDKs**:

- [Java SDK](https://docs.getunleash.io/sdks/java_sdk)
- [Node.js SDK](https://docs.getunleash.io/sdks/node_sdk)
- [Go SDK](https://docs.getunleash.io/sdks/go_sdk)
- [Ruby SDK](https://docs.getunleash.io/sdks/ruby_sdk)
- [Python SDK](https://docs.getunleash.io/sdks/python_sdk)
- [.Net SDK](https://docs.getunleash.io/sdks/dot_net_sdk)

**Official Frontend [Unleash Proxy](https://docs.getunleash.io/sdks/unleash-proxy) SDKs:**

- [Javascript SDK](https://docs.getunleash.io/sdks/proxy-javascript)
- [Android SDK](https://docs.getunleash.io/sdks/android_proxy_sdk)
- [iOS Proxy SDK](https://docs.getunleash.io/sdks/proxy-ios)

In addition there exists a good list of [community developed SDKs](https://docs.getunleash.io/sdks/community), so there might already exist an implementation for your favorite programming language (PHP, Elixir, Dart, Rust, Clojure, NestJS, Kotlin and more.)

## What is a feature toggle?

The main motivation for doing feature toggling is to decouple the process for deploying code to production and releasing new features. This helps reducing risk, and allow us to easily manage which features to enable

> Feature toggles decouple **deployment** of code from **release** of new features

This repo contains the unleash-server, which contains the Unleash Admin UI and the Unleash API. In order to make use of unleash you will also need a client SDK.

<img src="./.github/dashboard.png" alt="Unleash Admin UI" />

[Online demo](https://app.unleash-hosted/demo)

## Activation strategies

It's fine to have a system for turning stuff on and off. But some times we want more granular control, we want to decide who to the toggle should be enabled for. This is where activation strategies comes in to the picture. Activation strategies take arbitrary config and allows us to enable a toggle in various ways.

Common activation strategies includes:

- Active For users with a specified userId
- GradualRollout to X-percent of our users
- Active for our beta users
- Active only for application instances running on host x.

Read more about [activation strategies in our docs](https://docs.getunleash.io/docs/user_guide/activation_strategy).

## The Client API

The [client SDKs](https://docs.getunleash.io/sdks) provides a simple abstraction making it easy to check feature toggles in your application. The code snippet below shows how you would use `Unleash` in Java.

```java
if (unleash.isEnabled("AwesomeFeature")) {
  //do some magic
} else {
  //do old boring stuff
}
```

# Running Unleash Service

## Run it yourself

Unleash is open source and you are free to run your own instance. Please refer to the [getting-started-guide](https://docs.getunleash.io/docs/deploy/getting_started) to learn how to run the Unleash Service.

## Unleash as a Service (SaaS)

After numerous request we have created a separate company, Unleash-hosted, which offer Unleash as a Service. Unleash-hosted allows you to focus on you core business and have someone else taking care of hosting and maintaining Unleash.

Go to [getunleash.io](https://www.getunleash.io/plans) to learn more about this offering and start using Unleash today. This service also includes official support.

# Developer Guide

If you want to contribute to this project you are encouraged to send issue request, or provide pull-requests. Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) to learn more on how you can contribute.

# I Need help

- [Join Unleash on Slack](https://join.slack.com/t/unleash-community/shared_invite/enQtNjUxMjU2MDc0MTAxLTJjYmViYjkwYmE0ODVlNmY1YjcwZGRmZWU5MTU1YTQ1Nzg5ZWQ2YzBlY2U1MjlmZDg5ZDRmZTMzNmQ5YmEyOGE) if you want ask open questions about Unleash, feature toggling or discuss these topics in general.
- [Create a issue request](https://github.com/Unleash/unleash/issues/new) if you have found a bug or have ideas on how to improve Unleash.

## In the media

- [Utviklerpodden, 1 - Feature Flags og Unleash med Fredrik Oseberg](https://pod.space/utviklerpodden/feature-flags-og-unleash-med-fredrik-oseberg) (Norwegian)
- [Node Weekly issue 380](https://nodeweekly.com/issues/380)
- [Console 42 - The open-source newsletter](https://console.substack.com/p/console-42)
- [This Week in Rust 340](https://this-week-in-rust.org/blog/2020/05/27/this-week-in-rust-340/)
- [Unleash-hosted - Unleash as a Service](https://www.unleash-hosted.com)
- [Medium blog](https://medium.com/unleash-hosted)
- [Blog: Unleash your features gradually!](http://bytes.schibsted.com/unleash-features-gradually/)
- [Presentation: Unleash your features gradually!](http://ivarconr.github.io/feature-toggles-presentation/sch-dev-lunch-2017/#1)
- http://martinfowler.com/bliki/FeatureToggle.html
