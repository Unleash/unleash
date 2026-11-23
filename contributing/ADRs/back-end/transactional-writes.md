---
title: "ADR: Transactional writes"
---

## Background

Many writes save a change and then its event, or run several statements. Outside a transaction, each statement commits on its own. When a later statement fails, the earlier ones stay committed: a change can end up with no event, or an update across several statements can stop halfway. A failed event write outside a transaction doesn't fail the request, so the request still gets a 2xx response.

## Decision

### Writes that belong together commit together

A unit of work is the set of writes that one request, job step or startup step makes and that must commit together, like a database update and its event, or several statements that depend on each other. Each unit runs in one transaction, through the service's `transactional`. Don't split a unit across several `transactional` calls.

A write with nothing to keep atomic doesn't need a transaction, for example a single statement with no event, or one statement that only writes an event.

The transaction boundary normally belongs at the outer layer, such as the controller, job or startup code. Only that layer sees the whole unit of work. A service can't tell which writes must commit together, because it can be called on its own or as part of a bigger unit of work. The outer layer calls the service's `transactional` method and runs the service's writes inside the callback it passes:

```ts
const tag = await this.tagService.transactional((service) =>
    service.renameTag({ type, value }, req.body.value, req.audit),
);
```

A service doesn't call `transactional` on a service it holds. Depending on how the held service was built, that call opens either a savepoint inside the caller's transaction, or a separate transaction on a pool connection that commits on its own, so a caller that is in a transaction can't roll it back. The calling code can't tell which. Instead, the outer layer opens the one transaction. The outer layer's `transactional` call runs the outer service's factory again on that transaction to rebuild the outer service. The factory builds the held service from the same transaction too, so the outer service calls the held service's writes directly.

For example, simplified from the feature import:

Before
```ts
class ExportImportService {
    async importTags(tags: IFeatureTag[], auditUser: IAuditUser) {
        for (const tag of tags) {
            await this.featureTagService.transactional((service) =>
                service.addTag(
                    tag.featureName,
                    { type: tag.tagType, value: tag.tagValue },
                    auditUser,
                ),
            );
        }
    }
}
```

After
```ts
// The factory builds the feature tag service from the same db
const createExportImportService = (config: IUnleashConfig) => (db: Db) =>
    new ExportImportService({
        featureTagService: createFeatureTagService(config)(db),
    });

class ExportImportService {
    async importTags(tags: IFeatureTag[], auditUser: IAuditUser) {
        for (const tag of tags) {
            await this.featureTagService.addTag(
                tag.featureName,
                { type: tag.tagType, value: tag.tagValue },
                auditUser,
            );
        }
    }
}

// The composition root wraps the factory once, at startup
const importService = withTransactional(createExportImportService(config), db);

// The controller opens the one transaction
await this.importService.transactional((service) =>
    service.importTags(tags, req.audit),
);
```

### Code Reviewer Responsibilities

Raise a flag on:
- a route, job or startup code that calls a write outside `transactional`, where the write saves a change and its event, or runs several statements that must commit together;
- one unit's writes split across several `transactional` calls;
- a `transactional` call that the change adds inside a service, on a service that this service holds.
