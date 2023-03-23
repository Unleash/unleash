---
title: Environment Import & Export
---

:::info Availability

The environment import and export first appeared in Unleash 4.22.0.

:::

Environment export and import lets you copy feature configurations from one environment to another and even copy features from one Unleash instance to another.

When exporting, you select a set of features and **one** environment to export the configuration from. The environment must be the same for all features.

Then, when you import, you must select **one** environment and **one** project to import into. All features are imported into that project in that environment. If Unleash is unable to import the configuration safely, it will tell you why the import failed and what you need to do fix it (read more about [import rejection](#import-rejection).

## Import & Export items

When you export features, the export will contain both feature-specific configuration and global configuration.

On the project-level these  items are exported:

* the feature itself
* feature tags

On the environment-level, these items are exported for the chosen environment:

* activation strategies including constraints and references to segments
* variants
* enabled/disabled

Additionally, these global configuration items are exported:
* custom context fields 
* feature tag types

Importantly, while references to segments are exported, the segments themselves are **not** exported. Consult the [import rejection](#import-rejection) section for more information.

## Export

You can export features either from a project search or the global feature search. Use the search functionality to narrow the results to the list of features you want to export and use the export button to select environment. All features included in your search results will be included in the export.

![Search-driven export screen with WYSIWYG mode](/img/export.png)

## Import

Import is a 3 stage process designed to be efficient and error-resistant.

### Import stages

* **upload** - you can upload exported file or copy-paste export data into the code editor
* **validation** - you will get feedback on any errors or warnings before you do the actual import. This makes sure your feature flags configurations
are compatible with your target environment.
* **import** - the actual import that creates a new configuration in the target environment or creates a [change request](../change-requests.md) when the environment has change requests enabled

![Three-staged import process](/img/import.png)

### Import rejection

Import can be rejected when:
* the exported and imported context fields have conflicting context fields values. If the context fields don't exist in the target environment they will be created.
* the target Unleash instance doesn't have a matching segment. The actual constraints in the segment can be different. The matching is done by the segment name.
* the exported strategies include custom strategies that don't exist in the target Unleash instance. The matching is done by the strategy name.
* the exported feature already exists in another project in the target environment that is not a project that you import the toggle to.
* the target project and environment have a pending change request (applies to enterprise customers with change requests enabled for a given project and environment).

### Import warnings

Import validation will warn you when:
* the features you are trying to import are already archived in the target instance. Those features won't be imported again.
* the strategies you are trying to import are custom and may have different configuration parameters. Those strategies will be imported anyway.

### Required permissions

Import requires those permissions:
* Update feature toggles (always)
* Create feature toggles when import will be creating new features
* Update tag types when import will be introducing new tag types
* Create context fields when import will be creating new context fields
* Create activation strategies when import will be creating new activation strategies and change requests are disabled
* Delete activation strategies when import will be deleting existing activation strategies and change requests are disabled
* Update variants when import will be updating variants and change requests are disabled

### Import and change requests

When the target project and environment have change requests enabled the import will not be applied instantly. Instead, it will 
create a change request, send it to review and await for the approval.

## Environment Import & Export vs Old Import & Export

The new Environment Import & Export differs from the old [Import & Export](import-export.md).
The most important difference is a strong focus on a single project and environment in the target environment.
Also, the new Import & Export has a UI and extra safety mechanisms preventing corrupted data imports.

