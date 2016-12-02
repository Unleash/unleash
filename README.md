# unleash

__Warning: We will soon release the first official version of Unleash (1.0.0). If you want to test the previous package see [previous tag](https://github.com/unleash/unleash/tree/v1.0.0-alpha.2)__ 

[![Build Status](https://travis-ci.org/Unleash/unleash.svg?branch=master)](https://travis-ci.org/Unleash/unleash)
[![Coverage Status](https://coveralls.io/repos/github/Unleash/unleash/badge.svg?branch=master)](https://coveralls.io/github/Unleash/unleash?branch=master)
[![Dependency Status](https://david-dm.org/Unleash/unleash.svg)](https://david-dm.org/Unleash/unleash)
[![devDependency Status](https://david-dm.org/Unleash/unleash/dev-status.svg)](https://david-dm.org/Unleash/unleash#info=devD)
![Admin UI](https://cloud.githubusercontent.com/assets/572/5873775/3ddc1a66-a2fa-11e4-923c-0a9569605dad.png)
[Demo](http://unleash.herokuapp.com/) instance on Heroku

This repo contains the unleash-server, which contains the admin UI and a place to ask for the status of features. In order to make use of unleash you will also need a client implementation.

Known client implementations:
- [unleash-client-java](https://github.com/unleash/unleash-client-java)
- [unleash-client-node](https://github.com/unleash/unleash-client-node)
- (you implementaiton here!)

# Running Unleash 

## Requirements

You will need a __PostreSQL__ 9.3+ database instance to be able to run Unleash.

When starting Unleash you must specify a database uri (can be set as environment variable DATABASE_URL) 
which includes a username and password,  that have rights to migrate the database.

_Unleash_ will, at startup, check whether database migration is needed, and perform necessary migrations.

## Start Unleash 
### 1. The simplest way to get started:

```bash
$ npm install unleash-server -g
$ unleash -d postgres://unleash_user:passord@localhost:5432/unleash -p 4242

Unleash started on port:4242
```

You can also require Unleash as a lib and expend it with more options. Read more about this feature in the [getting started guide](./docs/getting-started.md). 

## Project details
- [Project Roadmap](https://github.com/unleash/unleash/wiki/Roadmap)

## Developer Guide
If you want to contribute to this project you are encuraged to send issue request, or provie pull-requests. 
Please read the [unleas developer guide](./docs/developer-guide.md) to learn more on how you can contribute. 

## Run with docker
We have made a sperate project which runs unleash inside docker. Please see [unelash-docker](https://github.com/Unleash/unleash-docker)
