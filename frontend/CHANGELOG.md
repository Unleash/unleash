# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

The latest version of this document is always available in
[releases][releases-url].

## [3.2.18]
- fix: clean up history view a bit

## [3.2.17]
- fix: feature search should use debounce
- fix: footer should be on bottom

## [3.2.16]
- fix: minor improvement on context UI

## [3.2.15]
- fix: strategy config not maintainted in create toggle
- fix: missing feature toggle should pre-fill name

## [3.2.14]
- fix: upgrade react-mdl to version 2.1.0

## [3.2.13]
- fix: Should be possible to clone even if strategy does not have groupId

## [3.2.12]
- feat: clone feature toggle configuration (#201)

## [3.2.11]
- fix: clean up variants view
- fix: Cannot remove all variants in Admin UI
- fix: update fetch-mock to version 8.0.0 (#199)
- fix: update mini-css-extract-plugin to version 0.9.0


## [3.2.10]
- fix: missing strategy makes the toggle-configure crash

## [3.2.9]
- fix: Update feature toggle description. (#198)
- fix: Update feature toggle description. (#196)
- feat: Filter on all values in toogle data
- feat: Add option for custom ui links (#195)
- fix: Ensure chips are wrapped (#194)


## [3.2.8]
- fix: auto-fill groupId paramters
- feat: Add support for flexible rollout strategy. (#193)


## [3.2.7]
- fix: upgrade react to 16.10.2
- fix: upgrade eslint to version 6.5.1
- fix: upgrade style-loader to version 1.0.0
- fix: Build with node-10
- chore: update yarn.lock
- fix: babel-preset-env (#190)
- fix: Added plugin to remove dist folder automatically (#191)
- fix: Prevent text highlighting overlap between chips (#188)
- chore: Added official sdk in the footer (#189)

## [3.2.6]
- fix: Add new locales: cz, de

## [3.2.5]
- feat: boolean strategy paramters

## [3.2.4]
- fix: Clean up the UI with empty states
- feat: Support a few more locales

## [3.2.3]
- fix: Cleanup logut flow
- chore: remove unleash.beta.variants flag

## [3.2.2]
- fix: Use toggle/on/off endoints to ensure correct state
- feat: Customisable UI via config
- chore: Update css-loader to version 2.1.1
- chore: Update debug to version 4.1.1
- chore: Update enzyme to latest versions
- chore: Update redux* to latest versions

## [3.2.1]
- fix: Fixed bug in history view preventing toggle-view.
- feat: Add all official client SDKs to footer

## [3.2.0]
- feat: Initial beta support for variants
- feature: Show tooltips and featuretoggle names in event view

## [3.1.4]
- feat: Add UI support for permission. 

## [3.1.3]
- fix(webpack): Strip all comments in css/js bundles.

## [3.1.2]
- chore(package): update webpack to version 4.17.1
- chore(package): move all dependencies to devDependencies as they are not used outside this module.  

## [3.1.1]
- fix(strategy-create): Should be able to open the create strategy view.
- chore(package): Upgrade redux to version 4.0.0

## [3.1.0]
- fix(react-router): Upgrade to react-router v4.
- fix(feature-create): Default strategy should be chosen if strategy list is empty. 
- fix(feature-update): Do not change route after feature toggle update.

## [3.0.1]
- fix(feature): Create feature form inside a Card to align UI
- feat(archive): Improve archive view, UI, search, toggle details
- fix(navigation): signout more visible
- fix(signout): make signout works with proxy
- chore(package): Upgrade react to version 16.2.0
- chore(package): update sass-loader to version 7.0.1 

## [3.0.0]
- Nothing new, just locking down the version.

## [3.0.0-alpha.8]
- feat(timestamps): Make formatting of timestamps configurable. 
- fix(package): Update react-mdl to version 1.11.0
- fix(package): update normalize.css to version 8.0.0

## [3.0.0-alpha.7] 
- Move metrics poller to seperate class
- Bugfix: CreatedAt set when creating new toggle
- chore(lint): Added propTypes to all components

## [3.0.0-alpha.6]
- Bugfix: actions should always throw errors
- Bugfix: filter regex should never throw. 

## [3.0.0-alpha.5]
- Add support for simple builtin authentication provider
- Add support for custom authentication provider (aka Oauth2, etc)

## [3.0.0-alpha.4]
- Added unleash-version details in footer. 
- Some house-keeping

## [3.0.0-alpha.2]
- show sdk version as part of instances details.  
- Bugfix: multiple strategies with list-inputs should work. 

## [3.0.0-alpha.1] - 2017-06-28
- updated paths to use new admin api paths

## [2.2.0] - 2017-01-20
- clean filter/sorting and fabbutton #61
- nicer fallback image for metric progress
- fix switch width issue

## [2.1.0] - 2017-01-20
- Adjust header #51 #52
