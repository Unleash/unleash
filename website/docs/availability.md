---
title: Feature availability and versioning
---

Your Unleash [plan](#plans) and [version](#versioning) determine what features you have access to. Our documentation displays the availability for each feature using the following annotation:

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `5.7+`

:::

This is an example of a feature that is only available to Enterprise customers who are on version `5.7` or later.

## Plans

- [Open Source](https://www.getunleash.io/pricing) - Available on [GitHub](https://github.com/Unleash/unleash) under an Apache 2.0 license.
- [Enterprise](https://www.getunleash.io/pricing) - Available as pay-as-you-go or as an annual contract, either as cloud-hosted or self-hosted.
- Pro - Currently not offered.

## Beta features

Some new Unleash features are tagged as `BETA` in the documentation. This means that the feature may be subject to change or discontinuation. Unleash may decide to enable such features for a select number of customers only. If you're interested in trying out a beta feature, please reach out to Customer Success at beta@getunleash.io.

## Versioning

Unleash uses [semantic versioning](https://semver.org/) with release notes available on [GitHub](https://github.com/Unleash/unleash/releases). If you are using Unleash Cloud, your instance is automatically on the latest build.

Unleash Cloud is a hosted service with continuous delivery. For transparency, we append build metadata to the base semantic version for every deployment. For example, in `7.0.10+6945.8192287`, `7.0.10` is the base release and `+6945.8192287` identifies the exact build.

If you're self-hosting Unleash, see [Upgrading Unleash](/deploy/upgrading-unleash) for how to keep your instance up to date.

[Unleash Edge](https://github.com/Unleash/unleash-edge) and our [SDKs](/reference/sdks) are versioned and released independently of Unleash. We recommend upgrading your SDKs and Unleash Edge to the latest versions to ensure compatibility, optimal performance, and access to the latest features and security updates.
