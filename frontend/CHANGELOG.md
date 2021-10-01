# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

The latest version of this document is always available in
[releases](https://github.com/Unleash/unleash-frontend/releases).
# 4.2.1
- Feat/toggle view (#389)
- feat: created project header (#388)
- feat: e2e tests and mobile views (#348)
- fix: missing-toggle link should include name-param once
- feat: project environments configuration (#365)
- fix: use renovater github config
- fix: renovate should be allowed to automerge all packages
- fix: allow renovate bot to auto-merge
- task: remove display name from environment (#367)
# 4.2.0
- Feat/environment strategies (#339)
- fix: not set env if undefined
- Add renovate.json (#340)
- Add project and environment scoping to API keys (#336)
- Fix/strategy permissions (#337)
- fix: header zIndex
- Feat/environment crud (#335)
# 4.1.1
- fix: header zindex
# 4.1.0
- fix: sync (#334)
- Fix/create feature (#332)
- Fix/texture (#330)
- fix: update constraint text field
- Fix/minor 41 bugs (#329)
- fix: clean up footer a bit
- fix: content-wrapper should not take 100%
- fix: should not show deprecated strategies
- fix: do not filter parent routes for main nav
- fix: add feature toggles and projects to mobile navigation (#328)
- fix: change prepublish to prepare
# 4.1.0-beta.4
- Feat/feature routes
- add enableSingleSignOut for OIDC
- (feat/tests) feat: SSO auto-create users with default role
# 4.1.0-beta.3
- Fix/routing
# 4.1.0-beta.2
- Fix/frontend projects changes 
- chore(deps): bump path-parse from 1.0.6 to 1.0.7 
- Add switch for deciding whether to send email.
- Fix/make sure stickiness exists 
- Load name from url 
- chore(deps): bump dns-packet from 1.3.1 to 1.3.4 
- chore(deps): bump ws from 6.2.1 to 6.2.2 
- chore(deps): bump tar from 6.1.0 to 6.1.5 
- fix: variant stickiness should not revert to default when updating 
- fix: add logout as an explicit call 
- Feat/new navigation 
# 4.0.5 fix: run use effect when value changes, not object (#315)
- fix: run use effect when value changes, not object (#315)
- fix: add flex wrap

# 4.0.5-beta.2
- fix/pagination

# 4.0.5-beta.1
- Feat/group by projects 
- fix: add missing icons
- Offline mode

# 4.0.4

- fix: update feedback url

# 4.0.3

- fix: add null check for dueDate

# 4.0.2

- chore/update-changelog
- feat/pnps
- fix/customer journey patches (#304)
- fix: add check for obscure error (#305)
- fix: passwordchecker

# 4.0.1

- fix: Project  actions need to checkAccess based on projectId
- fix: INLINE_RUNTIME_CHUNK

# 4.0.0

- feat: update color scheme and logo (#301)
- feat: Add admin-invoice section (#299)
- fix: reset border radius on mobile
- fix: standalone pages (#300)

# 4.0.0-beta.5

- chore(deps): bump hosted-git-info from 2.8.8 to 2.8.9 (#291)
- fix: remove unused components
- Fix/customer journey (#297)
- feat: simple project view (#295)
- fix: use router match util (#298)
- fix: typo
- fix: import correct component container (#296)

# 4.0.0-beta.4

- fix: footer

# 4.0.0-beta.3

- fix: include invite link in email (#294)
- fix: add link to manage access to edit project
- fix: hosted auth should not need to load initial data

# 4.0.0-beta.2

- Fix: feedback on create (#292)
- fix: proper error handling for auth-settings being stored (#293)
- fix: api path for auth-config
- fix: improve password auth extra options

# 4.0.0-beta.1

- fix: support custom stickiness for flexible strategies
- fix:  add members to project use correct uri
- Fix/console warn (#290)
- Fix/strategy constraints (#289)
- Set .nvmrc to 14 to reflect new requirement of node

# 4.0.0-beta.0

- feat: upgrade to node.js v14
- fix: tiny margin for feature toggle list item
- fix: should be allowed to create toggles without errors
- Fix: jumping screen (#288)
- Fix/minor changes (#285)
- Fix/v4 corrections (#287)
- fix: use correct baseUriPath with localStorage
- fix: link to docs for empty apps

# 4.0.0-alpha.14

- fix: all global event log requires admin
- fix: constraints array can be undefined

# 4.0.0-alpha.13

- feat: bootstrap endpoint for initial data (#281)
- fix: allow permissions to be checked without project being defined (#282)
- fix/strategy constraints (#283)
- fix: logout should only be called once
- fix: handle generic errors better


# 4.0.0-alpha.12

- fix: add datadog logo for addons

# 4.0.0-alpha.11
- Feat/auth hosted section (#280)
- fix: only get legalValues if definition exists
- Fix/variants (#278)
- Fix/bugfixes (#279)
- fix/locale (#277)
- fix: added teams logo
- Fix/cleanup (#276)
- fix: password

# 4.0.0-alpha.10
- fix: password

# 4.0.0-alpha.9
- fix: optimizations
- feat: user profile

# 4.0.0-alpha.8
- chore(deps): bump ssri from 6.0.1 to 6.0.2 (#270)
- fix: lint
- fix: minor tuning on auth
- feat: add new user (#273)

# 4.0.0-alpha.7
- feat: add support for demo sign-in

# 4.0.0-alpha.5
- fix: require ADMIN role to manage users
- fix: add permissions for tag-types and project

# 4.0.0-alpha.4
- fix: overall bugs
- feat: user flow
- fix: small description for toggles
- fix: make admin pages fork for OSS and enterprise

# 4.0.0-alpha.3
- fix: logout redirect logic
- fix: redirect from login page if authorized
- fix: material UI cleanup (#264)


# 4.0.0-alpha.2
- feat: admin users (#266)
- fix: remove editableStrategies from useEffect deps
- fix: Migrate to create-react-app and react-scripts (#263)

# 4.0.0-alpha.1

-   fix: delete strategy

# 4.0.0-alpha.0

-   feat: Switch to material-ui

# 3.15.0

-   feat: Adapt API keys to new endpoint (#259)
-   chore(deps): bump elliptic from 6.5.3 to 6.5.4 (#253)
-   chore(deps): bump yargs-parser from 5.0.0 to 5.0.1 (#256)
-   chore(deps): bump y18n from 3.2.1 to 3.2.2 (#261)
-   fix: add ascending sorting (#260)
-   chore: changelog
-   fix: encode URI value when deleting tag
-   Merge pull request #257 from Unleash/fix/encode-tag-values
-   fix: encode tag value

# 3.14.1

-   fix: uriencode tag.value when deleting a tag

# 3.14.0

-   fix: should fetch projects once to make sure we know about projects
-   feat/rbac: edit access for projects. (#251)

# 3.13.5

-   fix: check that strategies exists before calling includes

# 3.13.4

-   fix: metrics invalid date

# 3.13.3

-   fix: content-min-height

# 3.13.2

-   feat: stale dashboard

# 3.13.1

-   fix: fix update-variant-test
-   fix: unsecure => insecure
-   fix: upgrade uglifyjs-webpack-plugin to version 2.2.0
-   fix: one and only one front (#244)

# 3.13.0

-   fix: minor visual for dropdowns
-   feat: add oss/enterprise version to footer (#245)

# 3.12.0

-   feat: allow custom context fields to define stickiness. (#241)
-   fix: filter duplicates

# 3.11.4

-   fix: should not register duplicate HTML5 backends

# 3.11.3

-   fix: use findIndex when using predicate.

# 3.11.2

-   fix: Add UI for showing 'create tag' errors
-   fix: UX should not eagerly store strategy updates! (#240)
-   fix: upgraded jest to version 26.6.3

# 3.11.1

-   fix: make sure we also bundle SVG in public

# 3.11.0

-   feat: Addon support from UI (#236)
-   fix: Use type and value from action to remove tag (#238)
-   fix: add missing space (#239)
-   fix: error in snapshot

# 3.10.0

-   feat: Can now deprecate and reactivate strategies (#235)

# 3.9.1

-   fix: Tags viewable on archived features (#233)

# 3.9.0

-   feat: Tags for feature toggles (#232)
-   feat: Tag-types (#232)

# 3.8.4

-   fix: update canisue-lite
-   fix: move all api calls to store folders
-   fix: move feature-metrics store to its own folder
-   fix: move history to folder
-   fix: move feature-toggle store into folder
-   fix: move error store into folder
-   fix: remove unused client-instance concept
-   fix: archive store in folder
-   fix: remove use of input stores

# 3.8.3

-   feat: Add last seen at timestamp
-   fix: add last seen as sort option

# 3.8.2

-   fix: new feature toggle gets default strategy

# 3.8.1

-   fix: minor CSS improvement for strategy configs
-   fix: minor strategy configure update

# 3.8.0

-   feat: Should update activation strategies immediately (#229)

# 3.7.0

-   fix: remove deprecated badges
-   fix: filter for projects
-   chore(deps-dev): bump node-fetch from 2.6.0 to 2.6.1
-   feat: add technical support for projects in UI

# 3.6.5

-   fix: should be possible to remove all variants.

# 3.6.4

-   fix: minur ux tweaks

# 3.6.3

-   fix: hide content if showing authentication modal
-   fix: add security wanring to the console
-   fix: typo description => descriptionn

# 3.6.2

-   fix: show notification when app updates
-   fix: add created date for applications

# 3.6.1

-   fix: minor css tweaks for mobile
-   fix: should support 409 responses as well

# 3.6.0

-   feat: add search for applications
-   feat: Should be possible to remove applications
-   fix: make sure application is updated on edit
-   fix: list parameters should be trimmed
-   fix: cleanup edit application a bit
-   fix: use https url for local->heroku proxy
-   fix: upgrade whatwg-fetch to version 3.4.1

# 3.5.1

-   fix: add link to all client SDKs
-   fix: use Rect.memo to increase performance

# [3.5.0]

-   feat: added time-ago to toggle-list
-   feat: Add stale marking of feature toggles
-   feat: add support for toggle type (#220)
-   feat: sort by stale
-   fix: improve type-chip color
-   fix: some ux cleanup for toggle types

# [3.4.0]

-   Feat: (VariantCustomization) Allow user to customize variant weights (#216)
-   bump elliptic from 6.5.2 to 6.5.3 (#218)
-   chore(deps): bump websocket-extensions from 0.1.3 to 0.1.4 (#217)
-   chore(deps-dev): bump lodash from 4.17.15 to 4.17.19 (#214)
-   fix: upgrade react-dnd to version 11.1.3
-   fix: Update react-dnd to the latest version 🚀 (#213)
-   fix: read unleash version from ui-config (#219)
-   fix: flag initial context fields

# [3.3.5]

-   fix: should handle zero variants
-   fix: modal for variants

## [3.3.4]

-   fix: allow overflow for strategy card
-   fix: add common component input-list-field

## [3.3.3]

-   fix: improve on variant ui
-   fix: should not clear all stores on update user profile
-   fix: convert variant-view-component to function
-   fix: tune css a little

## [3.3.2]

-   fix: reset stores on login/logout (#212)
-   fix: password login should prefer login options
-   fix: Transform username/password login response to json (#211)

## [3.3.1]

-   feat: add support for username/password login
-   feat: locale select should be dropdown menu
-   feat: support internal routes
-   fix: adjust colors of dialog

## [3.2.21]

-   fix: upgrade fetch-mock to version 9.4.0
-   fix: upgrade redux to version 4.0.5
-   fix: upgrade babel dependencies
-   fix: upgrade react-router to version 5.1.2
-   fix: upgrade react to version 16.13.1
-   fix: rename use of legacy react lifecyle methods
-   fix: upgrade react-dnd to version 10.0.2"

## [3.2.20]

-   fix: logout should be real request and not just XHR

## [3.2.19]

-   fix: default groupId never set for strategies (only in ui)

## [3.2.18]

-   fix: clean up history view a bit

## [3.2.17]

-   fix: feature search should use debounce
-   fix: footer should be on bottom

## [3.2.16]

-   fix: minor improvement on context UI

## [3.2.15]

-   fix: strategy config not maintainted in create toggle
-   fix: missing feature toggle should pre-fill name

## [3.2.14]

-   fix: upgrade react-mdl to version 2.1.0

## [3.2.13]

-   fix: Should be possible to clone even if strategy does not have groupId

## [3.2.12]

-   feat: clone feature toggle configuration (#201)

## [3.2.11]

-   fix: clean up variants view
-   fix: Cannot remove all variants in Admin UI
-   fix: update fetch-mock to version 8.0.0 (#199)
-   fix: update mini-css-extract-plugin to version 0.9.0

## [3.2.10]

-   fix: missing strategy makes the toggle-configure crash

## [3.2.9]

-   fix: Update feature toggle description. (#198)
-   fix: Update feature toggle description. (#196)
-   feat: Filter on all values in toogle data
-   feat: Add option for custom ui links (#195)
-   fix: Ensure chips are wrapped (#194)

## [3.2.8]

-   fix: auto-fill groupId paramters
-   feat: Add support for flexible rollout strategy. (#193)

## [3.2.7]

-   fix: upgrade react to 16.10.2
-   fix: upgrade eslint to version 6.5.1
-   fix: upgrade style-loader to version 1.0.0
-   fix: Build with node-10
-   chore: update yarn.lock
-   fix: babel-preset-env (#190)
-   fix: Added plugin to remove dist folder automatically (#191)
-   fix: Prevent text highlighting overlap between chips (#188)
-   chore: Added official sdk in the footer (#189)

## [3.2.6]

-   fix: Add new locales: cz, de

## [3.2.5]

-   feat: boolean strategy paramters

## [3.2.4]

-   fix: Clean up the UI with empty states
-   feat: Support a few more locales

## [3.2.3]

-   fix: Cleanup logut flow
-   chore: remove unleash.beta.variants flag

## [3.2.2]

-   fix: Use toggle/on/off endoints to ensure correct state
-   feat: Customisable UI via config
-   chore: Update css-loader to version 2.1.1
-   chore: Update debug to version 4.1.1
-   chore: Update enzyme to latest versions
-   chore: Update redux\* to latest versions

## [3.2.1]

-   fix: Fixed bug in history view preventing toggle-view.
-   feat: Add all official client SDKs to footer

## [3.2.0]

-   feat: Initial beta support for variants
-   feature: Show tooltips and featuretoggle names in event view

## [3.1.4]

-   feat: Add UI support for permission.

## [3.1.3]

-   fix(webpack): Strip all comments in css/js bundles.

## [3.1.2]

-   chore(package): update webpack to version 4.17.1
-   chore(package): move all dependencies to devDependencies as they are not used outside this module.

## [3.1.1]

-   fix(strategy-create): Should be able to open the create strategy view.
-   chore(package): Upgrade redux to version 4.0.0

## [3.1.0]

-   fix(react-router): Upgrade to react-router v4.
-   fix(feature-create): Default strategy should be chosen if strategy list is empty.
-   fix(feature-update): Do not change route after feature toggle update.

## [3.0.1]

-   fix(feature): Create feature form inside a Card to align UI
-   feat(archive): Improve archive view, UI, search, toggle details
-   fix(navigation): signout more visible
-   fix(signout): make signout works with proxy
-   chore(package): Upgrade react to version 16.2.0
-   chore(package): update sass-loader to version 7.0.1

## [3.0.0]

-   Nothing new, just locking down the version.

## [3.0.0-alpha.8]

-   feat(timestamps): Make formatting of timestamps configurable.
-   fix(package): Update react-mdl to version 1.11.0
-   fix(package): update normalize.css to version 8.0.0

## [3.0.0-alpha.7]

-   Move metrics poller to seperate class
-   Bugfix: CreatedAt set when creating new toggle
-   chore(lint): Added propTypes to all components

## [3.0.0-alpha.6]

-   Bugfix: actions should always throw errors
-   Bugfix: filter regex should never throw.

## [3.0.0-alpha.5]

-   Add support for simple builtin authentication provider
-   Add support for custom authentication provider (aka Oauth2, etc)

## [3.0.0-alpha.4]

-   Added unleash-version details in footer.
-   Some house-keeping

## [3.0.0-alpha.2]

-   show sdk version as part of instances details.
-   Bugfix: multiple strategies with list-inputs should work.

## [3.0.0-alpha.1] - 2017-06-28

-   updated paths to use new admin api paths

## [2.2.0] - 2017-01-20

-   clean filter/sorting and fabbutton #61
-   nicer fallback image for metric progress
-   fix switch width issue

## [2.1.0] - 2017-01-20

-   Adjust header #51 #52
