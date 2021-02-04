# Changelog

## 3.11.x (unreleased)

- feat: Add support for filtering toggles on tags, projects or namePrefix (#690)
- feat: Introduce addon framework
- feat: Added tags to events table and emitted events
- fix: upgrade prom-client from 12.0.0 to 13.1.0
- fix: hide jira addon for now
- fix: upgrade unleash-frontend to version 3.11.1
- fix: Add a test for validation of empty params
- fix: add docs for addons
- fix: Add validation of required parameters
- fix: add unleashUrl option
- fix: Addons should support sensitive params
- fix: should wait for seen apps
- fix: typo in message in simple-authentication.js (#707)
- fix: even-store should not block on emit
- fix: Added the ability to specify db-schema via ENV (#702)
- fix: Strategy schema should allow deprecated field (#700)
- docs: update getting started guide with docker options (#697)
- fix typo in /api/client/features docs (#694)
- fix: website: require immer 8.0.1 or higher
- fix: Add support for configuring database pool size (#705)
- feat: Set default min dbpool size to 0
- feat: Set default max dbpool size to 4

## 3.10.1

- fix: remove fields from /api/client/features respnse (#692)

## 3.10.0

- feat: add tags (#655)
- feat: add tag-types (#655)
- feat: Added servicelayer (#685)
- feat: Allow deprecation of strategies (#682)
- feat: add lastSeenAt for feature toggles
- fix: upgrade knex to 0.21.15
- fix: Updated docs about event-types (#684)
- fix: Add application-created event (#595)

## 3.9.0

- fix: stateService undefined
- fix: this.timer merge conflict
- feat: add stop() method to gracefully terminate unleash (#665)

## 3.8.0

- feat: First draft of admin Open API specification (OAS) (#652)
- feat: upgrade unleash-frontend to version 3.8.2
- fix: OpenApi - Added Client API calls (#667)
- fix: run build also for external PRs
- fix: eslint ignorePatterns for OAS
- fix: typo in OAS servers
- fix: add support for basic auth with simple-auth (#659)
- fix: remove unused github action
- fix: add heroku server to openapi servers
- fix: add import options as part of environment variables
- fix: bump dev-deps for security
- fix: Replace travis with GitHub Actions
- fix: disable david-dm

## 3.7.0

- feat: Add support for explicitly set database version. (#654)
- feat: stateServices only exposed via services object
- feat: upgrade unleash-frontend to 3.7.0
- feat: Add technical support for projects
- chore(docs): Fix url typo in docs
- chore(docs): Fix url typo
- chore(docs): Add clojure client to doc (#649)
- chore(docs): Add clojure client to doc (#648)
- chore(docs): Add clojure client library reference (#647)
- fix: upgrade to unleash-frontend 3.5.6
- fix: Allow spaces/special chars in application names
- chore(docs): update sidebar
- feat: Allow migration style import (#645)
- fix: Variants missing from client API docs
- fix: constriants must have at least one value defined
- fix(docs): wrong id for feature-types
- fix: do not allow empty ('') constrain values.
- chore(deps): bump dot-prop from 4.2.0 to 4.2.1 in /website (#644)
- fix: clarify PostgreSQL version support
- fix: update list of SDKs supporting variants
- fix: add docs for disabled variant
- fix: Add api documentation for strategy constraints.
- fix: join link to slack in help section
- chore: fix typo in docs

## 3.6.1

- fix: update unleash-frontend to version 3.6.4
- fix: upgradde unleash-frontend to version 3.6.3
- fix: context legalValues should be at max 100 chars
- fix: enable trust-proxy
- fix: upgrade cookie-session library
- fix: default maxAge for session set to two days
- fix: add TTL to sessions
- fix: use validated and stripped data when updating
- fix: should use stripped update data for featureToggle
- fix: set clear-site-data on logout
- fix: use secure proxy to session cookie
- fix: add secureHeaders option for HSTS
- fix: stickness parmeters for stickiness is camelCase (doc)

## 3.6.0

- feat: Remove applications (#635)
- feat: upgrade unleash-frontend to version 3.6.2. Notable changes:
  - feat: add search for applications
  - feat: Should be possible to remove applications
  - fix: make sure application is updated on edit
  - fix: list parameters should be trimmed
  - fix: show notification when app updates
  - fix: show notification when app updates
- feat: upgrade knex to version 0.21.5
- fix: Name conflict should return 409
- fix: improve import/export documentation
- fix: update helmet config
- fix: Heroku Postgres add-on version change (#631)
- fix: Add option via env for ADMIN_AUTHENTICATION
- fix: upgrade yargs to version 16.0.3

## 3.5.4

- fix: helmet wap csp in quotes

## 3.5.3

- fix: lax helmet csp config for styles.

## 3.5.2

- fix: add optional helmet security headers
- fix: The links for Kotlin and PHP clients got mixed up (#623)

## 3.5.1

- fix: upgrade to [unleash-frontend v3.5.1](https://github.com/Unleash/unleash-frontend/blob/master/CHANGELOG.md#351)

## 3.5.0

- feat: add stale property on toggle (#619)
- fix: upgrade joi to version 17.2.0
- feat: Add support for toggle types (#618)
- feat: added time-ago to toggle-list

## 3.4.2

- fix: upgrade unleash-frontend to version 3.4.0
- fix: version should be part of ui-config (#616)
- feat: add weightType as legal property on variant schema (#614)
- Update getting-started.md (#617)
- Update @types/node to the latest version 🚀 (#596)
- fix: upgrade js-yaml to latest
- chore(deps): bump lodash from 4.17.15 to 4.17.19 in /website (#611)
- fix: replace @hapi/joi with joi
- Update getting-started.md
- fix: exporting only feature toggles as yaml should not crash

## 3.4.1

- fix: add keepAliveTimeout option

## 3.4.0

- feat: Adds server.create() (#606)

## 3.3.6

- fix: upgrade unleash-frontend to verson 3.3.5

## 3.3.5

- fix: upgrade unleash-frontend to verson 3.3.3

## 3.3.4

- fix: we now support node 14 :hurray
- fix: upgrade db-migrate-pg to version 1.2.2
- fix: upgrade unleash-frontend to version 3.3.2

## 3.3.3

- chore: add a few more community client SDKs
- fix: add user-store (#590)
- fix: upgrade unleash-frontend to 3.3.1
- fix: license year and company
- chore: add dart sdk details
- fix: pg dependency for db-migrate as well
- fix: support node 14 by upgrading pg to 8.0.3
- fix: we are not ready for node 14
- fix: remove Procfile for Heroku

## 3.3.2

- fix: stop measure responsetime for unknown paths (#591)
- fix: expose evaluated config and permissions object
- fix: user should not crash if email is missing

## 3.3.1

- fix: Support proper SSL settings using `DATABASE_SSL` (#585)
- fix: upgrade unleash-frontend to version 3.2.21
- fix: add users-table to store user details (#586)
- fix: disable ssl for local postgres in dev
- fix: use airbnb lint rules directly (#583)
- chore: reduce log-level for metrics

## 3.3.0

- feat: Update "enableLegacyRoutes" to false (#580)
- feat: require node >= 12
- feat: move secrets to settings (#577)
- fix: Update unleash-frontend to version 3.2.20 (#582)
- fix: Logout should not be xhr call (#576)
- fix: Update pg to the latest version 🚀 (#578)
- fix: upgrade eslint to verson 6.8.0
- fix: upgrade ava to version 3.7.0
- chore: update getting-started guide
- Fix: typo webpage (#579)
- fix(readme): improve heroku 1 click deploy behavior (#575)
- chore: Fix typo in gogole-auth-hook example (#572)
- fix: bump acorn from 7.0.0 to 7.1.1 (#571)

## 3.2.30

- fix: upgrade unleash-frontend to version 3.2.19

## 3.2.29

- fix: lock knex to version 0.20.10
- fix: upgrade unleash-frontend to version 3.2.18

## 3.2.28

- fix: more metrics
- fix: upgrade unleash-frontend to version 3.2.17
- fix: add settings column to postgres
- feat: api supports context fields (#564)
- fix: failing user.test on gravatar url
- fix: use gravatar-url instead of gravatar dep
- fix: upgrade lint-staged to latest
- fix: upgrade @hapi/joi to version 17.1.0
- fix: upgrade husky to version 4.2.3

## 3.2.27

- fix: remove prometheus-gc-stats dependency

## 3.2.26

- fix: Update prom-client to the latest version 🚀 (#562)
- chore: update lolex to latest version
- fix: variant weights can be up to 1000

## 3.2.25

- fix: upgrade unleash-frontend to version 3.2.15

## 3.2.24

- fix: upgrade unleash-frontend to version 3.2.13

## 3.2.23

- fix: upgrade to @hapi/joi to version 16.1.8
- fix: Upgrade unleash-frontend to version 3.2.11
- fix: update yargs to version 15.1.0

## 3.2.22

- fix: add appName as label in usage metrics

## 3.2.21

- fix: missing strategy makes the toggle-configure crash

## 3.2.20

- fix: update @types/node to latest
- fix: constraints should be part of toggle schema
- fix: Update yargs to to version 15.0.1
- fix: Update log4js to the latest version 🚀 (#524)
- fix: Add option to disable database migrations #526 (#52

## 3.2.19

- fix: update knex to version 0.20.0
- fix: Update unleash-frontend to 3.2.9

## 3.2.18

- feat: Add new Flexible Rollout Strategy (#517)

## 3.2.17

- fix: bump knex from 0.19.4 to 0.19.5 (secutiry-fix)

## 3.2.16

- fix: Update unleash-frontend to version 3.2.7
- fix: lint error
- fix: Add admin api for context-field definitions
- fix: Update lolex to the latest version 🚀 (#508)
- fix: Only use set-value 2.0.1
- chore: Added static context props in docs (#507)
- fix: Update dev-dependencies
- fix: upgrade prettier to version 1.18.2
- fix: Upgrade express to version 4.17.1
- fix: update eslint to version 6.5.1
- fix: update @passport-next/passport to version 3.0.1
- fix: remove unused dependency: commander
- chore: Add details about Larvel (php) SDK
- chore: Added unleash-client-core as official sdk (#505)
- fix: e2e tests should only set up one database per test file (#504)
- chore: Added reference to official client implementation in .Net (#503)
- fix(deps): bump mixin-deep from 1.3.1 to 1.3.2 (#487)
- fix: do not destroy db on startup
- fix: remove old test-setup hacks
- fix: upgrade knex to version 0.19.4
- fix: upgrade @types/node to version 12.7.9
- fix: upgrade lint-staged to version 9.4.1
- fix: add more logging if test-db destroy fails
- fix: upgrade async to version 3.1.0
- fix: upgrade supertest to version 4.0.2
- chore: upgrade ava to version 2.4.0
- fix: remove unused depenency yallist
- fix: Bump yargs to version 14.0.0
- fix: bump husky to version 3.0.8
- chore: Updated slack invite token (#501)
- fix: Upgrade log4js to version 5.1.0
- chore: increase test-logging
- chore: see if travis is hapy with serial tests
- Revert "fix: build on node 10 and 12"
- fix: build on node 10 and 12
- fix: bump pg to 7.12.1
- fix: only build with node v10 for now
- fix: build on node 10 and 12
- Fix asset paths (#486)
- chore: fix broken links
- chore: Add Elixir Unleash Library to README (#480)
- fix: update keycloak example (#478)
- fix(package): update commander to version 3.0.0

## 3.2.15

- feat: add db query latency metrics
- fix: fix: update knex to version 0.19.1
- fix: remove unused dependency install
- fix: Upgrade lint-staged to version 9.2.1
- fix: Upgrade husky to version 3.0.1
- fix: upgrade eslint to version 6.1.0
- fix: Update unleash-frontend to version 3.2.6
- fix: upgrade ava to 2.2.0
- fix: Update @passport-next/passport to the latest version rocket (#469)
- chore: Add guide for how to use eventHook to send updates to Slack

## 3.2.14

- fix: Unleash bin should allow databaseUrl to be defined in env.

## 3.2.13

- feat: add option and functionality that allows a user to hook into feature mutations (#457)
- chore: add budgets as a company using unleash (#456)
- fix: Add DATABASE_URL_FILE for loading a db url from a file (#455)
- fix: Upgrade knex to version 0.17.5
- chore: Update db-migrate-pg to version 1.0.0

## 3.2.12

- fix: none authentication should have a mock user (#449)
- fix: Update commander to version 2.20.0
- chore: Update docusaurus to version 1.11.0
- chore: Update ava to version 2.0.0
- chore: Update async to the latest version

## 3.2.11

- feat: Separate DATABASE*URL to multiple DATABASE*\* variable (#437)

## 3.2.10

- fix: Strategies should not be required for updateding application details
- feat: boolean strategy paramters

## 3.2.9

- fix: should be more allow about empty metrics

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
