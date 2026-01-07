---
title: "ADR: Logging levels"
---
## Date: 2025-03-20

## Background

Our log levels carry semantic information. 
Log lines logged at the error level triggers SRE alerts if they exceed more than 1 per hour. Though we are pretty good at not excessively logging at ERROR, we do have cases where SRE alerts gets triggered, but by the time SRE can log on and check the deployment, everything is fine again. This means we never had an ERROR, we should have had a WARN message.

This ADR aims to solidify an understanding that levels are important to use correctly to avoid mental load and on-call alerts for things we can't do anything about.

## Decision

We should agree on the semantic information carried in each level, and which levels are ok to ignore while scanning logs from running applications.

Current suggestion

| Log level | Frequency in healthy application | Standard Availability                     | Configurable                |  
|-----------|----------------------------------|-------------------------------------------|-----------------------------|
| ERROR     | 0                                | All environments                          | NO                          |
| WARN      | 1-10                             | All environments                          | NO                          |
| INFO      | 10-100                           | Default deploy config sets LOG_LEVEL=info | YES                         |
| DEBUG     | 100 - 1000                       | Local development                         | YES (specific deployments)  |
| TRACE     | 1000 - 10000                     | NO                                        | YES (specific deployments)  |




### Change

Previously we might've logged an ERROR for a self-healable issue, this should change to WARN, and not be an ERROR.

The only things that should be logged at ERROR are exceptional behaviour that we need to fix immediately, 
everything else should be downgraded to WARN. In order to reduce WARN cardinality, this might mean that some messages at WARN today should be downgraded to INFO.


### Examples
[traffic-data-service in enterprise](https://github.com/bricks-software/unleash-enterprise/blob/293304a5d67231d584c3fa4c28589af23fb395e3/src/traffic-data/traffic-data-usage-service.ts#L69)
#### Previous
```typescript
await Promise.all(promises)
            .then(() => {
                this.logger.debug('Traffic data usage saved');
            })
            .catch((err) => {
                this.logger.error('Failed to save traffic data usage', err);
            });
```

#### Recommended
Since there's nothing for an SRE to do here if it fails to save, this is an excellent candidate for downgrading to WARN
```typescript
await Promise.all(promises)
            .then(() => {
                this.logger.debug('Traffic data usage saved');
            })
            .catch((err) => {
                this.logger.warn('Failed to save traffic data usage', err); 
            });
```
[markSeen#account-store in unleash](https://github.com/Unleash/unleash/blob/038c10f6125c4cce200a0bf49f38c7bddada7093/src/lib/db/account-store.ts#L164)
```typescript
async markSeenAt(secrets: string[]): Promise<void> {
        const now = new Date();
        try {
            await this.db('personal_access_tokens')
                .whereIn('secret', secrets)
                .update({ seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
```
Not being able to update lastSeen is not something we can do anything about as on-calls, so this is also a good candidate for downgrading to WARN.
