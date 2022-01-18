---
id: import_export
title: Import & Export
---

_since v3.3.0_

Unleash supports import and export of feature toggles and strategies at startup and during runtime. The import mechanism guarantees that:
- all imported features will be non-archived
- existing updates to strategies and features are included in the event history

All import mechanisms support a `drop` parameter which will clean the database before import (all strategies and features will be removed).

:::caution Dropping in production
Be careful when using the `drop` parameter in production environments: cleaning the database could lead to unintended loss of data.
:::

## Runtime import & export {#runtime-import--export}

### State Service {#state-service}

Unleash returns a StateService when started, you can use this to import and export data at any time.

```javascript
const unleash = require('unleash-server');

const { services } = await unleash.start({...});
const { stateService } = services;

const exportedData = await stateService.export({includeStrategies: false, includeFeatureToggles: true, includeTags: true, includeProjects: true});

await stateService.import({data: exportedData, userName: 'import', dropBeforeImport: false});

await stateService.importFile({file: 'exported-data.yml', userName: 'import', dropBeforeImport: true})
```

If you want the database to be cleaned before import (all strategies and features will be removed), set the `dropBeforeImport` parameter.

It is also possible to not override existing feature toggles (and strategies) by using the `keepExisting` parameter.

### API Export {#api-export}

The api endpoint `/api/admin/state/export` will export feature-toggles and strategies as json by default.
You can customize the export with query parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| format | `json` | Export format, either `json` or `yaml` |
| download | `false` | If the exported data should be downloaded as a file |
| featureToggles | `true` | Include feature-toggles in the exported data |
| strategies | `true` | Include strategies in the exported data |
| tags | `true` | Include tagtypes, tags and feature_tags in the exported data |
| projects | `true` | Include projects in the exported data |

For example if you want to download just feature-toggles as yaml:

```
/api/admin/state/export?format=yaml&featureToggles=1&strategies=0&tags=0&projects=0&download=1
```

Example with curl:

```sh
curl -X GET -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46" \
  http://unleash.herokuapp.com/api/admin/state/export?&featureToggles=1&strategies=0 > export.json
```

### API Import {#api-import}

You can import feature-toggles and strategies by POSTing to the `/api/admin/state/import` endpoint (keep in mind this will require authentication).\
You can either send the data as JSON in the POST-body or send a `file` parameter with `multipart/form-data` (YAML files are also accepted here).

You can customize the import with query parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| drop | `false` | If the database should be cleaned before import (see comment below) |
| keep | `true` | If true, the existing feature toggles and strategies will not be override |

If you want the database to be cleaned before import (**all strategies and features will be removed**), specify a `drop` query parameter.

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

Example with curl:

```sh
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46" -d @export.json \
  http://localhost:4242/api/admin/state/import
```

\*) Remember to set correct token for Authorization.

## Startup import {#startup-import}

You can import toggles and strategies on startup by using an import file in JSON or YAML format. As with other forms of imports, you can also choose to remove the current toggle and strategy configuration in the database before importing.

Unleash lets you do this both via configuration parameters and environment variables. The relevant parameters/variables are:

| config parameter   | environment variable        | default | value                                                   |
|--------------------|-----------------------------|---------|---------------------------------------------------------|
| `importFile`       | `IMPORT_FILE`               | none    | path to the configuration file                          |
| `dropBeforeImport` | `IMPORT_DROP_BEFORE_IMPORT` | `false` | whether to clean the database before importing the file |

### Importing files

To import strategies and toggles from a file (called `configuration.yml` in the examples below), either
- use the `importFile` parameter to point to the file (you can also passed this into the `unleash.start()` entry point)
   ``` shell
   unleash-server --databaseUrl [...] \
   	       --importFile configuration.yml
   ```

- set the `IMPORT_FILE` environment variable to the path of the file before starting Unleash

   ``` shell
   IMPORT_FILE=configuration.yml
   ```

### Drop before import
:::caution
You should never use this in production environments.
:::

To remove pre-existing feature toggles and strategies in the database before importing the new ones, either:
- add the `dropBeforeImport` flag to the `unleash-server` command (or to `unleash.start()`)
   ``` shell
   unleash-server --databaseUrl [...] \
   	       --importFile configuration.yml \
   	       --dropBeforeImport
   ```
- set the `IMPORT_DROP_BEFORE_IMPORT` environment variable (note the leading `IMPORT_`) to `true`, `t`, or `1`. The variable is case-sensitive.

   ``` shell
   IMPORT_DROP_BEFORE_IMPORT=true
   ```
