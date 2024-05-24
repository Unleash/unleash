---
title: Archived Flags
---

You can _archive_ a feature flag when it is not needed anymore. You do this by clicking the "Archive" button on the feature flag details view. When you archive a feature flag, it will no longer be available to Client SDKs.

![The Unleash flag view showing a focused "archive feature flag" button, highlighted by a red arrow.](/img/archive-toggle.png 'Archiving a Feature Flag')

## Viewing archived flags

Archived flags are displayed in two places:

1. The global flag archive
2. The containing project's flag archive

Unleash keeps a list of _all_ archived flags across projects in the _global archive_. The global archive is accessible from the global feature list.

Additionally, each project keeps a list of all of _its_ archived flags. That is, when you archive a flag, Unleash adds it to the containing project's archive.

## Reviving a feature flag {#reviving-a-feature-toggle}

If you want to re-use a feature flag that you previously archived, you can revive in from the feature flag archive. Click the "revive icon" to revive the flag. Revived flags will be in the disabled state when you re-enable them.

![A list of archived flags. Each flag displays its name and project it belongs to. Each flag also has a "revive" button, as highlighted by a red arrow.](/img/archive-toggle-revive.png 'Reviving a Feature Flag')

## Deleting a feature flag

:::caution

We generally discourage deleting feature flags. The reason is that feature flag names in Unleash are used as identifiers, so if you were to delete a flag and then create a new one with the same name, the new one would reactivate any code that uses the old flag.

:::

The only way to fully _delete_ a feature flag in Unleash is by using the archive. An archived flag can be deleted via the API or by using the "delete feature flag" button in the global or project-level archive.

![A list of archived flags, each with a button to delete the flag permanently.](/img/archive-toggle-delete.png)
