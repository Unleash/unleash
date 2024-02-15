---
title: "ADR: Logging errors"
---

## Background

After debugging multiple errors over the last few years, we've consistently found that when something

## Decision

`Error` level should be reserved for events that are actually errors. That is, we need to do something about it. When we
log at the error level, we should give the person debugging as much information as possible.
As such, please include the error as a second argument to `logger.error`. This will include the stacktrace in the log
message and make it a lot easier to figure out where the error is coming from

### Change

#### Previously

```typescript
function errors() {
    try {
    } catch (e) {
        this.logger.error(`Something went wrong {$e}`);
    }
}
```

to

#### Now (Recommended)

```typescript
function errors() {
    try {
    } catch (e) {
        this.logger.error('Something went wrong', e);
    }
}
```
