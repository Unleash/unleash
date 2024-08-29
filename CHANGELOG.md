# Changelog

All notable changes to this project will be documented in this file.

## [6.1.11] - 2024-08-21

### Bug Fixes

- Enable disabled strategies keeps settings ([#7952](https://github.com/Unleash/unleash/issues/7952))


## [6.1.10] - 2024-08-16

### Bug Fixes

- Orphaned token label patch ([#7903](https://github.com/Unleash/unleash/issues/7903))


## [6.1.9] - 2024-08-14

### Bug Fixes

- Add collaborators to ignored props for feature diff notif ([#7877](https://github.com/Unleash/unleash/issues/7877))


### Features

- Allow editing root role/description on SCIM group ([#7874](https://github.com/Unleash/unleash/issues/7874))


## [6.1.8] - 2024-08-14

### Bug Fixes

- Change request enabled check should ignore disabled envs ([#7869](https://github.com/Unleash/unleash/issues/7869)) ([#7876](https://github.com/Unleash/unleash/issues/7876))


## [6.1.7] - 2024-08-14

### Bug Fixes

- Messed up on merge-conflicts


## [6.1.6] - 2024-08-14

### Features

- Update feature completed payload to have boolean instead of string ([#7855](https://github.com/Unleash/unleash/issues/7855))


### Miscellaneous Tasks

- Split send welcome email ([#7795](https://github.com/Unleash/unleash/issues/7795)) ([#7867](https://github.com/Unleash/unleash/issues/7867))


## [6.1.5] - 2024-08-13

### Bug Fixes

- SCIM UI flag removal ([#7856](https://github.com/Unleash/unleash/issues/7856))


## [6.1.4] - 2024-08-13

### Bug Fixes

- Don't show link stubs in slack notifications ([#7810](https://github.com/Unleash/unleash/issues/7810)) ([#7850](https://github.com/Unleash/unleash/issues/7850))


### Fix

- Time to production ([#7835](https://github.com/Unleash/unleash/issues/7835)) ([#7848](https://github.com/Unleash/unleash/issues/7848))


### Miscellaneous Tasks

- Cherry-pick SCIM flag removal ([#7851](https://github.com/Unleash/unleash/issues/7851))


## [6.1.3] - 2024-08-13

### Bug Fixes

- Don't always fetch all flags on project flag screen ([#7834](https://github.com/Unleash/unleash/issues/7834))

- Display feature naming patterns in dialog ([#7837](https://github.com/Unleash/unleash/issues/7837))


## [6.1.2] - 2024-08-08

### Bug Fixes

- Allow for empty groupId in form ([#7798](https://github.com/Unleash/unleash/issues/7798)) ([#7802](https://github.com/Unleash/unleash/issues/7802))


## [6.1.0] - 2024-08-07

### Bug Fixes

- Involuntarily scrolled to the top when mousing off group/project avatars ([#7287](https://github.com/Unleash/unleash/issues/7287))

- Project settings table overflow ([#7288](https://github.com/Unleash/unleash/issues/7288))

- Trim sso URL fields ([#7301](https://github.com/Unleash/unleash/issues/7301))

- Remove null users in filter ([#7308](https://github.com/Unleash/unleash/issues/7308))

- Update dependency ajv to v8.14.0 ([#7314](https://github.com/Unleash/unleash/issues/7314))

- Update dependency joi to v17.13.1 ([#7315](https://github.com/Unleash/unleash/issues/7315))

- Update dependency slug to v9.1.0 ([#7316](https://github.com/Unleash/unleash/issues/7316))

- Update react monorepo to v18.3.1 ([#7318](https://github.com/Unleash/unleash/issues/7318))

- Tweak docker build

- Lifecycle metrics on metrics insert ([#7322](https://github.com/Unleash/unleash/issues/7322))

- Yarnv4 requires shebangs in shell scripts to allow execution ([#7323](https://github.com/Unleash/unleash/issues/7323))

- Remove immutable switch from frontend build ([#7331](https://github.com/Unleash/unleash/issues/7331))

- Revert yarn4 ([#7334](https://github.com/Unleash/unleash/issues/7334))

- Update dependency express-rate-limit to v7.3.0 ([#7342](https://github.com/Unleash/unleash/issues/7342))

- Remove stale stats widget ([#7353](https://github.com/Unleash/unleash/issues/7353))

- Yarn v4 requires prepack instead of prepare script when building… ([#7371](https://github.com/Unleash/unleash/issues/7371))

- Playground parent deps check ([#7384](https://github.com/Unleash/unleash/issues/7384))

- Exclude lifecycle from stale checks ([#7386](https://github.com/Unleash/unleash/issues/7386))

- Fix unstable search ([#7391](https://github.com/Unleash/unleash/issues/7391))

- Lifecycle button permissions ([#7395](https://github.com/Unleash/unleash/issues/7395))

- Project to lifecycle events ([#7400](https://github.com/Unleash/unleash/issues/7400))

- Make default for gradual rollout work on the correct strategy name ([#7401](https://github.com/Unleash/unleash/issues/7401))

- Make rendering of new project form independent of rendering the project list ([#7405](https://github.com/Unleash/unleash/issues/7405))

- Check for permission in group access assignment ([#7408](https://github.com/Unleash/unleash/issues/7408))

- Turn off showing usernames and emails in the project cards when the flag is turned on ([#7421](https://github.com/Unleash/unleash/issues/7421))

- Add license key notice to upgrade instructions ([#7440](https://github.com/Unleash/unleash/issues/7440))

- Long project name display ([#7435](https://github.com/Unleash/unleash/issues/7435))

- Change lifecycle stage duration metric type ([#7444](https://github.com/Unleash/unleash/issues/7444))

- Make search selects explicit ([#7445](https://github.com/Unleash/unleash/issues/7445))

- Banner duplication on strategy edit with change requests ([#7452](https://github.com/Unleash/unleash/issues/7452))

- Strategy form buttons spacing ([#7468](https://github.com/Unleash/unleash/issues/7468))

- Prevent strategy variant weight from going into negative numbers on Frontend ([#7460](https://github.com/Unleash/unleash/issues/7460))

- Update dependency joi to v17.13.3 ([#7476](https://github.com/Unleash/unleash/issues/7476))

- Update dependency nodemailer to v6.9.14 ([#7477](https://github.com/Unleash/unleash/issues/7477))

- Cap project ids to 90 characters (without suffix) ([#7481](https://github.com/Unleash/unleash/issues/7481))

- Improve menu styling ([#7513](https://github.com/Unleash/unleash/issues/7513))

- Prevent project cell overflow on api keys table ([#7472](https://github.com/Unleash/unleash/issues/7472))

- Command menu hover ([#7515](https://github.com/Unleash/unleash/issues/7515))

- Remove focus on ESC ([#7535](https://github.com/Unleash/unleash/issues/7535))

- Sidebar update active when navigated via command menu. ([#7545](https://github.com/Unleash/unleash/issues/7545))

- Update addon counter to include new relic addon

- Update cache, even when the total is 0 ([#7582](https://github.com/Unleash/unleash/issues/7582))

- Make loader not exlpode to 100vh in unnecessary locations ([#7589](https://github.com/Unleash/unleash/issues/7589))

- Prevent long names from breaking form layouts ([#7591](https://github.com/Unleash/unleash/issues/7591))

- Toast error doesn't tell you what the error is ([#7601](https://github.com/Unleash/unleash/issues/7601))

- Insights sticky header ([#7607](https://github.com/Unleash/unleash/issues/7607))

- Update OpenAPI error converter to handle query param errors too ([#7609](https://github.com/Unleash/unleash/issues/7609))

- Validate patched data with schema ([#7616](https://github.com/Unleash/unleash/issues/7616))

- Use a fullscreen loader for the initial redirect load ([#7619](https://github.com/Unleash/unleash/issues/7619))

- Change "features flags" -> "feature flags" ([#7632](https://github.com/Unleash/unleash/issues/7632))

- Check for admin in signal endpoints hook ([#7642](https://github.com/Unleash/unleash/issues/7642))

- Add workaround for tooltip ([#7649](https://github.com/Unleash/unleash/issues/7649))

- Recently visit should only use main paths ([#7655](https://github.com/Unleash/unleash/issues/7655))

- Capitalize input labels ([#7667](https://github.com/Unleash/unleash/issues/7667))

- Validate project names on blur ([#7668](https://github.com/Unleash/unleash/issues/7668))

- Hide project selection option in CreateFeatureDialog when OSS ([#7669](https://github.com/Unleash/unleash/issues/7669))

- Show the selected project's name on the button, not its ID ([#7671](https://github.com/Unleash/unleash/issues/7671))

- Project icon sizing and color ([#7672](https://github.com/Unleash/unleash/issues/7672))

- Make config dropdown list generic over values ([#7676](https://github.com/Unleash/unleash/issues/7676))

- Prevent long project names from blowing out the form ([#7673](https://github.com/Unleash/unleash/issues/7673))

- Shorten max project name width in feature toggles creation form ([#7678](https://github.com/Unleash/unleash/issues/7678))

- On project delete with tokens put token deleted in audit log ([#7675](https://github.com/Unleash/unleash/issues/7675))

- Avoid weird spacing between title and collab mode icon ([#7683](https://github.com/Unleash/unleash/issues/7683))

- Break long project/flag names in the event log to prevent overflow ([#7684](https://github.com/Unleash/unleash/issues/7684))

- Allow editors to create flags again ([#7685](https://github.com/Unleash/unleash/issues/7685))

- Allow editors to submit flag form ([#7687](https://github.com/Unleash/unleash/issues/7687))

- FeatureForm - not jsx comment ([#7689](https://github.com/Unleash/unleash/issues/7689))

- Health stats number ([#7688](https://github.com/Unleash/unleash/issues/7688))

- Use nested flexboxes instead of grid area ([#7654](https://github.com/Unleash/unleash/issues/7654))

- Don't cut off hover-color of favorite button ([#7691](https://github.com/Unleash/unleash/issues/7691))

- Flex layout used the wrong axes for layout. ([#7696](https://github.com/Unleash/unleash/issues/7696))

- Avoid react key warnings in tables ([#7694](https://github.com/Unleash/unleash/issues/7694))

- Rollback should await a result ([#7712](https://github.com/Unleash/unleash/issues/7712))

- Align event log filter buttons ([#7726](https://github.com/Unleash/unleash/issues/7726))

- Strategy parameters UI ([#7713](https://github.com/Unleash/unleash/issues/7713))

- Show "System" for system users, instead of "User ID n" where n is the project's number in the order. ([#7734](https://github.com/Unleash/unleash/issues/7734))

- Strategy edit required param error ([#7747](https://github.com/Unleash/unleash/issues/7747))

- Avoid collaborators being smooshed together ([#7741](https://github.com/Unleash/unleash/issues/7741))

- Playground parent disabled with strategy ([#7744](https://github.com/Unleash/unleash/issues/7744))

- Insights health info link placement ([#7750](https://github.com/Unleash/unleash/issues/7750))

- Decrease collaborator font size ([#7754](https://github.com/Unleash/unleash/issues/7754))

- Show api token on playground ([#7753](https://github.com/Unleash/unleash/issues/7753))

- Feature type is now validated ([#7769](https://github.com/Unleash/unleash/issues/7769))

- Don't delete projects screen from history ([#7787](https://github.com/Unleash/unleash/issues/7787))

- Add yarn back


### Chore

- Add limits to feature flags ([#7536](https://github.com/Unleash/unleash/issues/7536))

- Use createApiTokenService instead of newing it up ([#7560](https://github.com/Unleash/unleash/issues/7560))


### Docs

- Merged migration articles into a single document ([#7324](https://github.com/Unleash/unleash/issues/7324))

- Made the Rust tutorial simpler


### Documentation

- Scim entra docs ([#7300](https://github.com/Unleash/unleash/issues/7300))

- V6 upgrading notes ([#7275](https://github.com/Unleash/unleash/issues/7275))

- Move provisioning reference to scim reference ([#7338](https://github.com/Unleash/unleash/issues/7338))

- Updated and formatted license docs. ([#7349](https://github.com/Unleash/unleash/issues/7349))

- Replace png with svg for feature flag org methods ([#7407](https://github.com/Unleash/unleash/issues/7407))

- IOS tutorial ([#7486](https://github.com/Unleash/unleash/issues/7486))

- Add a docs entry for file based OSS featureset import ([#7520](https://github.com/Unleash/unleash/issues/7520))

- Document resource limits ([#7567](https://github.com/Unleash/unleash/issues/7567))

- Add a footnote about how archived flags don't count towards the flag limit ([#7587](https://github.com/Unleash/unleash/issues/7587))

- Documented the environment variables available for configuring SSO ([#7630](https://github.com/Unleash/unleash/issues/7630))

- Added oidc example to lycheeignore

- Add minimum and recommended specs for Unleash and for Database ([#7653](https://github.com/Unleash/unleash/issues/7653))

- Removed the recommended chapter of PostgreSQL config ([#7661](https://github.com/Unleash/unleash/issues/7661))

- Integration events ([#7670](https://github.com/Unleash/unleash/issues/7670))

- Add new android sdk readme ([#7665](https://github.com/Unleash/unleash/issues/7665))

- Cleanup 🧹 ([#7659](https://github.com/Unleash/unleash/issues/7659))

- Add subpages of edge documentation ([#7720](https://github.com/Unleash/unleash/issues/7720))

- Insights v2 docs update ([#7692](https://github.com/Unleash/unleash/issues/7692))


### Feat

- Feature view created by field - frontend ([#7382](https://github.com/Unleash/unleash/issues/7382))

- Webhook markdown ([#7658](https://github.com/Unleash/unleash/issues/7658))


### Features

- Add created by in search results ([#7285](https://github.com/Unleash/unleash/issues/7285))

- Project flag creators api ([#7302](https://github.com/Unleash/unleash/issues/7302))

- Display created by user in search ([#7292](https://github.com/Unleash/unleash/issues/7292))

- Filter by created by ([#7306](https://github.com/Unleash/unleash/issues/7306))

- Show creators from non archived features ([#7309](https://github.com/Unleash/unleash/issues/7309))

- Add popover to users in flags list ([#7344](https://github.com/Unleash/unleash/issues/7344))

- Global search by flag type ([#7346](https://github.com/Unleash/unleash/issues/7346))

- Filter by user when interacting with the avatar ([#7347](https://github.com/Unleash/unleash/issues/7347))

- Upgrade from react v17 to v18 ([#7265](https://github.com/Unleash/unleash/issues/7265))

- Adding full creator information to view used by feature read ([#7356](https://github.com/Unleash/unleash/issues/7356))

- Command bar poc ([#7350](https://github.com/Unleash/unleash/issues/7350))

- Read flag creator ([#7357](https://github.com/Unleash/unleash/issues/7357))

- Clean up command bar props ([#7368](https://github.com/Unleash/unleash/issues/7368))

- Extract global feature search ([#7372](https://github.com/Unleash/unleash/issues/7372))

- Recent project by name ([#7375](https://github.com/Unleash/unleash/issues/7375))

- Search features from command bar ([#7378](https://github.com/Unleash/unleash/issues/7378))

- Command bar last visited: improve project/feature icons and paths ([#7383](https://github.com/Unleash/unleash/issues/7383))

- Optimize search store by removing inline EXISTS ([#7385](https://github.com/Unleash/unleash/issues/7385))

- Optimize search ([#7387](https://github.com/Unleash/unleash/issues/7387))

- Command bar search projects ([#7388](https://github.com/Unleash/unleash/issues/7388))

- Max strategies metrics ([#7392](https://github.com/Unleash/unleash/issues/7392))

- Optimize search store by removing inline EXISTS ([#7394](https://github.com/Unleash/unleash/issues/7394))

- Command bar pages and name resolving ([#7397](https://github.com/Unleash/unleash/issues/7397))

- Menubar is not dependant on query params anymroe ([#7399](https://github.com/Unleash/unleash/issues/7399))

- Anonimize demo users list flag view ([#7432](https://github.com/Unleash/unleash/issues/7432))

- Lifecycle stage count ([#7434](https://github.com/Unleash/unleash/issues/7434))

- Stage count by project metric ([#7441](https://github.com/Unleash/unleash/issues/7441))

- Now command bar will not search behind the scene ([#7443](https://github.com/Unleash/unleash/issues/7443))

- Now able to search pages ([#7446](https://github.com/Unleash/unleash/issues/7446))

- Tweak command bar UI styles to match sketches ([#7447](https://github.com/Unleash/unleash/issues/7447))

- Lifecycle stage entered counter ([#7449](https://github.com/Unleash/unleash/issues/7449))

- Search only features when there is search string ([#7450](https://github.com/Unleash/unleash/issues/7450))

- Transactional complete/uncomplete feature ([#7451](https://github.com/Unleash/unleash/issues/7451))

- Command menu items can have description as tooltip now ([#7455](https://github.com/Unleash/unleash/issues/7455))

- Largest projects and features metric ([#7459](https://github.com/Unleash/unleash/issues/7459))

- Command bar track events ([#7469](https://github.com/Unleash/unleash/issues/7469))

- Introduce large cache for swr ([#7470](https://github.com/Unleash/unleash/issues/7470))

- Strategy limit to 30 ([#7473](https://github.com/Unleash/unleash/issues/7473))

- Configurable strategies limit ([#7488](https://github.com/Unleash/unleash/issues/7488))

- Move recording recently visited into separate component ([#7494](https://github.com/Unleash/unleash/issues/7494))

- Add environments to resource limit schema ([#7495](https://github.com/Unleash/unleash/issues/7495))

- Command bar feedback ([#7485](https://github.com/Unleash/unleash/issues/7485))

- Constraint values limit ([#7498](https://github.com/Unleash/unleash/issues/7498))

- Constraint values limit UI ([#7501](https://github.com/Unleash/unleash/issues/7501))

- Allow enterprise override for constraint values limit ([#7502](https://github.com/Unleash/unleash/issues/7502))

- Use new environment limit in Unleash UI ([#7500](https://github.com/Unleash/unleash/issues/7500))

- Command bar results key down should exit/refocus input ([#7509](https://github.com/Unleash/unleash/issues/7509))

- Clear search string and close box after click ([#7511](https://github.com/Unleash/unleash/issues/7511))

- Projects limit ([#7514](https://github.com/Unleash/unleash/issues/7514))

- Add resource limits for API tokens ([#7510](https://github.com/Unleash/unleash/issues/7510))

- Project limit UI ([#7518](https://github.com/Unleash/unleash/issues/7518))

- What's new in Unleash ([#7497](https://github.com/Unleash/unleash/issues/7497))

- Segments limit ([#7524](https://github.com/Unleash/unleash/issues/7524))

- Track interaction with search ([#7526](https://github.com/Unleash/unleash/issues/7526))

- Segments limit ui ([#7528](https://github.com/Unleash/unleash/issues/7528))

- Use different cache key for command bar ([#7530](https://github.com/Unleash/unleash/issues/7530))

- Quick suggestions click close ([#7533](https://github.com/Unleash/unleash/issues/7533))

- UI limit for API tokens ([#7532](https://github.com/Unleash/unleash/issues/7532))

- Change billing plan get in touch to support email ([#7523](https://github.com/Unleash/unleash/issues/7523))

- Extended SDK metrics ([#7527](https://github.com/Unleash/unleash/issues/7527))

- Limit component ([#7538](https://github.com/Unleash/unleash/issues/7538))

- Limit component used in strategies ([#7542](https://github.com/Unleash/unleash/issues/7542))

- Hide command bar when losing focus ([#7544](https://github.com/Unleash/unleash/issues/7544))

- Command bar up down navigation ([#7546](https://github.com/Unleash/unleash/issues/7546))

- Add solid border for contrast ([#7550](https://github.com/Unleash/unleash/issues/7550))

- Limit environments component ([#7548](https://github.com/Unleash/unleash/issues/7548))

- Update description on project deletion ([#7539](https://github.com/Unleash/unleash/issues/7539))

- New Relic integration ([#7492](https://github.com/Unleash/unleash/issues/7492))

- Limit segments component ([#7553](https://github.com/Unleash/unleash/issues/7553))

- Constraints limit in a strategy ([#7554](https://github.com/Unleash/unleash/issues/7554))

- Constraints limit in a strategy UI ([#7555](https://github.com/Unleash/unleash/issues/7555))

- Add limit warning for feature flags ([#7556](https://github.com/Unleash/unleash/issues/7556))

- Constraints values limit in a strategy UI ([#7557](https://github.com/Unleash/unleash/issues/7557))

- Project limits ui ([#7558](https://github.com/Unleash/unleash/issues/7558))

- Disallow repeating last 5 passwords. ([#7552](https://github.com/Unleash/unleash/issues/7552))

- Exclude archived features in max reporting ([#7559](https://github.com/Unleash/unleash/issues/7559))

- Statistics for orphaned tokens ([#7568](https://github.com/Unleash/unleash/issues/7568))

- Show orphaned API tokens ([#7569](https://github.com/Unleash/unleash/issues/7569))

- API Tokens limit - UI ([#7561](https://github.com/Unleash/unleash/issues/7561))

- User seats component ([#7583](https://github.com/Unleash/unleash/issues/7583))

- Show all results in the same time ([#7590](https://github.com/Unleash/unleash/issues/7590))

- Select first item after query ([#7592](https://github.com/Unleash/unleash/issues/7592))

- Remove first item selection ([#7596](https://github.com/Unleash/unleash/issues/7596))

- Make frontend aware that OIDC can be configured through env ([#7597](https://github.com/Unleash/unleash/issues/7597))

- Insights filters ([#7608](https://github.com/Unleash/unleash/issues/7608))

- Make SAML dialog aware that it might be configured via env ([#7606](https://github.com/Unleash/unleash/issues/7606))

- Show info on healthy flags in health tooltip ([#7611](https://github.com/Unleash/unleash/issues/7611))

- Filter project flags by state ([#7618](https://github.com/Unleash/unleash/issues/7618))

- Allow you to gradually scale back constraint usage ([#7622](https://github.com/Unleash/unleash/issues/7622))

- Feature collaborators read model ([#7625](https://github.com/Unleash/unleash/issues/7625))

- Feature collaborators added to API behind a flag ([#7627](https://github.com/Unleash/unleash/issues/7627))

- Separate command bar and search hotkeys ([#7651](https://github.com/Unleash/unleash/issues/7651))

- Update openapi schema for feature creation for tags ([#7657](https://github.com/Unleash/unleash/issues/7657))

- Tag feature on creation ([#7664](https://github.com/Unleash/unleash/issues/7664))

- Added PoC for the new feature creation dialog ([#7666](https://github.com/Unleash/unleash/issues/7666))

- Add tags selection to feature creation ([#7674](https://github.com/Unleash/unleash/issues/7674))

- Redirect to new feature flag creation ([#7679](https://github.com/Unleash/unleash/issues/7679))

- Use a toggling button for impression data on/off ([#7682](https://github.com/Unleash/unleash/issues/7682))

- Human readable project names in insight charts ([#7686](https://github.com/Unleash/unleash/issues/7686))

- Health stats insights explanation ([#7690](https://github.com/Unleash/unleash/issues/7690))

- New event search flag ([#7699](https://github.com/Unleash/unleash/issues/7699))

- Rollback transaction wrapper ([#7706](https://github.com/Unleash/unleash/issues/7706))

- Add filter dropdowns to event log pages ([#7711](https://github.com/Unleash/unleash/issues/7711))

- Create gauges for all resource limits ([#7718](https://github.com/Unleash/unleash/issues/7718))

- UI for playground of change requests ([#7721](https://github.com/Unleash/unleash/issues/7721))

- Preview changes button ([#7722](https://github.com/Unleash/unleash/issues/7722))

- Remove orphaned tokens flags ([#7714](https://github.com/Unleash/unleash/issues/7714))

- Orphaned tokens - new API tokens list icon ([#7693](https://github.com/Unleash/unleash/issues/7693))

- Copy strategy to current environment ([#7730](https://github.com/Unleash/unleash/issues/7730))

- New event search ([#7708](https://github.com/Unleash/unleash/issues/7708))

- Add event types to filter button ([#7733](https://github.com/Unleash/unleash/issues/7733))

- Add projects and environments to cr preview ([#7740](https://github.com/Unleash/unleash/issues/7740))

- Event search on new endpoint, first test ([#7739](https://github.com/Unleash/unleash/issues/7739))

- Change request preview integration ([#7743](https://github.com/Unleash/unleash/issues/7743))

- Playground try configuration mode ([#7752](https://github.com/Unleash/unleash/issues/7752))

- Event search e2e tests ([#7755](https://github.com/Unleash/unleash/issues/7755))

- New useEventSearch hook ([#7757](https://github.com/Unleash/unleash/issues/7757))

- Link to frontend api url ([#7770](https://github.com/Unleash/unleash/issues/7770))

- Link to release notes from orphaned tokens ([#7731](https://github.com/Unleash/unleash/issues/7731))

- Wait for postgres to boot before running tests ([#7790](https://github.com/Unleash/unleash/issues/7790))


### Miscellaneous Tasks

- Orval search created by feature ([#7290](https://github.com/Unleash/unleash/issues/7290))

- Bump version to 6.0.0+main

- Orval types for flag creator ([#7305](https://github.com/Unleash/unleash/issues/7305))

- Test that the tags API still returns tags that you can't create anymore ([#7304](https://github.com/Unleash/unleash/issues/7304))

- Use node 20 for linting ([#7311](https://github.com/Unleash/unleash/issues/7311))

- Make feature.spec and segements.spec more resilient ([#7289](https://github.com/Unleash/unleash/issues/7289))

- Upgrade to yarn v4 ([#7230](https://github.com/Unleash/unleash/issues/7230))

- Merged 11 principles articles into a single document ([#7266](https://github.com/Unleash/unleash/issues/7266))

- Make the User Avatar size configurable ([#7332](https://github.com/Unleash/unleash/issues/7332))

- Bump version to 6.0.1+main

- Add gitignores to frontend and website subdirectories ([#7336](https://github.com/Unleash/unleash/issues/7336))

- Remove debug metrics flag ([#7348](https://github.com/Unleash/unleash/issues/7348))

- Use HTML (custom) tooltip for permission switches ([#7355](https://github.com/Unleash/unleash/issues/7355))

- Added www.java.com to lychee ignore

- Disable filtering for unknown users ([#7369](https://github.com/Unleash/unleash/issues/7369))

- Use new ScreenReaderOnly component in config buttons ([#7352](https://github.com/Unleash/unleash/issues/7352))

- Yarn v4 ([#7345](https://github.com/Unleash/unleash/issues/7345))

- Bump version to 6.0.2+main

- Wait to input the name of the segment when checking for error messages ([#7377](https://github.com/Unleash/unleash/issues/7377))

- Add some tests for the useRecentlyVisited hook ([#7380](https://github.com/Unleash/unleash/issues/7380))

- Bump version to 6.0.3+main

- Add metrics/gauges for "max constraint values" and "max constraints" ([#7398](https://github.com/Unleash/unleash/issues/7398))

- Delete ice cream icon 🍦 ([#7403](https://github.com/Unleash/unleash/issues/7403))

- Bump unleash-client to 5.5.5 ([#7412](https://github.com/Unleash/unleash/issues/7412))

- Bump version to 6.0.4+main

- Remove createProjectWithEnvironmentConfig and newCreateProjectUI flags ([#7429](https://github.com/Unleash/unleash/issues/7429))

- Remove unstable label from GA metrics features ([#7433](https://github.com/Unleash/unleash/issues/7433))

- Change "toggle updated" to "flag updated" in toast message ([#7439](https://github.com/Unleash/unleash/issues/7439))

- Remove unused interfaces from old state import ([#7448](https://github.com/Unleash/unleash/issues/7448))

- Change generated project id format to use incrementing numbers instead of hashes ([#7456](https://github.com/Unleash/unleash/issues/7456))

- Better debug logs in slack app ([#7467](https://github.com/Unleash/unleash/issues/7467))

- Yarn v4 ([#7457](https://github.com/Unleash/unleash/issues/7457))

- Resource limits flag ([#7471](https://github.com/Unleash/unleash/issues/7471))

- Sync dependencies with enterprise ([#7482](https://github.com/Unleash/unleash/issues/7482))

- Rename recent and page suggestions ([#7484](https://github.com/Unleash/unleash/issues/7484))

- Command bar refactor of search result items for consistent styling and icons ([#7483](https://github.com/Unleash/unleash/issues/7483))

- Change get in touch email and use biome from node_modules ([#7496](https://github.com/Unleash/unleash/issues/7496))

- Customer requested to CS to be removed from this list.

- Remove multer, since it isn't being used ([#7512](https://github.com/Unleash/unleash/issues/7512))

- Rename command bar files ([#7516](https://github.com/Unleash/unleash/issues/7516))

- Fix searchbar styling when focus is on results ([#7517](https://github.com/Unleash/unleash/issues/7517))

- Command bar feedback focus and text size ([#7521](https://github.com/Unleash/unleash/issues/7521))

- Fix command bar missing icons in quick suggestions ([#7522](https://github.com/Unleash/unleash/issues/7522))

- Extract api token service composition root; place it in /features ([#7519](https://github.com/Unleash/unleash/issues/7519))

- Remove unused clone code ([#7529](https://github.com/Unleash/unleash/issues/7529))

- Command bar remove strategy types as page suggestion ([#7543](https://github.com/Unleash/unleash/issues/7543))

- Fix command bar key prop usage ([#7534](https://github.com/Unleash/unleash/issues/7534))

- Make sdk metrics snake case ([#7547](https://github.com/Unleash/unleash/issues/7547))

- Don't prevent users from entering the env form when they're at the limit ([#7549](https://github.com/Unleash/unleash/issues/7549))

- Use a command bar shadow thats visible in darkmode as well ([#7551](https://github.com/Unleash/unleash/issues/7551))

- Delete project api tokens when last mapped project is removed ([#7503](https://github.com/Unleash/unleash/issues/7503))

- Bump biome to 1.8.3 ([#7540](https://github.com/Unleash/unleash/issues/7540))

- Added flag to remove unsafe inline style src header ([#7566](https://github.com/Unleash/unleash/issues/7566))

- Fix project name overflow ([#7575](https://github.com/Unleash/unleash/issues/7575))

- Remove share insights button ([#7600](https://github.com/Unleash/unleash/issues/7600))

- Add integrationEvents feature flag ([#7602](https://github.com/Unleash/unleash/issues/7602))

- Db migration for integration events ([#7604](https://github.com/Unleash/unleash/issues/7604))

- Send prometheus metrics when someone tries to exceed resource limits ([#7617](https://github.com/Unleash/unleash/issues/7617))

- Integration events store ([#7613](https://github.com/Unleash/unleash/issues/7613))

- Integration events service ([#7614](https://github.com/Unleash/unleash/issues/7614))

- Feature collaborators flag ([#7623](https://github.com/Unleash/unleash/issues/7623))

- Register integration events in webhooks ([#7621](https://github.com/Unleash/unleash/issues/7621))

- Allow you to lower constraint values even when they're above limit ([#7624](https://github.com/Unleash/unleash/issues/7624))

- Register integration events in Slack integration ([#7626](https://github.com/Unleash/unleash/issues/7626))

- Extend uiConfig schema with new SSO variables ([#7628](https://github.com/Unleash/unleash/issues/7628))

- Don't ask OSS users to reach out to CS ([#7633](https://github.com/Unleash/unleash/issues/7633))

- Register integration events in Slack App integration ([#7631](https://github.com/Unleash/unleash/issues/7631))

- Register integration events in Teams integration ([#7634](https://github.com/Unleash/unleash/issues/7634))

- Register integration events in Datadog integration ([#7635](https://github.com/Unleash/unleash/issues/7635))

- Update .lycheeignore ([#7640](https://github.com/Unleash/unleash/issues/7640))

- Register integration events in New Relic integration ([#7636](https://github.com/Unleash/unleash/issues/7636))

- Integration events API ([#7639](https://github.com/Unleash/unleash/issues/7639))

- Integration events hook ([#7641](https://github.com/Unleash/unleash/issues/7641))

- Add integration events modal ([#7648](https://github.com/Unleash/unleash/issues/7648))

- Keep latest integration events for each integration configuration ([#7652](https://github.com/Unleash/unleash/issues/7652))

- Show latest integration event on card ([#7656](https://github.com/Unleash/unleash/issues/7656))

- Add flag configuration for the new flag creation flow ([#7662](https://github.com/Unleash/unleash/issues/7662))

- Create shared dialog form template ([#7663](https://github.com/Unleash/unleash/issues/7663))

- Update description/docs for the new feature creation dialog fields ([#7677](https://github.com/Unleash/unleash/issues/7677))

- Origin middleware ([#7695](https://github.com/Unleash/unleash/issues/7695))

- Change log level to info in origin middleware ([#7705](https://github.com/Unleash/unleash/issues/7705))

- Change request playground flag ([#7707](https://github.com/Unleash/unleash/issues/7707))

- Composition root playground service ([#7710](https://github.com/Unleash/unleash/issues/7710))

- Request origin prom metrics ([#7709](https://github.com/Unleash/unleash/issues/7709))

- Use EventSchema instead of IEvent ([#7732](https://github.com/Unleash/unleash/issues/7732))

- Update handling of strategy deletion for demo walkthrough ([#7719](https://github.com/Unleash/unleash/issues/7719))

- Generate orval types ([#7742](https://github.com/Unleash/unleash/issues/7742))


### Refactor

- Lifecycle stage duration outside instance stats ([#7442](https://github.com/Unleash/unleash/issues/7442))

- Largest resources queries ([#7466](https://github.com/Unleash/unleash/issues/7466))

- Insights actions container relaxed width ([#7603](https://github.com/Unleash/unleash/issues/7603))

- Encapsulate playground limit in service ([#7700](https://github.com/Unleash/unleash/issues/7700))

- Make event log look and act like other pages ([#7704](https://github.com/Unleash/unleash/issues/7704))

- Rename rollback to more explicit rollbackTransaction ([#7723](https://github.com/Unleash/unleash/issues/7723))

- Simplify event log filters component and adds more data ([#7736](https://github.com/Unleash/unleash/issues/7736))


### Security

- Bump ws dependency ([#7697](https://github.com/Unleash/unleash/issues/7697))


### Testing

- Filter by created by/author ([#7307](https://github.com/Unleash/unleash/issues/7307))

- Describe default stickiness bahavior in a test ([#7379](https://github.com/Unleash/unleash/issues/7379))

- Remove last seen at assertion ([#7487](https://github.com/Unleash/unleash/issues/7487))

- Insights filtering ([#7612](https://github.com/Unleash/unleash/issues/7612))

- Flexible strategy component stickiness and groupId ([#7735](https://github.com/Unleash/unleash/issues/7735))


### Wip

- Split out avatar group; use same tooltip for all avatars ([#7681](https://github.com/Unleash/unleash/issues/7681))


### Meta

- Use a default value (of nothing) for NODE_OPTIONS ([#7759](https://github.com/Unleash/unleash/issues/7759))


## [6.0.4] - 2024-06-19

### Bug Fixes

- Project to lifecycle events ([#7400](https://github.com/Unleash/unleash/issues/7400))

- Check for permission in group access assignment ([#7408](https://github.com/Unleash/unleash/issues/7408)) ([#7413](https://github.com/Unleash/unleash/issues/7413))


## [6.0.3] - 2024-06-14

### Bug Fixes

- Backport lifecycle and playground fixes ([#7396](https://github.com/Unleash/unleash/issues/7396))


## [6.0.2] - 2024-06-12

### Bug Fixes

- Remove stale stats widget ([#7353](https://github.com/Unleash/unleash/issues/7353)) ([#7376](https://github.com/Unleash/unleash/issues/7376))


## [6.0.1] - 2024-06-10

### Bug Fixes

- Lifecycle metrics on metrics insert ([#7322](https://github.com/Unleash/unleash/issues/7322)) ([#7330](https://github.com/Unleash/unleash/issues/7330))


## [6.0.0] - 2024-06-06

### Bug Fixes

- Badge should render children 0 value ([#6981](https://github.com/Unleash/unleash/issues/6981))

- Duplicate column name in search query ([#6989](https://github.com/Unleash/unleash/issues/6989))

- Remove columns from the search api query ([#6996](https://github.com/Unleash/unleash/issues/6996))

- Update dependencies in OSS docker file

- Optimize table placeholder loading ([#7002](https://github.com/Unleash/unleash/issues/7002))

- Move slug to real deps ([#7004](https://github.com/Unleash/unleash/issues/7004))

- Removed dupliacted component ([#7013](https://github.com/Unleash/unleash/issues/7013))

- Fix prometheus metrics for lifecycle ([#7030](https://github.com/Unleash/unleash/issues/7030))

- Adjust meta data icons ([#7026](https://github.com/Unleash/unleash/issues/7026))

- Center last seen column ([#7035](https://github.com/Unleash/unleash/issues/7035))

- Make the project submission work from the project creation modal ([#7040](https://github.com/Unleash/unleash/issues/7040))

- Lifecycle improvements/fixes ([#7044](https://github.com/Unleash/unleash/issues/7044))

- Make name validation work properly. ([#7042](https://github.com/Unleash/unleash/issues/7042))

- Omit yes no from stale data comparison ([#7052](https://github.com/Unleash/unleash/issues/7052))

- Add appropriate response headers to SPA entry point HTML response ([#6992](https://github.com/Unleash/unleash/issues/6992))

- Loading is causing a glitch that changes the size of the dialog for a split second ([#7062](https://github.com/Unleash/unleash/issues/7062))

- Disable the create button when api call is made ([#7063](https://github.com/Unleash/unleash/issues/7063))

- Bearer tokens with base-path ([#7065](https://github.com/Unleash/unleash/issues/7065))

- Reached stage should emit feature name ([#7068](https://github.com/Unleash/unleash/issues/7068))

- New strategy using default strategy ([#7075](https://github.com/Unleash/unleash/issues/7075))

- Refresh project after import ([#7082](https://github.com/Unleash/unleash/issues/7082))

- Make numbers in chart to locale string ([#7084](https://github.com/Unleash/unleash/issues/7084))

- Deprecate useProjectNameOrId ([#7086](https://github.com/Unleash/unleash/issues/7086))

- Small improvements ([#7090](https://github.com/Unleash/unleash/issues/7090))

- Also check includedTraffic before calculating overage and showing warning ([#7091](https://github.com/Unleash/unleash/issues/7091))

- No requests before project loaded ([#7096](https://github.com/Unleash/unleash/issues/7096))

- Don't send change request info unless using the new form ([#7102](https://github.com/Unleash/unleash/issues/7102))

- Make dialog the right height and make it scroll if it's smaller ([#7103](https://github.com/Unleash/unleash/issues/7103))

- Set min-height on dropdown item list ([#7106](https://github.com/Unleash/unleash/issues/7106))

- Prevent single-select lists from reopening when you select an item from the search bar ([#7111](https://github.com/Unleash/unleash/issues/7111))

- Add accessible descriptions to the dropdowns ([#7112](https://github.com/Unleash/unleash/issues/7112))

- Minor UI adjustments ([#7117](https://github.com/Unleash/unleash/issues/7117))

- Make CR button wider always ([#7173](https://github.com/Unleash/unleash/issues/7173))

- Change request environment selector button label ([#7176](https://github.com/Unleash/unleash/issues/7176))

- Attempt a react friendly fix of summing ([#7151](https://github.com/Unleash/unleash/issues/7151))

- Use a fixed-width button label for CR selector in new project creation form ([#7179](https://github.com/Unleash/unleash/issues/7179))

- Fix empty events when no features need to be deleted ([#7181](https://github.com/Unleash/unleash/issues/7181))

- CR button shows docs for change requests when selected ([#7196](https://github.com/Unleash/unleash/issues/7196))

- Get rid of horizontal scrollbar on narrow screens in CreateProjectDialog ([#7198](https://github.com/Unleash/unleash/issues/7198))

- Footer overflow ([#7203](https://github.com/Unleash/unleash/issues/7203))

- Show 2 insights components to pro ([#7207](https://github.com/Unleash/unleash/issues/7207))

- Sort segments before comparing in cr diff calculations ([#7202](https://github.com/Unleash/unleash/issues/7202))

- When finding median time to production, ignore 0s ([#7200](https://github.com/Unleash/unleash/issues/7200))

- Handle long owner names for projects ([#7215](https://github.com/Unleash/unleash/issues/7215))

- Handle long names in new project card footers ([#7216](https://github.com/Unleash/unleash/issues/7216))

- Handle overflowing avatars in the new project card ([#7217](https://github.com/Unleash/unleash/issues/7217))

- Correctly align project card info when some cards have multi-line names ([#7223](https://github.com/Unleash/unleash/issues/7223))

- Increase performance of outdated SDK query ([#7226](https://github.com/Unleash/unleash/issues/7226))

- Demo steps should search the main table ([#7227](https://github.com/Unleash/unleash/issues/7227))

- Created by on application-created adds the ip as created by ([#7231](https://github.com/Unleash/unleash/issues/7231))

- Update dependency memoizee to v0.4.17 ([#7236](https://github.com/Unleash/unleash/issues/7236))

- Update dependency unleash-client to v5.5.3 ([#7237](https://github.com/Unleash/unleash/issues/7237))

- Prevent jumping content navbar switch ([#7232](https://github.com/Unleash/unleash/issues/7232))

- Mobile menu font size ([#7252](https://github.com/Unleash/unleash/issues/7252))

- Resolve tar to 6.2.1 ([#7256](https://github.com/Unleash/unleash/issues/7256))

- Hide insights from sidebar for oss and kill switch ([#7270](https://github.com/Unleash/unleash/issues/7270))

- Import export pointing to new docs ([#7274](https://github.com/Unleash/unleash/issues/7274))

- Display previously selected tags in dialog ([#7271](https://github.com/Unleash/unleash/issues/7271))

- Disallow invalid tag values ([#7268](https://github.com/Unleash/unleash/issues/7268))

- Trying to create a tag that's too short gives errors ([#7269](https://github.com/Unleash/unleash/issues/7269))

- Involuntarily scrolled to the top when mousing off group/project avatars ([#7287](https://github.com/Unleash/unleash/issues/7287))

- Trim sso URL fields ([#7301](https://github.com/Unleash/unleash/issues/7301)) ([#7303](https://github.com/Unleash/unleash/issues/7303))


### Chore

- Visually hide labels in the create project form ([#7015](https://github.com/Unleash/unleash/issues/7015))


### Docs

- Add Java YouTube Tutorial Video ([#7059](https://github.com/Unleash/unleash/issues/7059))


### Documentation

- Update feature availability ([#6971](https://github.com/Unleash/unleash/issues/6971))

- Make sure we use latest axios

- Add Python YouTube Video tutorial ([#7033](https://github.com/Unleash/unleash/issues/7033))

- Feature lifecycle ([#7034](https://github.com/Unleash/unleash/issues/7034))

- Optimizing AWS Lambda Documentation ([#6991](https://github.com/Unleash/unleash/issues/6991))

- Add spring boot video to tutorial ([#7098](https://github.com/Unleash/unleash/issues/7098))

- Update quickstart and tutorials with flag reference ([#7142](https://github.com/Unleash/unleash/issues/7142))

- Okta SCIM setup ([#7130](https://github.com/Unleash/unleash/issues/7130))

- Add more clarification on when to use sx vs styled ([#7209](https://github.com/Unleash/unleash/issues/7209))


### Features

- Add completed event as webhook event ([#6968](https://github.com/Unleash/unleash/issues/6968))

- Search order by final ([#6976](https://github.com/Unleash/unleash/issues/6976))

- Merge feature toggle details with feature meta info box ([#6977](https://github.com/Unleash/unleash/issues/6977))

- Configure CRs when creating projects ([#6979](https://github.com/Unleash/unleash/issues/6979))

- Start exposing environment metrics from feature endpoint ([#6986](https://github.com/Unleash/unleash/issues/6986))

- Show documentation relating to the specific thing your configuring in the new project form ([#6993](https://github.com/Unleash/unleash/issues/6993))

- Create initial stages for features ([#6983](https://github.com/Unleash/unleash/issues/6983))

- Pass metrics to feature component ([#6994](https://github.com/Unleash/unleash/issues/6994))

- Increase possible number range for yes/no metrics ([#6995](https://github.com/Unleash/unleash/issues/6995))

- Allow to use CA certificate file path for DB ([#6985](https://github.com/Unleash/unleash/issues/6985))

- Duration in stage, add feature lifecycle prometheus metrics ([#6973](https://github.com/Unleash/unleash/issues/6973))

- Generate project ids if they're missing ([#7003](https://github.com/Unleash/unleash/issues/7003))

- Completed stage lists all environments ([#7007](https://github.com/Unleash/unleash/issues/7007))

- Lifecycle is now navigatable by tab ([#7005](https://github.com/Unleash/unleash/issues/7005))

- Add project id to prometheus and feature flag ([#7008](https://github.com/Unleash/unleash/issues/7008))

- Front end can create projects without ids ([#7009](https://github.com/Unleash/unleash/issues/7009))

- Add status fields for feature lifecycle table ([#7014](https://github.com/Unleash/unleash/issues/7014))

- Feature lifecycle completed schema ([#7021](https://github.com/Unleash/unleash/issues/7021))

- Expose lifecycle stage in project overview search ([#7017](https://github.com/Unleash/unleash/issues/7017))

- Add completed status backend ([#7022](https://github.com/Unleash/unleash/issues/7022))

- Lifecycle in project overview ([#7024](https://github.com/Unleash/unleash/issues/7024))

- Mark completed ui selector ([#7025](https://github.com/Unleash/unleash/issues/7025))

- Create project dialog ([#7012](https://github.com/Unleash/unleash/issues/7012))

- Pre-live should include disabled prod ([#7031](https://github.com/Unleash/unleash/issues/7031))

- Lifecycle prometheus metrics per project ([#7032](https://github.com/Unleash/unleash/issues/7032))

- Webhook data for completed ([#7043](https://github.com/Unleash/unleash/issues/7043))

- Kept and discarded read model ([#7045](https://github.com/Unleash/unleash/issues/7045))

- Expose postgres version ([#7041](https://github.com/Unleash/unleash/issues/7041))

- Track complete event ([#7047](https://github.com/Unleash/unleash/issues/7047))

- Lifecycle column extracted ([#7049](https://github.com/Unleash/unleash/issues/7049))

- Uncomplete tracking ([#7053](https://github.com/Unleash/unleash/issues/7053))

- Backfill current stage on startup ([#7057](https://github.com/Unleash/unleash/issues/7057))

- Move SCIM config into separate tab ([#7055](https://github.com/Unleash/unleash/issues/7055))

- Deprecate feature toggle variants at environment level ([#7058](https://github.com/Unleash/unleash/issues/7058))

- Deprecate feature toggle environment variants api ([#7066](https://github.com/Unleash/unleash/issues/7066))

- Refactor data usage into hooks, estimate monthly added fees ([#7048](https://github.com/Unleash/unleash/issues/7048))

- Outdated sdks project level ([#7080](https://github.com/Unleash/unleash/issues/7080))

- Project level outdated sdks, project level banner ([#7083](https://github.com/Unleash/unleash/issues/7083))

- Switch to hook without features list ([#7085](https://github.com/Unleash/unleash/issues/7085))

- Add global isAdmin method for access service ([#7088](https://github.com/Unleash/unleash/issues/7088))

- Add prometheus metrics error logging ([#7105](https://github.com/Unleash/unleash/issues/7105))

- Debug metrics flag ([#7108](https://github.com/Unleash/unleash/issues/7108))

- Show docs with icons in sidebar ([#7109](https://github.com/Unleash/unleash/issues/7109))

- Rename toggle to flag with db migration ([#7118](https://github.com/Unleash/unleash/issues/7118))

- Navigation sidebar stub ([#7121](https://github.com/Unleash/unleash/issues/7121))

- Plan specific navigation ([#7126](https://github.com/Unleash/unleash/issues/7126))

- Mini navigation sidebar ([#7131](https://github.com/Unleash/unleash/issues/7131))

- Navigation switch ([#7132](https://github.com/Unleash/unleash/issues/7132))

- New mobile sidebar ([#7135](https://github.com/Unleash/unleash/issues/7135))

- Add ip to state-service and group-service ([#7120](https://github.com/Unleash/unleash/issues/7120))

- More spacious layout ([#7138](https://github.com/Unleash/unleash/issues/7138))

- Hide top nav ([#7140](https://github.com/Unleash/unleash/issues/7140))

- Persist navigation settings ([#7144](https://github.com/Unleash/unleash/issues/7144))

- Upgrade make fetch happen ([#7147](https://github.com/Unleash/unleash/issues/7147))

- Error log on unsupported pg ([#7139](https://github.com/Unleash/unleash/issues/7139))

- Adjust change request banner for new layout ([#7160](https://github.com/Unleash/unleash/issues/7160))

- Add remote ip to all events (2) ([#7149](https://github.com/Unleash/unleash/issues/7149))

- User profile preview ([#7150](https://github.com/Unleash/unleash/issues/7150))

- UI tweak new sidebar ([#7165](https://github.com/Unleash/unleash/issues/7165))

- Persist expand collapse ([#7169](https://github.com/Unleash/unleash/issues/7169))

- Currently selected nav item ([#7182](https://github.com/Unleash/unleash/issues/7182))

- Sidebar nav tweaks ([#7185](https://github.com/Unleash/unleash/issues/7185))

- Content padding matches top nav ([#7187](https://github.com/Unleash/unleash/issues/7187))

- Project insights out of beta ([#7188](https://github.com/Unleash/unleash/issues/7188))

- Last viewed project ([#7191](https://github.com/Unleash/unleash/issues/7191))

- Expand admin settings ([#7192](https://github.com/Unleash/unleash/issues/7192))

- Insights docs ([#7189](https://github.com/Unleash/unleash/issues/7189))

- Smart sticky expand/hide button ([#7201](https://github.com/Unleash/unleash/issues/7201))

- Insights out of beta and expose 2 widgets to pro ([#7177](https://github.com/Unleash/unleash/issues/7177))

- Remove accordion line ([#7205](https://github.com/Unleash/unleash/issues/7205))

- Synced last viewed projects ([#7208](https://github.com/Unleash/unleash/issues/7208))

- Move demo to the right ([#7212](https://github.com/Unleash/unleash/issues/7212))

- Recent flags ([#7211](https://github.com/Unleash/unleash/issues/7211))

- Add tooltips to new project creation form config buttons ([#7213](https://github.com/Unleash/unleash/issues/7213))

- Now CLIENT_METRICS event will be emitted with new structure ([#7210](https://github.com/Unleash/unleash/issues/7210))

- File import ([#7219](https://github.com/Unleash/unleash/issues/7219))

- Align list items on mode switch ([#7229](https://github.com/Unleash/unleash/issues/7229))

- New sidebar by default for OSS ([#7239](https://github.com/Unleash/unleash/issues/7239))

- Explain stickiness ([#7248](https://github.com/Unleash/unleash/issues/7248))

- Project health chart now goes from 0 to 100 to give perspective ([#7249](https://github.com/Unleash/unleash/issues/7249))

- Clickable tags in project overview ([#7263](https://github.com/Unleash/unleash/issues/7263))

- More powerful feature search by type ([#7267](https://github.com/Unleash/unleash/issues/7267))

- Filter by feature type ([#7273](https://github.com/Unleash/unleash/issues/7273))

- Adds information about project modes to the project creation form ([#7250](https://github.com/Unleash/unleash/issues/7250))

- Preview dependency ([#7284](https://github.com/Unleash/unleash/issues/7284))


### Fix

- Overflow sidebar cr banner ([#7193](https://github.com/Unleash/unleash/issues/7193))


### Miscellaneous Tasks

- Fix failing test; don't rely on a single item only ([#6974](https://github.com/Unleash/unleash/issues/6974))

- Version in package.json

- Remove project overview refactor flag ([#6897](https://github.com/Unleash/unleash/issues/6897))

- Add automatic ID generation algorithm ([#7001](https://github.com/Unleash/unleash/issues/7001))

- Update orval schemas ([#7010](https://github.com/Unleash/unleash/issues/7010))

- Update documentation for feature toggle variants ([#7064](https://github.com/Unleash/unleash/issues/7064))

- Bump version to 5.12.4+main

- Remove e2e tests for legacy env variants ([#7071](https://github.com/Unleash/unleash/issues/7071))

- Linter update ([#7072](https://github.com/Unleash/unleash/issues/7072))

- Bring workflow changes from 5.12 ([#7074](https://github.com/Unleash/unleash/issues/7074))

- Update workflows ([#7076](https://github.com/Unleash/unleash/issues/7076))

- Update app.json ([#7078](https://github.com/Unleash/unleash/issues/7078))

- Rename toggle to flag #1 ([#7092](https://github.com/Unleash/unleash/issues/7092))

- Rename toggle to flag #2 ([#7097](https://github.com/Unleash/unleash/issues/7097))

- Change toggle to flag #3 ([#7101](https://github.com/Unleash/unleash/issues/7101))

- Update input field text sizes ([#7107](https://github.com/Unleash/unleash/issues/7107))

- Rename toggle to flag #4 ([#7114](https://github.com/Unleash/unleash/issues/7114))

- Rename feature toggle to feature flag #5 ([#7115](https://github.com/Unleash/unleash/issues/7115))

- Rename toggle to flag #6 ([#7122](https://github.com/Unleash/unleash/issues/7122))

- Rename roles toggles to flag ([#7123](https://github.com/Unleash/unleash/issues/7123))

- Remove e2e that is not needed anymore ([#7124](https://github.com/Unleash/unleash/issues/7124))

- Rename toggle to flag #7 ([#7125](https://github.com/Unleash/unleash/issues/7125))

- Update orval types after renaming ([#7127](https://github.com/Unleash/unleash/issues/7127))

- Make it build again

- Workflows call workflows ([#7089](https://github.com/Unleash/unleash/issues/7089))

- Bump to @types/node 20 as well as updating frontend .nvmrc ([#7137](https://github.com/Unleash/unleash/issues/7137))

- Rename toggle to flag docs #1 ([#7136](https://github.com/Unleash/unleash/issues/7136))

- Rename toggle to flags in docs #2 ([#7141](https://github.com/Unleash/unleash/issues/7141))

- Rename toggle to flags in docs #3 ([#7143](https://github.com/Unleash/unleash/issues/7143))

- Update anchor toggle titles ([#7145](https://github.com/Unleash/unleash/issues/7145))

- Rename toggle to flag #final ([#7146](https://github.com/Unleash/unleash/issues/7146))

- Edge active tokens cache flag removal ([#7094](https://github.com/Unleash/unleash/issues/7094))

- Remove deprecated legacy features endpoint ([#7129](https://github.com/Unleash/unleash/issues/7129))

- Remove toggle reference apart from existing links ([#7148](https://github.com/Unleash/unleash/issues/7148))

- [**breaking**] [v6] remove error.description in error messages ([#7157](https://github.com/Unleash/unleash/issues/7157))

- Update illustrations for unleash anatomy ([#7163](https://github.com/Unleash/unleash/issues/7163))

- New create project dialog UI fixes ([#7167](https://github.com/Unleash/unleash/issues/7167))

- Fix create project form environment selector button width ([#7175](https://github.com/Unleash/unleash/issues/7175))

- Rename component to match file name and american spelling ([#7174](https://github.com/Unleash/unleash/issues/7174))

- Switch insights ui flag to kill switch ([#7166](https://github.com/Unleash/unleash/issues/7166))

- Update unleash banner in readme ([#7178](https://github.com/Unleash/unleash/issues/7178))

- Upgrade edge banner version ([#7180](https://github.com/Unleash/unleash/issues/7180))

- Removed edge bulk metrics endpoint ([#7161](https://github.com/Unleash/unleash/issues/7161))

- Allow CR selection when no envs are enabled ([#7183](https://github.com/Unleash/unleash/issues/7183))

- Deprecate custom strategies ([#7186](https://github.com/Unleash/unleash/issues/7186))

- New project dialog code cleanup 1 ([#7113](https://github.com/Unleash/unleash/issues/7113))

- Remove state service ([#7184](https://github.com/Unleash/unleash/issues/7184))

- Code cleanup for new project form pt 2 ([#7190](https://github.com/Unleash/unleash/issues/7190))

- Remove unused artillery scripts referencing state api ([#7194](https://github.com/Unleash/unleash/issues/7194))

- Additional removal notices of state api/service ([#7197](https://github.com/Unleash/unleash/issues/7197))

- Fix button design on narrow screens for new project form ([#7195](https://github.com/Unleash/unleash/issues/7195))

- Remove unused and deprecated methods in feature toggle legacy controller and in feature toggle service ([#7199](https://github.com/Unleash/unleash/issues/7199))

- Removed passport from docker package.json file ([#7159](https://github.com/Unleash/unleash/issues/7159))

- Sync user groups is a system action ([#7214](https://github.com/Unleash/unleash/issues/7214))

- Added dependency review ([#7206](https://github.com/Unleash/unleash/issues/7206))

- Mark deprecations with version ([#7218](https://github.com/Unleash/unleash/issues/7218))

- Remove project list split feature flags ([#7224](https://github.com/Unleash/unleash/issues/7224))

- Remove flag for new project cards ([#7225](https://github.com/Unleash/unleash/issues/7225))

- Bump node 20 version in docker image ([#7221](https://github.com/Unleash/unleash/issues/7221))

- Make ip mandatory ([#7220](https://github.com/Unleash/unleash/issues/7220))

- Change deny list to allow list ([#7242](https://github.com/Unleash/unleash/issues/7242))

- Change to fs/promises and add an import from file e2e test ([#7240](https://github.com/Unleash/unleash/issues/7240))

- Upgrade deps ([#7245](https://github.com/Unleash/unleash/issues/7245))

- Bump version to 5.12.5+main

- Bump version to 5.12.6+main

- Readded resolutions for our docker package file ([#7253](https://github.com/Unleash/unleash/issues/7253))

- Update project overview to flags ([#7247](https://github.com/Unleash/unleash/issues/7247))

- Bump version to 5.12.7+main

- Add a flag+ui flag for commandBarUI ([#7264](https://github.com/Unleash/unleash/issues/7264))

- Backport changed made in the workflow ([#7255](https://github.com/Unleash/unleash/issues/7255))

- Upgraded semver dependency (and biome) ([#7272](https://github.com/Unleash/unleash/issues/7272))

- Regenerate orval with new changes ([#7283](https://github.com/Unleash/unleash/issues/7283))


### Refactor

- Extract feature lifecycle component ([#7023](https://github.com/Unleash/unleash/issues/7023))

- Replace useProject with useProjectOverview ([#7087](https://github.com/Unleash/unleash/issues/7087))

- Navigation sidebar ([#7171](https://github.com/Unleash/unleash/issues/7171))


### Testing

- Move import test from cypress to RTL to make it less flaky ([#6982](https://github.com/Unleash/unleash/issues/6982))

- Move 2 table tests from cypress to rtl ([#6984](https://github.com/Unleash/unleash/issues/6984))

- Move tests from cypress to rtl ([#6987](https://github.com/Unleash/unleash/issues/6987))

- Test how the project form deals with project envs and cr env interaction ([#6997](https://github.com/Unleash/unleash/issues/6997))

- Fix flaky lifecycle test ([#7093](https://github.com/Unleash/unleash/issues/7093))

- Navigation sidebar ([#7172](https://github.com/Unleash/unleash/issues/7172))


### Poc

- Many strategies pagination ([#7011](https://github.com/Unleash/unleash/issues/7011))


## [5.6.0] - 2023-10-26

### Bug Fixes

- Account for array length ([#4849](https://github.com/Unleash/unleash/issues/4849))

- Version checker update needs permissions to write id-token

- Partial index on events announced ([#4856](https://github.com/Unleash/unleash/issues/4856))

- Permissions in the role payload ([#4861](https://github.com/Unleash/unleash/issues/4861))

- Add condition for getting max revision id from store ([#4549](https://github.com/Unleash/unleash/issues/4549))

- Update dependency joi to v17.10.2 ([#4883](https://github.com/Unleash/unleash/issues/4883))

- Update dependency db-migrate-pg to v1.5.2 ([#4894](https://github.com/Unleash/unleash/issues/4894))

- Update docusaurus monorepo to v2.4.3 ([#4895](https://github.com/Unleash/unleash/issues/4895))

- Separate project and project enterprise settings forms ([#4911](https://github.com/Unleash/unleash/issues/4911))

- Yarn lint:fix ([#4917](https://github.com/Unleash/unleash/issues/4917))

- Update potentially-stale status dynamically ([#4905](https://github.com/Unleash/unleash/issues/4905))

- ReportTable status column not updating ([#4924](https://github.com/Unleash/unleash/issues/4924))

- Linting ([#4925](https://github.com/Unleash/unleash/issues/4925))

- Only delete SSO-synced group membership where membership was added by SSO sync ([#4929](https://github.com/Unleash/unleash/issues/4929))

- Make cypress list length checks more relaxed ([#4933](https://github.com/Unleash/unleash/issues/4933))

- Remove console from FeatureToggleSwitch ([#4928](https://github.com/Unleash/unleash/issues/4928))

- Remove the info from the variants page ([#4937](https://github.com/Unleash/unleash/issues/4937))

- Change broken link to groups documentation ([#4941](https://github.com/Unleash/unleash/issues/4941))

- Local linter did not find formatting error ([#4954](https://github.com/Unleash/unleash/issues/4954))

- Fail when format or lint is incorrect ([#4956](https://github.com/Unleash/unleash/issues/4956))

- Ignore errors on changelog generation and include token ([#4926](https://github.com/Unleash/unleash/issues/4926))

- Typo in enabled event ([#4960](https://github.com/Unleash/unleash/issues/4960))

- Refactor getProjectOverview store method ([#4972](https://github.com/Unleash/unleash/issues/4972))

- Added await to getActiveUsers tests

- Export NotFoundError and ISegmentService in internals.ts ([#4997](https://github.com/Unleash/unleash/issues/4997))

- Missing uiFlag newInviteLink ([#5000](https://github.com/Unleash/unleash/issues/5000))

- Enable segment importing for oss ([#5010](https://github.com/Unleash/unleash/issues/5010))

- Message banner internal link assumption ([#5011](https://github.com/Unleash/unleash/issues/5011))

- Message banner zIndex ([#5015](https://github.com/Unleash/unleash/issues/5015))

- Error icon, add only relevant variants ([#5014](https://github.com/Unleash/unleash/issues/5014))

- Import segment test and fix ([#5017](https://github.com/Unleash/unleash/issues/5017))

- Disable all environments when reviving a feature ([#4999](https://github.com/Unleash/unleash/issues/4999))

- Maintenance banner should show right away when toggled ([#5021](https://github.com/Unleash/unleash/issues/5021))

- Use correct flag name ([#5026](https://github.com/Unleash/unleash/issues/5026))

- Feature flag playground features in new store ([#5013](https://github.com/Unleash/unleash/issues/5013))

- Small adjustments on the new header icons ([#5043](https://github.com/Unleash/unleash/issues/5043))

- Update dependency nodemailer to v6.9.6 ([#5049](https://github.com/Unleash/unleash/issues/5049))

- Extract username from user should not return undefined ([#5061](https://github.com/Unleash/unleash/issues/5061))

- Log diff ([#5072](https://github.com/Unleash/unleash/issues/5072))

- Server-side request forgery in @cypress/request@2.88.12 ([#5077](https://github.com/Unleash/unleash/issues/5077))

- Correctly set baseUriPath in setupAppWithBaseUrl ([#5068](https://github.com/Unleash/unleash/issues/5068))

- Update failing snapshot

- Add sort to deep diff ([#5084](https://github.com/Unleash/unleash/issues/5084))

- Force deletion of archived toggles when deleting a project ([#5080](https://github.com/Unleash/unleash/issues/5080))

- Add project filter to feature-toggle-list-builder ([#5099](https://github.com/Unleash/unleash/issues/5099))

- Remove docusaurus from main package json ([#5107](https://github.com/Unleash/unleash/issues/5107))

- Project overview refactor flag ([#5110](https://github.com/Unleash/unleash/issues/5110))

- Don't clean up settings when optional data is not present ([#5118](https://github.com/Unleash/unleash/issues/5118))

- One of our deps breaks on node 21 ([#5122](https://github.com/Unleash/unleash/issues/5122))

- Draft banner zIndex ([#5124](https://github.com/Unleash/unleash/issues/5124))

- Wait for bulk archive button to become enabled ([#5121](https://github.com/Unleash/unleash/issues/5121))

- Grey out text and icons for disabled strategies in playground ([#5113](https://github.com/Unleash/unleash/issues/5113))

- Read project id in edit project ([#5134](https://github.com/Unleash/unleash/issues/5134))

- Fix copy functionality always being disabled

- Fix linting for copyfeature ([#5138](https://github.com/Unleash/unleash/issues/5138))

- Last seen at rendering logic ([#5136](https://github.com/Unleash/unleash/issues/5136))

- Only get rows for toggles in project ([#5141](https://github.com/Unleash/unleash/issues/5141))

- Project mode can not be set to null anymore ([#5145](https://github.com/Unleash/unleash/issues/5145))

- Fix broken edit project link ([#5147](https://github.com/Unleash/unleash/issues/5147))

- Do not track empty strings in playground token input ([#5159](https://github.com/Unleash/unleash/issues/5159))


### Documentation

- Strategy variants video update ([#4854](https://github.com/Unleash/unleash/issues/4854))

- Add video to SDK overview reference ([#4855](https://github.com/Unleash/unleash/issues/4855))

- Rollback docusaurus upgrade so the docs work ([#4965](https://github.com/Unleash/unleash/issues/4965))

- Make videos bigger ([#4980](https://github.com/Unleash/unleash/issues/4980))

- Add a custom_edit_url for sdks and edge/proxy ([#4985](https://github.com/Unleash/unleash/issues/4985))

- Add feature availability troubleshooting guide ([#4989](https://github.com/Unleash/unleash/issues/4989))

- Updated sidebars and added missing doc ID ([#4993](https://github.com/Unleash/unleash/issues/4993))

- Dependent features ([#5058](https://github.com/Unleash/unleash/issues/5058))

- Added Flutter and Next.js Tutorials


### Feat

### Features

- Enterprise project settings ([#4844](https://github.com/Unleash/unleash/issues/4844))

- Read model for dependent features ([#4846](https://github.com/Unleash/unleash/issues/4846))

- Feature admin API returns dependencies and children ([#4848](https://github.com/Unleash/unleash/issues/4848))

- Display dependencies and parents in project details ([#4859](https://github.com/Unleash/unleash/issues/4859))

- Edit and delete dependencies menu ([#4863](https://github.com/Unleash/unleash/issues/4863))

- Events for dependencies ([#4864](https://github.com/Unleash/unleash/issues/4864))

- Biome lint ([#4853](https://github.com/Unleash/unleash/issues/4853))

- Add more events in integrations ([#4815](https://github.com/Unleash/unleash/issues/4815))

- Parent and child info in feature overview header ([#4901](https://github.com/Unleash/unleash/issues/4901))

- Generate orval types with dependent features ([#4902](https://github.com/Unleash/unleash/issues/4902))

- Biome lint frontend ([#4903](https://github.com/Unleash/unleash/issues/4903))

- Update dependency permission ([#4910](https://github.com/Unleash/unleash/issues/4910))

- Prevent delete and archive on parent feature ([#4913](https://github.com/Unleash/unleash/issues/4913))

- Change project with feature dependencies ([#4915](https://github.com/Unleash/unleash/issues/4915))

- Copy feature with parent ([#4918](https://github.com/Unleash/unleash/issues/4918))

- Flag for clone dependencies ([#4922](https://github.com/Unleash/unleash/issues/4922))

- Dependent features in playground ([#4930](https://github.com/Unleash/unleash/issues/4930))

- Allow defining initial admin user as env variable ([#4927](https://github.com/Unleash/unleash/issues/4927))

- Allow to delete dependencies when no orphans ([#4952](https://github.com/Unleash/unleash/issues/4952))

- Render segments changes in feature strategy update event messages ([#4950](https://github.com/Unleash/unleash/issues/4950))

- Orval types with change request for dependencies ([#4961](https://github.com/Unleash/unleash/issues/4961))

- Change request dependency UI ([#4966](https://github.com/Unleash/unleash/issues/4966))

- Do not allow to manage dependencies directly with cr enabled ([#4971](https://github.com/Unleash/unleash/issues/4971))

- Visualize dependencies managment in change requests ([#4978](https://github.com/Unleash/unleash/issues/4978))

- Generate declaration map ([#4981](https://github.com/Unleash/unleash/issues/4981))

- Feature changes counted in new table ([#4958](https://github.com/Unleash/unleash/issues/4958))

- Delete dependnecy button through change request ([#4983](https://github.com/Unleash/unleash/issues/4983))

- Add internalMessageBanner feature flag ([#4990](https://github.com/Unleash/unleash/issues/4990))

- Re-order message banners ([#4995](https://github.com/Unleash/unleash/issues/4995))

- Make invite link more visible ([#4984](https://github.com/Unleash/unleash/issues/4984))

- Multiple external message banners ([#4998](https://github.com/Unleash/unleash/issues/4998))

- Prevent adding dependency to archived or removed parent ([#4987](https://github.com/Unleash/unleash/issues/4987))

- Protect archive feature ([#5003](https://github.com/Unleash/unleash/issues/5003))

- Export dependent feature toggles ([#5007](https://github.com/Unleash/unleash/issues/5007))

- Dynamic icons by adding material symbols font ([#5008](https://github.com/Unleash/unleash/issues/5008))

- Message banners table migration ([#5009](https://github.com/Unleash/unleash/issues/5009))

- Make maintenance banner sticky ([#5016](https://github.com/Unleash/unleash/issues/5016))

- Validate archive dependent features ([#5019](https://github.com/Unleash/unleash/issues/5019))

- Dependencies import validation ([#5023](https://github.com/Unleash/unleash/issues/5023))

- Header invite link tracking ([#5001](https://github.com/Unleash/unleash/issues/5001))

- Verify archive dependent features UI ([#5024](https://github.com/Unleash/unleash/issues/5024))

- Add a dialog when reviving / batch reviving features ([#4988](https://github.com/Unleash/unleash/issues/4988))

- Adds a new design to the header icons ([#5025](https://github.com/Unleash/unleash/issues/5025))

- Remove dependency on archive ([#5040](https://github.com/Unleash/unleash/issues/5040))

- Make maintenance-related 503s more intuitive ([#5018](https://github.com/Unleash/unleash/issues/5018))

- Track add and remove dependencies ([#5041](https://github.com/Unleash/unleash/issues/5041))

- Add playground imrpovements flag ([#5045](https://github.com/Unleash/unleash/issues/5045))

- Add new message banner events ([#5055](https://github.com/Unleash/unleash/issues/5055))

- Show dependencies only when using pro/enterprise or at least on… ([#5052](https://github.com/Unleash/unleash/issues/5052))

- Import dependencies ([#5044](https://github.com/Unleash/unleash/issues/5044))

- Add option to return disabled strategies ([#5059](https://github.com/Unleash/unleash/issues/5059))

- Warn about sdk update with feature dependencies ([#5065](https://github.com/Unleash/unleash/issues/5065))

- Allow selection of text in strategies for contexts ([#5071](https://github.com/Unleash/unleash/issues/5071))

- Dependent features use new transaction mechanism ([#5073](https://github.com/Unleash/unleash/issues/5073))

- Adds rate limiting to metric POST endpoints ([#5075](https://github.com/Unleash/unleash/issues/5075))

- Show disabled strategies in playground ([#5081](https://github.com/Unleash/unleash/issues/5081))

- Default session id in frontend api ([#5083](https://github.com/Unleash/unleash/issues/5083))

- Add message banner API hooks ([#5078](https://github.com/Unleash/unleash/issues/5078))

- Display internal message banners ([#5079](https://github.com/Unleash/unleash/issues/5079))

- Prevent self dependencies ([#5090](https://github.com/Unleash/unleash/issues/5090))

- Check if child and parent are in the same project ([#5093](https://github.com/Unleash/unleash/issues/5093))

- Detect grandchild dependency ([#5094](https://github.com/Unleash/unleash/issues/5094))

- Ensure at least one owner on remove user/group access ([#5085](https://github.com/Unleash/unleash/issues/5085))

- Add new sticky component to handle stacked stickies ([#5088](https://github.com/Unleash/unleash/issues/5088))

- Show warning about dependencies removed on archive ([#5104](https://github.com/Unleash/unleash/issues/5104))

- Add hasStrategies and hasEnabledStrategies on feature environments ([#5012](https://github.com/Unleash/unleash/issues/5012))

- Promise timeout on lock ([#5108](https://github.com/Unleash/unleash/issues/5108))

- Banners admin page ([#5111](https://github.com/Unleash/unleash/issues/5111))

- Add job that cleans last seen every 24 hours ([#5114](https://github.com/Unleash/unleash/issues/5114))

- Make multiple roles per group/user GA by removing the flag ([#5109](https://github.com/Unleash/unleash/issues/5109))

- Replace gravatar-url with inline function ([#5128](https://github.com/Unleash/unleash/issues/5128))

- Improved has children/has parent indicator ([#5135](https://github.com/Unleash/unleash/issues/5135))

- Banner modal ([#5132](https://github.com/Unleash/unleash/issues/5132))

- Feature search stub ([#5143](https://github.com/Unleash/unleash/issues/5143))

- Use new on/off endpoints in banners toggles ([#5144](https://github.com/Unleash/unleash/issues/5144))

- Create db table for cr schedules ([#5148](https://github.com/Unleash/unleash/issues/5148))

- Add feature search service ([#5149](https://github.com/Unleash/unleash/issues/5149))

- Feature search basic functionality ([#5150](https://github.com/Unleash/unleash/issues/5150))

- Add input for api token in playground ([#5130](https://github.com/Unleash/unleash/issues/5130))

- Banner UI/UX adjustments ([#5151](https://github.com/Unleash/unleash/issues/5151))

- Remove feature flag for datadog json template ([#5105](https://github.com/Unleash/unleash/issues/5105))

- Make all internal rate limits configurable ([#5095](https://github.com/Unleash/unleash/issues/5095))

- Token input improvements ([#5155](https://github.com/Unleash/unleash/issues/5155))

- Playground token input usage tracking ([#5157](https://github.com/Unleash/unleash/issues/5157))

- Filter features by type ([#5160](https://github.com/Unleash/unleash/issues/5160))

- Add scheduledConfigurationChanges flag ([#5161](https://github.com/Unleash/unleash/issues/5161))


### Fix

- Copy feature alert when change requests enabled in any env ([#4964](https://github.com/Unleash/unleash/issues/4964))


### Miscellaneous Tasks

- Bump version to 5.6.0 ([#4847](https://github.com/Unleash/unleash/issues/4847))

- Limit the amount of unannounced events we announce ([#4845](https://github.com/Unleash/unleash/issues/4845))

- Update DATABASE_URL to use the database created via POSTGRES_D… ([#4836](https://github.com/Unleash/unleash/issues/4836))

- Unleash users page ([#4687](https://github.com/Unleash/unleash/issues/4687))

- Adds Biome as a recommended extension for vscode ([#4909](https://github.com/Unleash/unleash/issues/4909))

- Use https://git-cliff.org for changelog ([#4907](https://github.com/Unleash/unleash/issues/4907))

- Automate changelog generation on release branch ([#4914](https://github.com/Unleash/unleash/issues/4914))

- Revamp transactional impl ([#4916](https://github.com/Unleash/unleash/issues/4916))

- Handle transactions already started at the controller layer ([#4953](https://github.com/Unleash/unleash/issues/4953))

- Improve UI Config type ([#4959](https://github.com/Unleash/unleash/issues/4959))

- Improve type on import service ([#4962](https://github.com/Unleash/unleash/issues/4962))

- Rename validate step ([#4969](https://github.com/Unleash/unleash/issues/4969))

- Avoid building frontend if not needed ([#4982](https://github.com/Unleash/unleash/issues/4982))

- Split interfaces for import and export ([#5004](https://github.com/Unleash/unleash/issues/5004))

- Add enterprise event ([#5056](https://github.com/Unleash/unleash/issues/5056))

- GA transactional decorator ([#5020](https://github.com/Unleash/unleash/issues/5020))

- Update node sdk to official ga version with dependent flags ([#5042](https://github.com/Unleash/unleash/issues/5042))

- Introduce type to prevent potential issues ([#5066](https://github.com/Unleash/unleash/issues/5066))

- Generate types ([#5074](https://github.com/Unleash/unleash/issues/5074))

- Add splash screen for oss segments ([#5053](https://github.com/Unleash/unleash/issues/5053))

- Remove storybook ([#5091](https://github.com/Unleash/unleash/issues/5091))

- Force tough-cookie to 4.1.3 due to vulnerability ([#5092](https://github.com/Unleash/unleash/issues/5092))

- Remove ts-ignore and adapt tests ([#5103](https://github.com/Unleash/unleash/issues/5103))

- Remove invite link flag ([#5119](https://github.com/Unleash/unleash/issues/5119))

- Disable fsync in gh action postgres to speed up the tests ([#5139](https://github.com/Unleash/unleash/issues/5139))

- Add CHANGE_REQUEST_SCHEDULED to event types. ([#5162](https://github.com/Unleash/unleash/issues/5162))


### Refactor

- Expicit names in queries ([#4850](https://github.com/Unleash/unleash/issues/4850))

- Prefer eventService.storeEvent methods ([#4830](https://github.com/Unleash/unleash/issues/4830))

- Bubble promise instead of return await ([#4906](https://github.com/Unleash/unleash/issues/4906))

- Custom render should provide container ([#4938](https://github.com/Unleash/unleash/issues/4938))

- Make uiFlags typesafe ([#4996](https://github.com/Unleash/unleash/issues/4996))

- Feature toggle list query ([#5022](https://github.com/Unleash/unleash/issues/5022))

- Add test coverage ([#5046](https://github.com/Unleash/unleash/issues/5046))

- Create builder class for converting rows to avoid duplication ([#5050](https://github.com/Unleash/unleash/issues/5050))

- Add tests for /api/client/features ([#5057](https://github.com/Unleash/unleash/issues/5057))

- Move message banner interface to common file ([#5076](https://github.com/Unleash/unleash/issues/5076))

- Rename message banners to banners ([#5098](https://github.com/Unleash/unleash/issues/5098))

- Rename message banners to banners - events ([#5100](https://github.com/Unleash/unleash/issues/5100))

- Move version service scheduling to scheduler ([#5120](https://github.com/Unleash/unleash/issues/5120))

- Proxy service scheduler ([#5125](https://github.com/Unleash/unleash/issues/5125))

- Move metrics service scheduling ([#5129](https://github.com/Unleash/unleash/issues/5129))

- Slight clean up after GAing multiple roles ([#5133](https://github.com/Unleash/unleash/issues/5133))

- Type query params ([#5153](https://github.com/Unleash/unleash/issues/5153))

- Optimize queries ([#5158](https://github.com/Unleash/unleash/issues/5158))


### Testing

- Makes overview spec less flaky by doing 2 step search ([#4862](https://github.com/Unleash/unleash/issues/4862))

- Playground with dependencies ([#4936](https://github.com/Unleash/unleash/issues/4936))

- Added tests for has strategies and enabled strategies ([#5112](https://github.com/Unleash/unleash/issues/5112))

- Silent migration test ([#5131](https://github.com/Unleash/unleash/issues/5131))

- Speed up the tests ([#5140](https://github.com/Unleash/unleash/issues/5140))


### Bug

- Fix broken links from lychee ([#5127](https://github.com/Unleash/unleash/issues/5127))

- Remove strategies from copy breadcrumbs ([#5137](https://github.com/Unleash/unleash/issues/5137))


### Meta

- Add note to generate openapi docs before starting local dev ([#4976](https://github.com/Unleash/unleash/issues/4976))

## [5.5.7] - 2023-10-20

### Miscellaneous Tasks

- Add splash screen for oss segments (#5053) (#5097)

## [5.5.6] - 2023-10-09

### Bug Fixes

- Only delete SSO-synced group membership where membership was added by SSO sync (#4929)

## [5.5.5] - 2023-10-04

### Bug Fixes

- ReportTable not updating status dynamically (#4923)

## [5.5.4] - 2023-10-04

### Bug Fixes

- Update potentially-stale status dynamically (#4905) (#4920)

### Miscellaneous Tasks

- Automate changelog generation on release branch (#4914)

## [5.5.3] - 2023-09-28

### Bug Fixes

- Permissions in the role payload ([#4861](https://github.com/Unleash/unleash/issues/4861))


## [5.5.2] - 2023-09-28

### Bug Fixes

- Partial index on events announced ([#4856](https://github.com/Unleash/unleash/issues/4856))


## [5.5.1] - 2023-09-27

### Bug Fixes

- Account for array length ([#4849](https://github.com/Unleash/unleash/issues/4849))


### Miscellaneous Tasks

- Limit the amount of unannounced events we announce ([#4845](https://github.com/Unleash/unleash/issues/4845))


## [5.5.0] - 2023-09-27

### 1-1307

- Show info about flag naming patterns before making mistakes ([#4616](https://github.com/Unleash/unleash/issues/4616))


### 1-1315

- Revalidate feature name whenever the project changes ([#4628](https://github.com/Unleash/unleash/issues/4628))


### 1-1319

- Add feature naming pattern descriptions ([#4612](https://github.com/Unleash/unleash/issues/4612))


### 1-1320

- Allow you to update example with no pattern + update state better ([#4623](https://github.com/Unleash/unleash/issues/4623))


### 1-1329

- Return 400 when pattern is empty but example is not ([#4609](https://github.com/Unleash/unleash/issues/4609))


### 1-1333

- Fix type problems ([#4615](https://github.com/Unleash/unleash/issues/4615))


### 1-1342

- Show flag naming pattern info when you copy toggles ([#4629](https://github.com/Unleash/unleash/issues/4629))


### 1-1385

- Hide display of pattern info behind a flag ([#4744](https://github.com/Unleash/unleash/issues/4744))


### Bug Fixes

- Multiline textarea resizing for json input ([#4463](https://github.com/Unleash/unleash/issues/4463))

- Do not allow creation/update of feature toggle with invalid strategy name ([#4555](https://github.com/Unleash/unleash/issues/4555))

- Config snapshot ([#4593](https://github.com/Unleash/unleash/issues/4593))

- Add feature environment variants updated event ([#4598](https://github.com/Unleash/unleash/issues/4598))

- Reset selected toggle after archive or revive ([#4606](https://github.com/Unleash/unleash/issues/4606))

- Group roles assumption, refactor group types ([#4576](https://github.com/Unleash/unleash/issues/4576))

- Prevent 404 on auth settings hook ([#4619](https://github.com/Unleash/unleash/issues/4619))

- Api token schema ([#4633](https://github.com/Unleash/unleash/issues/4633))

- Fix failing group service test ([#4642](https://github.com/Unleash/unleash/issues/4642))

- Addon schema validation ([#4643](https://github.com/Unleash/unleash/issues/4643))

- Multi project roles UI improvements ([#4646](https://github.com/Unleash/unleash/issues/4646))

- Add experimental flag ([#4649](https://github.com/Unleash/unleash/issues/4649))

- Last seen environment remove duplicate entries ([#4663](https://github.com/Unleash/unleash/issues/4663))

- Integrations UI ([#4670](https://github.com/Unleash/unleash/issues/4670))

- API improvements aligning the types to our schemas ([#4650](https://github.com/Unleash/unleash/issues/4650))

- Post global events even when filtering by env ([#4672](https://github.com/Unleash/unleash/issues/4672))

- Validation for variant payload number type ([#4671](https://github.com/Unleash/unleash/issues/4671))

- Add additionalproperties to the sdkContextSchema ([#4682](https://github.com/Unleash/unleash/issues/4682))

- Use postmessage in slack app addon ([#4688](https://github.com/Unleash/unleash/issues/4688))

- Integrations quality updates ([#4677](https://github.com/Unleash/unleash/issues/4677))

- Include tags in variants event ([#4711](https://github.com/Unleash/unleash/issues/4711))

- Env variants event changelog ([#4712](https://github.com/Unleash/unleash/issues/4712))

- Include strategy variants in the event log ([#4716](https://github.com/Unleash/unleash/issues/4716))

- Integrations text review ([#4706](https://github.com/Unleash/unleash/issues/4706))

- Integration multiselector ([#4683](https://github.com/Unleash/unleash/issues/4683))

- Update dependency json-schema-to-ts to v2.9.2 ([#4721](https://github.com/Unleash/unleash/issues/4721))

- Update dependency db-migrate-pg to v1.3.2 ([#4720](https://github.com/Unleash/unleash/issues/4720))

- Disable all errors ([#4707](https://github.com/Unleash/unleash/issues/4707))

- Update dependency pg to v8.11.3 ([#4723](https://github.com/Unleash/unleash/issues/4723))

- Update dependency nodemailer to v6.9.5 ([#4722](https://github.com/Unleash/unleash/issues/4722))

- Variant type number duplicate options ([#4719](https://github.com/Unleash/unleash/issues/4719))

- Update dependency db-migrate to v0.11.14 ([#4724](https://github.com/Unleash/unleash/issues/4724))

- Update dependency db-migrate-pg to v1.4.2 ([#4735](https://github.com/Unleash/unleash/issues/4735))

- Update dependency express-rate-limit to v6.11.0 ([#4736](https://github.com/Unleash/unleash/issues/4736))

- Update dependency joi to v17.10.1 ([#4737](https://github.com/Unleash/unleash/issues/4737))

- Update dependency js-sha256 to ^0.10.0 ([#4740](https://github.com/Unleash/unleash/issues/4740))

- Sort toggleNames before updating last seen ([#4747](https://github.com/Unleash/unleash/issues/4747))

- Point to `useUiFlag` instead of `useUiFlags` ([#4748](https://github.com/Unleash/unleash/issues/4748))

- Round dora metrics ([#4755](https://github.com/Unleash/unleash/issues/4755))

- Misc integration-related fixes and improvements ([#4754](https://github.com/Unleash/unleash/issues/4754))

- Simplify channels logic in slack app integration ([#4756](https://github.com/Unleash/unleash/issues/4756))

- Rename Push to Environment button ([#4759](https://github.com/Unleash/unleash/issues/4759))

- Prevent blur when selecting text ([#4762](https://github.com/Unleash/unleash/issues/4762))

- Update dependency uuid to v9.0.1 ([#4793](https://github.com/Unleash/unleash/issues/4793))

- Force permissions export to only be enterprise in ui ([#4760](https://github.com/Unleash/unleash/issues/4760))

- Datadog addon needs flagResolver ([#4806](https://github.com/Unleash/unleash/issues/4806))

- String-width issue when running docker container ([#4808](https://github.com/Unleash/unleash/issues/4808))

- Project mode count even if no settings exist ([#4825](https://github.com/Unleash/unleash/issues/4825))

- Change check for slider ([#4838](https://github.com/Unleash/unleash/issues/4838))

- Empty object playground ([#4842](https://github.com/Unleash/unleash/issues/4842))

- Project features table initial state ([#4843](https://github.com/Unleash/unleash/issues/4843))


### Documentation

- Strategy variants ruby and dotnet sdk versions ([#4570](https://github.com/Unleash/unleash/issues/4570))

- Troubleshooting guides ([#4592](https://github.com/Unleash/unleash/issues/4592))

- Update compatibility matrix with strategy variants ([#4626](https://github.com/Unleash/unleash/issues/4626))

- Feature flag naming patterns ([#4632](https://github.com/Unleash/unleash/issues/4632))

- Add mention of multiple project roles ([#4648](https://github.com/Unleash/unleash/issues/4648))

- Change addons -> integrations ([#4523](https://github.com/Unleash/unleash/issues/4523))

- Add info on how to troubleshoot and better errors ([#4803](https://github.com/Unleash/unleash/issues/4803))

- Update the bulleted list case in about-the-docs.md ([#4811](https://github.com/Unleash/unleash/issues/4811))

- Create feature-flag-best-practices.md ([#4804](https://github.com/Unleash/unleash/issues/4804))

- Add Feature Flag Migration guide to docs ([#4792](https://github.com/Unleash/unleash/issues/4792))

- Unleash Slack App integration ([#4801](https://github.com/Unleash/unleash/issues/4801))

- Improve datadog integration docs ([#4802](https://github.com/Unleash/unleash/issues/4802))


### Feat

- Add prod guard when toggling envs ([#4774](https://github.com/Unleash/unleash/issues/4774))


### Features

- Import service validate duplicates ([#4558](https://github.com/Unleash/unleash/issues/4558))

- Application usage frontend ([#4561](https://github.com/Unleash/unleash/issues/4561))

- Multiple project roles ([#4512](https://github.com/Unleash/unleash/issues/4512))

- Application usage feature flag and cleanup ([#4568](https://github.com/Unleash/unleash/issues/4568))

- Close dialog when esc is pressed ([#4567](https://github.com/Unleash/unleash/issues/4567))

- Add a setting for toggling requesting additional scopes ([#4551](https://github.com/Unleash/unleash/issues/4551))

- Archive toggles in change request UI ([#4563](https://github.com/Unleash/unleash/issues/4563))

- Change request ui updates ([#4574](https://github.com/Unleash/unleash/issues/4574))

- Update breakpoint from 1260 to 1280 ([#4575](https://github.com/Unleash/unleash/issues/4575))

- DORA metrics lead time to production ([#4589](https://github.com/Unleash/unleash/issues/4589))

- Feature naming patterns ([#4591](https://github.com/Unleash/unleash/issues/4591))

- Search event log by tags ([#4604](https://github.com/Unleash/unleash/issues/4604))

- Search suggestion selectable ([#4610](https://github.com/Unleash/unleash/issues/4610))

- Add request logger env variable ([#4614](https://github.com/Unleash/unleash/issues/4614))

- Search UI improvements ([#4613](https://github.com/Unleash/unleash/issues/4613))

- Clickable search filter options ([#4618](https://github.com/Unleash/unleash/issues/4618))

- Persistent search queries ([#4624](https://github.com/Unleash/unleash/issues/4624))

- Plausible search ([#4625](https://github.com/Unleash/unleash/issues/4625))

- Jira plugin page ([#4627](https://github.com/Unleash/unleash/issues/4627))

- Integration sections ([#4631](https://github.com/Unleash/unleash/issues/4631))

- Official sdks ([#4637](https://github.com/Unleash/unleash/issues/4637))

- Integration urls, ux ([#4640](https://github.com/Unleash/unleash/issues/4640))

- Proxy and edge integration cards ([#4636](https://github.com/Unleash/unleash/issues/4636))

- Link to request integration ([#4634](https://github.com/Unleash/unleash/issues/4634))

- Edge integrations page ([#4639](https://github.com/Unleash/unleash/issues/4639))

- Add plausible to integrations ([#4647](https://github.com/Unleash/unleash/issues/4647))

- UseUiFlag shorthand hook ([#4566](https://github.com/Unleash/unleash/issues/4566))

- Remove newApplicationsList feature flag ([#4653](https://github.com/Unleash/unleash/issues/4653))

- Keyboard navigation in search ([#4651](https://github.com/Unleash/unleash/issues/4651))

- Variant with number payload ([#4654](https://github.com/Unleash/unleash/issues/4654))

- Hide project settings for OSS ([#4662](https://github.com/Unleash/unleash/issues/4662))

- Make import/export work with project patterns ([#4652](https://github.com/Unleash/unleash/issues/4652))

- Check toggle limit on import ([#4665](https://github.com/Unleash/unleash/issues/4665))

- Edge integration page ([#4657](https://github.com/Unleash/unleash/issues/4657))

- Import limit validation ([#4669](https://github.com/Unleash/unleash/issues/4669))

- Update UI to add hints about implicit ^ and $ ([#4667](https://github.com/Unleash/unleash/issues/4667))

- Add implicit surrounding `^` and `$` to patterns ([#4664](https://github.com/Unleash/unleash/issues/4664))

- Limit exclude archived features ([#4680](https://github.com/Unleash/unleash/issues/4680))

- Disallow description when no pattern exists ([#4679](https://github.com/Unleash/unleash/issues/4679))

- Add feature naming pattern tracking ([#4678](https://github.com/Unleash/unleash/issues/4678))

- Stop regexes with whitespace ([#4681](https://github.com/Unleash/unleash/issues/4681))

- Add service method to retrieve group and project access for all users ([#4708](https://github.com/Unleash/unleash/issues/4708))

- Playground custom properties are nested ([#4686](https://github.com/Unleash/unleash/issues/4686))

- Sdk flat context schema ([#4738](https://github.com/Unleash/unleash/issues/4738))

- Add a button to download user access information ([#4746](https://github.com/Unleash/unleash/issues/4746))

- Patch user access query to return projects provided by groups ([#4750](https://github.com/Unleash/unleash/issues/4750))

- Walking skeleton of private projects ([#4753](https://github.com/Unleash/unleash/issues/4753))

- Private project filtering and store implementation ([#4758](https://github.com/Unleash/unleash/issues/4758))

- Add active users statistics to metrics ([#4674](https://github.com/Unleash/unleash/issues/4674))

- Add ids to scheduled jobs ([#4764](https://github.com/Unleash/unleash/issues/4764))

- Stub for create dependent features ([#4769](https://github.com/Unleash/unleash/issues/4769))

- Persist dependent features ([#4772](https://github.com/Unleash/unleash/issues/4772))

- Implement optional json payload and template ([#4752](https://github.com/Unleash/unleash/issues/4752))

- Open-source segments 🚀 ([#4690](https://github.com/Unleash/unleash/issues/4690))

- Move middleware to enterprise ([#4767](https://github.com/Unleash/unleash/issues/4767))

- Make application usage private through project ([#4786](https://github.com/Unleash/unleash/issues/4786))

- Simpler integration filters ([#4766](https://github.com/Unleash/unleash/issues/4766))

- Client api dependent features ([#4778](https://github.com/Unleash/unleash/issues/4778))

- Private projects handle in playground ([#4791](https://github.com/Unleash/unleash/issues/4791))

- Strategy variants on strategy overview ([#4776](https://github.com/Unleash/unleash/issues/4776))

- Optimize private projects for enterprise ([#4812](https://github.com/Unleash/unleash/issues/4812))

- UI stub for adding dependent features ([#4814](https://github.com/Unleash/unleash/issues/4814))

- Add group-deleted event ([#4816](https://github.com/Unleash/unleash/issues/4816))

- Visualize feature variants on cr ([#4809](https://github.com/Unleash/unleash/issues/4809))

- Enforce no transitive parents ([#4818](https://github.com/Unleash/unleash/issues/4818))

- Add project collaboration mode to prometheus ([#4819](https://github.com/Unleash/unleash/issues/4819))

- Context/segment usage private ([#4826](https://github.com/Unleash/unleash/issues/4826))

- Delete dependency api ([#4824](https://github.com/Unleash/unleash/issues/4824))

- Add kill switch for client metrics ([#4829](https://github.com/Unleash/unleash/issues/4829))

- Add dependency dialogue ([#4828](https://github.com/Unleash/unleash/issues/4828))

- Delete all feature dependencies ([#4832](https://github.com/Unleash/unleash/issues/4832))

- Connect add dependency api ([#4831](https://github.com/Unleash/unleash/issues/4831))

- Api to list available parent options ([#4833](https://github.com/Unleash/unleash/issues/4833))

- Enforce one dependency ([#4835](https://github.com/Unleash/unleash/issues/4835))

- Show available parent dependency options ([#4837](https://github.com/Unleash/unleash/issues/4837))

- Add json editor ([#4784](https://github.com/Unleash/unleash/issues/4784))

- Inject project id to dependencies hooks ([#4839](https://github.com/Unleash/unleash/issues/4839))


### Fix

- Integrations form ([#4655](https://github.com/Unleash/unleash/issues/4655))


### Miscellaneous Tasks

- Prepare next release

- Prepare 5.4 release ([#4554](https://github.com/Unleash/unleash/issues/4554))

- Remove configurableFeatureTypeLifetimes flag ([#4569](https://github.com/Unleash/unleash/issues/4569))

- Deps update unleash client ([#4571](https://github.com/Unleash/unleash/issues/4571))

- Remove duplicated tags ([#4580](https://github.com/Unleash/unleash/issues/4580))

- Return 404 when projectid not found ([#4581](https://github.com/Unleash/unleash/issues/4581))

- Change request flags removed ([#4601](https://github.com/Unleash/unleash/issues/4601))

- Strategy variant flag removed ([#4603](https://github.com/Unleash/unleash/issues/4603))

- Token api simplification ([#4600](https://github.com/Unleash/unleash/issues/4600))

- Show short error message when validation fails ([#4617](https://github.com/Unleash/unleash/issues/4617))

- Return 404 when adding environment to project that doesnt exist ([#4635](https://github.com/Unleash/unleash/issues/4635))

- Explain implicit ^ and $ in docs ([#4668](https://github.com/Unleash/unleash/issues/4668))

- Update design for feature naming pattern info ([#4656](https://github.com/Unleash/unleash/issues/4656))

- Dora cleanup ([#4676](https://github.com/Unleash/unleash/issues/4676))

- Merge one of with properties ([#4763](https://github.com/Unleash/unleash/issues/4763))

- Improve access service ([#4689](https://github.com/Unleash/unleash/issues/4689))

- Improve access service iter 2 ([#4779](https://github.com/Unleash/unleash/issues/4779))

- Remove project select ([#4768](https://github.com/Unleash/unleash/issues/4768))

- GA (remove flag) for Slack App integration ([#4765](https://github.com/Unleash/unleash/issues/4765))

- Doc only should skip build ([#4820](https://github.com/Unleash/unleash/issues/4820))

- Pin @swc/core to v1.3.83 ([#4823](https://github.com/Unleash/unleash/issues/4823))

- Revert #4823 and bump @swc/core to 1.3.88 ([#4827](https://github.com/Unleash/unleash/issues/4827))

- Pin node version 18.17.1 ([#4834](https://github.com/Unleash/unleash/issues/4834))


### Refactor

- Clean up some unused imports ([#4597](https://github.com/Unleash/unleash/issues/4597))

- Instance health cleanup ([#4602](https://github.com/Unleash/unleash/issues/4602))

- Use conditionally render instead of && ([#4620](https://github.com/Unleash/unleash/issues/4620))

- Clean up no longer used PAT methods ([#4621](https://github.com/Unleash/unleash/issues/4621))

- Simplify flag naming tooltip ([#4685](https://github.com/Unleash/unleash/issues/4685))

- Remove check for feature naming data object ([#4745](https://github.com/Unleash/unleash/issues/4745))

- Feature oriented architecture for feature dependencies ([#4771](https://github.com/Unleash/unleash/issues/4771))

- Contract event group deleted after #4816 ([#4817](https://github.com/Unleash/unleash/issues/4817))


### Testing

- Enforce behavior via test ([#4701](https://github.com/Unleash/unleash/issues/4701))


### UI

- Make project settings / creation form full-width ([#4675](https://github.com/Unleash/unleash/issues/4675))


### Openapi

- Sort tags file ([#4595](https://github.com/Unleash/unleash/issues/4595))


### Task

- Added workflow for calling update-version-action ([#4805](https://github.com/Unleash/unleash/issues/4805))


## [5.4.4] - 2023-09-15

### Bug Fixes

- Include tags in variants event ([#4711](https://github.com/Unleash/unleash/issues/4711))


## [5.4.3] - 2023-09-12

### Bug Fixes

- Last seen environment remove duplicate entries ([#4663](https://github.com/Unleash/unleash/issues/4663))


## [5.4.2] - 2023-09-04

### Bug Fixes

- Add feature environment variants updated event ([#4598](https://github.com/Unleash/unleash/issues/4598))


## [5.4.1] - 2023-08-25

### Features

- Cherry pick configurableFeatureTypeLifetimes ([#4572](https://github.com/Unleash/unleash/issues/4572))

- Add a setting for toggling requesting additional scopes ([#4551](https://github.com/Unleash/unleash/issues/4551)) ([#4573](https://github.com/Unleash/unleash/issues/4573))


## [5.4.0] - 2023-08-23

### #4209

- Add 'add to draft' button for segments. ([#4400](https://github.com/Unleash/unleash/issues/4400))


### 1-1192

- Track the feature type and the new lifetime ([#4395](https://github.com/Unleash/unleash/issues/4395))


### Bug Fixes

- Default strategy stickiness ([#4340](https://github.com/Unleash/unleash/issues/4340))

- Client metrics name validation ([#4339](https://github.com/Unleash/unleash/issues/4339)) ([#4342](https://github.com/Unleash/unleash/issues/4342))

- Sync enabled and variant status ([#4345](https://github.com/Unleash/unleash/issues/4345))

- Do not split non string values ([#4346](https://github.com/Unleash/unleash/issues/4346))

- Frontend variant weights distribution ([#4347](https://github.com/Unleash/unleash/issues/4347))

- Stable bulk updates ([#4352](https://github.com/Unleash/unleash/issues/4352))

- Update dependency nodemailer to v6.9.4 ([#4362](https://github.com/Unleash/unleash/issues/4362))

- UI improvements on CR reorder strategy ([#4375](https://github.com/Unleash/unleash/issues/4375))

- Update dependency unleash-client to v4.1.0 ([#4373](https://github.com/Unleash/unleash/issues/4373))

- EventStore#getMaxRevisionId can return null ([#4384](https://github.com/Unleash/unleash/issues/4384))

- Password hash is null should yield PasswordMissmatch ([#4392](https://github.com/Unleash/unleash/issues/4392))

- Update dependency express-rate-limit to v6.8.1 ([#4406](https://github.com/Unleash/unleash/issues/4406))

- Environment id missing bug ([#4397](https://github.com/Unleash/unleash/issues/4397))

- Remove lastSeenAt when exporting FeatureEnvironment ([#4416](https://github.com/Unleash/unleash/issues/4416))

- Dot in context fields ([#4434](https://github.com/Unleash/unleash/issues/4434))

- Added cursor pagination to slackapp conversations query ([#4442](https://github.com/Unleash/unleash/issues/4442))

- Deletion validation didnt account for groups ([#4441](https://github.com/Unleash/unleash/issues/4441))

- Performance improvements for demo and docs update ([#4454](https://github.com/Unleash/unleash/issues/4454))

- Demo for old variants ([#4455](https://github.com/Unleash/unleash/issues/4455))

- CR strategy name changes code ([#4449](https://github.com/Unleash/unleash/issues/4449))

- Proper aggregation of strategies ([#4456](https://github.com/Unleash/unleash/issues/4456))

- Disable Edit constraint when context field was deleted ([#4460](https://github.com/Unleash/unleash/issues/4460))

- Plain link for read about ([#4470](https://github.com/Unleash/unleash/issues/4470))

- Remove lastSeenAt from useCollaborateData.tsx staleness check ([#4461](https://github.com/Unleash/unleash/issues/4461))

- Strategy variants in demo link to new variants ([#4477](https://github.com/Unleash/unleash/issues/4477))

- Diff no changes ([#4480](https://github.com/Unleash/unleash/issues/4480))

- Add timezones to timestamps ([#4488](https://github.com/Unleash/unleash/issues/4488))

- Change slackapp to using scheduleMessage ([#4490](https://github.com/Unleash/unleash/issues/4490))

- Update slack-app tests to reflect what we now do

- Update dependency @svgr/webpack to v8 ([#4407](https://github.com/Unleash/unleash/issues/4407))

- Update dependency pg to v8.11.2 ([#4509](https://github.com/Unleash/unleash/issues/4509))

- Update dependency pg-connection-string to v2.6.2 ([#4510](https://github.com/Unleash/unleash/issues/4510))

- Update dependency express-rate-limit to v6.9.0 ([#4516](https://github.com/Unleash/unleash/issues/4516))

- Set css preload to false ([#4524](https://github.com/Unleash/unleash/issues/4524))

- Disallow empty summaries and descriptions ([#4529](https://github.com/Unleash/unleash/issues/4529))

- Highlighter casing ([#4543](https://github.com/Unleash/unleash/issues/4543))

- Import duplicate features ([#4550](https://github.com/Unleash/unleash/issues/4550))

- Diff component for ordering ([#4552](https://github.com/Unleash/unleash/issues/4552))


### Documentation

- Strategy variants ([#4289](https://github.com/Unleash/unleash/issues/4289))

- Strategy variants in 5.4 ([#4372](https://github.com/Unleash/unleash/issues/4372))

- Edge updates for docs/proxy-hosting ([#4275](https://github.com/Unleash/unleash/issues/4275))

- Update strategy variants sdks and add sidebar link ([#4436](https://github.com/Unleash/unleash/issues/4436))

- Custom root roles ([#4451](https://github.com/Unleash/unleash/issues/4451))

- Change requests for segments ([#4476](https://github.com/Unleash/unleash/issues/4476))


### Feat

- Strategy variant slider ([#4344](https://github.com/Unleash/unleash/issues/4344))

- Last seen in feature environment ([#4391](https://github.com/Unleash/unleash/issues/4391))

- Last seen by env UI ([#4439](https://github.com/Unleash/unleash/issues/4439))

- Toggle overview env last seen ([#4445](https://github.com/Unleash/unleash/issues/4445))

- Last seen toggle list ([#4541](https://github.com/Unleash/unleash/issues/4541))


### Features

- Change Request on Reorder UI ([#4249](https://github.com/Unleash/unleash/issues/4249))

- Incrementing sort order for strategies ([#4343](https://github.com/Unleash/unleash/issues/4343))

- Strategy variants infop ([#4348](https://github.com/Unleash/unleash/issues/4348))

- Strategy variants alert ([#4371](https://github.com/Unleash/unleash/issues/4371))

- Segments service DI ([#4376](https://github.com/Unleash/unleash/issues/4376))

- Add last_seen_at column to feature_environments ([#4387](https://github.com/Unleash/unleash/issues/4387))

- Optional change request feature ([#4394](https://github.com/Unleash/unleash/issues/4394))

- Add lastSeenByEnvironment flag ([#4393](https://github.com/Unleash/unleash/issues/4393))

- Allow trust proxy ([#4396](https://github.com/Unleash/unleash/issues/4396))

- Protect segment operations for change requests ([#4417](https://github.com/Unleash/unleash/issues/4417))

- Segments in pending CR screen ([#4420](https://github.com/Unleash/unleash/issues/4420))

- Strategy variants events ([#4430](https://github.com/Unleash/unleash/issues/4430))

- Add prom metric for total custom root roles ([#4435](https://github.com/Unleash/unleash/issues/4435))

- Add prom metric for total custom root roles in use ([#4438](https://github.com/Unleash/unleash/issues/4438))

- Default strategy variant ([#4443](https://github.com/Unleash/unleash/issues/4443))

- Bulk archive usage warning ([#4448](https://github.com/Unleash/unleash/issues/4448))

- Pointer to strategy variants ([#4440](https://github.com/Unleash/unleash/issues/4440))

- Demo for strategy variants ([#4457](https://github.com/Unleash/unleash/issues/4457))

- Cr sidebar segments count ([#4466](https://github.com/Unleash/unleash/issues/4466))

- Count segment changes ([#4468](https://github.com/Unleash/unleash/issues/4468))

- Delete segment from CR ([#4469](https://github.com/Unleash/unleash/issues/4469))

- Segment constraints in UI ([#4472](https://github.com/Unleash/unleash/issues/4472))

- Track read about ([#4478](https://github.com/Unleash/unleash/issues/4478))

- Add margin for segment constraints ([#4481](https://github.com/Unleash/unleash/issues/4481))

- Use update count in cr summary ([#4482](https://github.com/Unleash/unleash/issues/4482))

- Change request rejected event ([#4485](https://github.com/Unleash/unleash/issues/4485))

- Change request rejections db table ([#4486](https://github.com/Unleash/unleash/issues/4486))

- Change request reject UI ([#4489](https://github.com/Unleash/unleash/issues/4489))

- Reject change request dialog ([#4491](https://github.com/Unleash/unleash/issues/4491))

- Do not update every second ([#4492](https://github.com/Unleash/unleash/issues/4492))

- Link to change request configuration ([#4494](https://github.com/Unleash/unleash/issues/4494))

- Enable migration lock by default ([#4495](https://github.com/Unleash/unleash/issues/4495))

- Disable scheduler for tests ([#4496](https://github.com/Unleash/unleash/issues/4496))

- Change request reject docs and step update ([#4493](https://github.com/Unleash/unleash/issues/4493))

- Get api tokens by name ([#4507](https://github.com/Unleash/unleash/issues/4507))

- Review buttons makeover ([#4513](https://github.com/Unleash/unleash/issues/4513))

- Reject timeline state ([#4517](https://github.com/Unleash/unleash/issues/4517))

- Add usage info to project role deletion dialog ([#4464](https://github.com/Unleash/unleash/issues/4464))

- Create client_applications_usage table migration ([#4521](https://github.com/Unleash/unleash/issues/4521))

- Application usage new ui ([#4528](https://github.com/Unleash/unleash/issues/4528))

- Slack-app can now post to both tagged and default channel ([#4520](https://github.com/Unleash/unleash/issues/4520))

- Features overwrite warning ([#4535](https://github.com/Unleash/unleash/issues/4535))

- Persist client application usage ([#4534](https://github.com/Unleash/unleash/issues/4534))

- Last seen for toggles that have an old usage reported ([#4538](https://github.com/Unleash/unleash/issues/4538))

- Last seen per environment health ([#4539](https://github.com/Unleash/unleash/issues/4539))

- Last seen per environment archive ([#4540](https://github.com/Unleash/unleash/issues/4540))

- More powerful project search ([#4542](https://github.com/Unleash/unleash/issues/4542))

- Change request advanced search and filter ([#4544](https://github.com/Unleash/unleash/issues/4544))

- Applicaton usage endpoint ([#4548](https://github.com/Unleash/unleash/issues/4548))


### Miscellaneous Tasks

- Enable strict schema validation by default and fix ([#4355](https://github.com/Unleash/unleash/issues/4355))

- Clean client api flag removed ([#4368](https://github.com/Unleash/unleash/issues/4368))

- Add debug information to slack addon ([#4379](https://github.com/Unleash/unleash/issues/4379))

- Add more debug logs ([#4388](https://github.com/Unleash/unleash/issues/4388))

- Update orval types ([#4402](https://github.com/Unleash/unleash/issues/4402))

- Reduce build time ([#4405](https://github.com/Unleash/unleash/issues/4405))

- Increase max app names to 1000 ([#4421](https://github.com/Unleash/unleash/issues/4421))

- Simplify coverage report ([#4429](https://github.com/Unleash/unleash/issues/4429))

- Update orval with latest change request schema updates ([#4446](https://github.com/Unleash/unleash/issues/4446))

- Remove customRootRoles flag in favor of killswitch ([#4431](https://github.com/Unleash/unleash/issues/4431))

- Fix formatting of openapi description ([#4503](https://github.com/Unleash/unleash/issues/4503))

- Remove `additionalProperterties: true` annotation. ([#4508](https://github.com/Unleash/unleash/issues/4508))

- Remove newProjectLayout flag ([#4536](https://github.com/Unleash/unleash/issues/4536))

- Remove emitPotentiallyStaleEvents flag ([#4537](https://github.com/Unleash/unleash/issues/4537))


### OpenAPI

- Clean up remaining schemas, part 1 ([#4351](https://github.com/Unleash/unleash/issues/4351))

- More schema cleanup ([#4353](https://github.com/Unleash/unleash/issues/4353))

- Remaining schema updates ([#4354](https://github.com/Unleash/unleash/issues/4354))

- Add operation tests: require summaries and descriptions ([#4377](https://github.com/Unleash/unleash/issues/4377))


### Testing

- Default strategy stickiness ([#4341](https://github.com/Unleash/unleash/issues/4341))

- Matching variants ([#4349](https://github.com/Unleash/unleash/issues/4349))

- Fix import and access e2e tests due to recent changes ([#4467](https://github.com/Unleash/unleash/issues/4467))


### Meta

- Add CODEOWNERS and set thomas as docs owner ([#4418](https://github.com/Unleash/unleash/issues/4418))


### Openapi

- Add new tags for API operations. ([#4432](https://github.com/Unleash/unleash/issues/4432))

- Stabilize playground + feature types endpoints ([#4433](https://github.com/Unleash/unleash/issues/4433))


## [5.3.5] - 2023-08-15

### Bug Fixes

- Change slackapp to using scheduleMessage ([#4490](https://github.com/Unleash/unleash/issues/4490))


## [5.3.4] - 2023-08-11

### Bug Fixes

- Added cursor pagination to slackapp conversations query ([#4442](https://github.com/Unleash/unleash/issues/4442))


## [5.3.3] - 2023-08-02

### Bug Fixes

- EventStore#getMaxRevisionId can return null ([#4384](https://github.com/Unleash/unleash/issues/4384))


## [5.3.2] - 2023-07-26

### Bug Fixes

- Playground variants


## [5.3.1] - 2023-07-25

### Bug Fixes

- Default stickiness

- Client metrics name validation ([#4339](https://github.com/Unleash/unleash/issues/4339)) ([#4342](https://github.com/Unleash/unleash/issues/4342))


## [5.3.0] - 2023-07-25

### #4205

- Add flag for emitting potentially stale events ([#4237](https://github.com/Unleash/unleash/issues/4237))

- Update to prepare for emitting potentially stale events ([#4239](https://github.com/Unleash/unleash/issues/4239))

- Activate event emission ([#4240](https://github.com/Unleash/unleash/issues/4240))

- Add openapi definition for the new endpoint ([#4256](https://github.com/Unleash/unleash/issues/4256))


### Bug Fixes

- Default email sender to getunleash.io domain ([#3739](https://github.com/Unleash/unleash/issues/3739))

- Metrics performance patch ([#4108](https://github.com/Unleash/unleash/issues/4108))

- Project 404 ([#4114](https://github.com/Unleash/unleash/issues/4114))

- Default strategy groupId failure ([#4120](https://github.com/Unleash/unleash/issues/4120))

- Demo flow with split strategy button by making step optional ([#4125](https://github.com/Unleash/unleash/issues/4125))

- SERVER_KEEPALIVE_TIMEOUT env variable should be seconds ([#4130](https://github.com/Unleash/unleash/issues/4130))

- Improve users search ([#4131](https://github.com/Unleash/unleash/issues/4131))

- Add resolution for semver

- Change to the proper author ([#4141](https://github.com/Unleash/unleash/issues/4141))

- Hide users list extra searchable columns ([#4142](https://github.com/Unleash/unleash/issues/4142))

- Ensure userId context exists when running demo ([#4144](https://github.com/Unleash/unleash/issues/4144))

- Some security vulnerabilities ([#4143](https://github.com/Unleash/unleash/issues/4143))

- Add resolution for semver

- Disallow deletion of single login history entries ([#4149](https://github.com/Unleash/unleash/issues/4149))

- Avoid expression injection ([#4157](https://github.com/Unleash/unleash/issues/4157))

- Update yarn.lock ([#4160](https://github.com/Unleash/unleash/issues/4160))

- Added service-account events ([#4164](https://github.com/Unleash/unleash/issues/4164))

- Add change-edited event

- Disallow deletion of all login history entries ([#4159](https://github.com/Unleash/unleash/issues/4159))

- Project tokens can now be created with the correct permissions ([#4165](https://github.com/Unleash/unleash/issues/4165))

- Initial playground env ([#4167](https://github.com/Unleash/unleash/issues/4167))

- Resolution for semver in docker as well ([#4168](https://github.com/Unleash/unleash/issues/4168))

- Update dependency pg to v8.11.1 ([#4172](https://github.com/Unleash/unleash/issues/4172))

- Bulk tags will work now with project permissions ([#4177](https://github.com/Unleash/unleash/issues/4177))

- Validate min constraint values in openapi ([#4179](https://github.com/Unleash/unleash/issues/4179))

- Remove dangerouslySetInnerHTML ([#4181](https://github.com/Unleash/unleash/issues/4181))

- Only load if document present

- Do not include rio server-side

- Constraint validation affecting disabled button ([#4183](https://github.com/Unleash/unleash/issues/4183))

- Update dependency pg-connection-string to v2.6.1 ([#4173](https://github.com/Unleash/unleash/issues/4173))

- Delete project dialog cancel redirect ([#4184](https://github.com/Unleash/unleash/issues/4184))

- Add focus style to vertical tabs ([#4186](https://github.com/Unleash/unleash/issues/4186))

- Correct escaping of ui flags for plausible ([#3907](https://github.com/Unleash/unleash/issues/3907))

- Missing flags ([#4214](https://github.com/Unleash/unleash/issues/4214))

- Return 400 on incorrect client metrics input ([#4193](https://github.com/Unleash/unleash/issues/4193))

- Reduce severity of api token middleware errors ([#4216](https://github.com/Unleash/unleash/issues/4216))

- Min items was breaking import ([#4219](https://github.com/Unleash/unleash/issues/4219))

- Existing stickiness value should be available in the dropdown  ([#4228](https://github.com/Unleash/unleash/issues/4228))

- Feature OpenAPI endpoints - project related ([#4212](https://github.com/Unleash/unleash/issues/4212))

- Reactive stickiness strategy variants ([#4255](https://github.com/Unleash/unleash/issues/4255))

- Unwrap create strategy event creation (bug) ([#4264](https://github.com/Unleash/unleash/issues/4264))

- DigitalOcean template ([#4287](https://github.com/Unleash/unleash/issues/4287))

- Update dependency express-rate-limit to v6.7.1 ([#4301](https://github.com/Unleash/unleash/issues/4301))

- Variant table deadlocks ([#4309](https://github.com/Unleash/unleash/issues/4309))

- Update dependency knex to v2.5.1 ([#4322](https://github.com/Unleash/unleash/issues/4322))

- Group cleanup ([#4334](https://github.com/Unleash/unleash/issues/4334))

- Missing events in the event store ([#4335](https://github.com/Unleash/unleash/issues/4335))

- Global role is called root role ([#4336](https://github.com/Unleash/unleash/issues/4336))

- Drop staleness column form features archive ([#4338](https://github.com/Unleash/unleash/issues/4338))

- 404 in dark theme ([#4337](https://github.com/Unleash/unleash/issues/4337))

- Addons toggle ([#4312](https://github.com/Unleash/unleash/issues/4312))


### Chore

- Add configurable feature type lifetimes flag ([#4253](https://github.com/Unleash/unleash/issues/4253))

- Move event types into a separate reference doc. ([#4268](https://github.com/Unleash/unleash/issues/4268))


### Documentation

- Context api tag ([#4117](https://github.com/Unleash/unleash/issues/4117))

- Not on latest unleash with openapi enabeld ([#4024](https://github.com/Unleash/unleash/issues/4024))

- Auth tag ([#4126](https://github.com/Unleash/unleash/issues/4126))

- Documentation around metrics API ([#4134](https://github.com/Unleash/unleash/issues/4134))

- Switch order of api doc sidebar items; put legacy docs under legacy header ([#4135](https://github.com/Unleash/unleash/issues/4135))

- Events tag ([#4152](https://github.com/Unleash/unleash/issues/4152))

- Project overview ([#4176](https://github.com/Unleash/unleash/issues/4176))

- Add description to requests per seconds schemas ([#4182](https://github.com/Unleash/unleash/issues/4182))

- Add descriptions and examples to tag schemas ([#4194](https://github.com/Unleash/unleash/issues/4194))

- Add impression events as supported in the java sdk ([#4213](https://github.com/Unleash/unleash/issues/4213))

- Update proxy hosting to point to Frontend API ([#4191](https://github.com/Unleash/unleash/issues/4191))

- Suggest to use strategy constraints instead of custom strategies ([#4215](https://github.com/Unleash/unleash/issues/4215))

- Highlight unleash edge ([#4229](https://github.com/Unleash/unleash/issues/4229))

- Add description of how to install jira cloud plugin ([#4197](https://github.com/Unleash/unleash/issues/4197))

- Update playground docs to mention advanced features ([#4266](https://github.com/Unleash/unleash/issues/4266))

- Update postgres ssl docs to accurately use ca over key ([#4271](https://github.com/Unleash/unleash/issues/4271))

- Document feature potentially stale on events ([#4278](https://github.com/Unleash/unleash/issues/4278))


### Features

- Responsive strategy icons ([#4121](https://github.com/Unleash/unleash/issues/4121))

- Remove experimental flag for telemetry ([#4123](https://github.com/Unleash/unleash/issues/4123))

- Frontend api openapi spec ([#4133](https://github.com/Unleash/unleash/issues/4133))

- Improve demo welcome screen options ([#4132](https://github.com/Unleash/unleash/issues/4132))

- Advanced playground UI tweaks ([#4136](https://github.com/Unleash/unleash/issues/4136))

- Hovering over feature shows full feature name ([#4138](https://github.com/Unleash/unleash/issues/4138))

- Openapi schema for user admin ([#4146](https://github.com/Unleash/unleash/issues/4146))

- User openapi spec ([#4162](https://github.com/Unleash/unleash/issues/4162))

- No results on playground error ([#4170](https://github.com/Unleash/unleash/issues/4170))

- Show username and email in name column (users tables) ([#4180](https://github.com/Unleash/unleash/issues/4180))

- Project UI rework, move edit and delete buttons deeper ([#4195](https://github.com/Unleash/unleash/issues/4195))

- Strategy variant test UI ([#4199](https://github.com/Unleash/unleash/issues/4199))

- Project feature limit UI ([#4220](https://github.com/Unleash/unleash/issues/4220))

- Sort feature strategies ([#4218](https://github.com/Unleash/unleash/issues/4218))

- Strategy variant migrations ([#4225](https://github.com/Unleash/unleash/issues/4225))

- Add slackAppAddon feature flag ([#4235](https://github.com/Unleash/unleash/issues/4235))

- Feature creation limit crud together with frontend ([#4221](https://github.com/Unleash/unleash/issues/4221))

- Strategy variant schema openapi ([#4232](https://github.com/Unleash/unleash/issues/4232))

- Persist strategy variants ([#4236](https://github.com/Unleash/unleash/issues/4236))

- Slack App addon ([#4238](https://github.com/Unleash/unleash/issues/4238))

- Client api with proper client segments and strategy variants ([#4244](https://github.com/Unleash/unleash/issues/4244))

- Strategy variant UI spike ([#4246](https://github.com/Unleash/unleash/issues/4246))

- Strategy variants stickiness ([#4250](https://github.com/Unleash/unleash/issues/4250))

- AdvancedPlayground flag used only for runtime control ([#4262](https://github.com/Unleash/unleash/issues/4262))

- Group schema updates ([#4258](https://github.com/Unleash/unleash/issues/4258))

- Feature toggle type - edit form ([#4269](https://github.com/Unleash/unleash/issues/4269))

- Improve slack app addon scalability ([#4284](https://github.com/Unleash/unleash/issues/4284))

- Strategy variants in playground ([#4281](https://github.com/Unleash/unleash/issues/4281))

- Feature type lifetime API integration ([#4295](https://github.com/Unleash/unleash/issues/4295))

- Slack app addon default channels ([#4308](https://github.com/Unleash/unleash/issues/4308))


### Fix

- Variants-batch ([#4222](https://github.com/Unleash/unleash/issues/4222))

- Wrap reorder event to strategy variant feature ([#4265](https://github.com/Unleash/unleash/issues/4265))


### Miscellaneous Tasks

- Remove sync to enterprise from release branches ([#4112](https://github.com/Unleash/unleash/issues/4112))

- Remove unused imports from `yarn lint` ([#4082](https://github.com/Unleash/unleash/issues/4082))

- Openapi docs for archive ([#4127](https://github.com/Unleash/unleash/issues/4127))

- Bump semver from 7.5.2 to 7.5.3 in /frontend ([#4088](https://github.com/Unleash/unleash/issues/4088))

- Change request info ([#3971](https://github.com/Unleash/unleash/issues/3971))

- Document endpoint tagged Unstable ([#4118](https://github.com/Unleash/unleash/issues/4118))

- Add debug information ([#4140](https://github.com/Unleash/unleash/issues/4140))

- Avoids code injection through git commit ([#4147](https://github.com/Unleash/unleash/issues/4147))

- Add paths-ignore to more workflows ([#4041](https://github.com/Unleash/unleash/issues/4041))

- Remove group root role toggle ([#4026](https://github.com/Unleash/unleash/issues/4026))

- Remove OpenAPI snapshot tests ([#4153](https://github.com/Unleash/unleash/issues/4153))

- Add reo to docs

- Openapai favorite endpoints ([#4189](https://github.com/Unleash/unleash/issues/4189))

- Datadog addon, ability to include source type name ([#4196](https://github.com/Unleash/unleash/issues/4196))

- Add auto-generated doc index to gitignore ([#4198](https://github.com/Unleash/unleash/issues/4198))

- Mark potentially stale features ([#4217](https://github.com/Unleash/unleash/issues/4217))

- Update demo qr ([#4241](https://github.com/Unleash/unleash/issues/4241))

- Remove context/segment usage flag ([#4242](https://github.com/Unleash/unleash/issues/4242))

- Remove split button strategy flag ([#4245](https://github.com/Unleash/unleash/issues/4245))

- Prepare next release ([#4257](https://github.com/Unleash/unleash/issues/4257))

- Update OpenAPI definitions generated for frontend ([#4283](https://github.com/Unleash/unleash/issues/4283))


### Refactor

- Roles - make better plan assumptions ([#4113](https://github.com/Unleash/unleash/issues/4113))

- Clean up deprecated permissions ([#4124](https://github.com/Unleash/unleash/issues/4124))

- Use `requestType` instead of `isAdmin`, `optionalIncludes` ([#4115](https://github.com/Unleash/unleash/issues/4115))

- Split NoAccessError into ForbiddenError + PermissionError ([#4190](https://github.com/Unleash/unleash/issues/4190))

- Move status codes into classes ([#4200](https://github.com/Unleash/unleash/issues/4200))

- Error param prop ([#4247](https://github.com/Unleash/unleash/issues/4247))


### Testing

- Don't use multiple expect.stringContaining in one statement ([#4158](https://github.com/Unleash/unleash/issues/4158))

- Add some basic tests to the new slack app ([#4259](https://github.com/Unleash/unleash/issues/4259))


### A11y

- Change the playground diff link to be a button. ([#4274](https://github.com/Unleash/unleash/issues/4274))


### Bug

- Mark descriptions on strategies as nullable ([#4156](https://github.com/Unleash/unleash/issues/4156))


### Openapi

- `strategies` tag ([#4116](https://github.com/Unleash/unleash/issues/4116))

- Update API tokens tag ([#4137](https://github.com/Unleash/unleash/issues/4137))

- Update tag description ([#4178](https://github.com/Unleash/unleash/issues/4178))

- Update misc 'features'-tagged endpoints ([#4192](https://github.com/Unleash/unleash/issues/4192))

- Update the splash endpoints and schemas for splash ([#4227](https://github.com/Unleash/unleash/issues/4227))

- Document operations for admin ui feedback ([#4226](https://github.com/Unleash/unleash/issues/4226))

- Update ui-config endpoints ([#4280](https://github.com/Unleash/unleash/issues/4280))

- Remove all the extra data info ([#4277](https://github.com/Unleash/unleash/issues/4277))


### Semver

- Pin at ^7.5.3


### Task

- Add customHeaders as possible parameter. ([#4139](https://github.com/Unleash/unleash/issues/4139))


### Ux

- Return better error message if a segment doesn't exist ([#4122](https://github.com/Unleash/unleash/issues/4122))


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

## 4.2.0

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

## 4.1.4

- feat: Move environments to enterprise (#935)
- fix: correct failing feature toggle test
- fix: Cleanup new features API with env support (#929)

## 4.1.3

- fix: Added indices and primary key to feature_tag (#936)
- fix: failing test
- fix: add resetDb to migrator
- Set default SMTP port to 587 instead of 567
- docs: add react-sdk to proxy docs.
- Update README.md

## 4.1.2

- chore: update frontend
- fix: fine tune db-config based on experience
- chore: trigger docs generation
- fix: set DEPLOYMENT_BRANCH for docusaurus
- fix: upgrade docusaurus to 2.0.0-beta.5
- fix: addon-service should only trigger enabled addons
- fix: improve performance for fetching active api tokens
- Fix/sso docs (#931)
- chore(deps): bump tar from 6.1.7 to 6.1.11 (#930)

## 4.1.1

- chore: update frontend
- fix: set correct projects count in metrics

## 4.1.0

- docs: Added mikefrancis/laravel-unleash (#927)


## 4.1.0-beta.15

- chore: update frontend
- fix: make sure exising projects get :global: env automatically
- docs: cleanup unleash-hosted refereces

## 4.1.0-beta.14

- fix: upgrade unleash-frontend to v4.1.0-beta.10
- fix: correct data format for FEATURE_CREATED event

##  4.1.0-beta.13

- chore: update frontend

##  4.1.0-beta.12

- chore: update frontend
- fix: oas docs on root
- Revert "fix: oas being overriden"
- fix: oas being overriden
- fix: only add strategies to addon texts when available
- fix: add user and project counters
- fix: import schema needs to understand :global: env
- fix: import should not drop built-in strategies

## 4.1.0-beta.11

- fix: bump unleash-frontend to 4.1.0-beta.7
- Update index.md
- Update feature-toggles-archive-api.md
- Update configuring-unleash.md

## 4.1.0-beta.10

- chore: update yarn.lock
- Fix/feature events (#924)
- fix: getFeatureToggleAdmin should include project

## 4.1.0-beta.9

- fix: upgrade unleash-frontend to version 4.1.0-beta.5

## 4.1.0-beta.8

- chore: update unleash-frontend
- Update README.md
- Update README.md
- Fix/switch project endpoint (#923)
- fix: only update name if not undefined

## 4.1.0-beta.7

- feat: sync fields when logging in via SSO (#916)
 
## 4.1.0-beta.6

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

## 4.1.0-beta.5

- fix: adjust logo in emails
- Revert "fix: uri encode smtp connection string (#901)"
- 
## 4.1.0-beta.4

- fix: Clean up exported types even more

## 4.1.0-beta.3

- fix: exported types x2

## 4.1.0-beta.2
- fix: export types from main entry

## 4.1.0-beta.1
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


## 4.1.0-beta.0

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

## 4.0.6-beta.1

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

## 4.0.4

- fix: userFeedback should not be allowed to throw
- fix: make sure routes/user handles api calls

## 4.0.3

- feat: pnps feedback (#862)
- fix: upgrade unleash-frontend to v4.0.4
- chore: docs updates

## 4.0.2

- fix: upgrade unleash-frontend to version 4.0.1
- fix: projects needs at least one owner

## 4.0.1

- fix: create config should allow all options params
- fix: a lot of minor docs improvements

## 4.0.0

- fix: upgrade unleash-frontend to version 4.0.0
- fix: add migration (#847)
- fix: Refactor/update email (#848)
- chore(deps): bump hosted-git-info from 2.8.8 to 2.8.9 in /website (#843)
- Add explanation of how to run multiple instances of Unleash to the Getting Started doc (#845

## 4.0.0-beta.6

- fix: Upgrade unleash-frontend to version 4.0.0-beta.5
- fix: Update docs to prepare for version 4

## 4.0.0-beta.5

- fix: upgrade to unleash-frontend 4.0.0-beta.4
- fix: versionInfo as part of ui-config
- fix: misunderstanding node URL api
- fix: demo auth type should support api token

## 4.0.0-beta.4

- upgrade unleash-frontend to version 4.0.0-beta.3
- fix: convert to typescript
- fix: report email as not sent to fe if it throws (#844)

## 4.0.0-beta.3

- chore: update changelog
- fix: reset-token-service should use unleashUrl
- chore: expose an endpoint to really delete a toggle (#808)
- fix: upgrade unleash-frontend to version 4.0.0-beta.2

## 4.0.0-beta.1

- fix: upgrade unleash-frontend to version 4.0.0-beta.0
- fix: rbac now checks permission for both projects (#838)
- fix: an hour is 3600000 seconds not 60000 seconds
- fix: readd support for DATABASE_URL_FILE

## 4.0.0-beta.0

- fix: reload of admin/api page yields 404

## 4.0.0-alpha.8

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

## 4.0.0-alpha.7

- fix: more types
- fix: move permission to types
- fix: bump unleash-frontend to version 4.0.0-alpha.12
- fix: catch all route only for baseUriPath (#825)
- Feat/serve frontend with baseuri (#824)
- fix: define root role by setting the name of the role (#823)
- feat: automatically add all existing users as owners to all existing … (#818)
- fix: project store was wrongly typing its id field as number (#822)

## 4.0.0-alpha.6

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

## 4.0.0-alpha.5

- chore: update frontend

## 4.0.0-alpha.4

- feat: add option for LOG_LEVEL (#803)
- fix: make users emails case-insensitive (#804)
- fix: update unleash-frontend
- fix: emailservice now just returns if email was configured
- fix: simplify isConfigured check
- fix: loading of emailtemplates

## 4.0.0-alpha.3

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
