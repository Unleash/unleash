---
title: Data collection
---
:::info

At Unleash, we prioritize the privacy and security of our users' data. This document provides an overview of the data collected when running Unleash. We explain the purpose of data collection and provide instructions on managing data collection settings.

:::

## What data is collected {#what-data-is-collected}
When running Unleash, we collect the following data:

**Version and Instance ID**: A unique identifier and version for your Unleash instance. This ID allows us to track usage statistics and measure the adoption of Unleash across different installations and helps us ensure that you're using the latest version with the most up-to-date features and security enhancements.

**Feature Usage Data**: Starting from **Unleash 5.3**, we collect additional data related to feature usage in Unleash.

This includes the following data points:
- The number of active feature toggles in use
- The total number of users in the system
- The total number of projects in the system
- The number of custom context fields defined and in use
- The number of user groups defined in the system
- The number of custom roles defined in the system
- The number of environments defined in the system
- The number of segments in active use by feature toggles
- The number of custom strategies defined and in use
- The number of feature exports/imports made

Please note that all collected data is anonymous, and we only collect usage counts. This data helps us understand how features are used in Unleash, enabling us to prioritize important features and make informed decisions about deprecating features that are no longer relevant to our users.

Please note that we do not collect personally identifiable information (PII) through Unleash.

## Managing data collection settings {#managing-data-collection-settings}
We understand that privacy preferences may vary among our users. While the data collected by Unleash is limited and anonymous, we provide options to manage data collection settings:

**Disabling All Telemetry**: If you have previously disabled the version telemetry by setting the environment variable `CHECK_VERSION` to anything other than "true", "t" or "1" both the version telemetry and the feature telemetry will be disabled. This respects your choice to opt out of all telemetry data if you had previously disabled it.

**Turning Off Feature Telemetry**: To disable the collection of the new telemetry data while still allowing the version telemetry, set the environment variable `SEND_TELEMETRY` to anything other than "true", "t" or "1" before starting Unleash. This will ensure that the new telemetry data is not sent, but the version information is still sent.

We respect your privacy choices, and we will continue to honor your decision regarding telemetry. If you have any questions or concerns about managing data collection settings or privacy, please reach out to our support team for assistance.

