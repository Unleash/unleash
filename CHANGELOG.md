# Changelog

## [Unreleased]
- Add sdkVersion in client registration
- disable edit of built-in strategies

## 3.0.0-alpha.1
- upgrade unleash-frontend to 3.0.0-alpha.1
- moved api endpoints to /api/admin/* and /api/client/*
- refactored all routes to use a standalone router per file
- removed v.1 legacy data support
- removed v.1 legacy /features endpoint
- added prettier and upgraded eslint

## 2.2.0
- Expose hooks in main export #223

## 2.1.7
- Bump unleash-frontend to 2.2.6

## 2.1.6
- Added strategies validation when updating feature toggle
- Allow node newer than 6 to run the app

## 2.1.4
- Bump unleash-fronted to 2.2.4

## 2.1.3
- Bugfix for db: timestamps should be with time zone.
- Bump unleash-fronted to 2.2.3

## 2.1.2
- Bugfix for migration: avoid multiple calls on same callback.

## 2.1.0
- Provide a set of pre-defined activation strategies. These will automatically be defined by the migrator as long as they don't exist already. 
    - applicationHostname
    - gradualRolloutRandom
    - gradualRolloutSessionId
    - gradualRolloutUserId
    - remoteAddress
    - userWithId

## 2.0.4
- bump unleash-frontend which includes a lot of UI improvements and bug-fixes.
- Fix error message when trying to create a archived feature toggle. 

## 2.0.0 (January 2017)

- Support multiple strategies. This makes it easy to use multiple activation strategies in combination.
- Client metrics. Gives details about what toggles a specific client application uses, how many times a toggle was evaluated to true / false. Everything presented in the UI. 
- Client registration. This gives insight about connected clients, instances, strategies they support. 
- Client Application overview. Based on metrics and client registrations.
- Database-migration done internally by Unleash, no external migration step required. 
- Publish unleash-server to npm. 
- Provide Prometheus endpoint for service metrics (response times, memory usage, etc).
- A lot of bug-fixes (check commit history and issues for reference)
- Unleash-frontend as a separate repo: https://github.com/Unleash/unleash-frontend. Total rewrite of UI using react + redux + material Design. 
- Unleash moved to it’s own organization: https://github.com/Unleash making it more open and allow everyone to contribute. 
- Unleash-docker as a separate module: https://github.com/Unleash/unleash-docker 
- Unleash binary, making it easy to install and use Unleash as a service. 
- Removed all config/tuning that was specific to FINN.no usage of Unleash.

**If you are migrating from 1.0.0 to 2.0.0 we recommend reading [the migration guide](https://github.com/Unleash/unleash/blob/master/docs/migration-guide.md)**



## 1.0.0 (January 2015)
- Initial public release

