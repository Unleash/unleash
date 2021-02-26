---
id: archived_toggles
title: Archived toggles
---

In unleash you may choose to "archive" a feature toggle when it is not needed anymore. You do this by clicking the "Archive" button on the feature toggle details view. By archiving a feature toggle it will not be available to Client SDKs anymore. 

![Archive Toggle](../assets/archive-toggle.png 'Archiving a Feature Toggle').

You will not be able to "fully delete a feature toggle". The reason for this is to avoid old toggles suddenly "waking up again". This could, in worst case, re-activate old functionality in code where the use of the feature toggle has not been cleaned up yet. 

## Reviving a feature toggle

If you want to re-use a feature toggle which has been archived you may revive in from the archive. You do that by clicking the "revive icon". Please not that revived toggles will be "disabled" when they are active again.

![Revive Toggle](../assets/archive-toggle-revive.png 'Reviving a Feature Toggle').



