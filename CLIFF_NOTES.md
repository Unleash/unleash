# Changelog

All notable changes to this project will be documented in this file.

## [4.21.0] - 2023-02-22

### Documentation

- Mention env var options for auth config (#3169)

## [4.19.0] - 2022-12-15

### Bug Fixes

- Allow publish-new-version action to run from branch (#2698)
- Disable networkView for dev, fail more gracefully (#2701)

### Docs

- Update availability notice for sso keycloak group sync

### Features

- First draft of chart for instance traffic in frontend (#2670)

## [4.18.7] - 2022-12-09

### Bug Fixes

- Bump qs from 6.5.2 to 6.5.3 (#2613)
- IsPro check on change request configuration (#2610)
- Update vercel proxy paths (#2623)
- Update package json and remove empty exports (#2625)
- Add resulution for qs dep
- Tags endpoint returning 404 when featureId is not set (#2621)
- Update dependency docusaurus-plugin-openapi-docs to v1.4.7 (#2646)

### Features

- Add plan checks to uiconfig (#2600)
- Add capability to write heap snapshot. (#2611)

### Miscellaneous Tasks

- Update dependency @types/cors to v2.8.13 (#2614)
- Update dependency @types/deep-diff to v1.0.2 (#2615)
- Update dependency @types/jest to v29.2.4 (#2626)
- Update dependency @types/node to v16.18.6 (#2628)
- Update dependency openapi-enforcer to v1.22.2 (#2629)
- Update dependency superagent to v8.0.6 (#2630)
- Update dependency supertest to v6.3.3 (#2631)
- Update dependency vite to v3.2.5 (#2632)
- Update dependency vitest to v0.25.6 (#2633)
- Update dependency @types/node to v16.18.7 (#2642)
- Update react-router monorepo to v6.4.5 (#2643)
- Update dependency sass to v1.56.2 (#2644)
- Update storybook monorepo to v6.5.14 (#2645)

### POC

- Integration tests (#2422)

## [4.18.6] - 2022-12-06

### Bug Fixes

- Upgrade express to v4.18.2
- Json-schema-to-ts is a dev-dependency

## [4.18.5] - 2022-12-06

### Bug Fixes

- Add resulution for 'decode-uri-component'
- Favorites column visibility (#2605)

### Docs

- Add more (missing) redirects, fix links (#2592)

## [4.18.4] - 2022-12-06

### Bug Fixes

- Allow import @server (#2601)

## [4.16.0] - 2022-10-03

### #1391

- Add generated doc cleaning script (#2077)

### Bug Fixes

- Add env and project labels to feature updated metrics. (#2043)
- Do not call store function in constructor
- Update SDK matrix
- S/Never logged/Never/g in frontend (#2075)
- Deletes all sessions for user on logout (#2071)
- Revert breaking change for incoming token creation reqs (#2084)
- Make unit test target work (#2082)
- Client registration events are on eventStore (#2093)
- Support coverage reports on external PRs (#2087)
- Update UI labeling: custom constraint -> (strategy) constraint (#2101)
- Typo in strategy-constraints.md (#2115)
- Add appName to http response time metrics (#2117)
- Url encode application name in links (#2121)
- Updated develper guide to force UTC timezone for test db
- Update coverage

### Docs

- Update API access for new token type (#1958)
- Update docusaurus deploy command to generate openapi docs
- Fix typo: Unlash -> Unleash

### Documentation

- Update link for symfony sdk (#2048)
- Test broken links in website (#1912)
- Update images using latest UI screenshots (#1992)
- Fix broken link to how-to-create-API token guide (#2073)
- Move user groups section to after permissions section (#2081)
- Fix broken link to front-end API tokens (#2094)

### Features

- Add method for migrating proxies without environment validation (#2056)
- Update to pull_request_target (#2059)
- Open-Source Strategy Constraints (#2112)
- New profile page and PATs front-end (#2109)

### Fix

- Expose API version even when not running via npm/yarn (#2062)
- Fix edge case URLs in code samples (#2078)
- Prevent password reset email flooding (#2076)

### Refactor

- Don't check for OpenAPI version in snapshot tests (#2072)

### Openapi

- Improve validation testing (#2058)

## [4.14.0] - 2022-07-28

### Bug Fixes

- Make additionalProperties true (#1861)
- Update dependency unleash-proxy-client to v2.0.3 (#1841)
- Fix broken OpenAPI spec (#1846)
- Remove unneeded ts-expect-error now that types in knex are in sync (#1866)
- Minor ui improvements (#1163)
- Refetch immutable toggle when adding strategy (#1164)
- Update dependency json-schema-to-ts to v2.5.5 (#1865)
- Add permission lock to quick strategy add (#1165)
- Small ui fixes related to groups and tooltips (#1167)
- SortOrder updates needs to be async

### Miscellaneous Tasks

- Update dependency fast-check to v3.1.1 (#1859)
- Update dependency es5-ext to v0.10.61 (#1862)
- Update metcalfc/changelog-generator action to v3 (#513)
- Pin dependencies (#1155)
- Update dependency chart.js to v3.8.2
- Update dependency tss-react to v3.7.1
- Update dependency vite to v2.9.14
- Update dependency vite-plugin-svgr to v2.2.1
- Update dependency @types/react to v17.0.48
- Update dependency @types/make-fetch-happen to v10 (#1823)
- Update dependency supertest to v6.2.4 (#1787)
- Update dependency dpage/pgadmin4 to v6.12 (#1867)
- Update dependency del-cli to v5 (#1838)

### Refactor

- Create user avatar component, clean up (#1151)

### Task

- Bump unleash-frontend to 4.14.1

## [4.10.0] - 2022-04-29

### Bug Fixes

- Update react monorepo to v18.1.0
- Announce navigation to screen readers (#911)
- Update dependency unleash-proxy-client to v2.0.1
- Update dependency unleash-frontend to v4.10.0-beta.8 (#1545)
- Pr-build use pull_request_target event
- User search by text instead of regex (#924)
- Wrap long legal values/descriptions (#927)
- Users table sort header styles
- Truncate long parameter values (#928)

### Documentation

- Remove deprecation notices for tags.
- Add more Api information + add disable toggle info
- Link to the correct new endpoints in the features v2 API
- Add docs for vue and svelte clients (#1541)
- Update compat table with custom stickiness for go (#1544)
- Change the remoteAddress description (#1539)
- Correct custom activation strategies param types (#1547)

### Features

- Update ApiRequest to accept POST w/o payloads
- Bump frontend to 4.10.0

### Miscellaneous Tasks

- Update dependency lint-staged to v12.4.1
- Update dependency superagent to v7.1.3
- Update dependency supertest to v6.2.3
- Remove code leftover code
- Update dependency eslint-config-airbnb-typescript to v17 (#1486)
- Update dependency prettier to v2.6.2
- Update dependency @types/lodash.clonedeep to v4.5.7
- Update dependency @types/react-dom to v17.0.16
- Update dependency @types/react-test-renderer to v17.0.2
- Update dependency typescript to v4.6.4
- Update dependency http-proxy-middleware to v2.0.6
- Update dependency react-router-dom to v5.3.1
- Update dependency react-scripts to v5.0.1

### Refactor

- Misc login page accessibility improvements (#914)
- Fix a few eslint module boundary type overrides (#1542)
- Disallow additionalProperties in response schemas (#1543)
- Fix override field selection (#925)
- Fix segment permission checks (#930)

### Task

- Use make-fetch-happen (#1500)

## [4.9.1] - 2022-03-23

### Documentation

- List v1.3.1 of the PHP sdk as first compatible w/adv constr.

### Features

- Upgrade unleash-frontend to 4.9.0

## [4.9.0] - 2022-03-23

### Bug Fixes

- Move unsaved label below refresh popup (#772)
- Remove placeholder comment
- Mark .NET sdk as not having `currentTime` context field
- Delete empty table row
- Remove link color in strategies list (#773)
- Remove empty ruleset
- Make sure customer type is included in the payload.
- Update header
- Update dependency unleash-frontend to v4.9.0-beta.1
- Update dependency knex to v1.0.4
- Update config tests for enabled environments
- Update dependency unleash-frontend to v4.9.0-beta.2
- Make sure we handle hours as 00-23
- Show invalid token page when token error is received (#785)
- Add warning to constraint accordion (#792)
- Update dependency unleash-frontend to v4.9.0-beta.3
- Breakpoint misalignment (#796)
- Change rollout datatype to int

### Documentation

- Minor rewording and clarification around strategy impl/eval
- Start scaffolding out new constraint operator info
- Add description of each of the strat constraint operators.
- Update "constraint structure" section
- Add availability note, finish first draft of constraint ops
- Finish first draft of new strat constraints doc.
- Add unleash context and compat table updates
- Remove 'introduced in' column in Unleash Context table.
- Move string operator case sensitivity note to table
- Update SemVer section: clarify what requirements we have
- Update description of `currentTime` in the Unleash context.
- Add note about how invalid context field values are handled
- Update semver format after discussion and alignment
- Merge `currentTime` with "advanced constraints" row
- Document how to get SEMVER_GTE/LTE functionality
- Add a note saying passord is password for Norwegian
- Create initial outline for how to schedule feature releases
- Describe details of enabled_environments in unleash config docs
- Add more placeholder / structural content.
- Create first draft of schedule how-to
- Bold important text
- Add note to strategy constraints about undefined behavior
- Add screenies and update descriptions accordingly
- Clear up that constraints are available to pro customers too
- Add note saying that some SDKs will crash with new operators.
- Add more content around database connections
- Add code samples, move db configuration to separate section
- Remove duplicate db connection options description
- Note the minimum SDK versions necessary for adv constraints
- Add php support version for advanced constraints
- Add more comprehensive overview of sdk incompatibilities
- Change spec to specification, add link to spec
- Update min versions for node, python, ruby
- Only list feature versions for constraint ops inclusion
- Link to strategy constraints from the schedule how-to guide
- Add a link to the SDK incompatibility section
- PR feedback: configure db url, db url file, precedence
- Sort options alphabetically in example object.
- Add note about PHP crashing if it doesn't recognize the op

### Features

- Add changeRole (#768)
- Validate json (#764)
- Add new feature strategy create/edit pages (#739)
- Add data: "was the form opened manually" and "current page"
- Validate strategies (#1429)
- Add environment variable to set override enabled environments
- Enabled environments override now also moves projects and toggles to new environments
- Make DATE_AFTER the default time operator
- Segments (#776)
- Add operators splash page (#802)

### Miscellaneous Tasks

- Update dependency lint-staged to v12.3.5
- Update dependency ts-node to v10.7.0
- Update typescript-eslint monorepo to v5.14.0
- Merge main -> this branch
- Update dependency @testing-library/react to v12.1.4
- Update dependency @types/react to v17.0.40
- Update dependency tsc-watch to v4.6.2
- Update dependency eslint to v8.11.0
- Update dependency http-proxy-middleware to v2.0.4
- Update dependency @babel/core to v7.17.7
- Update typescript-eslint monorepo to v5.15.0
- Update dependency cypress to v9.5.2
- Extend tests for enabled environments
- Update dependency prettier to v2.6.0
- Update dependency prettier to v2.6.0
- Update dependency lint-staged to v12.3.7
- Update node.js to v14.19.1
- Update dependency @babel/core to v7.17.8
- Update dependency @types/react to v17.0.41
- Update dependency @types/react-dom to v17.0.14
- Update dependency @types/supertest to v2.0.12
- Update typescript-eslint monorepo to v5.16.0
- Formatting

### Refactor

- Remove unused tooltip prop (#769)
- Fix strategy modal issues (#778)
- Improve feature not found page (#774)
- Wait for UI config for CO flag (#781)
- Fix form submission avoidance on add constraint (#783)
- Improve strategy card focus styles (#787)
- Improve constraint date formatting (#789)
- Improve constraint values form (#790)
- Fix search crash on missing values (#794)
- Test useFeaturesFilter (#795)
- Fix crash on empty target date (#798)
- Always add values to constraints (#1448)
- Fix Tooltip ref warning (#804)
- Make refresh work on fogot password page (#808)
- Avoid splash pages in e2e tests (#810)
- Restrict API tokens to enabled environments (#809)

## [4.8.2] - 2022-03-01

### Bug Fixes

- Merge conflicts
- Merge conflicts
- Remove console log
- Make css module loading work as expected.
- Explicitly set background for the light theme
- Make close button visible again
- Don't reset radio group values to undefined
- Remove pointer events from hidden content.
- Update PR based on feedback
- Update PR based on feedback
- Add mobile view for search
- Configure user endpoint when AuthType is NONE (#1403)

### Documentation

- Change primary color for light theme to unleash purple
- Style input text area
- Set customer type correctly
- Fix styling issues on narrow screens

### Features

- Rough style first question page of feedback component.
- Start adding state logic to component.
- Start splitting component up into multiple pieces.
- Create step 1 and set up step 2
- Reverse source order of form control buttons.
- Style page 3
- Hide 'very unsatisfied'/'very satisfied' on smaller sreens
- Start hooking up open/close logic
- Further styling and hooking up of open feedback-button
- Style open-feedback-button.
- Render all steps at the same time, add thank you; first anims
- Overlay form sections
- Add search input in project features
- Add search in projects
- Fix keyboard focus between screens
- Set up request execution on form submission
- Clear form on manual closing.
- Implement saving and loading from localStorage
- Set completion flag upon submitting form

### Miscellaneous Tasks

- Pin dependency @testing-library/dom to 8.11.3
- Bump nanoid from 3.1.28 to 3.3.1 (#725)
- Bump url-parse from 1.5.3 to 1.5.10 (#735)
- Bump follow-redirects from 1.13.3 to 1.14.9 (#726)
- Support css modules in storybook
- First feedback page
- Update dependency sass to v1.49.9
- Update dependency eslint to v8.10.0
- Update actions/checkout action to v2 (#589)
- Minor cleanup and simplification
- Remove debug logs
- Update typescript-eslint monorepo to v5.13.0
- Update dependency cypress to v9.5.1
- Update dependency typescript to v4.6.2
- Update dependency typescript to v4.6.2

### Refactor

- Change error type in edit context
- Use the MUI OutsideClickHandler (#756)
- Fix sorting features by last seen and created at (#755)
- Remove craco and wdyr (#753)

### Styling

- Fix unformatted file
- Add className for SearchField

## [4.8.1] - 2022-02-25

### Bug Fixes

- Handle context name error without making an api call
- Readd orderBy statement to project query (#1394)

### Documentation

- Swizzle root and add feedback component
- Remove "future enhancements" section of environments doc

### Features

- Add basic (sorta styled) first feedback screen
- Add search functionality

### Miscellaneous Tasks

- Rename styles to module, add more focus styles

### Refactor

- Update remove project function
- Fix flaky Cypress tests (#746)
- Port date utils to TS (#720)
- Fix misc TS errors (#729)

## [4.8.0] - 2022-02-24

### Bug Fixes

- Remove toast when clicking cancel
- Remove tooltips
- Set admin permission (#736)
- Update PR based on feedback
- Update dependency unleash-frontend to v4.8.0-beta.10
- Replace empty name for admin in project access
- Correct oas for creating feature toggle
- Update dependency unleash-frontend to v4.8.0
- Add migration patch
- Remove project column from roles if exists

### Documentation

- Mark PHP as advanced constraint compatible in compatibility table
- Update docs for Go SDK because wait until initialized already exists

### Features

- Create ressources buttons and update all forms

### Miscellaneous Tasks

- Use standard css file name
- Update dependency @types/jest to v27.4.1
- Update dependency @types/jest to v27.4.1

### Refactor

- Update text in ui consistent
- Improve feature toggle search state (#741)
- Remove chart point filter (#743)
- Change resourceCreateButton and SaveChangesButton name
- Update Create and Update buttons types

### Styling

- Fix styles in CreateButton

### Testing

- Update snapshots

## [4.7.2] - 2022-02-10

### Bug Fixes

- Update PR based on feedback
- Test and update snapshot
- Upgrade unleash-frontend to v4.7.2

### Refactor

- Refactor addons to TSX and remove unused files (#676)
- Add application interface and add use applications output interface
- Loading
- Use explicit export and delete unused files
- Restore application store and add toast

## [4.7.1] - 2022-02-09

### Bug Fixes

- Text changes
- Update dependency unleash-frontend to v4.7.1
- Resolve unused deps and fix routes
- Remove projectId from create feature form (#658)
- Typo (#1346)
- Tests
- Project access (#621)
- Fix google analytics link

### Documentation

- Use `some-secret` instead of `some-public-key`
- Fix delete call for deleting feature toggles
- Hide 'back-to-main-menu' entry in narrow menu
- Add docs for impression data (#1328)
- Change API how-tos label from "API" to "API how-tos"
- Add "sendEmail" field to user-admin.md (#1329)
- Update compatibility matrix
- Add payload properties for user-admin post payload
- Fix contrast issues with dark theme link color.
- Move light-specific theme changes to 'light-theme' css
- Dark mode fix contrast in sidebar and with vid comp
- Use a purple color for primary theme color
- Remove 'documentation' link in na bar.
- Fix issues with transparent pngs; add borders, centering
- Use ifm variable for border width.
- Add impression data guide outline and sidebar entry
- Add more outlines, steps, etc to how-to impression data
- Add API request component: display in http and httpie easy!
- Add steps to enable impression events for existing toggles.
- Clarify placeholder info.

### Miscellaneous Tasks

- Update dependency @types/react to v17.0.39
- Update dependency jest to v27.5.0
- Fix broken link to community sdks section
- Update dependency ts-node to v10.5.0
- Update typescript-eslint monorepo to v5.11.0
- Update dependency jest to v27.5.1
- Update dependency @babel/core to v7.17.2
- Remove trailing full stop.

### Refactor

- Application-view to ApplicationView with useApplication hook
- Add useApplicationsApi
- Create new EditApplication component
- Remove enzyme (#664)
- Port UserProfile to TS/SWR (#665)
- Create ApplicationList component
- Detach ApplicationList from global settings (#666)
- Add useInvoices hook (#656)
- Port EventHistory to TS/SWR (#669)
- Finish ApplicationList and add it to routes
- Port ReportCard to TS/SWR (#674)
- Port auth admin to TS/SWR (#675)
- Port FeatureToggleList to TS/SWR (#663)
- Port global settings to TS/hooks (#679)
- Use locationSettings in application for date format
- Remove unused components
- Remove unused invoices state (#685)
- Port unleash context to SWR (#683)
- Remove unused feature types state (#688)
- Replace ts-ignore with ts-expect-error (#681)
- Add a MainTheme type (#686)
- Remove unused feedback state (#682)
- Port MainLayout to TS/SWR (#684)
- Remove unused feature tags state (#689)
- Remove unused feature metrics state (#690)
- Remove unused tags code (#687)
- Change based on PR feedback
- Add handleChange

## [4.7.0] - 2022-02-03

### Bug Fixes

- Update dependency knex to v1.0.2
- Remove stray debugger statement (#657)
- Jest-coverage-report-action disable annotations
- Add tsx and nullish coalescence (#667)

### Features

- Add impressionData switch to create feature form (#639)

### Miscellaneous Tasks

- Update dependency sass to v1.49.7
- Pin dependency @types/react-test-renderer to 17.0.1
- Update dependency css-loader to v6.6.0
- Update dependency @babel/core to v7.17.0
- Update dependency @testing-library/jest-dom to v5.16.2
- Update frontend

### Refactor

- Port ApiDetails to useSWR and TS (#653)

## [4.6.5] - 2022-02-01

### Bug Fixes

- Format api paths (#655)

### Miscellaneous Tasks

- Update node.js to v14.19.0
- Update frontend

## [4.6.4] - 2022-02-01

### Bug Fixes

- Race condition when adding users
- Rbac should pick up projectId from path if available
- Upgrade unleash-frontend to v4.6.3

### Miscellaneous Tasks

- Update dependency lint-staged to v12.3.3

## [4.6.3] - 2022-02-01

### Bug Fixes

- Use correct path for create feature link (#650)
- Cleanup based on PR feedback
- Update dependency unleash-frontend to v4.6.2

### Documentation

- Fix link to addons page
- Fix link to getting started page
- Link directly to the markdown file
- Link directly to the markdown file
- Fix markdown file name

### Features

- Create useAddons and useAddonsApi

### Miscellaneous Tasks

- Update typescript-eslint monorepo to v5.10.2
- Update dependency sass to v1.49.4
- Update dependency @types/node to v14.18.10

### Refactor

- Remove redux from addons components

## [4.6.1] - 2022-01-31

### Bug Fixes

- Set migration for feedbacK (#1315)

## [4.6.0] - 2022-01-31

### Bug Fixes

- Remove snackbar from addUser
- Convert simple-password-provider.test.js to ts
- GoogleAnalytics for docusaurus to new format (#1306)
- Pin dependency @docusaurus/plugin-google-analytics to 2.0.0-beta.15 (#1307)
- Remove unused dependencies
- Trim context field name (#634)
- Readme.md
- E2e tests (#636)
- Remove test subcat from sidebar
- Pnps
- Update snapshots
- Welcome-email should not include password-link when disabled (#1302)
- Handle existing feature name (#641)
- Add autofocus to all new create-screens
- Add autofocus to create environment screen
- Update dependency unleash-frontend to v4.6.0
- Viewers should be allowed to see strategy config (#645)
- Update dependency @svgr/webpack to v6.2.1
- Metric counters should use bigint (#1313)
- Upgrade unleash-frontend to v4.6.1

### Documentation

- Remove role 'alert' from availability notice.
- Update how-to for cprs with new video element.
- Finish v1 of the video content element.
- Remove redundant video heading and commented-out content.
- Remove container query polyfill

### Features

- Add toast when delete user
- Add useUiBootstrap hook and update send email state (#643)

### Miscellaneous Tasks

- Update dependency lint-staged to v12.3.2
- Make docs sidebar hover and active color same unleash grey.
- Update dependency eslint to v8.8.0

### Refactor

- Update usersList

## [4.5.1] - 2022-01-06

### Bug Fixes

- Pin dependency @docusaurus/remark-plugin-npm2yarn to 2.0.0-beta.14 (#1224)
- Expose ApiUser out of Unleash
- Update dependency helmet to v5 (#1215)
- Correct format for API tokens
- Downgrade faker to 5.5.3
- Add gha to upload to cdn on release
- Gha releast_to_cdn must use yarn
- Gha releast_to_cdn does not need to build twice
- Gha releast_to_cdn set working directory for all
- Gha releast_to_cdn set working directory correctly
- Gha releast_to_cdn rm working directory
- Add support for CDN prefix in index.html
- Upload all assests under build
- Revert favicon path in index.html
- Update dependency unleash-frontend to v4.4.1
- Should not remove variants when updating feature toggle metadata (#1234)
- Update yarn.lock

### Documentation

- Add `npm2yarn` annotation to all npm commands
- Remove spacing, change 'node' -> Node.js
- Minor language improvements
- Add description of `open-source` authentication type.
- Add difference between `initApiTokens` and env var option.
- Add information on using env vars for startup imports.
- Change wording slightly.
- Add initial stub for custom project roles to rbac article.
- Update version tag for when CPR\* is expected to be released
- Add placeholder how-to-guide for custom project roles
- Revamp the rbac article; add roles table, describe CPR.
- Explain what the project and env permissions mean for CPR
- Add info on variants to project permissions.

### Features

- Add strategies icons (#565)
- Create password field component
- Add init api tokens option (#1181)
- Add support for cdnPrefix for static assets (#1191)

### Miscellaneous Tasks

- Update typescript-eslint monorepo to v5.9.0
- Update dependency sass to v1.45.2
- Update dependency @types/memoizee to v0.4.7
- Update dependency @types/react to v17.0.38
- Update react-dnd monorepo
- Update dependency jest to v27.4.6
- Update dependency node-forge to v1 (#1228)
- Update dependency faker to v6 (#1227)
- Update dependency @babel/core to v7.16.7
- Update dependency @types/node to v14.18.5
- Update dependency jest to v27.4.7
- Update dependency date-fns to v2.28.0
- Update dependency @types/jest to v27.4.0
- Update dependency sass to v1.46.0
- Update dependency @types/enzyme to v3.10.11
- Update dependency @types/uuid to v8.3.4

## [4.4.5] - 2022-01-03

### Bug Fixes

- Update dependency db-migrate to v0.11.13
- Constraints scrollbars (#504)
- Image inclusion and alt text syntax was wrong.
- Remove margin under footer (#514)
- Clear search input on route change
- Make new variant api validate name uniqueness (#1126)
- Typo in function name + remove unused value state
- Stop healthrating from including archived (#1128)
- Metrics v2 should await for the clearer (#1114)
- Use specific attribute as useEffect trigger (#527)
- Add logo in login screen for small size screen (#523)
- Remove edit click handler from variants list (#528)
- Require json-schema v0.4.0 or later (#1135)
- Correct version number for unleash-frontend
- Sloader path (#530)
- Remove unused dep
- Remove lastUpdate from fieldToRow
- Rename last_update to updated_at
- Add timestamp on project creation for update_at column
- Allow user to create up to 7 environments (#543)
- Cleanup old user permissions (#1150)
- Upgrade unleash-frontend to v4.3.0-beta.1
- Always require permission for POST, PATCH, PUT, DELETE (#1152)
- Update dependency @svgr/webpack to v6 (#1136)
- Bump unleash-frontend to v4.3.0
- Update dependency @svgr/webpack to v6.1.1
- Truncate long environment name (#535)
- Open validate endpoint (#1162)
- Updated API docs to reflect v4.3
- Reset loader when fetch receives 401 and fix no auth type (#549)
- Update frontend
- Truncate long environment name (#535)
- Truncate environments names in project view
- Wrong environment name in strategy creation
- Replace execution strategy with activation strategy
- Rename metrics-service to client-instance service
- Move toggle-counters to metrics service
- Lint
- Rename services
- Drop client_metrics table
- Uintroduce call to update last_seen on client-instance
- Cleanup application view (#553)
- Update dependency unleash-frontend to v4.4.0
- Update dependency @svgr/webpack to v6.1.2
- Hide role route from the menu dd
- Update snapshots
- Account for invalid token in SWR Provider (#561)
- Adds feature-variant-updated event. (#1189)
- Adjust feature-variant-updated event
- Adjust main splash container when zoom in (#566)
- Update dependency knex to v0.95.15
- Fix broken link to how-to guide.
- Align code and highlight indentation.
- Realign indentation of code and comments
- Update updateUser code to reject empty emails (#1210)

### Docs

- Update feature-toggles-api.md (#1105)
- Add a tip about docker names having to be unique.

### Documentation

- Add docs for Jira server plugin
- Mark Jira Cloud plugin as not recommended
- Added screenshot successful install
- Improve readability of jira server installation plugin slightly
- Remove jira cloud plugin docs for now (#1118)
- Add initial (untested) steps on how to run the proxy locally.
- Fix up docker commands to have consistent formatting.
- Add always pull to docker commands
- Add always pull to getting started
- First pass at updating the feature toggle types entry.
- Fix internal links.
- Link to feature-flag-types from important concepts.
- Touch up the section on deprecating feature toggles.
- Add initial outline id for custom stickiness.
- Add basic info to stickiness.
- Update reference to gradual rollout (was 'flexible rollout')
- Add stickiness document to advanced section.
- Remove link to old activation strategies document.
- Delete old activation strategies file.
- Delete old unleash-context doc.
- Add image for custom stickiness.
- Update stickiness docs.
- Fix a typo in activation strategies: use -> user
- Fix links to old versions of pages; link to new versions.
- Remove link to non-existing page about sdk capabilities.
- Use internal links for linking to other doc pages.
- Add note about Unleash using MurmurHash for stickiness.
- Clarify that health rating is only updated once an hour.
- Add environments post to side bar.
- Remove references to environments being a beta feature.
- Typo; change "metics" -> "metrics"
- Add section on (potentially) stale toggles to tech debt
- Describe the shape of the data returned by the Unleash proxy
- Adjust variant outline; add rough ideas.
- Explain what the proxy configuration variables are.
- JS proxy client: explain client keys
- Android SDK: reformat and add more details on client secrets
- React proxy sdk: explain clientKey and other config vars.
- IOS proxy: add info about client keys and environments.
- Start documenting variant properties and weights
- Finish variant weight reference documentation
- Document variant payloads.
- Add some first info on overrides.
- Stickiness, disabled variant.
- Conflicting overrides; rm usage
- Clarify weight distribution
- Add discussion topic on a/b testing
- First draft of a/b testing discussion
- Rename A/B testing file
- Rename 'discussion' -> 'concepts'
- Add a first iteration of the compatibility table.
- Flesh out descriptions
- Add links to concepts in table.
- Add slack link to text
- Add .net gradual rollout custom stickiness
- Center icons in table
- Link to sdks in table headers, use human strat names.
- Rename 'concepts' -> 'topics'
- Delete env strat constraint image, rewrite paragraph.
- Update strategy constraints documentation.
- Update variants screenshot
- Update archive page.
- Update audit log chapter.
- Update API access document.
- Update environments section.
- Update project images.
- Update text (and add alt text) in projects document.
- Update control-rollout document.
- Update the custom strategy documentation.
- Update tech debt section.
- Gradual rollout: custom stickiness -> point to SDK table
- Update doc; add how-to make custom context fields.
- Add custom stickiness header.
- Add note about custom stickiness being in beta.
- Fix quickstart image not being displayed.
- Add custom stickiness section to context docs.
- Add img of legal values' effect on the UI.
- Reference the SDK compat table in stickiness docs
- Rough draft of how to create custom context fields.
- Full draft for how to create custom context fields.
- Add note to context docs re: creating and updating.
- Spilt strat constraints into ref and how-to.
- Add note about creating standard context fields.
- Update strat constraints with SDK info.
- Add link to how-to guide for strat constraints.
- Update how-to doc title for strat constraints.
- Update availability notes for custom context fields.
- Adjust heading levels, add ideas.
- Separate reference and how-to
- Add note about unimplemented strats.
- Semi-scaffold how-to section
- Start filling in how-to for custom strats
- Add steps for custom strats with proxy.
- Add note to proxy docs about custom strats.
- Describe using custom strats when proxy is not docker.
- Mention required params
- Update param type overview
- Update docker commands to start containers in detached mode
- Fix list numbers
- Add steps for running the proxy in node with custom strats.
- Indent code block properly.
- Highlight `customStrategies` option.
- Fix comparison operator from `>` to `<`
- Pluralize SDK -> SDKs

### Features

- Use new Variants API (#518)
- Update health report (#541)
- Remove old metrics service
- New toggle screen view (#544)
- RBAC environment role list (#558)
- Update metrics view in the accordion footer
- Add show password for all passwords input

### Miscellaneous Tasks

- Update dependency @welldone-software/why-did-you-render to v6.2.3
- Update typescript-eslint monorepo to v5.4.0
- Update dependency @types/react to v17.0.35
- Update dependency typescript to v4.5.2
- Upped postgres version for Heroku. (#1112)
- Update dependency typescript to v4.5.2
- Update dependency @types/uuid to v8.3.3
- Update dependency @types/jest to v27.0.3
- Update dependency @types/node to v14.17.34
- Update dependency date-fns to v2.26.0
- Update dependency source-map-support to v0.5.21
- Update dependency @types/jest to v27.0.3
- Update dependency @types/js-yaml to v4.0.5
- Update dependency eslint to v8.3.0
- Update dependency @types/react to v17.0.36
- Update dependency eslint-config-airbnb-typescript to v16 (#1109)
- Update dependency @testing-library/jest-dom to v5.15.1
- Update dependency @types/react to v17.0.37
- Update dependency sass to v1.43.5
- Update dependency prettier to v2.5.0
- Update metcalfc/changelog-generator action to v3 (#1121)
- Update dependency redux-thunk to v2.4.1
- Update dependency lint-staged to v12 (#1104)
- Update dependency jest to v27.4.0
- Update typescript-eslint monorepo to v5.5.0
- Update dependency sass to v1.44.0
- Pin dependency prettier to v2.4.1
- Update dependency prettier to v2.5.0
- Update dependency date-fns to v2.27.0
- Update dependency jest to v27.4.2
- Update node.js to v14.18.2
- Update dependency jest to v27.4.3
- Update frontend
- Update frontend
- Require json-schema 0.4.0 or higher
- Update dependency @testing-library/jest-dom to v5.16.0
- Update dependency @types/node to v14.18.0
- Update dependency eslint to v8.4.0
- Update dependency prettier to v2.5.1
- Update dependency prettier to v2.5.1
- Update dependency ts-jest to v27.1.0
- Fix syntax highlighting for a json code snippet.
- (docs) keep list styling (internally) consistent
- Update dependency @testing-library/jest-dom to v5.16.1
- Update dependency @testing-library/jest-dom to v5.16.0
- Update dependency @types/node to v14.18.0
- Update dependency prettier to v2.5.1
- Update typescript-eslint monorepo to v5.6.0
- Update dependency eslint to v8.4.1
- Format compat table.
- Update dependency typescript to v4.5.3
- Update dependency typescript to v4.5.3
- Update dependency jest to v27.4.4
- Update dependency ts-jest to v27.1.1
- Update dependency jest to v27.4.5
- Update dependency typescript to v4.5.4
- Update dependency typescript to v4.5.4
- Update typescript-eslint monorepo to v5.7.0
- Unhyphenate kebab-menu -> kebab menu
- Lowercase <br/> tag
- Update dependency ts-jest to v27.1.2
- Update dependency @types/node to v14.18.1
- Update dependency eslint to v8.5.0
- Update dependency lint-staged to v12.1.3
- Update typescript-eslint monorepo to v5.8.0
- Update dependency @types/node to v14.18.2
- Update dependency sass to v1.45.1
- Update dependency tsc-watch to v4.6.0
- Remove unnecessary escape sequences.
- Format table
- Update with new branch names
- Update with new branch names
- Correct compatibility matrix for server SDKs
- Update dependency lint-staged to v12.1.4
- Update typescript-eslint monorepo to v5.8.1
- Update dependency @types/jest to v27.4.0
- Update dependency eslint to v8.6.0
- Update dependency lint-staged to v12.1.5
- Update dependency eslint-plugin-import to v2.25.4

### Task

- Add a workflow that validates docs for PRs (#1123)
- Add link to FCC video (#1127)
- Ban changes to variants through feature (#1130)
- Sort variants by name (#1132)
- Add buttons for deleting/editing a constraint (#522)

## [4.2.3] - 2021-11-12

### Bug Fixes

- Remove typo from UI
- Add correct path for create first toggle button
- Disable revive feature when project is deleted
- Rename isProjectDeleted to projectExists and add PermissionIconButton
- Support new event format with diff will be done in the UI (#496)
- Update dependency knex to v0.95.14
- Add migration
- Styling
- Prevent deadlock for batchinserting usage metrics (#1100)
- Refactor client-metrics list and ttl-list to TypeScript (#1080)
- Remove record splash and update sql query in add-splash-entry
- Update sql query in add-splash-entry
- Update e2e test for splash
- Status chip (#501)
- Mobile percentagecircle (#502)
- Remove req.body from the splash object when update
- Add cascade query inside create table for splash
- Upgrade unleash-frontend to v4.2.13
- Return be object instead of array

### Documentation

- Clarify that the proxy does not expose disabled flags (#1094)
- Add syntax highlighting to react-sdk
- Polish text on environments.
- Simplify language + pre-configure -> preconfigure
- Add paragraph to intro: things will still work (default env)
- Add notes about users having to add strats to enable envs.
- Updated maven coordinates for java sdk

### Features

- Clean up events (#1089)

### Miscellaneous Tasks

- Update dependency eslint-config-airbnb-typescript to v14.0.2
- Update dependency eslint to v8.2.0
- Pin dependencies
- Update typescript-eslint monorepo to v5.3.1
- Update dependency eslint-config-airbnb-typescript to v15 (#1091)
- Update dependency @types/node to v14.17.33
- Update dependency eslint-plugin-import to v2.25.3
- Update dependency eslint-config-airbnb-base to v15 (#1098)

## [4.2.2] - 2021-11-04

### Bug Fixes

- Convert iso-strings from db to date object

## [4.2.1] - 2021-11-04

### Bug Fixes

- Remove semicolon from component (#480)
- Be explicit when specifying time & replace moment with date-fns (#1072)
- Update docusaurus monorepo to v2.0.0-beta.9 (#1081)
- Update mime library method signature to 2.X (#1078)
- Update dependency knex to v0.95.13
- Handle undefined project with default (#486)
- Guard for disabling envs (#492)
- Toast text
- Update dependency unleash-frontend to v4.2.12
- Disable projects (#1085)

### Miscellaneous Tasks

- Update dependency node-fetch to v2.6.6
- Update typescript-eslint monorepo to v5.3.0
- Update dependency @testing-library/jest-dom to v5.15.0
- Update dependency @types/react to v17.0.34
- Update dependency @types/react-dom to v17.0.11
- Update dependency css-loader to v6.5.1
- Update changelog

## [4.2.0] - 2021-10-29

### Bug Fixes

- Lint
- Add default sort order for built in envs (#1076)

### Features

- Disable password based login (#1046)

### Miscellaneous Tasks

- Remvoe console.error for tests expecting error
- Mute expected test errors
- Update CHANGELOG.md

## [4.2.0-2] - 2021-10-01

### Bug Fixes

- Api-token only show env if enabled
- Render new link if enabled
- Upgrade unleash-frontend to 4.2.2

## [4.2.0-1] - 2021-10-01

### Bug Fixes

- Update dependency js-yaml to v4 (#985)
- Store metrics only if not empty (#991)
- Add environments to project details (#992)
- Reduce data in FEATURE_ENVIRONMENT events
- Allow renovate bot to auto-merge
- Renovate should be allowed to automerge all packages
- Use renovater github config
- Missing-toggle link should include name-param once
- Add projects api for oss as well
- Client api should return feature toggles for disabled environments (#995)
- Do not filter FEATURE_METADATA_UPDATE events
- Remove swagger.json poc
- Update changelog
- Upgrade unleash-frontend to 4.2.1

### Features

- Project environments configuration (#365)
- E2e tests and mobile views (#348)
- Created project header (#388)

### Miscellaneous Tasks

- Update metcalfc/changelog-generator action to v1 (#982)
- Update dependency jest to v27.2.3 (#990)
- Update dependency eslint-config-airbnb-typescript to v14 (#979)
- Update dependency react-timeago to v5.3.0 (#364)
- Update dependency @types/debounce to v1.2.1 (#344)
- Update renovte config
- Uopdate renovate config
- Bump tar from 6.1.5 to 6.1.11 (#333)
- Update dependency jest to v27.2.4
- Bump tmpl from 1.0.4 to 1.0.5 (#338)
- Bump url-parse from 1.5.1 to 1.5.3 (#331)
- Update dependency css-loader to v5.2.7
- Update dependency redux to v4.1.1
- Update dependency typescript to v4.4.3
- Update dependency swr to v0.5.7
- Update dependency sass to v1.42.1
- Update dependency @testing-library/react to v12 (#373)
- Update actions/setup-node action to v2 (#372)
- Update dependency @types/jest to v26.0.24 (#346)
- Update dependency @types/enzyme to v3.10.9 (#345)
- Update dependency node-fetch to v2.6.5 (#354)
- Update dependency @types/react to v17.0.25 (#349)
- Update dependency immutable to v4.0.0-rc.15 (#353)
- Update dependency enzyme-to-json to v3.6.2 (#352)
- Update dependency @types/node to v12.20.27 (#347)
- Update dependency @welldone-software/why-did-you-render to v6.2.1 (#361)
- Pin dependency cypress to v8.4.1
- Update dependency @types/node to v14 (#379)
- Update dependency cypress to v8.5.0
- Update dependency @types/react to v17.0.26
- Update dependency react-router-dom to v5.3.0
- Update dependency react-timeago to v6 (#384)
- Update dependency web-vitals to v2 (#386)
- Update dependency swr to v1 (#385)
- Update dependency css-loader to v6 (#382)
- Update actions/checkout action to v2 (#378)
- Update dependency @types/jest to v27 (#375)
- Update dependency @testing-library/user-event to v13 (#374)
- Update dependency @types/react-router-dom to v5.3.0 (#360)
- Update dependency @testing-library/jest-dom to v5.14.1 (#359)
- Update dependency react-redux to v7.2.5 (#355)
- Update dependency @types/react-dom to v17.0.9 (#350)
- Update metcalfc/changelog-generator action to v1 (#387)
- Update dependency date-fns to v2.24.0
- Update react-dnd monorepo (#358)

### Task

- Remove displayName from environments (#988)
- Add default environment (#989)
- Remove display name from environment (#367)

## [4.2.0-0] - 2021-09-28

### Bug Fixes

- Convert feature-schema.test.js to typescript
- Convert files to typescript
- Convert event-hook.test.js to typescript
- Convert xtract-user.js to typescript
- Convert api-def.js to tyoescript
- Convert more tests to typescript
- Convert schemas to typescript
- Lint error
- Header zIndex
- Upgrade connect-session-knex to version 2.1.0
- Added displayName to feature environments
- Correct test verifications
- Don't include archived feature strategies (#955)
- Enforce non-nullability of environment type (#950)
- Envrionments should have type
- Pin dependencies (#957)
- Update dependency knex to v0.95.11 (#967)
- Update docusaurus monorepo to v2.0.0-beta.6 (#968)
- Not set env if undefined
- Allow renovate-bot to autmerge minor and patch
- Update dependency unleash-frontend to v4.2.0 (#976)
- Update dependency prom-client to v14 (#987)

### Documentation

- Remove the conflict between docker steps and docker-compose (#952)
- Readme update dashboard screenshot (#953)
- Minor adjustments.

### Features

- Add project and environment columns to events (#942)
- Rename :global: env to "default" (#947)
- Add project and environment scoping to API keys (#336)

### Miscellaneous Tasks

- Set transtivie resolutions
- Bump tmpl from 1.0.4 to 1.0.5 (#949)
- Bump prismjs from 1.24.1 to 1.25.0 in /websitev2 (#946)
- Add renovate.json (#956)
- Add renovate.json (#340)
- Pin dependencies (#341)
- Update dependency @testing-library/react to v11.2.7 (#342)
- Update dependency @types/jest to v27.0.2 (#958)
- Update dependency ts-jest to v27.0.5 (#964)
- Update dependency trim to v1 (#963)
- Update dependency jest to v27.2.2 (#962)
- Update dependency source-map-support to v0.5.20 (#966)
- Update dependency husky to v7.0.2 (#965)
- Update dependency eslint-plugin-prettier to v3.4.1 (#961)
- Update dependency eslint-plugin-import to v2.24.2 (#960)
- Security resolutions
- Update dependency typescript to v4.4.3 (#971)
- Update typescript-eslint monorepo to v4.31.2 (#972)
- Update dependency supertest to v6.1.6 (#969)
- Update changelog
- Update dependency prettier to v2.4.1 (#974)
- Update dependency ts-node to v10.2.1 (#973)
- Update dependency tsc-watch to v4.5.0 (#975)
- Update actions/setup-node action to v2 (#977)
- Update dependency glob-parent to v6 (#981)
- Update typescript-eslint monorepo to v4.32.0 (#983)
- Update dependency eslint-plugin-prettier to v4 (#980)

### Task

- Adds FEATURE*ENVIRONMENT*{ENABLED,DISABLED} events (#970)

## [4.1.4-0] - 2021-09-14

### Bug Fixes

- Cleanup new features API with env support (#929)
- Correct failing feature toggle test

### Features

- Move environments to enterprise (#935)

## [4.1.3-0] - 2021-09-10

### Bug Fixes

- Add resetDb to migrator
- Failing test
- Added indices and primary key to feature_tag (#936)

### Documentation

- Add react-sdk to proxy docs.

## [4.1.2] - 2021-09-05

### Bug Fixes

- Improve performance for fetching active api tokens
- Addon-service should only trigger enabled addons
- Upgrade docusaurus to 2.0.0-beta.5
- Set DEPLOYMENT_BRANCH for docusaurus
- Fine tune db-config based on experience
- Header zindex

### Miscellaneous Tasks

- Bump tar from 6.1.7 to 6.1.11 (#930)
- Trigger docs generation
- Update changelog
- Update frontend

## [4.1.1] - 2021-09-01

### Bug Fixes

- Set correct projects count in metrics
- Sync (#334)

### Miscellaneous Tasks

- Update changelog
- Update frontend

## [4.1.0] - 2021-08-31

### Documentation

- Added mikefrancis/laravel-unleash (#927)

## [4.0.3] - 2021-06-08

### Bug Fixes

- Disable version service in tests
- Passwordchecker
- Remove secure headers from server-dev
- Only generate docs if websitev2 subfolders are changed
- Add details about the proxy
- Add details about ios proxy sdk
- Typo
- Slug for /sdks
- Link to sdks
- Add more code highlighting
- Docs highlithing for kotlin
- Typo in docs
- Don't build all of unleash just for doc updates
- Update README.md
- Update README.md
- README.md
- Require at least trim:0.0.3 for docs
- More docs
- Logo in heroku button
- Proper logo
- Styles to docs
- Add check for obscure error (#305)
- Register metrics middleware before pre-hook (#866)
- Add null check for dueDate
- Update feedback url

### Documentation

- Correct /api/client/features examples
- Enterprise authentication

### Fix

- Minor improvements on docs.

### Miscellaneous Tasks

- Update links (#858)
- Update README.md - 'In the media'-list (#860)
- Add docs for android-proxy-sdk (#865)
- Update changelog
- Update frontend
- Update changelog
- Upgrade unleash-frontend to v4.0.3
- Upgrade unleash-frontend to v4.0.4
- Update changelog

## [4.0.2] - 2021-05-25

### Bug Fixes

- INLINE_RUNTIME_CHUNK
- Project actions need to checkAccess based on projectId
- Projects needs at least one owner
- Upgrade unleash-frontend to version 4.0.1

### Miscellaneous Tasks

- Update changelog

## [4.0.1] - 2021-05-25

### Bug Fixes

- Update yarn.lock
- Update website/yarn.lock
- Lint
- Update transitive dependencies for website
- Upgrade db-migrate to v0.11.12
- Upgrade faker to version 5.5.3
- Upgrade lint-staged to version 11.0.0
- Upgrade supertest to version 6.1.3
- Broken link
- Broken link in docs
- More docs
- More docs
- Create config should allow all options params

### Miscellaneous Tasks

- Update types definitions
- Update changelog.md

## [4.0.0] - 2021-05-21

### Bug Fixes

- Add migration (#847)
- Reset border radius on mobile
- Upgrade unleash-frontend to version 4.0.0

### Features

- Add admin-invoice section (#299)
- Update color scheme and logo (#301)

### Miscellaneous Tasks

- Bump hosted-git-info from 2.8.8 to 2.8.9 in /website (#843)
- Update changelog
- Update changelog

## [3.17.4] - 2021-03-26

### Bug Fixes

- Make e2e test more stable (#767)
- Convert event-store to typescript (#768)
- All migrations requires down step
- Upgrade unleash-frontend to version 3.14.1
- Ensure createdBy is not empty
- Version-checker must have instanceId

### Miscellaneous Tasks

- Add more media info to README.md
- Fix broken /docs link
- Type argument missing
- Another missing type
- Update changelog

## [3.17.2] - 2021-03-19

### Bug Fixes

- Event tags does not need undefined guard
- Delete duplicate client instances

## [3.17.1] - 2021-03-18

### Bug Fixes

- Check that strategies exists before calling includes (#252)
- Should fetch projects once to make sure we know about projects
- Lint error
- Upgrade docusaurus
- Always set instanceid in uiconfig
- Encode tag value
- Encode URI value when deleting tag
- Inital event.tags should be array type

### Documentation

- Add technical debt documentation (#751)

### Features

- Edit access for projects. (#251)
- Default roles and RBAC permission checker. (#735)
- Upgrade unleash-frontend to version 3.14.0

### Miscellaneous Tasks

- Update changelog
- Fix documentation typos (#758)
- Update Go SDK getting started
- Update changelog
- Update changelog
- Fix typo in docker network create
- Add docs for context api (#762)
- Update docs
- Changelog
- Update changelog for 3.17.1

## [3.16.0] - 2021-03-05

### Bug Fixes

- Add strategy constraints
- Add unit test for addon-retry
- Incorrect sql syntax in migration.
- Don't use hardcoded timestamps as default values (#745)
- Makes eventstore emit id and createdAt (#746)
- Metrics invalid date (#248)
- Messages to slack for archied toggles (#750)
- Publish events about unannounced applications
- ProjectId must follow nameType in query

### Features

- Add support for bulk operations on client apps/instance registr… (#744)

### Miscellaneous Tasks

- More docs
- Remove superfluous logging from client registration
- Setup separate workflow for PRs
- Don't build prs from main build file
- Update changelog
- Update frontend version (#749)
- Update changelog

## [3.15.0] - 2021-02-26

### Bug Fixes

- One and only one front (#244)
- Upgrade uglifyjs-webpack-plugin to version 2.2.0
- Unsecure => insecure
- Fix update-variant-test
- Upgrade unleash-frontend to version 3.13.1
- Make sure test-data is urlsafe
- Upgrade unleash-frontend to version 3.13.1
- Project id should be validated correctly on create
- Update unleash-frontend dependency (#736)
- Content-min-height
- Not crash if addon http post throws (#738)

### Features

- Make client features endpoint memoizable (#734)
- Upgrade unleash-frontend to version 3.13.0

### Miscellaneous Tasks

- Update changelog
- Update changelog
- Begin converting files from JS to TypeScript
- Cname for docs
- Update changelog
- Improve our user documentation (#733)
- Use img instead of svg for logo
- Update gaTrackingId for user docs
- Fix getting started link on docs index
- Update sidebar
- Add docs for health
- Docs
- More docs
- More docs
- Update changelog
- Update dependencies (#737)
- Update changelog

## [3.14.0] - 2021-02-23

### Bug Fixes

- Make sure test-data is urlsafe
- Minor visual for dropdowns
- Tests

### Features

- Add oss/enterprise version to footer (#245)
- Make client features endpoint memoizable (#734)
- Upgrade unleash-frontend to version 3.13.0

### Miscellaneous Tasks

- Begin converting files from JS to TypeScript
- Add TS support to code coverage
- Switch FeatureHasTagError back to js
- Add eslint rules and fix strings to pass rules
- Update changelog
- Update changelog

## [3.13.0] - 2021-02-19

### Bug Fixes

- Gh-720 Use express path templates for prometheus metrics (#724)
- Filter duplicates
- Make sure static site includes CNAME
- Move CNAME to static
- TypeScript should be a dev dependency (#730)
- Don't check version when starting up in dev mode
- Generate uuid in js migration instead of from db

### Features

- Allow custom context fields to define stickiness. (#241)
- Handle database connection errors with 500 (#725)
- Add db-session store (#722)
- Introduce specific "feature stale" events (#727)
- Update unleash-frontend to version 3.12.0

### Miscellaneous Tasks

- Make github workflow trigger on all pushes
- Add override information for version check to doc
- Better uuid name
- Update changelog
- Update changelog

## [3.12.0] - 2021-02-12

### Bug Fixes

- Add middleware verifying content type
- Refactor context to use service pattern (#721)

### Features

- Allow stickiness on context-fields (#713)

### Miscellaneous Tasks

- Remove git add from husky
- Update changelog

## [3.11.2] - 2021-02-09

### Bug Fixes

- Typo in test
- Should not register duplicate HTML5 backends
- Update unleash-frontend to version 3.11.4

### Miscellaneous Tasks

- Update changelog
- Update changelog

## [3.11.1] - 2021-02-09

### Bug Fixes

- Use findIndex when using predicate.
- Upgrade unleash-frontend to version 3.11.3
- Include frontend bug fix

### Miscellaneous Tasks

- Update changelog
- Update changelog

## [3.11.0] - 2021-02-09

### Bug Fixes

- Website: reqquire immer 8.0.1 or higher
- Strategy schema should allow deprecated field (#700)
- Error in snapshot
- Added the ability to specify db-schema via ENV (#702)
- Even-store should not block on emit
- Typo in message in simple-authentication.js (#707)
- Should wait for seen apps
- Add missing space (#239)
- Use type and value from action to remove tag (#238)
- Make sure we also bundle SVG in public
- Addons should support sensitive params
- Add unleashUrl option
- Add validation of required parameters
- Add docs for addons
- Add a test for validation of empty params
- Upgrade unleash-frontend to version 3.11.1
- Hide jira addon for now
- Upgrade prom-client from 12.0.0 to 13.1.0
- Upgraded jest to version 26.6.3
- UX should not eagerly store strategy updates! (#240)
- Add UI for showing 'create tag' errors
- FeatureHasTagError is formatting error message as Joi
- Upgrade unleash-frontend to version 3.11.2

### Chore

- Add action for performing github release

### Documentation

- Update getting started guide with docker options (#697)

### Features

- Add filterquery support for toggles
- Added tags to events table and emitted events
- Addon support from UI (#236)
- Introduce addon framework

### Miscellaneous Tasks

- Update Open API specification (#686)
- Add suvery link to docs
- Use yarn for scripts
- Bump ini from 1.3.5 to 1.3.8 (#231)
- Fix broken link in docs
- Update changelog for next release
- Update changelog.md
- Update changelog
- Added some note to addon docs
- Update changelog
- Cleanup changelog

## [3.10.1] - 2021-01-22

### Bug Fixes

- Avoid github actions running twice on PRs
- Lint it
- Add last seen as sort option
- Update snapshot for tests
- DROP schema before create
- Add unit test for lastSeenAt being updated
- Swagger to redoc (#678)
- Cleanup test console output
- Run on all pull_requests regardless of branch
- Make github action use correct ref for pull-requests
- Remove use of input stores
- Archive store in folder
- Remove unused client-instance concept
- Move error store into folder
- Move feature-toggle store into folder
- Move history to folder
- Move feature-metrics store to its own folder
- Move all api calls to store folders
- Update canisue-lite
- Upgrade unleash-frontend to 3.8.4
- Migrate all .scss files to .module.scss
- Upgrade redux-devtools to version 3.7.0
- Add go SDK to list supporting variants
- Use node 12 for building
- Github action
- Stop using travis for builds
- Remove pg_virtualenv scripts
- Bug in migration droping wrong table
- Tweak deprecated strategies view
- Remove fields from /api/client/features respnse (#692)

### Features

- Add last seen at timestamp
- Adds last-seen dat on toggles

### Miscellaneous Tasks

- Update changelog
- Add NestJS client library reference
- Update changelog
- Update changelog.md

## [3.9.0] - 2020-12-17

### Bug Fixes

- Minor CSS tweak
- This.timer merge conflict
- StateService undefined

### Features

- Add stop() method to gracefully terminate unleash (#665)

### Miscellaneous Tasks

- Update changelog

### Testing

- Remove focus on test (#674)

## [3.8.0] - 2020-12-15

### Bug Fixes

- Disable david-dm
- Replace travis with GitHub Actions
- Bump dev-deps for security
- Add import options as part of environment variables
- Should update activation strategies immediately (#229)
- Namespace settings in localStorage
- Add heroku server to openapi servers
- Remove unused github action
- Add support for basic auth with simple-auth (#659)
- Typo in OAS servers
- Eslint ignorePatterns for OAS
- Run build also for external PRs
- Minor css tweaks
- Minor strategy configure update
- Upgrade unleash-frontend to 3.8.1
- OpenApi - Added Client API calls (#667)
- New feature toggle gets default strategy
- Upgrade unleash-frontend to 3.8.2

### Features

- Upgrade unleash-frontend to version 3.8.0
- First draft of admin Open API specification (OAS) (#652)

### Miscellaneous Tasks

- Bump highlight.js from 9.17.1 to 9.18.5 in /website
- Bump http-proxy from 1.18.0 to 1.18.1 (#223)
- Update CHANGELOG
- Bump ini from 1.3.5 to 1.3.7 (#670)
- Bump ini from 1.3.5 to 1.3.7 in /website (#671)
- Clean up configuring unleash (#672)
- Update changelog
- Add link to Open API specifications
- Update changelog

## [3.7.0] - 2020-11-23

### Bug Fixes

- Stickness parmeters for stickiness is camelCase (doc)
- Add secureHeaders option for HSTS
- Use secure proxy to session cookie
- Set clear-site-data on logout
- Should use stripped update data for featureToggle
- Use validated and stripped data when updating
- Typo description => descriptionn
- Add TTL to sessions
- Default maxAge for session set to two days
- Upgrade cookie-session library
- Enable trust-proxy
- Add security wanring to the console
- Hide content if showing authentication modal
- Context legalValues should be at max 100 chars
- Upgradde unleash-frontend to version 3.6.3
- Minur ux tweaks
- Update unleash-frontend to version 3.6.4
- Join link to slack in help section
- Add api documentation for strategy constraints.
- Add docs for disabled variant
- Update list of SDKs supporting variants
- Clarify PostgreSQL version support
- Do not allow empty ('') constrain values.
- Wrong id for feature-types
- Constriants must have at least one value defined
- Variants missing from client API docs
- Allow spaces/special chars in application names
- Should be possible to remove all variants.
- Upgrade to unleash-frontend 3.5.6
- Filter for projects
- Remove deprecated badges

### Features

- Allow migration style import (#645)
- Add support for explicitly set database version. (#654)
- Add support for projects
- Add technical support for projects
- Upgrade unleash-frontend to 3.7.0
- StateServices only exposed via services object

### Fix

- Typo in metrics-api.md (#643)

### Miscellaneous Tasks

- Update changelog
- Update changelog
- Update changelog.md
- Fix typo in docs
- Bump dot-prop from 4.2.0 to 4.2.1 in /website (#644)
- Update sidebar
- Add clojure client library reference (#647)
- Add clojure client to doc (#648)
- Add clojure client to doc (#649)
- Fix url typo
- Fix url typo in docs
- Bump node-fetch from 2.6.0 to 2.6.1
- Update README.md
- Update changelog

## [3.6.0] - 2020-09-27

### Bug Fixes

- Helmet wap csp in quotes
- Remove greenkeeper
- Heroku Postgres add-on version change (#631)
- Update helmet config
- List parameters should be trimmed
- Make sure application is updated on edit
- Use https url for local->heroku proxy
- Cleanup edit application a bit
- Improve import/export documentation
- Upgrade whatwg-fetch to version 3.4.1
- Add option via env for ADMIN_AUTHENTICATION
- Should support 409 responses as well
- Minor css tweaks for mobile
- Failing test
- Name conflict should return 409
- Upgrade unleash-frontend to version 3.6.1
- Upgrade yargs to version 16.0.3
- Failing tests for 409
- Upgrade supertest to version 5.0.0
- Upgrade superagent to version 6.1.0
- Show notification when app updates
- Add created date for applications
- Upgrade unleash-frontend to version 3.6.2

### Features

- Should be possible to remove applications
- Add search for applications
- Remove applications (#635)
- Upgrade unleash-frontend to version 3.6.0

### Miscellaneous Tasks

- Bump decompress from 4.2.0 to 4.2.1 in /website (#628)
- Typo in strategy docs
- Upgrade CHANGELOG
- Update CHANGELOG
- Update CHANGELOG
- Fix CHANGELOG
- Update CHANGELOG.md

## [3.5.3] - 2020-09-07

### Bug Fixes

- Lax helmet csp config for styles.

### Miscellaneous Tasks

- Update CHANGELOG.md

## [3.5.2] - 2020-09-06

### Bug Fixes

- Use Rect.memo to increase performance
- Add link to client SDKs
- Upgrade to unleash-frontend v3.5.1
- The links for Kotlin and PHP clients got mixed up (#623)
- Add optional helmet security headers

### Chore

- Rename feautre-upda... to feature-updates-to-slack.md (#622)

### Miscellaneous Tasks

- Update changelog
- Bump prismjs from 1.17.1 to 1.21.0 in /website (#620)
- Update CHANGELOG.md

## [3.5.0] - 2020-08-10

### Bug Fixes

- Add disabled propertu to select
- Tests
- Update feature toggle variants documentation
- Add more client SDK to documentation
- Variant documentation title cleanup
- Some ux cleanup for toggle types
- Add created_at to feature_types
- Upgrade unleash-frontend to latest

### Miscellaneous Tasks

- Update chanelog

## [3.5.0-0] - 2020-08-07

### Bug Fixes

- Only fetch types once
- Upgrade joi to version 17.2.0
- Update yarn.lock
- Use npmjs registry
- Yarn.lock
- Imporve type-chip color
- Dependencies
- Add user documentation for feature toggle types

### Features

- Add support for toggle type
- Add support for toggle type (#220)
- Add support for toggle types (#618)
- Add stale marking of feature toggles
- Added time-ago to toggle-list
- Stort by stale
- Add stale property on toggle (#619)

### Miscellaneous Tasks

- Update changelog
- Update changelog for next release 3.5.0

## [3.4.2] - 2020-08-03

### Bug Fixes

- Add resolution for minimist and kind-of
- Add keepAliveTimeout option
- Flag inital context fields
- Exporting only feature toggles as yaml should not crash
- Replace @hapi/joi with joi
- Upgrade js-yaml to latest
- Version should be part of ui-config (#616)
- Read unleash version from ui-config (#219)
- Update react-dnd to the latest version 🚀 (#213)
- Upgrade react-dnd to version 11.1.3
- Upgrade unleash-frontend to version 3.4.0

### Feat

- (VariantCustomization) Allow user to customize variant weights (#216)

### Features

- Add weightType as legal property on variant schema (#614)

### Miscellaneous Tasks

- Changelog.md
- Bump lodash from 4.17.15 to 4.17.19 (#610)
- Bump lodash from 4.17.15 to 4.17.19 in /website (#611)
- Bump lodash from 4.17.15 to 4.17.19 (#214)
- Bump websocket-extensions from 0.1.3 to 0.1.4 (#217)
- Bump elliptic from 6.5.2 to 6.5.3 (#218)
- Update changelog
- Update changelog

## [3.4.0] - 2020-06-17

### Chore

- Fix typo in README.md (#607)

### Feat

- Adds server.create() (#606)

### Miscellaneous Tasks

- Bump websocket-extensions from 0.1.3 to 0.1.4 in /website (#604)
- Update changelog

## [3.3.6] - 2020-06-15

### Bug Fixes

- Add common component input-list-field
- Allow overflow for strategy card
- Modal for variants
- Should handle zero variants
- Upgrade unleash-frontend to verson 3.3.5

### Miscellaneous Tasks

- Updated baseUriPath documentation (#601)
- Add Otovo to users array (#603)
- Update changelog

## [3.3.5] - 2020-05-20

### Bug Fixes

- Add react-select
- Tune css a little
- Convert variant-view-component to function
- Should not clear all stores on update user profile
- Improve on variant ui
- Upgrade unleash-frontend to verson 3.3.3

### Miscellaneous Tasks

- Update changelog
- Update changelog.md

## [3.3.4] - 2020-05-14

### Bug Fixes

- Password login should prefer login options
- Add 'options' field to AuthenticationRequired
- Reset stores on login/logout (#212)
- Upgrade unleash-frontend to version 3.3.2
- Upgrade db-migrate-pg to version 1.2.2
- We now support node 14 :hurray

### Miscellaneous Tasks

- Update changelog
- Update changelog
- Update changelog.md

## [3.3.3] - 2020-05-12

### Bug Fixes

- Remove Procfile for Heroku
- Add missing await for node 14
- We are not ready for node 14
- Support node 14 by upgrading pg to 8.0.3
- Pg dependency for db-migrate as well
- License year to 2020
- License year and company
- Upgrade unleash-frontend to 3.3.1
- Add user-store (#590)
- We are NOT ready for node 14
- Correct repo url in package.json

### Chore

- Add dart sdk details

### Features

- Support internal routes
- Locale select should be dropdown menu
- Add support for username/password login

### Miscellaneous Tasks

- Update changelog
- Add a few more community client SDKs
- Update changelog

## [3.3.2] - 2020-05-02

### Bug Fixes

- User should not crash if email is missing
- Expose evaluated config and permissions object
- Adjust colors of dialog
- Stop measure responsetime for unknown paths (#591)

### Miscellaneous Tasks

- Update changelog.md

## [3.3.1] - 2020-04-19

### Bug Fixes

- Use airbnb lint rules directly (#583)
- Disable ssl for local postgres in dev
- Support proper SSL settings using `DATABASE_SSL` (#585)
- Upgrade react-dnd to version 10.0.2"
- Rename use of legacy react lifecyle methods
- Upgrade react to version 16.13.1
- Upgrade react-router to version 5.1.2
- Upgrade babel dependencies
- Upgrade redux to version 4.0.5
- Upgrade fetch-mock to version 9.4.0
- Lint
- Upgrade react-reduc to version 7.2.0
- Upgrade unleash-frontend to version 3.2.21
- Add users-table to store user details (#586)

### Miscellaneous Tasks

- Update changelog
- Reduce log-level for metrics
- Update CHANGELOG

## [3.3.0] - 2020-04-13

### Bug Fixes

- Fix sort-order
- Lint errors
- Improve heroku 1 click deploy behavior (#575)
- Logout should not be xhr call
- Logout should not be xhr call (#576)
- Update pg to the latest version 🚀 (#578)
- Update unleash-frontend to version 3.2.20 (#582)
- Upgrade ava to version 3.7.0
- Upgrade eslint to verson 6.8.0

### Features

- Move secrets to settings (#577)
- Require node >= 12
- Update "enableLegacyRoutes" to false (#580)

### Fix

- Typo webpage (#579)

### Miscellaneous Tasks

- Bump acorn from 7.0.0 to 7.1.1 (#571)
- Fix typo in gogole-auth-hook example (#572)
- Update getting-started guide
- Update getting-started guide
- Update changelog

## [3.2.30] - 2020-03-10

### Bug Fixes

- Default groupId never set for strategies (only in ui)
- Upgrade unleash-frontend to version 3.2.19

## [3.2.29] - 2020-03-05

### Bug Fixes

- Clean up history view a bit
- Upgrade unleash-frontend to version 3.2.18
- Remove unused param
- Lock knex to version 0.20.10

### Miscellaneous Tasks

- Changelog

## [3.2.28] - 2020-02-28

### Bug Fixes

- Upgrade husky to version 4.2.3
- Upgrade @hapi/joi to version 17.1.0
- Upgrade lint-staged to latest
- Use gravatar-url instead of gravatar dep
- Failing user.test on gravatar url
- Add settings column to postgres
- Upgrade unleash-frontend to version 3.2.16
- Footer should be at the bottom.
- Add debounce for toggle-filter to avoid lag
- Lint
- Upgrade unleash-frontend to version 3.2.17
- Metrics for toggle count and version (#565)

### Features

- Api supports context fields (#564)
- UI for view, create and edit context fields (#204)

### Miscellaneous Tasks

- Upgrade documentation
- Update CHANGELOG
- Update CHANGELOG
- Update changelog

## [3.2.27] - 2020-02-21

### Bug Fixes

- Remove prometheus-gc-stats

### Miscellaneous Tasks

- Update changelog.md

## [3.2.26] - 2020-02-21

### Bug Fixes

- Make unti tests pass whatever the timezone is
- Remove unused function
- Make timezone defaulted
- Flag without border in css
- Make Lint happy
- Upgrade react to version 16.2.0
- Regenrate snapshot test for archive view
- Display strategies tab as default
- Naviagation issue when updating feature
- Remove duplicate description in feature deatil view
- Get rid of the regression, create feature can have a name
- Upgrade react-modal to version 3.1.13
- Upgrade react-redux to version 5.0.6
- Move description outside of strategies block
- Display strategies tab as default
- Naviagation issue when updating feature
- Remove duplicate description in feature deatil view
- Get rid of the regression, create feature can have a name
- Move description outside of strategies block
- Redirect to list of features once feature is updated
- Signout more visible
- Update test
- Do not disaply add strategy in read-only mode
- Make CI happy
- Make signout works with proxy
- Make Travis happy
- Toggle correctly display for list and update feature
- Create feature form inside a Card to align UI
- Icon can be null and default values will not kick in then.
- Upgrade to react-router v. 4.x.
- Create/add feature toggle wants to change the current url.
- Add 'history' prop to the archive-list.
- Added unique render key.
- Make sure logout still works.
- Ovveride test rules in root .eslintrc file
- Should be able to open the create strategy view
- Upgrade webpack to 4.x
- Strip all comments in css/js bundles.
- Use correct US English language code.
- Use navigator.language as default locale.
- Fixed bug in history view preventing toggle-view
- Failing test
- Use toggle/on/off endoints to ensure correct state
- Make greenkeeper stop push pr for react-dnd
- Cleanup logut flow
- Clean up the UI with empty states
- Lint errors
- Add new locales: cz, de
- Prevent text highlighting overlap between chips (#188)
- Added plugin to remove dist folder automatically (#191)
- Babel-preset-env (#190)
- Build with node-10
- Upgrade style-loader to version 1.0.0
- Upgrade eslint to version 6.5.1
- Upgrade react to 16.10.2
- Skip locale test for now
- Auto-fill groupId paramters
- Ensure chips are wrapped (#194)
- Update feature toggle description. (#196)
- Update feature toggle description. (#198)
- Do not show defaul environment in ui
- Missing strategy makes the toggle-configure crash
- Cannot remove all variants in Admin UI
- Clean up linitng
- Update fetch-mock to version 8.0.0 (#199)
- Update mini-css-extract-plugin to version 0.9.0
- Clean up variants view
- Should be possible to clone even if strategy does not have groupId
- Failing test
- Upgrade react-mdl to version 2.1.0
- Strategy config not maintainted in create toggle
- Missing feature toggle should pre-fill name
- Update db-migrate to version 0.10.0
- Update db-migrate-pg to version 0.3.0
- Update yargs to version 11.0.0
- DB should not override createdAt if set.
- Upgrade unleash-frontend to version 3.0.0-alpha.8
- Prepare version 3.0.0
- Update express-validator to version 5.0.0
- Update prom-client to version 11.0.0 🚀 (#309)
- Update install to version 0.11.0
- Update db-migrate to version 0.11.1
- Update deep-diff to version 1.0.0
- Update unleash-frontend to version 3.0.1
- Unleash should not start if migration fails.
- Update install to version 0.12.0
- Update yargs to version 12.0.1
- Update knex to version 0.15.2
- Update log4js to version 3.0.2
- Upgrade to log4js 3.0.3 and fix configuration
- Update unleash-frontend to version 3.1.0
- Update unleash-frontend to version 3.1.1
- Add gzip support
- Update joi to version 14.0.0
- Add namePrefix paramter to /api/client/features
- Update build to also verify node 10.
- Decploy scripts in travis needs to be single command
- Update knex to version 0.16.0
- Update knex to version 0.16.1
- Correct error message
- Client errors should use 400 status codes
- Database migrator does use the databaseSchema option
- Critical bugfix 'databaseSchema' not defaulting to 'public'
- Variant tests more stable
- Update variant protocol
- Gracefully handle variant metrics
- Bump frontend for better variant support
- Bump unleash-frontend
- Override field changed name to contextName
- Metric-schema for variant counts
- Toggle variants documentation
- Update unleash-frontend to 3.2.0 with variants support
- Variants should be allowed to be 'null'
- Update dependencies
- Also deploy README.md as part of docs
- Bump unleash-frontend to version 3.2.1
- Metrics poller should start even if inital fetch fails.
- SimpleAuthentication should work with custom basePaths
- Add explicit endpoints for toggle on/off
- Application list should be alphabetically sorted
- Import should use mime.lookup() for filename
- Trigger actual logout on request
- Bump unleash-frontend to version 3.2.3
- Update mime to version 2.4.1
- Session cookie should set path to baseUriPath
- Require path of logger
- LogProvider as option injected to unleash.
- Bump unleash-frontend to 3.2.4
- Should be more allow about empty metrics
- Application fields should be optional.
- Update ava to the latest version 🚀 (#448)
- Specify helpers in ava
- None authentication should have a mock user (#449)
- Update docusaurus to version 1.11.0
- Update commander to version 2.20.0
- Update nyx to version 14.1.1
- Upgrade knex to version 0.17.5
- Add DATABASE_URL_FILE for loading a db url from a file (#455)
- Unleash bin should allow databaseUrl to be defined in env
- Update @passport-next/passport to the latest version 🚀 (#469)
- Upgrade ava to 2.2.0
- Update unleash-frontend to version 3.2.6
- Upgrade eslint to version 6.1.0
- Upgrade husky to version 3.0.1
- Upgrade lint-staged to version 9.2.1
- Update knex to version 0.19.1
- Update commander to version 3.0.0
- Update keycloak example (#478)
- Build on node 10 and 12
- Only build with node v10 for now
- Build on node 10 and 12
- Upgrade log4js to version 5.1.0
- Bump husky to version 3.0.8
- Bump yargs to version 14.0.0
- Remove unused depenency yallist
- E2e tests should only set up one database per test file (#504)
- Remove unused dependency: commander
- Update @passport-next/passport to version 3.0.1
- Update eslint to version 6.5.1
- Upgrade express to version 4.17.1
- Upgrade prettier to version 1.18.2
- Update dev-dependencies
- Only use set-value 2.0.1
- Update lolex to the latest version 🚀 (#508)
- Add admin api for context-field definitions
- Lint error
- Update unleash-frontend to version 3.2.7
- Bump knex from 0.19.4 to 0.19.5 (#513)
- Update unleash-frontend to 3.2.9
- Update yarn.lock
- Update knex to version 0.20.0
- Add option to disable database migrations #526 (#527)
- Update log4js to the latest version 🚀 (#524)
- Update yargs to to version 15.0.1
- Constraints should be part of toggle schema
- Update @types/node to latest
- Bump unleash-frontend to version 3.2.10
- Add appName as label
- Failing test
- Update nyc to version 15.0.0
- Upgrade to @hapi/joi (#543)
- Documentation footer
- Update yargs to version 15.1.0
- Upgrade unleash-frontend to version 3.2.11
- Upgrade unleash-frontend to version 3.2.12
- Upgrade unleash-frontend 3.2.13
- Typo in for the Laravel name (#549)
- Upgrade unleash-frontend to version 3.2.14
- Upgrade unleash-frontend to version 3.2.15
- Variant weights can be up to 1000
- Update prom-client to the latest version 🚀 (#562)

### Bugfix

- Default percentage values should be set, not just displayed.
- Multiple strategies with list-inputs should work.
- Actions should always throw errors
- Filter regex should never throw.
- Use basUrl when logging actual request path
- More informative name validation errors

### Chore

- Add guide for how to use eventHook to send updates to Slack (#459)

### Documentation

- Add Greenkeeper badge
- Add Greenkeeper badge

### Feat

- Clone feature toggle configuration (#201)

### Features

- Timezone should be configurable
- Display strategies details for archived features
- Diplay archived list similar to features list
- Lint are you happy now?
- Reuse Feature
- Reuse Feature
- Reuse feature/view-component.jsx to display archive details
- Make read-only view for feature item
- Archive view can be sorted as feature view
- Make revive available from archive view details
- Default strategy is actually default
- Do not change route after feature toggle update
- Add support for permission system in unleash frontend
- Add support for permission system in unleash frontend
- Add support for permission system in unleash frontend
- Add support for permission system in unleash frontend
- Add support for permission system in unleash frontend
- Show tooltips and featuretoggle names in event view
- Inital beta for variants
- Add all official client SDKs to footer
- Customisable UI via config
- Support a few more locales
- Boolean strategy paramters
- Boolean strategy paramters (#178)
- Add support for flexible rollout strategy. (#193)
- Add option for custom ui links (#195)
- Filter on all values in toogle data
- Added option to bind to http address.
- Expose toggle updates to prometheus
- Add action specific user permissions
- Update frontend with permission support
- Added feature toggle variants
- Frontend with variant support
- Add suppport for variant overrides
- Add customizable ui config
- Added import & export through stateService #395
- Boolean strategy paramters
- Separate DATABASE*URL to multiple DATABASE*\* variable (#437)
- Add option and functionality that allows a user to hook into feature mutations (#457)
- Add db query latency metrics (#473)
- Add new Flexible Rollout Strategy (#517)

### Fix

- Toggle name length has visual issues
- Tests
- Add support for IPC connections.

### Metrics

- Wrte api documentation

### Miscellaneous Tasks

- Update dependencies
- Update style-loader to version 0.20.0
- Update lockfile
- Added propTypes to all components
- Update changelogOH
- Bump react-mdl to 1.11.0
- Update CHANGELOG.md with recent changes
- Prepare version 3.0.0
- Update lock-file
- Update sass-loader to version 7.0.1
- Update lockfile
- Update style-loader to version 0.21.0
- Update lockfile
- Prepare v3.0.1
- Update css-loader to version 1.0.0
- Update lockfile
- Bump react to version 16.4.2
- Bump react-dnd to version 5.0.0
- Upgrade eslit to 4.19.1
- Update style-loader to version 0.22.0
- Update lockfile
- Update changelog
- Updated recent changes
- Fix typo
- Upgrade redux to version 4.0.0
- Upgrade jest to 23.5.0
- Upgrade react-redux to version 5.0.7
- Update webpack to version 4.17.1
- Move all dependencies to devDependencies as they are not used outside this module.
- Add details for version 3.1.2
- Upgrade enzyme to verison 3.5.0
- Upgrade eslint to version 5.4.0
- Update style-loader to version 0.23.0
- Update lockfile
- Update babel-eslint to version 9.0.0
- Update lockfile
- Update fetch-mock to version 7.0.2
- Update lockfile yarn.lock
- Update lockfile
- Allow greenkeeper to update react
- Update css-loader to version 2.0.0
- Update lockfile yarn.lock
- Update changelog
- Update changelog
- Update readme.md
- Update CHANGELOG.md
- Fix linting
- Update debug to version 4.1.1
- Update enzyme to latest versions
- Update redux\* to latest versions
- Update CHANGELOG.md
- Remove unleash.beta.variants flag
- Update changelog
- Update changelog
- Update CHANGELOG.md
- Added official sdk in the footer (#189)
- Update .gitignore
- Update readme
- Update yarn.lock
- Update README.md
- Update CHANGELOG
- Update CHANGELOG
- Update changelog.md
- Update changelog
- Change title in devmode
- Update CHANGELOG.md
- Update changelog
- Update dependencies
- Update lockfile
- Update ava to version 0.24.0
- Update lockfile
- Update lint-staged to version 6.0.0
- Update lockfile
- Update @types/node to version 9.3.0
- Update lockfile
- Update ava to version 0.25.0
- Update lockfile
- Update lockfile
- Update lockfile
- Bump unleash-frontend to 3.0.0-alpha.7
- Updated changelog for 3.0.0-alpha.10
- Update lockfile
- Update lint-staged to version 7.0.0
- Update lockfile
- Update lockfile
- Update lockfile
- Update lockfile
- Update @types/node to version 10.0.3
- Update lockfile
- Update CHANGELOG.md
- Prepare next version
- Bump dependecies
- Bump supertest to 3.1.0
- Bump serve-favicon to 2.5.0
- Bump joi to 13.0.3
- Bump express
- Bump log4js to 2.6.0
- Bump moment to 2.22.1
- Bump @types/node to 10.0.8
- Bump all dev-dependencies
- Bump pg to 7.4.3
- Bump knex to 0.14.6
- Bump commander to 2.15.1
- Prepare next version
- Update nyc to version 12.0.1
- Update lockfile
- Update eslint to version 5.0.0
- Update lockfile
- Update lockfile
- Update lockfile
- Update lockfile
- Update changelog
- Prepare version 3.1.0
- Update unleash-frontend to version 3.1.2
- Update unleash-frontend to version 3.1.3
- Prepare version 3.1.1
- Upgrade prettier
- Update lolex to version 3.0.0
- Update lockfile yarn.lock
- Update husky to version 1.1.1
- Update lockfile yarn.lock
- Update lockfile yarn.lock
- Add another python client
- Added official python client
- Update lint-staged to version 8.0.0
- Update lockfile yarn.lock
- Update lockfile
- Update changelog
- Update superagent to version 4.0.0
- Update lockfile yarn.lock
- Added Docusaurus with a website
- Add docker instructions to getting_started
- Fix lint
- Update changelog
- Add google auth hook guide
- Update yarn.lock
- Cleaned up client SDK documentation
- Fix linting
- Fix linting
- Fix lint
- Upgrade husk and nyc
- Fix husky config
- Upgrade prettier to 1.15.2
- Add prettier rules
- Fix formatting all the things
- Add precommit formatting
- Add gtagId to siteConfig
- Add documentation for custom strategies
- Fix typos in custom strategy guide
- Simplify custom strategy example
- Typo
- Typo in file name
- Only use eslint to fix js files
- Update lockfile yarn.lock
- Prepare 3.1.3 release
- Add site verification
- Update lockfile yarn.lock
- Modernize HealthCheckController
- Modernize BackstageController
- Modernize IndexController
- Modernize FeaturesController
- Modernize ClientIndexController
- Modernize ClientMetricsController
- Modernize ClientRegisterController
- Simplify client-controller constructor
- Cleanup api-def
- Remove unused files
- Admin ArchiveController
- Spin out base class for Controllers
- Admin FeatureController
- Use joi schema-validation in FeatureController
- Use base controller for all client controllers
- UserController
- Admin MetricsController
- Admin StrategyController
- Admin cleanup error-handlers
- Remove express-validator
- Use joi for url-friendly name validation
- Upgrade ava to 1.0.1
- Update
- Upgrade various dev-dependecies
- Upgrade pg to version 7.7.1
- Upgrade joi to version 14.3.0
- Upgrade prom-client to version 11.2.0
- Upgrade deep-diff to version 1.0.2
- Upgrade moment to version 2.23.0
- Updated changes
- Prepare patch release
- Explain that passord is not a typo.
- Upgrade supertest to version 3.4.2
- Upgrade all the dependencies
- Update changelog
- Update guide on integrating with Google Auth
- Update changelog
- Typo in use-doc
- Update sdk doc
- Update README.md
- Update CHANGELOG.md
- Update CHANGELOG.md
- Update yarn.lock
- Update import/export documentation
- Update supertest to version 4.0.1
- Update lockfile yarn.lock
- Update CHANGELOG.md
- Added new user of unleash-doc
- Update superagent to version 5.0.2
- Update lockfile yarn.lock
- Update husky to version 2.0.0
- Update lockfile yarn.lock
- Update lolex to version 4.0.1
- Update lockfile yarn.lock
- Update nyc to version 14.0.0
- Update changelog for next release
- Update @types/node to version 12.0.0
- Update lockfile yarn.lock
- Update changelog
- Update changelog
- Bump yarn.lock
- Use undefined instead of null
- Make options more testable
- Update changelog
- Add new screenshot
- Update readme with details about slack
- Typos in README.md
- Update async to the latest version 🚀 (#445)
- Remove console.log in test
- Update db-migrate-pg to version 1.0.0
- Add budgets as a company using unleash (#456)
- Update changelog
- Add a test to verify eventHook registration
- Add webhook guide do website
- Update readme
- Move metrics-helper.js
- Bump lodash.merge from 4.6.1 to 4.6.2 (#474)
- Update CHANGELOG.md
- Add Elixir Unleash Library to README (#480)
- Fix broken links
- Bump pg to 7.12.1
- See if travis is hapy with serial tests
- Increase test-logging
- Debugging travis by ignoring import tests
- Fix slack invite link
- Tune travis config
- Updated slack invite token (#501)
- Test db-pool on travis
- Test postgres 11 on travis
- Upgrade ava to version 2.4.0
- Upgrade supertest to version 4.0.2
- Upgrade async to version 3.1.0
- Add more logging if test-db destroy fails
- Upgrade lint-staged to version 9.4.1
- Upgrade @types/node to version 12.7.9
- Upgrade knex to version 0.19.4
- Remove old test-setup hacks
- Do not destroy db on startup
- Bump mixin-deep from 1.3.1 to 1.3.2 (#487)
- Added reference to official client implementation in .Net (#503)
- Added unleash-client-core as official sdk (#505)
- Add details about Larvel (php) SDK
- Added static context props in docs (#507)
- Update CHANGELOG.md
- Toggle/on|off documentation added (#515)
- Update CHANGELOG.md
- Update CHANGELOG.md
- Fix typo (#523)
- Update beta-features.md with clients supporting variants (#525)
- Update changelog
- Add baseUriPath support to docs (#531)
- Update CHANGELOG.md
- Bump handlebars from 4.1.2 to 4.5.3 (#542)
- Add .NET Core to top sentence about supported platforms (#538)
- Update CHANGELOG
- Update readme
- Update activation-strategies.md (#554)
- Update lolex to latest version
- Update code of conduct.
- Update changelog

### Refactor

- Separate add-feature and update-feature components
- Use body-parser bundled with express (#304)

### Security-fix

- Upgrade body-parser to 1.17.2

### Testing

- Add enzyme tests
- Test add, update feature form

### Bugfix

- CreatedAt set when creating new toggle

### Clean

- Remove unused code
- Remove unused code
- Reuse list-component from feature to diplay list of archives
- Reuse part of list-container from feature to diplay list of archives
- Remove unused code
- Remove ternary if in jsx

### Db-migration

- Create default strategy with event

### Debug

- Travis with postgres 10
- Test not destroying db in test-setup

### Gitignore

- Added Visual Stuido Code IDE ignores

### Lint

- Make lint happy

### Migration

- Down should remove built_in strategies created in up

### Revert

- Destroy db at test-init

<!-- generated by git-cliff -->
