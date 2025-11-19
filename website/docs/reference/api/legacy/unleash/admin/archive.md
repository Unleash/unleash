---
title: /api/admin/archive
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="noindex" />

### Revive feature flag {#revive-feature-toggle}

`POST http://unleash.host.com/api/admin/archive/revive/:featureName`

Response: **200 OK** - When feature flag was successfully revived.

### Delete an archived feature flag

`DELETE http://unleash.host.com/api/admin/archive/:featureName`

Will fully remove the feature flag and associated configuration. Impossible to restore after this action.
