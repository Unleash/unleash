---
title: 'How to synchronize Unleash instances'
---

:::note 

This is an experimental feature.

:::

# Unleash instance synchronization script 

This script allows you to synchronize feature flags between two Unleash instances using the export and import APIs provided by Unleash. The script exports feature flags from the source instance and imports them into the target instance.

For one-off full instance migrations, we recommend a [database dump/restore](/deploy/configuring-unleash#back-up-and-restore-the-database) (`pg_dump` / `pg_restore`) instead.

You can find this script in the following location within the project:

`scripts/promote.sh`

This script can also be integrated into a continuous deployment pipeline, allowing you to automatically synchronize feature flags between instances at a frequency determined by your pipeline configuration.

:::warning
If you have any segments or custom strategies defined, you must first manually create these in the target instance.
:::

Feature flags are imported with full configuration, including:
- [Activation strategies](/reference/activation-strategies)
- [Context fields](/reference/unleash-context)
- [Strategy variants](/reference/strategy-variants)
- [Tags](/reference/feature-toggles#tags)
- [Feature flag state](/reference/feature-toggles#feature-flag-state)
- [Feature dependencies](/reference/feature-toggles#feature-flag-dependencies)
- [Feature flag links](/reference/feature-toggles#external-links)

If a feature flag already exists in your target instance, it will be overwritten.

## Configuration

To synchronize two Unleash instances, you need to configure each instance with the required settings. The script requires the following configuration:

### Source Unleash instance

- `SOURCE_URL`: The URL of the source Unleash API.
  Example: `SOURCE_URL="http://localhost:4242/api/admin/features-batch/export"`
- `SOURCE_API_TOKEN`: The API token for the source Unleash instance. This can be a personal access token or a service account token with enough privileges to perform the export operation.
  Example: `SOURCE_API_TOKEN="user:98b555423fa020a3e67267fb8462fdeea13a1d62e7ea61d5fe4f3022"`
- `SOURCE_ENV`: The environment name for the source instance. Only feature flags matching this environment will be exported.
- `SOURCE_TAG`: The tag to filter feature flags for export.

### Target Unleash instance

- `TARGET_URL`: The URL of the target Unleash API.
  Example: `TARGET_URL="http://localhost:4242/api/admin/features-batch/import"`
- `TARGET_API_TOKEN`: The API token for the target Unleash instance. This can be a personal access token or a service account token with enough privileges to perform the import operation.
  Example: `TARGET_API_TOKEN="user:98b555423fa020a3e67267fb8462fdeea13a1d62e7ea61d5fe4f3022"`
- `TARGET_PROJECT`: The project name for the target instance where the feature flags will be imported.
- `TARGET_ENV`: The environment name for the target instance.

## Process

The script performs the following steps:

1. Export feature flags from the source instance based on the specified tag and environment.
2. Import the exported feature flags into the target instance under the specified project and environment.

If change requests are enabled in the target project, the import process will go through the change request process, allowing you to review the changes before applying them.

The script prints each step of the export and import process, providing feedback on the success or failure of each operation.

## Troubleshooting

Here are some common issues you might encounter and how to resolve them:

- Check that you use the correct URLs for the source and target instances.
- Ensure that the API tokens have the necessary permissions to perform export and import operations.
- Verify that the specified source and target environments exist.
- Check that the target project exists.
- If you have change requests enabled in the target project, ensure that there are no pending change requests for the same API token.
-  Check that any custom strategies or segments have been migrated manually.
