# Unleash

[![Build Status](https://travis-ci.org/Unleash/unleash.svg?branch=master)](https://travis-ci.org/Unleash/unleash)
[![Coverage Status](https://coveralls.io/repos/github/Unleash/unleash/badge.svg?branch=master)](https://coveralls.io/github/Unleash/unleash?branch=master)
[![Dependency Status](https://david-dm.org/Unleash/unleash.svg)](https://david-dm.org/Unleash/unleash)
[![devDependency Status](https://david-dm.org/Unleash/unleash/dev-status.svg)](https://david-dm.org/Unleash/unleash#info=devD)

Unleash is a feature toggle system, that gives you a great overview over all feature toggles across 
all your applications and services. It comes with client implementations for Java and Node, and it is 
fairly easy to develop client implementation for your favourite language. 

The main motivation for doing feature toggling is to decouple the process for deploying code to production 
and releasing new features. This helps reducing risk, and allow us to easily manage which features to enable

> Feature toggles decouple **deployment** of code from **release** of new features

This repo contains the unleash-server, which contains the admin UI and a place to ask for the status of features. 
In order to make use of unleash you will also need a client implementation.

<kbd>
![2016-12-28-211658_1115x752_scrot](https://cloud.githubusercontent.com/assets/158948/21530723/069c3002-cd43-11e6-9837-7509dfbf0678.png)
</kbd>

Online demo [version availble on heroku](https://unleash-new-ui.herokuapp.com/#/features).

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
- [unleash-client-java](https://github.com/unleash/unleash-client-java)
- [unleash-client-node](https://github.com/unleash/unleash-client-node)
- (your implementation here!)

Client implementations makes it is easy for developers to check whether a toggle is enabled or disabled. 

```
if(unleash.isEnabled("AwesomeFeature")) {
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

Unleash started on port:4242
```

You can also require Unleash as a lib and expand it with more options. Read more about this feature in the [getting started guide](./docs/getting-started.md). 

## Project details
- [Project Roadmap](https://github.com/unleash/unleash/wiki/Roadmap)

## Developer Guide
If you want to contribute to this project you are encouraged to send issue request, or provide pull-requests. 
Please read the [unleash developer guide](./docs/developer-guide.md) to learn more on how you can contribute. 

## Run with docker
We have made a separate project which runs unleash inside docker. Please see [unleash-docker](https://github.com/Unleash/unleash-docker)
