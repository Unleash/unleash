# Changelog

## 2.1.0
- Provide a set of defined activation strategies:
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



## 1.0.0 (January 2014)
- Initial public release

