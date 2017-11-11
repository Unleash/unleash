# Unleash

[![Greenkeeper badge](https://badges.greenkeeper.io/Unleash/unleash.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/Unleash/unleash.svg?branch=master)](https://travis-ci.org/Unleash/unleash)
[![Coverage Status](https://coveralls.io/repos/github/Unleash/unleash/badge.svg?branch=master)](https://coveralls.io/github/Unleash/unleash?branch=master)
[![Dependency Status](https://david-dm.org/Unleash/unleash.svg)](https://david-dm.org/Unleash/unleash)
[![devDependency Status](https://david-dm.org/Unleash/unleash/dev-status.svg)](https://david-dm.org/Unleash/unleash?type=dev)

Unleash is a feature toggle system, that gives you a great overview over all feature toggles across 
all your applications and services. It comes with official client implementations for Java, Node.js and Go.

The main motivation for doing feature toggling is to decouple the process for deploying code to production 
and releasing new features. This helps reducing risk, and allow us to easily manage which features to enable

> Feature toggles decouple **deployment** of code from **release** of new features

This repo contains the unleash-server, which contains the admin UI and a place to ask for the status of features. 
In order to make use of unleash you will also need a client implementation.

<img src="https://github.com/Unleash/unleash/raw/master/docs/assets/dashboard.png" alt="Unleash UI" width="600" />

[Online demo version available on heroku](https://unleash.herokuapp.com/#/features).

## Activation strategies
It's fine to have a system for turning stuff on and off. But some times we want more granular control, 
we want to decide who to the toggle should be enabled for. This is where activation strategies comes in to 
the picture. Activation strategies take arbitrary config and allows us to enable a toggle in various ways.

Common activation strategies includes:
- Active For users with a specified userId
- GradualRollout to X-percent of our users
- Active for our beta users
- Active only for application instances running on host x. 

Read more about activation strategies in [docs/activation-strategies.md](./docs/activation-strategies.md)

## Client implementations
We have offical SDK's for Java, Node.js and Go. And we will be happy to add implementations in other langugages written by you! These libraries makes it very easy to use Unleash in you application.

- [unleash-client-java](https://github.com/unleash/unleash-client-java)
- [unleash-client-node](https://github.com/unleash/unleash-client-node)
- [unleash-client-go](https://github.com/unleash/unleash-client-go)
- (your implementation here!)


```java
if (unleash.isEnabled("AwesomeFeature")) {
  //do some magic
} else {
  //do old boring stuff
}
```


# Running Unleash 

## Requirements

You will need a __PostgreSQL__ 9.3+ database instance to be able to run Unleash.

When starting Unleash you must specify a database URI (can be set as environment variable DATABASE_URL) 
which includes a username and password, which has the rights to migrate the database.

_Unleash_ will, at startup, check whether database migration is needed, and perform necessary migrations.

## Start Unleash 

**The simplest way to get started:**
(database-url can also be set as a environment variable: DATABASE_URL)

```bash
$ npm install unleash-server -g
$ unleash -d postgres://unleash_user:password@localhost:5432/unleash -p 4242

Unleash started on http://localhost:4242
```

You can also require Unleash as a lib and expand it with more options. Read more about this feature in the [getting started guide](./docs/getting-started.md). 

## Run with docker
We have made a separate project which runs unleash inside docker. Please see [unleash-docker](https://github.com/Unleash/unleash-docker)

# Developer Guide
If you want to contribute to this project you are encouraged to send issue request, or provide pull-requests. 
Please read the [unleash developer guide](./docs/developer-guide.md) to learn more on how you can contribute. 

# I want to learn more
- [Blog: Unleash your features gradually!](http://bytes.schibsted.com/unleash-features-gradually/)
- [Presentation: Unleash your features gradually!](http://ivarconr.github.io/feature-toggles-presentation/sch-dev-lunch-2017/#1)
- http://martinfowler.com/bliki/FeatureToggle.html
