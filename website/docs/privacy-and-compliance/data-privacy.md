---
title: Data and privacy
pagination_next: privacy-and-compliance/compliance-overview
---

At Unleash, we prioritize the privacy and security of our customers' data. Our [architecture](/concepts) ensures privacy by evaluating feature flags locally within the [client SDKs](/sdks) or [Unleash Edge](/unleash-edge), meaning no user data is shared with the Unleash instance.

:::info

Unleash does not collect any personally identifiable information (PII).

:::

Unleash collects anonymous usage counts to help measure usage statistics and improve the product. The following sections explain what data we collect and how you can manage data collection settings.

## What data is collected

When running Unleash, we collect the following data:

### Version and instance ID

We collect a unique identifier and version number for your Unleash instance. This ID allows us to measure usage statistics and the adoption of Unleash across different installations. It also helps us ensure that you’re using the latest version with the most up-to-date features and security enhancements.

### Feature usage data

> **Version**: `5.3+`

To improve Unleash, we collect anonymous usage statistics:
- Number of active feature flags
- Number of projects, environments, users, user groups, and custom roles
- Number of active segments, custom strategies, and custom context fields
- Number of times features flags have been exported or imported

All collected data is anonymous and limited to usage counts. This data helps us understand how features are used in Unleash, enabling us to prioritize important features and make informed decisions about deprecating features that are no longer relevant to our users.

## Manage data collection settings

We recognize that privacy requirements differ across organizations. While the data collected by Unleash is limited and anonymous, we provide options to manage data collection settings:

### Disable all telemetry

Set the `CHECK_VERSION` environment variable to anything other than `true`, `t`, or `1`. This disables both version and feature telemetry.

### Disable feature telemetry

Set the `SEND_TELEMETRY` environment variable to anything other than `true`, `t`, or `1` before starting Unleash. This disables feature telemetry while still allowing version tracking.

