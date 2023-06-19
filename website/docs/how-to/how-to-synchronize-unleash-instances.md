---
title: 'How to synchronize Unleash instances'
---

:::note 

This is experimental feature

:::

# Unleash Instance Synchronization Script 

This script allows you to synchronize feature toggles between two Unleash instances using the export and import APIs provided by Unleash. The script exports feature toggles from the source instance and imports them into the target instance.

You can find this script in the following location within the project:

`scripts/promote.sh`

This script can also be integrated into a continuous deployment pipeline, allowing you to automatically synchronize feature toggles between instances at a frequency determined by your pipeline configuration.

## Configuration

To synchronize two Unleash instances, you need to configure each instance with the required settings. The script requires the following configuration:

### Source Unleash Instance

- `SOURCE_URL`: The URL of the source Unleash API.
  Example: `SOURCE_URL="http://localhost:4242/api/admin/features-batch/export"`
- `SOURCE_API_TOKEN`: The API token for the source Unleash instance. This can be a personal access token or a service account token with enough privileges to perform the export operation.
  Example: `SOURCE_API_TOKEN="user:98b555423fa020a3e67267fb8462fdeea13a1d62e7ea61d5fe4f3022"`
- `SOURCE_ENV`: The environment name for the source instance. Only feature toggles matching this environment will be exported.
- `SOURCE_TAG`: The tag to filter feature toggles for export.

### Target Unleash Instance

- `TARGET_URL`: The URL of the target Unleash API.
  Example: `TARGET_URL="http://localhost:4242/api/admin/features-batch/import"`
- `TARGET_API_TOKEN`: The API token for the target Unleash instance. This can be a personal access token or a service account token with enough privileges to perform the import operation.
  Example: `TARGET_API_TOKEN="user:98b555423fa020a3e67267fb8462fdeea13a1d62e7ea61d5fe4f3022"`
- `TARGET_PROJECT`: The project name for the target instance where the feature toggles will be imported.
- `TARGET_ENV`: The environment name for the target instance.

## Process

The script performs the following steps:

1. Export feature toggles from the source instance based on the specified tag and environment.
2. Import the exported feature toggles into the target instance under the specified project and environment.

If change requests are enabled in the target project, the import process will go through the change request process, allowing you to review the changes before applying them.

The script prints each step of the export and import process, providing feedback on the success or failure of each operation.

## Troubleshooting

Here are some common issues you might encounter and how to resolve them:

1. Make sure you use the correct URLs for the source and target instances.
2. Ensure that the API tokens have the necessary permissions to perform export and import operations.
3. Verify that the specified source and target environments exist.
4. Check that the target project exists.
5. If you have change requests enabled in the target project, ensure that there are no pending change requests for the same API token.

:::info Feedback wanted

If you would like to give feedback on this feature, experience issues or have questions, please feel free to open an issue on [GitHub](https://github.com/Unleash/unleash/).

:::


