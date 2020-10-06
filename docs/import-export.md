---
id: import_export
title: Import & Export
---

_since v3.3.0_

Unleash supports import and export of feature-toggles and strategies at startup and during runtime. The import mechanism will guarantee that all imported features will be non-archived, as well as updates to strategies and features are included in the event history.

All import mechanisms support a `drop` parameter which will clean the database before import (all strategies and features will be removed).

> You should be careful when using `drop` parameter in production environments, as it will clean current state.

## Runtime import & export

### State Service

Unleash returns a StateService when started, you can use this to import and export data at any time.

```javascript
const unleash = require('unleash-server');

unleash.start({...})
  .then(async ({ stateService }) => {
    const exportedData = await stateService.export({includeStrategies: false, includeFeatureToggles: true});
    await stateService.import({data: exportedData, userName: 'import', dropBeforeImport: false});
    await stateService.importFile({file: 'exported-data.yml', userName: 'import', dropBeforeImport: true})
  });
```

If you want the database to be cleaned before import (all strategies and features will be removed), set the `dropBeforeImport` parameter.

> You should never use this in production environments.

### API Export

The api endpoint `/api/admin/state/export` will export feature-toggles and strategies as json by default.\
You can customize the export with queryparameters:

| Parameter | Default | Description |
| --- | --- | --- |
| format | `json` | Export format, either `json` or `yaml` |
| download | `false` | If the exported data should be downloaded as a file |
| featureToggles | `true` | Include feature-toggles in the exported data |
| strategies | `true` | Include strategies in the exported data |

For example if you want to download all feature-toggles as yaml:

```
/api/admin/state/export?format=yaml&featureToggles=1&download=1
```

### API Import

You can import feature-toggles and strategies by POSTing to the `/api/admin/state/import` endpoint (keep in mind this will require authentication).\
You can either send the data as JSON in the POST-body or send a `file` parameter with `multipart/form-data` (YAML files are also accepted here).

If you want the database to be cleaned before import (all strategies and features will be removed), specify a `drop` query parameter.

> You should never use this in production environments.

Example usage:

```
POST /api/admin/state/import
{
    "features": [
        {
            "name": "a-feature-toggle",
            "enabled": true,
            "description": "#1 feature-toggle"
        }
    ]
}
```

## Startup import

### Import files via config parameter

You can import a json or yaml file via the configuration option `importFile`.

Example usage: `unleash-server --databaseUrl ... --importFile export.yml`.

If you want the database to be cleaned before import (all strategies and features will be removed), specify the `dropBeforeImport` option.

> You should never use this in production environments.

Example usage: `unleash-server --databaseUrl ... --importFile export.yml --dropBeforeImport`.

These options can also be passed into the `unleash.start()` entrypoint.
