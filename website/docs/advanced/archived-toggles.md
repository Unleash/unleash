---
id: archived_toggles
title: Archived toggles
---

You can _archive_ a feature toggle when it is not needed anymore. You do this by clicking the "Archive" button on the feature toggle details view. When you archive a feature toggle, it will no longer be available to Client SDKs.

![The Unleash toggle view showing a focused "archive feature toggle" button, highlighted by a red arrow.](/img/archive-toggle.png 'Archiving a Feature Toggle').

You can not "fully delete a feature toggle". This is to prevent you from creating a new feature toggle with the same name as an old one. This could potentially reactivate old functionality in code that still referenced the old toggle and result in unintended consequences.

## Viewing archived toggles

You can find archived toggles in the toggle archive. The archive is accessible from the global feature toggle list.

## Reviving a feature toggle {#reviving-a-feature-toggle}

If you want to re-use a feature toggle that you previously archived, you can revive in from the feature toggle archive. Click the "revive icon" to revive the toggle. Revived toggles will be in the disabled state when you re-enable them.

![A list of archived toggles. Each toggle displays its name and project it belongs to. Each toggle also has a \"revive\" button, as highlighted by a red arrow.](/img/archive-toggle-revive.png 'Reviving a Feature Toggle').
