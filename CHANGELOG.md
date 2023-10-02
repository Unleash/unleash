# Changelog

All notable changes to this project will be documented in this file.

## [5.2.9] - 2023-07-25

### Bug Fixes

- Client metrics name validation ([#4339](https://github.com/Unleash/unleash/issues/4339))


## [5.2.8] - 2023-07-12

### Miscellaneous Tasks

- Prepare 5.2 patch ([#4224](https://github.com/Unleash/unleash/issues/4224))


## [5.2.7] - 2023-07-07

### Bug Fixes

- Disable on invalid constraints


## [5.2.6] - 2023-07-07

### Bug Fixes

- Bulk tags will work now with project permissions ([#4177](https://github.com/Unleash/unleash/issues/4177))


## [5.2.5] - 2023-07-06

### Bug Fixes

- Project tokens can now be created with the correct permissions ([#4165](https://github.com/Unleash/unleash/issues/4165))


### Miscellaneous Tasks

- Remove sync to enterprise from release branches ([#4112](https://github.com/Unleash/unleash/issues/4112))


## [5.2.4] - 2023-07-06

### Bug Fixes

- Update yarn.lock ([#4160](https://github.com/Unleash/unleash/issues/4160))


## [5.2.3] - 2023-07-06

### Bug Fixes

- Bump and pin semver to 7.5.3


## [5.2.2] - 2023-06-29

### Bug Fixes

- Project 404 ([#4114](https://github.com/Unleash/unleash/issues/4114))

- Default strategy groupId failure ([#4120](https://github.com/Unleash/unleash/issues/4120))


## [5.2.0] - 2023-06-28

### Bug Fixes

- Misc UI fixes mostly responsiveness related ([#3868](https://github.com/Unleash/unleash/issues/3868))

- Use correct event type for maxRevisionId ([#3870](https://github.com/Unleash/unleash/issues/3870))

- Reject unauthorized client requests ([#3881](https://github.com/Unleash/unleash/issues/3881))

- Remove consecutive slashes ([#3882](https://github.com/Unleash/unleash/issues/3882))

- Update dependency pg to v8.11.0 ([#3867](https://github.com/Unleash/unleash/issues/3867))

- Update dependency openapi-types to v12.1.1 ([#3885](https://github.com/Unleash/unleash/issues/3885))

- Update dependency pg-connection-string to v2.6.0 ([#3886](https://github.com/Unleash/unleash/issues/3886))

- Update dependency prom-client to v14.2.0 ([#3887](https://github.com/Unleash/unleash/issues/3887))

- Update dependency semver to v7.5.1 ([#3888](https://github.com/Unleash/unleash/issues/3888))

- Update dependency unleash-proxy-client to v2.5.0 ([#3889](https://github.com/Unleash/unleash/issues/3889))

- Author and email should be for PRs ([#3899](https://github.com/Unleash/unleash/issues/3899))

- Remove repository which is no longer needed ([#3900](https://github.com/Unleash/unleash/issues/3900))

- Remove unneseccary constraint validation request ([#3914](https://github.com/Unleash/unleash/issues/3914))

- Propagate http-errors as they are ([#3922](https://github.com/Unleash/unleash/issues/3922))

- Only show simple tag type if there are no tag types in the server ([#3919](https://github.com/Unleash/unleash/issues/3919))

- Update dependency nodemailer to v6.9.3 ([#3934](https://github.com/Unleash/unleash/issues/3934))

- Fix variant metrics ([#3947](https://github.com/Unleash/unleash/issues/3947))

- Update dependency unleash-client to v3.21.0 ([#3948](https://github.com/Unleash/unleash/issues/3948))

- Add createdAt in projects API response ([#3929](https://github.com/Unleash/unleash/issues/3929))

- Allow empty appName as it may come in the url ([#3953](https://github.com/Unleash/unleash/issues/3953))

- Update dependency json-schema-to-ts to v2.9.1 ([#3945](https://github.com/Unleash/unleash/issues/3945))

- Feature not found in project yields 404 ([#3958](https://github.com/Unleash/unleash/issues/3958))

- Fix sort order for environments ([#3992](https://github.com/Unleash/unleash/issues/3992))

- Table imports ([#3982](https://github.com/Unleash/unleash/issues/3982))

- Show environment reorder handle ([#3990](https://github.com/Unleash/unleash/issues/3990))

- Column initial state for project features ([#3983](https://github.com/Unleash/unleash/issues/3983))

- Add trial expired warning for enterprise ([#3997](https://github.com/Unleash/unleash/issues/3997))

- Can review CR with skip change request ([#3998](https://github.com/Unleash/unleash/issues/3998))

- Demo to use new query param ([#4000](https://github.com/Unleash/unleash/issues/4000))

- Usage of default strategy ([#3995](https://github.com/Unleash/unleash/issues/3995))

- Filter out usage for export ([#4006](https://github.com/Unleash/unleash/issues/4006))

- Specific actions for enterprise trial messages ([#4001](https://github.com/Unleash/unleash/issues/4001))

- Playground link ([#4008](https://github.com/Unleash/unleash/issues/4008))

- Reject API admin tokens when importing features ([#4016](https://github.com/Unleash/unleash/issues/4016))

- Infinite playground rendering ([#4031](https://github.com/Unleash/unleash/issues/4031))

- Creating groups should work without users ([#4033](https://github.com/Unleash/unleash/issues/4033))

- Consider ADMIN in API tokens fetch permissions ([#4032](https://github.com/Unleash/unleash/issues/4032))

- Default segments should only be selected when using default stra… ([#4040](https://github.com/Unleash/unleash/issues/4040))

- Multi env select should always have an environment selected ([#4061](https://github.com/Unleash/unleash/issues/4061))

- Disallow empty list of envs and invalid env names in advanced playground ([#4060](https://github.com/Unleash/unleash/issues/4060))

- Autocomplete bug when changing context field ([#4064](https://github.com/Unleash/unleash/issues/4064))

- Add admin guard to groups ([#4069](https://github.com/Unleash/unleash/issues/4069))

- Fetching user root roles include custom ones ([#4068](https://github.com/Unleash/unleash/issues/4068))

- Update roles permission guard ([#4070](https://github.com/Unleash/unleash/issues/4070))

- Remove playground results flip ([#4076](https://github.com/Unleash/unleash/issues/4076))

- Add strategy bug when strategySplittedButton flag is on ([#4071](https://github.com/Unleash/unleash/issues/4071))

- Set max height for add/replace button ([#4085](https://github.com/Unleash/unleash/issues/4085))

- Update dependency semver to v7.5.2 ([#4087](https://github.com/Unleash/unleash/issues/4087))

- Add timestamp to feature toggle metrics ([#4094](https://github.com/Unleash/unleash/issues/4094))

- Break toggle description niceley ([#4093](https://github.com/Unleash/unleash/issues/4093))

- Max revision query order ([#4096](https://github.com/Unleash/unleash/issues/4096))

- Allow roles to be selected when adding user to project ([#4102](https://github.com/Unleash/unleash/issues/4102))


### Docs

- Update stickiness docs ([#3928](https://github.com/Unleash/unleash/issues/3928))


### Documentation

- ADR: Separation of Request and Response schemas ([#3869](https://github.com/Unleash/unleash/issues/3869))

- Health check endpoint ([#3959](https://github.com/Unleash/unleash/issues/3959))

- Instance admin  ([#3961](https://github.com/Unleash/unleash/issues/3961))

- How to synchronize unleash instances ([#3977](https://github.com/Unleash/unleash/issues/3977))

- OpenAPI Client tag ([#3979](https://github.com/Unleash/unleash/issues/3979))

- Mark 'yes' and `no` as required, add more details to variants ([#3984](https://github.com/Unleash/unleash/issues/3984))

- Angular unleash proxy client ([#3897](https://github.com/Unleash/unleash/issues/3897))

- Encourage feedback for sync ([#4003](https://github.com/Unleash/unleash/issues/4003))

- Document how and why we collect data when using Unleash ([#4020](https://github.com/Unleash/unleash/issues/4020))

- Add note about how to handle more than 150 groups in Azure SSO ([#4044](https://github.com/Unleash/unleash/issues/4044))

- Add reference to Haskell SDK ([#3752](https://github.com/Unleash/unleash/issues/3752))


### Features

- Add usage of segment in list ([#3853](https://github.com/Unleash/unleash/issues/3853))

- Segment usage ui test ([#3872](https://github.com/Unleash/unleash/issues/3872))

- Disable notifications flag ([#3874](https://github.com/Unleash/unleash/issues/3874))

- Autocomplete off on login password ([#3901](https://github.com/Unleash/unleash/issues/3901))

- Change own password confirmation ([#3894](https://github.com/Unleash/unleash/issues/3894))

- Usage on context fields in list ([#3906](https://github.com/Unleash/unleash/issues/3906))

- Display strategy title and type ([#3908](https://github.com/Unleash/unleash/issues/3908))

- Generate object combinations ([#3920](https://github.com/Unleash/unleash/issues/3920))

- Context field usage backend ([#3921](https://github.com/Unleash/unleash/issues/3921))

- Context field usage frontend ([#3938](https://github.com/Unleash/unleash/issues/3938))

- Walking skeleton of the advanced playground ([#3949](https://github.com/Unleash/unleash/issues/3949))

- Context/segment usage plausible ([#3956](https://github.com/Unleash/unleash/issues/3956))

- Draft branch playground evaluation ([#3967](https://github.com/Unleash/unleash/issues/3967))

- Add instance stats to version check ([#3835](https://github.com/Unleash/unleash/issues/3835))

- Update predefined strategies tooltip ([#3964](https://github.com/Unleash/unleash/issues/3964))

- Split strategies table into two with new design ([#3969](https://github.com/Unleash/unleash/issues/3969))

- Advanced playground openapi ([#3972](https://github.com/Unleash/unleash/issues/3972))

- Custom root roles ([#3975](https://github.com/Unleash/unleash/issues/3975))

- Playground environment table ([#3985](https://github.com/Unleash/unleash/issues/3985))

- Add max order to environments ([#3988](https://github.com/Unleash/unleash/issues/3988))

- Advanced playground table ([#3978](https://github.com/Unleash/unleash/issues/3978))

- Strategy tooltip grouping and default ([#3986](https://github.com/Unleash/unleash/issues/3986))

- Virtualized table with parent ref ([#3993](https://github.com/Unleash/unleash/issues/3993))

- Add support for turning telemetry off with environment variable ([#3987](https://github.com/Unleash/unleash/issues/3987))

- Roles unification ([#3999](https://github.com/Unleash/unleash/issues/3999))

- Playground environment diff table ([#4002](https://github.com/Unleash/unleash/issues/4002))

- Change CR strategy title and name behaviour ([#4004](https://github.com/Unleash/unleash/issues/4004))

- Implement better roles sub-tabs ([#4009](https://github.com/Unleash/unleash/issues/4009))

- Environment diff ([#4007](https://github.com/Unleash/unleash/issues/4007))

- Store playground settings in local storage ([#4012](https://github.com/Unleash/unleash/issues/4012))

- Separate api token roles ([#4019](https://github.com/Unleash/unleash/issues/4019))

- Query complexity validation ([#4017](https://github.com/Unleash/unleash/issues/4017))

- Enable oas by default ([#4021](https://github.com/Unleash/unleash/issues/4021))

- Use new role components in project access ([#4018](https://github.com/Unleash/unleash/issues/4018))

- Initial scroll trigger ([#4036](https://github.com/Unleash/unleash/issues/4036))

- Configurable playground limit ([#4047](https://github.com/Unleash/unleash/issues/4047))

- Add "edit" link to playground strategies ([#4027](https://github.com/Unleash/unleash/issues/4027))

- Advanced playground multi value context fields ([#4053](https://github.com/Unleash/unleash/issues/4053))

- Ui tweaks for playground ([#4058](https://github.com/Unleash/unleash/issues/4058))

- Plausible for new strategy flow ([#4057](https://github.com/Unleash/unleash/issues/4057))

- Execution plan diff table ([#4065](https://github.com/Unleash/unleash/issues/4065))

- Link to strategy edit screens from playground strategy results ([#4063](https://github.com/Unleash/unleash/issues/4063))

- Count number of combinations from playground ([#4077](https://github.com/Unleash/unleash/issues/4077))

- Expose kapi as part of docs ([#3996](https://github.com/Unleash/unleash/issues/3996))

- Upgrade AdminAlert to PermissionGuard ([#4074](https://github.com/Unleash/unleash/issues/4074))


### Fix

- Laggy toggles ([#3873](https://github.com/Unleash/unleash/issues/3873))


### Miscellaneous Tasks

- Name and email convention ([#3871](https://github.com/Unleash/unleash/issues/3871))

- Simplify workflows ([#3902](https://github.com/Unleash/unleash/issues/3902))

- Remove unnecessary build ([#3910](https://github.com/Unleash/unleash/issues/3910))

- Lower log-level for unexpected errors ([#3837](https://github.com/Unleash/unleash/issues/3837))

- Improve joi errors ([#3836](https://github.com/Unleash/unleash/issues/3836))

- Clarify error logs ([#3915](https://github.com/Unleash/unleash/issues/3915))

- Avoid building frontend twice ([#3918](https://github.com/Unleash/unleash/issues/3918))

- Optimize docker build oss ([#3951](https://github.com/Unleash/unleash/issues/3951))

- Rename version to reflect next candidate ([#3944](https://github.com/Unleash/unleash/issues/3944))

- Set unleash version to be either the enterprise version or OSS ([#3974](https://github.com/Unleash/unleash/issues/3974))

- Upgrade orval types ([#3981](https://github.com/Unleash/unleash/issues/3981))

- Add advanced playground table test ([#4005](https://github.com/Unleash/unleash/issues/4005))

- Remove variant metrics flag ([#4042](https://github.com/Unleash/unleash/issues/4042))

- Update orval models ([#4062](https://github.com/Unleash/unleash/issues/4062))

- Document default strategy ([#4010](https://github.com/Unleash/unleash/issues/4010))

- Remove unused values to stop linter complaining ([#4078](https://github.com/Unleash/unleash/issues/4078))

- Filter out deprecated permissions ([#4083](https://github.com/Unleash/unleash/issues/4083))

- Remove strategyImprovements flag ([#4043](https://github.com/Unleash/unleash/issues/4043))


### Refactor

- Playground in feature oriented architecture ([#3942](https://github.com/Unleash/unleash/issues/3942))

- Read project ids in memory ([#3965](https://github.com/Unleash/unleash/issues/3965))

- Extract playground steps ([#3966](https://github.com/Unleash/unleash/issues/3966))

- Address custom root roles PR comments ([#3994](https://github.com/Unleash/unleash/issues/3994))

- Misc cleanups ([#4022](https://github.com/Unleash/unleash/issues/4022))

- Token permissions, drop admin-like permissions ([#4050](https://github.com/Unleash/unleash/issues/4050))


### Testing

- Advanced playground ([#3968](https://github.com/Unleash/unleash/issues/3968))

- Meta schema rules should not check description on ref ([#3980](https://github.com/Unleash/unleash/issues/3980))

- Playground env table display ([#3989](https://github.com/Unleash/unleash/issues/3989))

- Advanced playground error ([#4023](https://github.com/Unleash/unleash/issues/4023))


### Security

- Reject multiple successive slashes in path ([#3880](https://github.com/Unleash/unleash/issues/3880))


### Task

- Make keepalive configurable via an environment variable ([#4015](https://github.com/Unleash/unleash/issues/4015))


## [5.1.9] - 2023-06-16

### Bug Fixes

- Add createdAt in projects API response ([#3929](https://github.com/Unleash/unleash/issues/3929))

- Can review CR with skip change request ([#3998](https://github.com/Unleash/unleash/issues/3998))


## [5.1.8] - 2023-06-12

### Bug Fixes

- Fix variant metrics ([#3947](https://github.com/Unleash/unleash/issues/3947)) ([#3950](https://github.com/Unleash/unleash/issues/3950))


## [5.1.6] - 2023-06-07

### Miscellaneous Tasks

- Clarify error logs ([#3915](https://github.com/Unleash/unleash/issues/3915))


## [5.1.5] - 2023-05-27

### Bug Fixes

- Remove consecutive slashes ([#3882](https://github.com/Unleash/unleash/issues/3882))


## [5.1.4] - 2023-05-27

### Bug Fixes

- Reject unauthorized client requests ([#3881](https://github.com/Unleash/unleash/issues/3881))


## [5.1.3] - 2023-05-27

### Security

- Reject multiple successive slashes in path ([#3880](https://github.com/Unleash/unleash/issues/3880))


## [5.1.2] - 2023-05-26

### Fix

- Laggy toggles ([#3873](https://github.com/Unleash/unleash/issues/3873))


## [5.1.1] - 2023-05-26

### Bug Fixes

- Use correct event type for maxRevisionId ([#3870](https://github.com/Unleash/unleash/issues/3870))


## [5.1.0] - 2023-05-25

### Bug Fixes

- Allow null checker to not fail if it gets no output ([#3779](https://github.com/Unleash/unleash/issues/3779))

- Block adding a root role to a group with a project role ([#3775](https://github.com/Unleash/unleash/issues/3775))

- Change commit hash step name ([#3784](https://github.com/Unleash/unleash/issues/3784))

- Prevent variant name from containing extra whitespace ([#3777](https://github.com/Unleash/unleash/issues/3777))

- Demo QR code ([#3793](https://github.com/Unleash/unleash/issues/3793))

- Fix deleting feature from global archive ([#3786](https://github.com/Unleash/unleash/issues/3786))

- Strategy remove menu ([#3807](https://github.com/Unleash/unleash/issues/3807))

- Properly handle flag resolver variants ([#3808](https://github.com/Unleash/unleash/issues/3808))

- Move title at the top in default strategy ([#3812](https://github.com/Unleash/unleash/issues/3812))

- Laggy switch ([#3814](https://github.com/Unleash/unleash/issues/3814))

- Update dependency helmet to v6.2.0 ([#3824](https://github.com/Unleash/unleash/issues/3824))

- Update dependency joi to v17.9.2 ([#3825](https://github.com/Unleash/unleash/issues/3825))

- Make area behind bulk actions clickable ([#3838](https://github.com/Unleash/unleash/issues/3838))

- Use the correct actor ([#3842](https://github.com/Unleash/unleash/issues/3842))

- Only show names as changed when titles have changed. ([#3843](https://github.com/Unleash/unleash/issues/3843))

- Default strategy screen not loading when no default strategy ([#3840](https://github.com/Unleash/unleash/issues/3840))

- New workflow name ([#3845](https://github.com/Unleash/unleash/issues/3845))

- Update dependency json-schema-to-ts to v2.8.2 ([#3844](https://github.com/Unleash/unleash/issues/3844))

- Move application logic to service ([#3846](https://github.com/Unleash/unleash/issues/3846))

- Add confirmation to disable password login ([#3829](https://github.com/Unleash/unleash/issues/3829))

- Update dependency log4js to v6.9.1 ([#3847](https://github.com/Unleash/unleash/issues/3847))

- Workflow was moved ([#3852](https://github.com/Unleash/unleash/issues/3852))

- Hide password login when it's disabled ([#3851](https://github.com/Unleash/unleash/issues/3851))

- Profile should wait for loaded state before rendering ([#3855](https://github.com/Unleash/unleash/issues/3855))

- Change password alert when password based login is disabled ([#3856](https://github.com/Unleash/unleash/issues/3856))

- Default strategy screen not loading ([#3857](https://github.com/Unleash/unleash/issues/3857))

- Rollout not reflected correctly for default strategy ([#3859](https://github.com/Unleash/unleash/issues/3859))

- Update dependency make-fetch-happen to v11.1.1 ([#3863](https://github.com/Unleash/unleash/issues/3863))

- Update dependency nodemailer to v6.9.2 ([#3865](https://github.com/Unleash/unleash/issues/3865))


### Documentation

- Extend group documentation to include information on setting root roles ([#3696](https://github.com/Unleash/unleash/issues/3696))

- Openapi schema specifications for Projects tag ([#3571](https://github.com/Unleash/unleash/issues/3571))

- Maintanance mode impact ([#3858](https://github.com/Unleash/unleash/issues/3858))

- Azure sso guide ([#3431](https://github.com/Unleash/unleash/issues/3431))

- Remove "docs under restructuring note" ([#3864](https://github.com/Unleash/unleash/issues/3864))


### Features

- Release inputs added to dispatcher ([#3756](https://github.com/Unleash/unleash/issues/3756))

- New notify enterprise workflow ([#3781](https://github.com/Unleash/unleash/issues/3781))

- Set commit hash as static asset version ([#3783](https://github.com/Unleash/unleash/issues/3783))

- Base path support for openapi ([#3780](https://github.com/Unleash/unleash/issues/3780))

- Create stubs for bulk toggle ([#3792](https://github.com/Unleash/unleash/issues/3792))

- Basic bulk update implementation ([#3794](https://github.com/Unleash/unleash/issues/3794))

- Remove icons to prepare space for bulk toggle ([#3796](https://github.com/Unleash/unleash/issues/3796))

- Bulk enabled disable ([#3797](https://github.com/Unleash/unleash/issues/3797))

- Message banner (variants) ([#3788](https://github.com/Unleash/unleash/issues/3788))

- Bulk enable disable change requests ([#3801](https://github.com/Unleash/unleash/issues/3801))

- Bulk enable hints ([#3802](https://github.com/Unleash/unleash/issues/3802))

- Transactional bulk update ([#3806](https://github.com/Unleash/unleash/issues/3806))

- Change requests UI for activate disabled strategies ([#3787](https://github.com/Unleash/unleash/issues/3787))

- Disable bulk toggles flag ([#3827](https://github.com/Unleash/unleash/issues/3827))

- Disable bulk update env var ([#3828](https://github.com/Unleash/unleash/issues/3828))

- Maintenance mode disables scheduler ([#3854](https://github.com/Unleash/unleash/issues/3854))


### Miscellaneous Tasks

- Use concurrently to run parallel builds ([#3785](https://github.com/Unleash/unleash/issues/3785))

- Disable null checks until we have time to fix this ([#3830](https://github.com/Unleash/unleash/issues/3830))

- Delay static asset generation ([#3848](https://github.com/Unleash/unleash/issues/3848))

- Add Unit test result check task ([#3695](https://github.com/Unleash/unleash/issues/3695))


### Refactor

- Rename demo img assets ([#3795](https://github.com/Unleash/unleash/issues/3795))

- Change plausible events to be more specific at the top level ([#3810](https://github.com/Unleash/unleash/issues/3810))


### Testing

- Bulk enable display ([#3803](https://github.com/Unleash/unleash/issues/3803))

- Add debug logs ([#3841](https://github.com/Unleash/unleash/issues/3841))


## [5.0.11] - 2023-06-07

### Miscellaneous Tasks

- Clarify error logs ([#3915](https://github.com/Unleash/unleash/issues/3915))


## [5.0.10] - 2023-05-27

### Bug Fixes

- Remove consecutive slashes ([#3882](https://github.com/Unleash/unleash/issues/3882))


## [5.0.9] - 2023-05-27

### Bug Fixes

- Reject unauthorized client requests ([#3881](https://github.com/Unleash/unleash/issues/3881))


## [5.0.8] - 2023-05-27

### Bug Fixes

- Use username instead of tokenName

- Hard code not found error to 404 in app


### Security

- Reject multiple successive slashes in path ([#3880](https://github.com/Unleash/unleash/issues/3880))


## [5.0.7] - 2023-05-26

### Bug Fixes

- Anonymise PII fields in user access if flag is set ([#3773](https://github.com/Unleash/unleash/issues/3773))

- Use correct event type for maxRevisionId ([#3870](https://github.com/Unleash/unleash/issues/3870))


## [5.0.6] - 2023-05-12

### Bug Fixes

- Log missing user at warn level ([#3735](https://github.com/Unleash/unleash/issues/3735))


## [5.0.5] - 2023-05-11

### Miscellaneous Tasks

- Tmp 5.0.5 ([#3746](https://github.com/Unleash/unleash/issues/3746))


## [5.0.2] - 2023-05-08

### Bug Fixes

- Anonymize email in event payload ([#3672](https://github.com/Unleash/unleash/issues/3672))


## [5.0.1] - 2023-04-28

### Bug Fixes

- Correct error for missing context field ([#3647](https://github.com/Unleash/unleash/issues/3647))


## [4.23.4] - 2023-06-05

### Bug Fixes

- Remove consecutive slashes


## [4.23.3] - 2023-05-10

### Bug Fixes

- Project tokens type bug fix ([#3734](https://github.com/Unleash/unleash/issues/3734))


## [4.23.2] - 2023-05-08

### Bug Fixes

- Import tags ([#3709](https://github.com/Unleash/unleash/issues/3709))


## [4.22.9] - 2023-06-06

### Bug Fixes

- Remove consecutive slashes


## [4.22.8] - 2023-04-26

### Bug Fixes

- Migration failure when sessionId exists ([#3624](https://github.com/Unleash/unleash/issues/3624))


## [4.22.7] - 2023-04-25

### Miscellaneous Tasks

- Patch 4.22.7 ([#3618](https://github.com/Unleash/unleash/issues/3618))


## [4.22.6] - 2023-04-25

### Miscellaneous Tasks

- Patch 4.22.6 ([#3603](https://github.com/Unleash/unleash/issues/3603))


## [4.22.3] - 2023-04-06

### Bug Fixes

- Stickiness ([#3471](https://github.com/Unleash/unleash/issues/3471))


## [4.22.1] - 2023-04-05

### Bug Fixes

- Concurrency issue when running multiple requests ([#3442](https://github.com/Unleash/unleash/issues/3442))


### Features

- Add PAT kill switch ([#3454](https://github.com/Unleash/unleash/issues/3454))


## [4.21.3] - 2023-06-06

### Bug Fixes

- Remove consecutive slashes


## [4.21.2] - 2023-03-29

### Bug Fixes

- Hide project stats behind flag and backport to 4.21 ([#3419](https://github.com/Unleash/unleash/issues/3419))


## [4.21.1] - 2023-03-22

### Bug Fixes

- Properly escaping app names ([#3368](https://github.com/Unleash/unleash/issues/3368))


## [4.21.0] - 2023-02-22

### Documentation

- Mention env var options for auth config ([#3169](https://github.com/Unleash/unleash/issues/3169))


## [4.20.6] - 2023-06-06

### Bug Fixes

- Remove consecutive slashes


## [4.20.5] - 2023-02-09

### Bug Fixes

- Make sure we have a user in event store


## [4.20.4] - 2023-02-02

### Bug Fixes

- Latest changes in network overview


## [4.20.3] - 2023-02-01

### Bug Fixes

- When app count is zero because it just started ([#3029](https://github.com/Unleash/unleash/issues/3029))


## [4.20.2] - 2023-01-30

### Bug Fixes

- List projects with all archived toggles ([#3020](https://github.com/Unleash/unleash/issues/3020))


## [4.20.0] - 2023-01-26

### Bug Fixes

- Prevent deleting the last variable variant on the ui ([#2964](https://github.com/Unleash/unleash/issues/2964))

- Preload error ([#2980](https://github.com/Unleash/unleash/issues/2980))

- Redirect only happening on root path with replace ([#2981](https://github.com/Unleash/unleash/issues/2981))

- Project table overflow ([#2987](https://github.com/Unleash/unleash/issues/2987))

- Revert table virtualization in variants per env ([#2990](https://github.com/Unleash/unleash/issues/2990))

- Small fixes on variants push to env UI ([#2991](https://github.com/Unleash/unleash/issues/2991))

- Check is flag enabled! ([#2993](https://github.com/Unleash/unleash/issues/2993))

- Project without potential actions health items separation


### Docs

- Fix typo in front-end api url


### Documentation

- Add front-end API setup to the quickstart guide ([#2984](https://github.com/Unleash/unleash/issues/2984))

- Generate client-side SDK docs from readme ([#2949](https://github.com/Unleash/unleash/issues/2949))


### Features

- Add push to all button to UI ([#2969](https://github.com/Unleash/unleash/issues/2969))

- Visualize variants diff in CR ([#2979](https://github.com/Unleash/unleash/issues/2979))

- Back transition from validate to configure ([#2982](https://github.com/Unleash/unleash/issues/2982))

- Import stage ([#2985](https://github.com/Unleash/unleash/issues/2985))

- Adds CR to variants per env UI ([#2989](https://github.com/Unleash/unleash/issues/2989))


### Miscellaneous Tasks

- Increase max number of environments from 15 to 50 ([#2968](https://github.com/Unleash/unleash/issues/2968))

- Ignore Twitter link from being checked ([#2971](https://github.com/Unleash/unleash/issues/2971))


### Task

- Changing variants blocked by cr ([#2966](https://github.com/Unleash/unleash/issues/2966))


## [4.19.5] - 2023-06-06

### Bug Fixes

- Remove consecutive slashes


## [4.19.4] - 2023-01-13

### Bug Fixes

- Found an edge case exporting variants ([#2900](https://github.com/Unleash/unleash/issues/2900))


## [4.19.3] - 2023-01-12

### Bug Fixes

- Export features with variants event when feature is disabled ([#2824](https://github.com/Unleash/unleash/issues/2824))


## [4.19.2] - 2023-01-11

### Bug Fixes

- Dots in env name accessor


## [4.19.0] - 2022-12-15

### Bug Fixes

- Allow publish-new-version action to run from branch ([#2698](https://github.com/Unleash/unleash/issues/2698))

- Disable networkView for dev, fail more gracefully ([#2701](https://github.com/Unleash/unleash/issues/2701))


### Docs

- Update availability notice for sso keycloak group sync


### Features

- First draft of chart for instance traffic in frontend ([#2670](https://github.com/Unleash/unleash/issues/2670))


## [4.18.9] - 2022-12-14

### Bug Fixes

- Background frontend settings should not crash tests


## [4.18.8] - 2022-12-12

### Bug Fixes

- Move docker-compose to this repo ([#2666](https://github.com/Unleash/unleash/issues/2666))


## [4.18.7] - 2022-12-09

### Bug Fixes

- Bump qs from 6.5.2 to 6.5.3 ([#2613](https://github.com/Unleash/unleash/issues/2613))

- IsPro check on change request configuration ([#2610](https://github.com/Unleash/unleash/issues/2610))

- Update vercel proxy paths ([#2623](https://github.com/Unleash/unleash/issues/2623))

- Update package json and remove empty exports ([#2625](https://github.com/Unleash/unleash/issues/2625))

- Add resulution for qs dep

- Tags endpoint returning 404 when featureId is not set ([#2621](https://github.com/Unleash/unleash/issues/2621))

- Update dependency docusaurus-plugin-openapi-docs to v1.4.7 ([#2646](https://github.com/Unleash/unleash/issues/2646))


### Features

- Add plan checks to uiconfig ([#2600](https://github.com/Unleash/unleash/issues/2600))

- Add capability to write heap snapshot. ([#2611](https://github.com/Unleash/unleash/issues/2611))


### POC

- Integration tests ([#2422](https://github.com/Unleash/unleash/issues/2422))


## [4.18.6] - 2022-12-06

### Bug Fixes

- Upgrade express to v4.18.2

- Json-schema-to-ts is a dev-dependency


## [4.18.5] - 2022-12-06

### Bug Fixes

- Add resulution for 'decode-uri-component'

- Favorites column visibility ([#2605](https://github.com/Unleash/unleash/issues/2605))


### Docs

- Add more (missing) redirects, fix links ([#2592](https://github.com/Unleash/unleash/issues/2592))


## [4.18.4] - 2022-12-06

### Bug Fixes

- Allow import @server ([#2601](https://github.com/Unleash/unleash/issues/2601))


## [4.17.3] - 2022-11-23

### Bug Fixes

- Broken UI after import ([#2447](https://github.com/Unleash/unleash/issues/2447))


## [4.17.1] - 2022-11-08

### Bug Fixes

- Merge order for UI config


## [4.17.0] - 2022-11-04

### Bug Fixes

- Clone environment creating token everytime ([#2335](https://github.com/Unleash/unleash/issues/2335))


## [4.16.4] - 2022-10-21

### Bug Fixes

- Respect environment if set on context ([#2206](https://github.com/Unleash/unleash/issues/2206))


## [4.16.3] - 2022-10-18

### Bug Fixes

- Should only require CREATE_ADDON when creating addon ([#2204](https://github.com/Unleash/unleash/issues/2204))


## [4.16.2] - 2022-10-17

### Bug Fixes

- Filter empty metrics before we collect last seen toggles. ([#2172](https://github.com/Unleash/unleash/issues/2172))

- CORS options path ([#2165](https://github.com/Unleash/unleash/issues/2165))


## [4.16.1] - 2022-10-06

### Bug Fixes

- Equality check on feature strategy ([#2145](https://github.com/Unleash/unleash/issues/2145))


## [4.16.0] - 2022-10-03

### Bug Fixes

- Add env and project labels to feature updated metrics. ([#2043](https://github.com/Unleash/unleash/issues/2043))

- Do not call store function in constructor

- Update SDK matrix

- S/Never logged/Never/g in frontend ([#2075](https://github.com/Unleash/unleash/issues/2075))

- Deletes all sessions for user on logout ([#2071](https://github.com/Unleash/unleash/issues/2071))

- Revert breaking change for incoming token creation reqs ([#2084](https://github.com/Unleash/unleash/issues/2084))

- Make unit test target work ([#2082](https://github.com/Unleash/unleash/issues/2082))

- Client registration events are on eventStore ([#2093](https://github.com/Unleash/unleash/issues/2093))

- Support coverage reports on external PRs ([#2087](https://github.com/Unleash/unleash/issues/2087))

- Update UI labeling: custom constraint -> (strategy) constraint ([#2101](https://github.com/Unleash/unleash/issues/2101))

- Typo in strategy-constraints.md ([#2115](https://github.com/Unleash/unleash/issues/2115))

- Add appName to http response time metrics ([#2117](https://github.com/Unleash/unleash/issues/2117))

- Url encode application name in links ([#2121](https://github.com/Unleash/unleash/issues/2121))

- Updated develper guide to force UTC timezone for test db

- Update coverage


### Docs

- Update API access for new token type ([#1958](https://github.com/Unleash/unleash/issues/1958))

- Update docusaurus deploy command to generate openapi docs

- Fix typo: Unlash -> Unleash


### Documentation

- Update link for symfony sdk ([#2048](https://github.com/Unleash/unleash/issues/2048))

- Test broken links in website ([#1912](https://github.com/Unleash/unleash/issues/1912))

- Update images using latest UI screenshots ([#1992](https://github.com/Unleash/unleash/issues/1992))

- Fix broken link to how-to-create-API token guide ([#2073](https://github.com/Unleash/unleash/issues/2073))

- Move user groups section to after permissions section ([#2081](https://github.com/Unleash/unleash/issues/2081))

- Fix broken link to front-end API tokens ([#2094](https://github.com/Unleash/unleash/issues/2094))


### Features

- Add method for migrating proxies without environment validation ([#2056](https://github.com/Unleash/unleash/issues/2056))

- Update to pull_request_target ([#2059](https://github.com/Unleash/unleash/issues/2059))

- Open-Source Strategy Constraints ([#2112](https://github.com/Unleash/unleash/issues/2112))

- New profile page and PATs front-end ([#2109](https://github.com/Unleash/unleash/issues/2109))


### Fix

- Prevent password reset email flooding ([#2076](https://github.com/Unleash/unleash/issues/2076))


### Miscellaneous Tasks

- Add generated doc cleaning script ([#2077](https://github.com/Unleash/unleash/issues/2077))

- Improve validation testing ([#2058](https://github.com/Unleash/unleash/issues/2058))


## [4.15.5] - 2022-10-03

### Bug Fixes

- Correct path for login

- Add env and project labels to feature updated metrics. ([#2043](https://github.com/Unleash/unleash/issues/2043))


## [4.15.4] - 2022-09-19

### Bug Fixes

- Update snapshot to new version

- Updated snapshot to not include api version


## [4.15.2] - 2022-09-12

### Features

- Add method for migrating proxies without environment validation ([#2056](https://github.com/Unleash/unleash/issues/2056))


## [4.14.5] - 2022-08-18

### Miscellaneous Tasks

- Update frontend version


## [4.14.4] - 2022-08-16

### Bug Fixes

- Default to an empty array in mapFeaturesForBootstrap


### Miscellaneous Tasks

- Update frontend


## [4.14.3] - 2022-08-15

### Bug Fixes

- Check variants before mapping


### Miscellaneous Tasks

- Update unleash-frontend


## [4.14.2] - 2022-08-08

### Features

- Add new standard errors ([#1890](https://github.com/Unleash/unleash/issues/1890))

- Change log level for OpenAPI to debug ([#1895](https://github.com/Unleash/unleash/issues/1895))

- Change log level for OpenAPI to debug ([#1895](https://github.com/Unleash/unleash/issues/1895))


## [4.14.1] - 2022-08-05

### Bug Fixes

- Update docusaurus monorepo to v2.0.1 ([#1871](https://github.com/Unleash/unleash/issues/1871))

- Add missing client variant schema fields ([#1880](https://github.com/Unleash/unleash/issues/1880))

- Update dependency unleash-frontend to v4.14.3 ([#1888](https://github.com/Unleash/unleash/issues/1888))

- Add missing client variant schema fields ([#1880](https://github.com/Unleash/unleash/issues/1880))


### Docs

- Fix formatting of docusaurus admonitions


### Features

- Return detailed information on feature toggle evaluation ([#1839](https://github.com/Unleash/unleash/issues/1839))


## [4.14.0] - 2022-07-28

### Bug Fixes

- Make additionalProperties true ([#1861](https://github.com/Unleash/unleash/issues/1861))

- Update dependency unleash-proxy-client to v2.0.3 ([#1841](https://github.com/Unleash/unleash/issues/1841))

- Fix broken OpenAPI spec ([#1846](https://github.com/Unleash/unleash/issues/1846))

- Remove unneeded ts-expect-error now that types in knex are in sync ([#1866](https://github.com/Unleash/unleash/issues/1866))

- Update dependency json-schema-to-ts to v2.5.5 ([#1865](https://github.com/Unleash/unleash/issues/1865))

- SortOrder updates needs to be async


### Task

- Bump unleash-frontend to 4.14.1


## [4.13.1] - 2022-07-14

### Bug Fixes

- Use left join for segments to avoid nullmapping


## [4.13.0] - 2022-06-29

### Miscellaneous Tasks

- Bump front end to 4.13.0


## [4.12.6] - 2022-06-14

### Bug Fixes

- Update `multer` ([#1649](https://github.com/Unleash/unleash/issues/1649))


### Task

- Update frontend to 4.12.4


## [4.12.5] - 2022-06-01

### Miscellaneous Tasks

- Update frontend


## [4.12.4] - 2022-06-01

### Miscellaneous Tasks

- Update unleash-frontend


## [4.12.3] - 2022-05-31

### Bug Fixes

- Update dependency unleash-frontend to v4.12.1


## [4.12.2] - 2022-05-31

### Bug Fixes

- Flag for anonymising user search


## [4.12.1] - 2022-05-30

### Bug Fixes

- Add flag to annomise event log


## [4.12.0] - 2022-05-27

### Bug Fixes

- Require equal environments when moving toggles ([#1595](https://github.com/Unleash/unleash/issues/1595))

- The replaceGroupId field should be optional ([#1608](https://github.com/Unleash/unleash/issues/1608))

- Include jest coverage files (POC)

- Specify coverage files to use for jest pr action (poc)

- Only specify base-cov-file for jest action (poc)

- Add debug step

- Remove parametersSchema maxLength requirement ([#1616](https://github.com/Unleash/unleash/issues/1616))

- More debug

- More debugigng to jest coverage action (POC)

- Do not ignore coverage/report.json

- Failing test

- Auto-push coverage

- Coverage build for main should be a seperate workflow

- Coverage action

- Add gh creds to coverage action

- Coverage action need username

- Switch gh token for coverage action

- Inline coverage action script commands

- Coverage action

- Do not produce report.json in coverage action for now

- Update dependency unleash-frontend to v4.11.0 ([#1597](https://github.com/Unleash/unleash/issues/1597))

- Project environments order ([#1599](https://github.com/Unleash/unleash/issues/1599))

- Update dependency unleash-frontend to v4.11.2

- Upgrade multer to v1.4.4

- Allow project roles to be changed when the relevant user has a root role ([#1632](https://github.com/Unleash/unleash/issues/1632))


### Documentation

- Add "how to run for development" to CONTRIBUTING.md ([#1600](https://github.com/Unleash/unleash/issues/1600))

- Switch all slack links to slack.unleash.run ([#1613](https://github.com/Unleash/unleash/issues/1613))

- Update import to use named export instead of default ([#1609](https://github.com/Unleash/unleash/issues/1609))

- Use named export instead of default ([#1614](https://github.com/Unleash/unleash/issues/1614))

- Use named export instead of default ([#1615](https://github.com/Unleash/unleash/issues/1615))


### Miscellaneous Tasks

- Fix coverage badge

- Update coverage

- Update coverage reports

- Test


### Refactor

- Add regression test for long parameter values ([#1617](https://github.com/Unleash/unleash/issues/1617))

- Improve OpenAPI refs ([#1620](https://github.com/Unleash/unleash/issues/1620))


### Meta

- Add external PRs to project board


## [4.11.2] - 2022-05-23

### Miscellaneous Tasks

- Update unleash frontend to 4.11.2


## [4.11.1] - 2022-05-20

### Bug Fixes

- Remove parametersSchema maxLength requirement ([#1616](https://github.com/Unleash/unleash/issues/1616))

- Failing test


### Miscellaneous Tasks

- Update snapshot test since the cherry-pick is not clean


## [4.11.0] - 2022-05-18

### Features

- Bump unleash frontend to 4.11.0


## [4.10.5] - 2022-05-11

### Bug Fixes

- Correct patch for feature project id


## [4.10.4] - 2022-05-11

### Bug Fixes

- Repair feature strategies with broken project ids ([#1593](https://github.com/Unleash/unleash/issues/1593))


## [4.10.3] - 2022-05-11

### Miscellaneous Tasks

- Upgrade frontend


## [4.10.2] - 2022-05-10

### Bug Fixes

- Upgrade unleash-frontend to v4.10.2


## [4.10.1] - 2022-05-10

### Bug Fixes

- Update dependency unleash-frontend to v4.10.1

- Set favicon icon to CDN if prefix is set ([#1553](https://github.com/Unleash/unleash/issues/1553))

- Remove console.log from test

- Correct types used in addon.ts


## [4.10.0] - 2022-04-29

### Bug Fixes

- Update react monorepo to v18.1.0

- Update dependency unleash-proxy-client to v2.0.1

- Update dependency unleash-frontend to v4.10.0-beta.8 ([#1545](https://github.com/Unleash/unleash/issues/1545))

- Pr-build use pull_request_target event


### Documentation

- Remove deprecation notices for tags.

- Add more Api information + add disable toggle info

- Link to the correct new endpoints in the features v2 API

- Add docs for vue and svelte clients ([#1541](https://github.com/Unleash/unleash/issues/1541))

- Update compat table with custom stickiness for go ([#1544](https://github.com/Unleash/unleash/issues/1544))

- Change the remoteAddress description ([#1539](https://github.com/Unleash/unleash/issues/1539))

- Correct custom activation strategies param types ([#1547](https://github.com/Unleash/unleash/issues/1547))


### Features

- Update ApiRequest to accept POST w/o payloads

- Bump frontend to 4.10.0


### Miscellaneous Tasks

- Remove code leftover code


### Refactor

- Fix a few eslint module boundary type overrides ([#1542](https://github.com/Unleash/unleash/issues/1542))

- Disallow additionalProperties in response schemas ([#1543](https://github.com/Unleash/unleash/issues/1543))


### Task

- Use make-fetch-happen ([#1500](https://github.com/Unleash/unleash/issues/1500))


## [4.9.1] - 2022-03-23

### Documentation

- Add more content around database connections

- Add code samples, move db configuration to separate section

- Remove duplicate db connection options description

- PR feedback: configure db url, db url file, precedence

- Sort options alphabetically in example object.

- Add note about PHP crashing if it doesn't recognize the op

- List v1.3.1 of the PHP sdk as first compatible w/adv constr.


### Features

- Upgrade unleash-frontend to 4.9.0


## [4.9.0] - 2022-03-23

### Bug Fixes

- Remove placeholder comment

- Mark .NET sdk as not having `currentTime` context field

- Delete empty table row

- Remove empty ruleset

- Make sure customer type is included in the payload.

- Update dependency unleash-frontend to v4.9.0-beta.1

- Update dependency knex to v1.0.4

- Update config tests for enabled environments

- Update dependency unleash-frontend to v4.9.0-beta.2

- Update dependency unleash-frontend to v4.9.0-beta.3


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

- Note the minimum SDK versions necessary for adv constraints

- Add php support version for advanced constraints

- Add more comprehensive overview of sdk incompatibilities

- Change spec to specification, add link to spec

- Update min versions for node, python, ruby

- Only list feature versions for constraint ops inclusion

- Link to strategy constraints from the schedule how-to guide

- Add a link to the SDK incompatibility section


### Features

- Add data: "was the form opened manually" and "current page"

- Validate strategies ([#1429](https://github.com/Unleash/unleash/issues/1429))

- Add environment variable to set override enabled environments

- Enabled environments override now also moves projects and toggles to new environments


### Miscellaneous Tasks

- Merge main ->  this branch

- Extend tests for enabled environments


### Refactor

- Always add values to constraints ([#1448](https://github.com/Unleash/unleash/issues/1448))


## [4.8.2] - 2022-03-01

### Bug Fixes

- Configure user endpoint when AuthType is NONE ([#1403](https://github.com/Unleash/unleash/issues/1403))


## [4.8.1] - 2022-02-25

### Bug Fixes

- Readd orderBy statement to project query ([#1394](https://github.com/Unleash/unleash/issues/1394))


### Documentation

- Remove "future enhancements" section of environments doc


## [4.8.0] - 2022-02-24

### Bug Fixes

- Update dependency unleash-frontend to v4.8.0-beta.10
- Correct oas for creating feature toggle
- Update dependency unleash-frontend to v4.8.0
- Add migration patch
- Remove project column from roles if exists

### Documentation

- Mark PHP as advanced constraint compatible in compatibility table
- Update docs for Go SDK because wait until initialized already exists

## [4.7.5] - 2022-04-21

### Bug Fixes

- Add release script
- Cleanup migrations after the 3.13.0 bug

## [4.7.4] - 2022-03-30

### Features

- Move front end to v4.7.3

## [4.7.3] - 2022-03-02

### Bug Fixes

- Configure user endpoint when AuthType is NONE ([#1403](https://github.com/Unleash/unleash/issues/1403))

## [4.7.2] - 2022-02-10

### Bug Fixes

- Upgrade unleash-frontend to v4.7.2

## [4.7.1] - 2022-02-09

### Bug Fixes

- Update dependency unleash-frontend to v4.7.1
- Typo ([#1346](https://github.com/Unleash/unleash/issues/1346))

### Documentation

- Use `some-secret` instead of `some-public-key`
- Fix delete call for deleting feature toggles
- Hide 'back-to-main-menu' entry in narrow menu
- Add docs for impression data ([#1328](https://github.com/Unleash/unleash/issues/1328))
- Change API how-tos label from "API" to "API how-tos"
- Add "sendEmail" field to user-admin.md ([#1329](https://github.com/Unleash/unleash/issues/1329))
- Update compatibility matrix
- Fix contrast issues with dark theme link color.
- Move light-specific theme changes to 'light-theme' css
- Dark mode fix contrast in sidebar and with vid comp
- Use a purple color for primary theme color
- Remove 'documentation' link in na bar.
- Fix issues with transparent pngs; add borders, centering
- Use ifm variable for border width.

### Miscellaneous Tasks

- Fix broken link to community sdks section
- Remove trailing full stop.

## [4.7.0] - 2022-02-03

### Bug Fixes

- Update dependency knex to v1.0.2
- Jest-coverage-report-action disable annotations

### Miscellaneous Tasks

- Update frontend

## [4.6.8] - 2022-04-21

### Bug Fixes

- Add release script
- Cleanup migrations after the 3.13.0 bug

## [4.6.7] - 2022-03-30

### Features

- Upgrade frontend to v4.6.5

## [4.6.6] - 2022-03-02

### Bug Fixes

- Configure user endpoint when AuthType is NONE (#1403)

## [4.6.5] - 2022-02-01

### Miscellaneous Tasks

- Update frontend

## [4.6.4] - 2022-02-01

### Bug Fixes

- Rbac should pick up projectId from path if available
- Upgrade unleash-frontend to v4.6.3

## [4.6.3] - 2022-02-01

### Bug Fixes

- Update dependency unleash-frontend to v4.6.2

### Documentation

- Fix link to addons page
- Fix link to getting started page
- Link directly to the markdown file
- Link directly to the markdown file
- Fix markdown file name

## [4.6.1] - 2022-01-31

### Bug Fixes

- Set migration for feedbacK (#1315)

## [4.6.0] - 2022-01-31

### Bug Fixes

- Convert simple-password-provider.test.js to ts
- GoogleAnalytics for docusaurus to new format (#1306)
- Pin dependency @docusaurus/plugin-google-analytics to 2.0.0-beta.15 (#1307)
- Readme.md
- Remove test subcat from sidebar
- Welcome-email should not include password-link when disabled (#1302)
- Update dependency unleash-frontend to v4.6.0
- Update dependency @svgr/webpack to v6.2.1
- Metric counters should use bigint (#1313)
- Upgrade unleash-frontend to v4.6.1

### Documentation

- Remove role 'alert' from availability notice.
- Update how-to for cprs with new video element.
- Finish v1 of the video content element.
- Remove redundant video heading and commented-out content.
- Remove container query polyfill

### Miscellaneous Tasks

- Make docs sidebar hover and active color same unleash grey.

## [4.5.3] - 2022-04-21

### Bug Fixes

- Add release script
- Cleanup migrations after the 3.13.0 bug

## [4.5.2] - 2022-03-31

### Features

- Upgrade front end to 4.4.2

## [4.5.1] - 2022-01-06

### Bug Fixes

- Pin dependency @docusaurus/remark-plugin-npm2yarn to 2.0.0-beta.14 (#1224)
- Expose ApiUser out of Unleash
- Update dependency helmet to v5 (#1215)
- Correct format for API tokens
- Downgrade faker to 5.5.3
- Update dependency unleash-frontend to v4.4.1
- Should not remove variants when updating feature toggle metadata (#1234)
- Update yarn.lock

### Documentation

- Add steps for running the proxy in node with custom strats.
- Indent code block properly.
- Highlight `customStrategies` option.
- Fix comparison operator from `>` to `<`
- Pluralize SDK -> SDKs
- Add `npm2yarn` annotation to all npm commands
- Remove spacing, change 'node' -> Node.js
- Minor language improvements
- Add description of `open-source` authentication type.
- Add difference between `initApiTokens` and env var option.
- Add information on using env vars for startup imports.
- Change wording slightly.

### Features

- Add init api tokens option (#1181)
- Add support for cdnPrefix for static assets (#1191)

## [4.4.8] - 2022-03-31

### Features

- Move frontend to v4.4.2
- Move frontend to 4.4.2

## [4.4.7] - 2022-02-23

### Bug Fixes

- Cleanup data from v3.13.0-bug
- Connect admin user with admin role

## [4.4.6] - 2022-02-22

### Bug Fixes

- Adding missing project column to roles

## [4.4.5] - 2022-01-03

### Bug Fixes

- Adds feature-variant-updated event. (#1189)
- Adjust feature-variant-updated event
- Update dependency knex to v0.95.15
- Fix broken link to how-to guide.
- Align code and highlight indentation.
- Realign indentation of code and comments
- Update updateUser code to reject empty emails (#1210)

### Documentation

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

### Miscellaneous Tasks

- Remove unnecessary escape sequences.
- Format table
- Correct compatibility matrix for server SDKs

## [4.4.4] - 2021-12-17

### Bug Fixes

- Adds feature-variant-updated event. (#1189)
- Adjust feature-variant-updated event

## [4.4.1] - 2021-12-15

### Bug Fixes

- Update dependency unleash-frontend to v4.4.0
- Update dependency @svgr/webpack to v6.1.2

### Documentation

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

### Miscellaneous Tasks

- Format compat table.
- Unhyphenate kebab-menu -> kebab menu
- Lowercase <br/> tag

## [4.4.0] - 2021-12-10

### Bug Fixes

- Remove unused dep
- Remove lastUpdate from fieldToRow
- Rename last_update to updated_at
- Add timestamp on project creation for update_at column
- Bump unleash-frontend to v4.3.0
- Update dependency @svgr/webpack to v6.1.1
- Open validate endpoint (#1162)
- Updated API docs to reflect v4.3
- Update frontend
- Rename metrics-service to client-instance service
- Move toggle-counters to metrics service
- Lint
- Rename services
- Drop client_metrics table
- Uintroduce call to update last_seen on client-instance

### Documentation

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

### Features

- Remove old metrics service
- Upgrade unleash-frontend to v4.4.0

### Miscellaneous Tasks

- Require json-schema 0.4.0 or higher
- Fix syntax highlighting for a json code snippet.
- (docs) keep list styling (internally) consistent

## [4.3.4] - 2022-04-21

### Bug Fixes

- Add release script
- Cleanup migrations after the 3.13.0 bug

## [4.3.3] - 2022-03-31

### Bug Fixes

- Updated API docs to reflect v4.3

### Features

- Move front end to 4.3.2

## [4.3.2] - 2021-12-06

### Bug Fixes

- Remove unused dep
- Remove lastUpdate from fieldToRow
- Rename last_update to updated_at
- Add timestamp on project creation for update_at column
- Bump unleash-frontend to v4.3.0
- Update dependency @svgr/webpack to v6.1.1
- Open validate endpoint (#1162)
- Updated API docs to reflect v4.3
- Update frontend

### Documentation

- Explain what the proxy configuration variables are.
- JS proxy client: explain client keys
- Android SDK: reformat and add more details on client secrets
- React proxy sdk: explain clientKey and other config vars.
- IOS proxy: add info about client keys and environments.

### Miscellaneous Tasks

- Require json-schema 0.4.0 or higher
- Fix syntax highlighting for a json code snippet.
- (docs) keep list styling (internally) consistent

## [4.3.1] - 2021-12-03

### Bug Fixes

- Bump unleash-frontend to v4.3.0

## [4.3.0] - 2021-12-03

### Bug Fixes

- Add migration
- Styling
- Remove record splash and update sql query in add-splash-entry
- Update sql query in add-splash-entry
- Update e2e test for splash
- Remove req.body from the splash object when update
- Add cascade query inside create table for splash
- Return be object instead of array
- Update dependency db-migrate to v0.11.13
- Image inclusion and alt text syntax was wrong.
- Make new variant api validate name uniqueness (#1126)
- Stop healthrating from including archived (#1128)
- Metrics v2 should await for the clearer (#1114)
- Require json-schema v0.4.0 or later (#1135)
- Correct version number for unleash-frontend
- Cleanup old user permissions (#1150)
- Upgrade unleash-frontend to v4.3.0-beta.1
- Always require permission for POST, PATCH, PUT, DELETE (#1152)
- Update dependency @svgr/webpack to v6 (#1136)

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

### Miscellaneous Tasks

- Upped postgres version for Heroku. (#1112)
- Update frontend
- Update frontend
- Require json-schema 0.4.0 or higher

### Task

- Add a workflow that validates docs for PRs (#1123)
- Add link to FCC video (#1127)
- Ban changes to variants through feature (#1130)
- Sort variants by name (#1132)

## [4.2.4] - 2022-04-21

### Bug Fixes

- Add release script
- Cleanup migrations after the 3.13.0 bug

## [4.2.3] - 2021-11-12

### Bug Fixes

- Update dependency knex to v0.95.14
- Prevent deadlock for batchinserting usage metrics (#1100)
- Refactor client-metrics list and ttl-list to TypeScript (#1080)
- Upgrade unleash-frontend to v4.2.13

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

## [4.2.2] - 2021-11-04

### Bug Fixes

- Convert iso-strings from db to date object

## [4.2.1] - 2021-11-04

### Bug Fixes

- Be explicit when specifying time & replace moment with date-fns (#1072)
- Update docusaurus monorepo to v2.0.0-beta.9 (#1081)
- Update mime library method signature to 2.X (#1078)
- Update dependency knex to v0.95.13
- Update dependency unleash-frontend to v4.2.12
- Disable projects (#1085)

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
