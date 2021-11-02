# Changelog

# 4.2.0

- ix: add default sort order for built in envs (#1076)
- chore: mute expected test errors
- feat: Disable password based login (#1046)
- chore: remove console.error for tests expecting error
- fix: lint
- fix: legacy feature stale on/off needs to return full toggle
- fix: bump unleash-frontend to v4.2.11
- fix: add endpoint for fetching a single user (#1074)
- fix: reuse message formatter for addons (#1058)
- fix(deps): update dependency knex to v0.95.12
- chore(deps): update dependency lint-staged to v11.2.6
- fix: demo-auth should use /auth path
- chore(deps): update metcalfc/changelog-generator action to v2 (#1062)
- fix: use date-fns for date/time maths instead of (wrong) Date#setHours (#1070)
- chore: pool min 1, max 4 DB connections & limit Jest workers to 4 (#1069)
- chore(deps): update dependency lint-staged to v11.2.5
- docs: minor typo
- chore: add video to environments
- fix: rename websitev2 to website
- fix: Environments documentation
- fix: place dollar sign before amount (#1066)
- chore(deps): update typescript-eslint monorepo to v5.2.0
- fix: removing a strategy from a toggle should only require UPDATE_FEATURE permission
- chore(deps): update dependency lint-staged to v11.2.4
- Chore: rework docker-postgres.sh to be cross-platform (#1037)
- chore(deps): update dependency eslint to v8.1.0
- chore(deps): update dependency @types/js-yaml to v4.0.4
- chore(deps): update dependency ts-node to v10.4.0
- fix: bump unleash-frontend to 4.2.10
- Update feature-toggle-types.md
- fix: bump unleash-frontend to 4.2.9
- fix: Only trigger environment enabled/disabled events if different f… (#1053)
- chore(deps): update dependency eslint to v8 (#1012)
- fix: simplify how we update projects
- fix: Remove duplicate FEATURE_METADATA_UPDATED from events list for webhook addon (#1052)
- fix: only send FEATURE_UPDATED for legacy (#1054)
- fix(deps): update docusaurus monorepo to v2.0.0-beta.8 (#1057)
- chore(deps): update dependency ts-node to v10.3.1
- fix: bump unleash-frontend to 4.2.8
- chore(deps): update typescript-eslint monorepo to v5 (#1018)
- fix: add constraint for changing project. (#1049)
- fix: only add project environments if enabled (#1050)
- chore(deps): update dependency husky to v7.0.4
- fix: bump unleash-frontend to 4.2.7
- fix: Create a apiuser for demo auth. (#1045)
- add try-catch to demo auth middleware (#1044)
- chore(deps): update dependency jest to v27.3.1
- fix: make hasPermission call handle api tokens (#1041)
- Fix/feature strategies needs project update (#1040)
- chore(deps): update dependency jest to v27.3.0
- chore(deps): update node.js to v14.18.1
- chore(node-version): move node spec to .node-version (#1034)
- docs: add reference to developer-guide (#1035)
- chore(deps): update dependency ts-jest to v27.0.7
- chore(deps): update dependency @types/faker to v5.5.9
- fix: event-log
- Update developer-guide.md
- fix(deps): update docusaurus monorepo to v2.0.0-beta.7
- fix: bump unleash-frontend to 4.2.6
- chore(deps): update dependency ts-jest to v27.0.6
- fix: bump unleash-forntend to 4.2.5
- fix: update context field does not await the response (#1027)
- fix(deps): update dependency unleash-frontend to v4.2.4
- fix: add support for experimental flags (#1025)
- fix: feature_strategies paramter column should not be null (#1024)
- chore(deps): update dependency eslint-plugin-import to v2.25.2
- chore(deps): update dependency typescript to v4.4.4
- docs: typo fix (#1021)
- docs: grammatical error (#1022)
- fix: create admin users if enabled and zero users already
- fix: upgrade unleash-frontend to version 4.2.3
- chore(deps): update metcalfc/changelog-generator action to v1.0.1
- Make Appinstance registration include environment (#1014)
- chore(deps): update dependency ts-node to v10.3.0
- Update node.md (#1016)
- Docs: Update python.md (#1015)
- Trigger STALE events when patching stale field
- chore(deps): update dependency lint-staged to v11.2.3
- chore(deps): update dependency lint-staged to v11.2.2
- chore(deps): update dependency lint-staged to v11.2.1
- chore(deps): update dependency jest to v27.2.5
- chore(deps): update dependency eslint-config-airbnb-typescript to v14.0.1
- feat/metricsV2 (#1005)
- feat: clone feature toggle API (#1006)
- feat: add new more specific feature/environment events to addons (#994)
- fix: modify actions for PRs
- fix: custom test-script for yart coverage reporter action
- fix: custom test-script for yart coverage reporter action
- fix: adjust test-script for jest-coverage action
- chore: add jest coverage action for pr builds (#997)
- fix: add sort order to environments (#1004)
- task: Disables feature_environments without strategies (#1003)
- docs: Mention php sdk as supporting variants (#1001)
- docs: Update php documentation to include context provider (#1000)
- chore(deps): update typescript-eslint monorepo to v4.33.0
- chore(deps): update dependency lint-staged to v11.2.0
- chore(deps): update dependency eslint-plugin-prettier to v4 (#980)
- chore(deps): update typescript-eslint monorepo to v4.32.0 (#983)
- fix(deps): update dependency prom-client to v14 (#987)
- chore(deps): update dependency glob-parent to v6 (#981)
- chore(deps): update actions/setup-node action to v2 (#977)
- chore(deps): update dependency tsc-watch to v4.5.0 (#975)
- fix(deps): update dependency unleash-frontend to v4.2.0 (#976)
- fix: allow renovate-bot to autmerge minor and patch
- chore(deps): update dependency ts-node to v10.2.1 (#973)
- chore(deps): update dependency prettier to v2.4.1 (#974)
- task: Adds FEATURE_ENVIRONMENT_{ENABLED,DISABLED} events (#970)
- chore(deps): update dependency supertest to v6.1.6 (#969)
- chore(deps): update typescript-eslint monorepo to v4.31.2 (#972)
- chore(deps): update dependency typescript to v4.4.3 (#971)
- chore: security resolutions
- chore(deps): update dependency eslint-plugin-import to v2.24.2 (#960)
- fix(deps): update docusaurus monorepo to v2.0.0-beta.6 (#968)
- fix(deps): update dependency knex to v0.95.11 (#967)
- chore(deps): update dependency eslint-plugin-prettier to v3.4.1 (#961)
- chore(deps): update dependency husky to v7.0.2 (#965)
- chore(deps): update dependency source-map-support to v0.5.20 (#966)
- chore(deps): update dependency jest to v27.2.2 (#962)
- chore(deps): update dependency trim to v1 (#963)
- chore(deps): update dependency ts-jest to v27.0.5 (#964)
- chore(deps): update dependency @types/jest to v27.0.2 (#958)
- fix(deps): pin dependencies (#957)
- chore: Add renovate.json (#956)
- docs: minor adjustments.
- fix: environments should have type
- feat: rename :global: env to "default" (#947)
- Fixed the react link appearance
- fix: Enforce non-nullability of environment type (#950)
- Add UPDATE and DELETE TAG_TYPE permissions (#951)
- fix: don't include archived feature strategies (#955)
- removed the --save from npm command
- removed the --save flag
- docs: Readme update dashboard screenshot (#953)
- docs: remove the conflict between docker steps and docker-compose (#952)
- chore(deps): bump prismjs from 1.24.1 to 1.25.0 in /websitev2 (#946)
- chore(deps): bump tmpl from 1.0.4 to 1.0.5 (#949)
- fix: correct test verifications
- fix: Added displayName to feature environments
- Add type to environments
- Merge pull request #948 from Unleash/documentation-update
- update the advanced part
- update the docs with the new screenshots
- chore: set transitive resolutions
- fix: upgrade connect-session-knex to version 2.1.0
- added tests and exports for 3.17, 4.0 and 4.1 (#944)
- feat: add project and environment columns to events (#942)
- Respect sort order when displaying strategies (#943)
- Feat/api key scoping (#941)
- fix: lint error
- fix: convert schemas to typescript
- fix: convert more tests to typescript
- fix: convert api-def.js to typescript
- fix: convert xtract-user.js to typescript
- fix: convert event-hook.test.js to typescript
- fix: convert files to typescript
- fix: convert feature-schema.test.js to typescript

# 4.1.4

- feat: Move environments to enterprise (#935)
- fix: correct failing feature toggle test
- fix: Cleanup new features API with env support (#929)

# 4.1.3

- fix: Added indices and primary key to feature_tag (#936)
- fix: failing test
- fix: add resetDb to migrator
- Set default SMTP port to 587 instead of 567
- docs: add react-sdk to proxy docs.
- Update README.md

# 4.1.2

- chore: update frontend
- fix: fine tune db-config based on experience
- chore: trigger docs generation
- fix: set DEPLOYMENT_BRANCH for docusaurus
- fix: upgrade docusaurus to 2.0.0-beta.5
- fix: addon-service should only trigger enabled addons
- fix: improve performance for fetching active api tokens
- Fix/sso docs (#931)
- chore(deps): bump tar from 6.1.7 to 6.1.11 (#930)

# 4.1.1

- chore: update frontend
- fix: set correct projects count in metrics

# 4.1.0

- docs: Added mikefrancis/laravel-unleash (#927)


# 4.1.0-beta.15

- chore: update frontend
- fix: make sure exising projects get :global: env automatically
- docs: cleanup unleash-hosted refereces

# 4.1.0-beta.14

- fix: upgrade unleash-frontend to v4.1.0-beta.10
- fix: correct data format for FEATURE_CREATED event

#  4.1.0-beta.13

- chore: update frontend

#  4.1.0-beta.12

- chore: update frontend
- fix: oas docs on root
- Revert "fix: oas being overriden"
- fix: oas being overriden
- fix: only add strategies to addon texts when available
- fix: add user and project counters
- fix: import schema needs to understand :global: env
- fix: import should not drop built-in strategies

# 4.1.0-beta.11

- fix: bump unleash-frontend to 4.1.0-beta.7
- Update index.md
- Update feature-toggles-archive-api.md
- Update configuring-unleash.md

# 4.1.0-beta.10

- chore: update yarn.lock
- Fix/feature events (#924)
- fix: getFeatureToggleAdmin should include project

# 4.1.0-beta.9

- fix: upgrade unleash-frontend to version 4.1.0-beta.5

# 4.1.0-beta.8

- chore: update unleash-frontend
- Update README.md
- Update README.md
- Fix/switch project endpoint (#923)
- fix: only update name if not undefined

# 4.1.0-beta.7

- feat: sync fields when logging in via SSO (#916)
 
# 4.1.0-beta.6

- fix: bump unleash-frontend to 4.1.0-beta.3,
- fix: add php syntax highlighting to docs (#921)
- fix: add properties to legacy endpoints (#919)
- docs: Add official php documentation (#920)
- fix: add member and toggle count to project list (#918)
- Fix the custom activation strategy example (#913)
- chore: update yarn.lock
- Fix typo in sample (#917)
- Fix Common Grammar Error in ReadMe (#914)
- WIP: Feat/quickstart oss (#912)

# 4.1.0-beta.5

- fix: adjust logo in emails
- Revert "fix: uri encode smtp connection string (#901)"
- 
# 4.1.0-beta.4

- fix: Clean up exported types even more

# 4.1.0-beta.3

- fix: exported types x2

# 4.1.0-beta.2
- fix: export types from main entry

# 4.1.0-beta.1
- fix: upgrade unleash-fronendt to 4.1.0.beta.2
- docs: Update Unleash Proxy docker pull instructions (#911)
- feat: Adds sendEmail flag to body of create user request (#894)
- fix: Controller wraps handler with try/catch (#909)
- fix: upgrade husky to 7.0.1
- Revert "fix: upgrade js-yaml to 4.1.0"
- fix: upgrade js-yaml to 4.1.0
- fix: bump eslint-plugin-import to 2.24.0
- chore: remove resolution
- fix: update supertest to version 6.1.5
- fix: bump @types
- fix: update ts-node to 10.2.0
- fix: bump unleash-frontend to v4.0.10
- fix: uri encode smtp connection string (#901)
- fix: Stores as typescript and with interfaces.  (#902)
- fix: add node v16 as build target
- docs: update footer
- docs: update link to unleash-proxy-client-js
- doc: add import query params in doc (#673) (#903)
- fix: yarn.lock resolution for website docs
- fix: update yarn.lock file
- fix: failing tests
- fix: clean dist folder on build
- chore: document password requirements
- doc: Remove link to laravel php sdk
- fix: only import feature_tags for imported features
- Use absolute url to api-token doc


# 4.1.0-beta.0

- fix: Use 4.0.9 of frontend
- Fix typo (#899)
- fix: Update node.md (#896)
- fix: remove public.pem (unused)
- fix: logout-controller should support logoutUrl override (#881)
- fix: Remove trailing backslash (#892)
- fix link to proxy-javascript (#889)
- fix curl health call (#888)
- fix: always add global environment to new projects
- fix: return empty array if no features are found for project
- doc: Add rikudou/unleash-sdk to community clients (#885)

# 4.0.6-beta.1

- feat: Wip/environments (#880)
- Fixed typo (#884)
- Fix contextProvider not being in code block (#883)
- Fix link to unleash-client-go (#876)
- fix: digital ocean specs
- fix: deploy.template.yaml to follow specs
- fix: digitalocean deploy template
- fix: Added cascade to user_feedback foreign key
- fix: refactor code
- fix: add option for graceful shutdown (#872)
- docs: Added api key for algolia
- fix: Do gracefull shutdown of Unleash on 'SIGINT' & 'SIGTERM' (#870)
- docs: improve introduction section
- docs: improve introduction section
- docs: fix wrong grafana query
- chore: update readme
- docs: fix typo and remember to note that the slack addon needs Unleash URL
- chore(deps): bump ws from 6.2.1 to 6.2.2 in /websitev2 (#869)
- doc: redirects for external links

# 4.0.4

- fix: userFeedback should not be allowed to throw
- fix: make sure routes/user handles api calls

# 4.0.3

- feat: pnps feedback (#862)
- fix: upgrade unleash-frontend to v4.0.4
- chore: docs updates

# 4.0.2

- fix: upgrade unleash-frontend to version 4.0.1
- fix: projects needs at least one owner

# 4.0.1

- fix: create config should allow all options params
- fix: a lot of minor docs improvements

# 4.0.0

- fix: upgrade unleash-frontend to version 4.0.0
- fix: add migration (#847)
- fix: Refactor/update email (#848)
- chore(deps): bump hosted-git-info from 2.8.8 to 2.8.9 in /website (#843)
- Add explanation of how to run multiple instances of Unleash to the Getting Started doc (#845

# 4.0.0-beta.6

- fix: Upgrade unleash-frontend to version 4.0.0-beta.5
- fix: Update docs to prepare for version 4

# 4.0.0-beta.5

- fix: upgrade to unleash-frontend 4.0.0-beta.4
- fix: versionInfo as part of ui-config
- fix: misunderstanding node URL api
- fix: demo auth type should support api token

# 4.0.0-beta.4

- upgrade unleash-frontend to version 4.0.0-beta.3
- fix: convert to typescript
- fix: report email as not sent to fe if it throws (#844)

# 4.0.0-beta.3

- chore: update changelog
- fix: reset-token-service should use unleashUrl
- chore: expose an endpoint to really delete a toggle (#808)
- fix: upgrade unleash-frontend to version 4.0.0-beta.2

# 4.0.0-beta.1

- fix: upgrade unleash-frontend to version 4.0.0-beta.0
- fix: rbac now checks permission for both projects (#838)
- fix: an hour is 3600000 seconds not 60000 seconds
- fix: readd support for DATABASE_URL_FILE

# 4.0.0-beta.0

- fix: reload of admin/api page yields 404

# 4.0.0-alpha.8

- feat: global events requires admin role
- fix: remove toast info from bootstrap controller (#834)
- feat: add migration (#832)
- fix: set name type to be min 1 character (#833)
- fix: bum unleash-frontend to version 4.0.0-alpha.14
- fix: /api/admin/user should not allow caching
- fix: match bootstrap uiConfig with expected data format (#830)
- feat: Datadog integration (#820)
- fix: regular users are not API users
- Feat: format base path (#828)

# 4.0.0-alpha.7

- fix: more types
- fix: move permission to types
- fix: bump unleash-frontend to version 4.0.0-alpha.12
- fix: catch all route only for baseUriPath (#825)
- Feat/serve frontend with baseuri (#824)
- fix: define root role by setting the name of the role (#823)
- feat: automatically add all existing users as owners to all existing … (#818)
- fix: project store was wrongly typing its id field as number (#822)

# 4.0.0-alpha.6

- feat: Teams addon for messaging on Microsoft teams (#814)
- feat: add user create/update/delete events (#807)
- fix: upgrade unleash-frontend to version 4.0.0-alpha.11
- fix: Authentication required options is optional
- fix: default custom auth hook now denies all requests to api endpoints (#811)
- fix: deletes sessions for user when user is removed (#810)
- fix: import statements for type/events
- fix: refactor event types
- fix: move AuthenticationRequired to types
- fix: migrate only users without any role
- fix: migration to create root roles for users with permissions (#816)
- fix: set default DATABASE_SSL to not rejectUnauthorized (#817)
- fix: handle password being undefined when validating (#809)
- fix: active sessions are now destroyed if auth/reset and auth/validate endpoints are used (#806)
- fix: send email on process.nextTick (#805)
- fix: add hosted auth option
- fix: fix test data
- fix: correct test data
- fix: migration should call cb on down
- fix: change default admin password
- fix: add types for node-fetch

# 4.0.0-alpha.5

- chore: update frontend

# 4.0.0-alpha.4

- feat: add option for LOG_LEVEL (#803)
- fix: make users emails case-insensitive (#804)
- fix: update unleash-frontend
- fix: emailservice now just returns if email was configured
- fix: simplify isConfigured check
- fix: loading of emailtemplates

# 4.0.0-alpha.3

- fix: should allow revive toggles
- fix: hasPermission should not throw
- fix: Added enterpriseVersion to root of IUnleashConfig/IUnleashOptions
- feat: add new user email (#793)
- fix: User should require a ID field set (#799)
- fix: introduce settingService
- fix: migration rollback use DROP for column
- fix: skipLocked when updating lastSeen for toggles
- feat: Add change-password endpoint to user-controller (#800)
- fix: convert AUTH_TYPE to uppercase (#797)
- Fix: strategies sort order (#798)
- fix: only ADMIN can list all users
- fix: enable demo-authentication (#796)
- fix: default db SSL to undefined
- fix: use db config with schema for db-migrate
- feat: options need types (#794)
- feat: add ui-bootstrap endpoint (#790)
- feat: add ui-bootstrap endpoint (#790)
- feat: expose user permissions (#791)
- feat: Reset token (#786)
- fix: rename rbac roles. (#788)
- fix: remove unused import
- fix: fully remove enableLegacyRoutes option
- fix: failing tests
- fix: expose auth-type in ui-config

## 4.0.0-alpha.2

- feat: Email service (#757)
- feat: unleash v4 will require node 14 or higher (#784)
- feat: Add username/password authentication (#777)
- fix: should only do checkRbac if it exists
- fix: docs transitive dependencies
- chore: typos in migration-guide
- fix: remove enableLegacyRoutes option from v2
- fix: upgrade unleash-frontend to latest alpha
- fix: migrate all permissions to rbac (#782)
- fix: add default empty array to strategies from db (#781)
- feat: added basic email-service (#780)
- fix: Clear-Site-Data header needs to be double quoted

## 4.0.0-alpha.1

- chore: upgrade frontend 4.0.0-alpha.1

## 4.0.0-alpha.0

- chore(deps): bump y18n from 4.0.0 to 4.0.1 (#775)
- Feat: Api-Tokens (#774)

## 3.17.6

- fix: skipLocked when updating lastSeen for toggles (second attempt)

## 3.17.5

- fix: skipLocked when updating lastSeen for toggles

## 3.17.4

- fix: version-checker must have instanceId
- fix: ensure createdBy is not empty

## 3.17.3

- feat: upgrade unleash-frontend to version 3.14.1
- fix: make sure CREATE_APPLICATION events are only sent once per application

## 3.17.2

- fix: make sure applying unique constraint on client_instances works

## 3.17.1

- fix: initial event.tags should be array type
- fix: always set instanceId in ui-config

## 3.17.0

- fix: upgrade docusaurus
- feat: upgrade unleash-frontend to version 3.14.0
- Add import/export for tags and projects (#754)
- feat: Default roles and RBAC permission checker. (#735) (experimental)
- feat: upgrade unleash-frontend to version 3.14.0

## 3.16.1

- fix: make sure applying unique constraint on client_instances works

## 3.16.0

- fix: projectId must follow nameType in query
- fix: publish events about unannounced applications
- fix: messages to slack for archived toggles (#750)
- fix: makes event-store emit id and createdAt (#746)
- fix: don't use hardcoded timestamps as default values (#745)
- feat/return feature on create (#742)
- fix: incorrect sql syntax in migration.
- feat: add support for bulk operations on client apps/instance registr<E2><80><A6> (#744)
- fix: add unit test for addon-retry
- fix: add strategy constraints

## 3.15.0

Began work on a technical debt dashboard on the frontend. The first iteration of this dashboard is included in this release.

- fix: not crash if addon http post throws (#738)
- fix: update unleash-frontend dependency (#736)
- fix: project id should be validated correctly on create
- fix: upgrade unleash-frontend to version 3.13.1

## 3.14.0

- feat: upgrade unleash-frontend to version 3.13.0
- feat: make client features endpoint memoizable (#734)
- feat: Add instance id to ui-config endpoint
- fix: make sure test-data is urlsafe

## 3.13.0

- feat: check latest version
- feat: expose current and latest version to ui-config
- feat: Use express-session backed by postgres
- feat: update unleash-frontend to version 3.12.0
- feat: Handle database connection errors with 500 (#725)
- feat: Introduce specific "feature stale" events (#727)
- fix: generate uuid in js migration instead of from db
- fix: Don't check version when starting up in dev mode
- fix: TypeScript should be a dev dependency (#730)
- fix: make sure static site includes CNAME
- fix: gh-720 Use express path templates for prometheus metrics (#724)

## 3.12.0

- feat: setup typescript
- fix: refactor context to use service pattern
- feat: allow stickiness on context-fields
- fix: add middleware verifying content type
- chore: Remove git add from husky

## 3.11.2

- fix: update unleash-frontend to version 3.11.4

## 3.11.1

- fix: upgrade unleash-frontend to version 3.11.3

## 3.11.0

- feat: Add support for filtering toggles on tags, projects or namePrefix (#690)
- feat: Introduce addon framework
- feat: Added tags to events table and emitted events
- fix: upgrade prom-client from 12.0.0 to 13.1.0
- fix: upgrade unleash-frontend to version 3.11.2
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
