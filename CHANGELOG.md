# Changelog

## 3.2.8

- fix: Bump unleash-frontend to 3.2.4
- chore(package): update @types/node to version 12.0.0
- fix: LogProvider as option injected to unleash.

## 3.2.7

- fix: Session cookie should set path to baseUriPath

## 3.2.6

- Fix: Add support for IPC connections.
- fix(package): update mime to version 2.4.1
- chore(package): update nyc to version 14.0.0
- chore(package): update lockfile yarn.lock
- chore(package): update lolex to version 4.0.1
- chore(package): update lockfile yarn.lock
- chore(package): update husky to version 2.0.0
- chore(package): update lockfile yarn.lock
- chore(package): update superagent to version 5.0.2

## 3.2.5

- fix: Bump unleash-frontend to version 3.2.3
- fix: Minor logout cleanup
- feat: Added import & export through stateService (#395)

## 3.2.4

- feat: Customizable ui via ui-config

## 3.2.3

- fix: Metrics poller should start even if inital fetch fails.
- fix: SimpleAuthentication should work with custom basePaths
- fix: Add explicit endpoints for toggle on/off
- fix: Application list should be alphabetically sorted

## 3.2.2

- fix: Bump unleash-frontend to version 3.2.1

## 3.2.1

- fix: Variants should be allowed to be 'null'

## 3.2.0

- feat: Add beta support for toggle variants

## 3.1.7

- fix: Critical bugfix 'databaseSchema' not defaulting to 'public'

## 3.1.6

- fix: Database migrator does use the databaseSchema option.

## 3.1.5

- feat(permission): Implement beta support for permissions.
- chore(package): Upgrade a lot of dependencies

## 3.1.4

- chore(package): Upgrade ava to version 1.0.1
- chore(modernize): Clean up internal structure
- chore(modernize): Use joi for all validations
- chore(package): Upgrade moment to version 2.23.0
- chore(package): Upgrade deep-diff to version 1.0.2
- chore(package): Upgrade prom-client to version 11.2.0
- chore(package): Upgrade joi to version 14.3.0
- chore(package): Upgrade pg to version 7.7.1
- chore(package): Upgrade various dev-dependecies

## 3.1.3

- fix(metrics): Add prometheus compatible feature metrics endpoint

## 3.1.2

- fix(clientApi): Add namePrefix paramter to /api/client/features

## 3.1.1

- fix(gzip): Add gzip support
- fix(package): update unleash-frontend to version 3.1.3

## 3.1.0

- fix(package): update unleash-frontend to version 3.1.1

## 3.0.6

- fix(log4js): Upgrade log4js to version 3.0.3 and fix default log configuration

## 3.0.5

- fix(package): update log4js to version 3.0.2
- fix(package): update knex to version 0.15.2
- fix(package): update yargs to version 12.0.1
- chore(readme): Update documentation
- fix(package): update install to version 0.12.0
- fix(revive): Include user information on revive
- chore(package): update eslint to version 5.0.0
- chore(package): update nyc to version 12.0.1

## 3.0.4

- feat(metrics): Expose toggle updates to prometheus
- chore(package.json): Bump serve-favicon to 2.5.0
- chore(package.json): Bump joi to 13.0.3
- chore(package.json): bump express
- chore(package.json): Bump log4js to 2.6.0
- chore(package.json): Bump moment to 2.22.1
- chore(package.json): Bump @types/node to 10.0.8
- chore(package.json): Bump pg to 7.4.3
- chore(package.json): Bump knex to 0.14.6
- chore(package.json): Bump commander to 2.15.1

## 3.0.3

- feat(bind): Added option to bind to specific http address
- fix(migration): Unleash should not start if migration fails.

## 3.0.2

- fix(package): Update unleash-frontend to version 3.0.1

## 3.0.1

- fix(package): Update db-migrate-pg to version 0.4.0
- fix(package): update prom-client to version 11.0.0
- refactor: use body-parser bundled with express
- fix(package): update express-validator to version 5.0.0

## 3.0.0 (10.02.2018)

- All changes in all 3.0.0 alpha-releases is included in this version
- fix(package): Upgrade unleash-frontend to version 3.0.0

## 3.0.0-alpha.10

- chore(package.json): Bump unleash-frontend to 3.0.0-alpha.7
- fix(store): DB should not override createdAt if set.

## 3.0.0-alpha.9

- Bugfix: more informative name validation errors ([#292](https://github.com/Unleash/unleash/pull/292))

## 3.0.0-alpha.8

- [Auth] User-provider ([#261](https://github.com/Unleash/unleash/issues/261))
- [Auth] Document how to secure Unleash ([#234](https://github.com/Unleash/unleash/issues/234))
- [Auth] Admin UI should handle 401 ([#232](https://github.com/Unleash/unleash/issues/232))
- [Auth] Client API authentication ([#231](https://github.com/Unleash/unleash/issues/231))
- [Auth] Handle 403 (Forbidden) with custom auth.
- [Auth] Support sign out ([#288](https://github.com/Unleash/unleash/issues/288))

## 3.0.0-alpha.7

- Bugfix: Should not allow creation of archived toggle #284

## 3.0.0-alpha.6

- Expose vresion number in /api and in user interface.
- Housekeeping: Upgrading a lot of dependencies

## 3.0.0-alpha.3

- Bump unleash-frontend

## 3.0.0-alpha.2

- Add sdkVersion in client registration
- disable edit of built-in strategies
- Strip uknown fields in client requests.
- Disable x-powered-by header
- Add posibility to inject custom logger provider

## 3.0.0-alpha.1

- upgrade unleash-frontend to 3.0.0-alpha.1
- moved api endpoints to /api/admin/_ and /api/client/_
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
