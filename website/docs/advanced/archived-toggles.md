---
id: archived_toggles
title: Archived toggles
---

You can _archive_ a feature toggle when it is not needed anymore. You do this by clicking the "Archive" button on the feature toggle details view. When you archive a feature toggle, it will no longer be available to Client SDKs.

![The Unleash toggle view showing a focused "archive feature toggle" button, highlighted by a red arrow.](/img/archive-toggle.png 'Archiving a Feature Toggle').

## Viewing archived toggles

Archived toggles are displayed in two places:

1. The global toggle archive
2. The containing project's toggle archive

Unleash keeps a list of _all_ archived toggles across projects in the _global archive_. The global archive is accessible from the global feature list.

Additionally, each project keeps a list of all of _its_ archived toggles. That is, when you archive a toggle, Unleash adds it to the containing project's archive.

## Reviving a feature toggle {#reviving-a-feature-toggle}

If you want to re-use a feature toggle that you previously archived, you can revive in from the feature toggle archive. Click the "revive icon" to revive the toggle. Revived toggles will be in the disabled state when you re-enable them.

![A list of archived toggles. Each toggle displays its name and project it belongs to. Each toggle also has a "revive" button, as highlighted by a red arrow.](/img/archive-toggle-revive.png 'Reviving a Feature Toggle').

## Deleting a feature toggle

:::caution

We generally discourage deleting feature toggles. The reason is that feature toggle names in Unleash are used as identifiers, so if you were to delete a toggle and then create a new one with the same name, the new one would reactivate any code that uses the old toggle.

:::

The only way to fully _delete_ a feature toggle in Unleash is by using the archive. An archived toggle can be deleted via the API or by using the "delete feature toggle" button in the global or project-level archive.

![A list of archived toggles, each with a button to delete the toggle permanently.](/img/archive-toggle-delete.png).
