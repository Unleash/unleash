# Unleash

![Build & Tests](https://github.com/Unleash/unleash/workflows/Build%20%26%20Tests/badge.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/Unleash/unleash/badge.svg?branch=master)](https://coveralls.io/github/Unleash/unleash?branch=master) [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/Unleash/unleash)

Unleash is a open source feature flag & toggle system, that gives you a great overview over all feature toggles across all your applications and services. It comes with official client implementations for Java, Node.js, Go, Ruby, Python and .NET Core.

## Unleash-enterprise [:link:](https://www.unleash-hosted.com/pricing)

Unleash is also available in an enterprise edition, which builds on top of the open-source version, with additional features. Go to [unleash-hosted.com](https://www.unleash-hosted.com/pricing) to learn more about the enterprise offering.

## What is a feature toggle?

The main motivation for doing feature toggling is to decouple the process for deploying code to production and releasing new features. This helps reducing risk, and allow us to easily manage which features to enable

> Feature toggles decouple **deployment** of code from **release** of new features

This repo contains the unleash-server, which contains the admin UI and a place to ask for the status of features. In order to make use of unleash you will also need a client implementation.

<img src="https://github.com/Unleash/unleash/raw/master/docs/assets/dashboard_new.png" alt="Unleash UI" width="600" />

[Online demo version available on heroku](https://unleash.herokuapp.com/#/features).

## Activation strategies

It's fine to have a system for turning stuff on and off. But some times we want more granular control, we want to decide who to the toggle should be enabled for. This is where activation strategies comes in to the picture. Activation strategies take arbitrary config and allows us to enable a toggle in various ways.

Common activation strategies includes:

- Active For users with a specified userId
- GradualRollout to X-percent of our users
- Active for our beta users
- Active only for application instances running on host x.

Read more about activation strategies in [docs/activation-strategies.md](./docs/activation-strategies.md)

## Variants

Sometimes you need more control than just a boolean flag. Variants provides this and can be used in combination of feature toggles and allow you to return multiple variants from a feature toggle, if it is enabled.

## Client implementations

We have official SDK's for Java, Node.js, Go, Ruby and Python. And we will be happy to add implementations in other languages written by you! These libraries makes it very easy to use Unleash in you application.

Official client SDK's:

- [unleash/unleash-client-java](https://github.com/unleash/unleash-client-java)
- [unleash/unleash-client-node](https://github.com/unleash/unleash-client-node)
- [unleash/unleash-client-go](https://github.com/unleash/unleash-client-go)
- [unleash/unleash-client-ruby](https://github.com/unleash/unleash-client-ruby)
- [unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)
- [unleash/unleash-client-dotnet](https://github.com/Unleash/unleash-client-dotnet)

Clients written by awesome enthusiasts: :fire:

- [cognitedata/unleash-client-rust](https://github.com/cognitedata/unleash-client-rust) (Rust)
- [silvercar/unleash-client-kotlin](https://github.com/silvercar/unleash-client-kotlin) (Kotlin)
- [uekoetter.dev/unleash-client-dart](https://pub.dev/packages/unleash) (Dart)
- [minds/unleash-client-php](https://gitlab.com/minds/unleash-client-php) (PHP)
- [afontaine/unleash_ex](https://gitlab.com/afontaine/unleash_ex) (Elixir)
- [mikefrancis/laravel-unleash](https://github.com/mikefrancis/laravel-unleash) (Laravel - PHP)
- [AppsFlyer/clojure-unleash](https://github.com/AppsFlyer/unleash-client-clojure) (Clojure)
- [pmb0/nestjs-unleash](https://github.com/pmb0/nestjs-unleash) (NestJS - Node.js)

### The Client API

The client SDKs provides a simple abstraction making it easy to check feature toggles in your application. The code snippet below shows how you would use `Unleash` in Java.

```java
if (unleash.isEnabled("AwesomeFeature")) {
  //do some magic
} else {
  //do old boring stuff
}
```

# Running Unleash Service

## Run it yourself

Unleash is open source and you are free to run your own instance. Please refer to the [getting-started-guide](https://unleash.github.io/docs/getting_started) to learn how to run the Unleash Service.

We have made a separate project which runs Unleash inside docker. Please see [unleash-docker](https://github.com/Unleash/unleash-docker) for details

## Unleash as a Service (SaaS)

After numerous request we have created a separate company, Unleash-hosted, which offer Unleash as a Service. Unleash-hosted allows you to focus on you core business and have someone else taking care of hosting and maintaining Unleash.

Go to [unleash-hosted.com](https://www.unleash-hosted.com/pricing) to learn more about this offering and start using Unleash today. This service also includes official support.

# Developer Guide

If you want to contribute to this project you are encouraged to send issue request, or provide pull-requests. Please read the [unleash developer guide](./docs/developer-guide.md) to learn more on how you can contribute.

# I Need help

- [Join Unleash on Slack](https://join.slack.com/t/unleash-community/shared_invite/enQtNjUxMjU2MDc0MTAxLTJjYmViYjkwYmE0ODVlNmY1YjcwZGRmZWU5MTU1YTQ1Nzg5ZWQ2YzBlY2U1MjlmZDg5ZDRmZTMzNmQ5YmEyOGE) if you want ask open questions about Unleash, feature toggling or discuss these topics in general.
- [Create a issue request](https://github.com/Unleash/unleash/issues/new) if you have found a bug or have ideas on how to improve Unleash.

## In the media

- [Node Weekly issue 380](https://nodeweekly.com/issues/380)
- [Console 42 - The open-source newsletter](https://console.substack.com/p/console-42) 
- [This Week in Rust 340](https://this-week-in-rust.org/blog/2020/05/27/this-week-in-rust-340/)
- [Unleash-hosted - Unleash as a Service](https://www.unleash-hosted.com)
- [Medium blog](https://medium.com/unleash-hosted)
- [Blog: Unleash your features gradually!](http://bytes.schibsted.com/unleash-features-gradually/)
- [Presentation: Unleash your features gradually!](http://ivarconr.github.io/feature-toggles-presentation/sch-dev-lunch-2017/#1)
- http://martinfowler.com/bliki/FeatureToggle.html
