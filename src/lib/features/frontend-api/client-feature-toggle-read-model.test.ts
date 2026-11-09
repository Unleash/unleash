import { EventEmitter } from 'node:events';
import type { Db } from '../../db/db.js';
import ClientFeatureToggleReadModel from './client-feature-toggle-read-model.js';

test.each([
    ...Object.getOwnPropertyNames(Object.prototype),
    'prototype',
])('aggregates existing feature and environment names %s safely', (name) => {
    const readModel = new ClientFeatureToggleReadModel(
        {} as Db,
        new EventEmitter(),
    );
    const result = readModel.getAggregatedData([
        { environment: 'default', name, enabled: true },
        { environment: name, name: 'normal-feature', enabled: true },
        { environment: name, name, enabled: true },
    ]);

    expect(result.default[name]).toMatchObject({ name, enabled: true });
    expect(result[name]['normal-feature']).toMatchObject({
        name: 'normal-feature',
        enabled: true,
    });
    expect(result[name][name]).toMatchObject({ name, enabled: true });
    expect(Object.getPrototypeOf(result)).toBeNull();
    expect(Object.getPrototypeOf(result[name])).toBeNull();
});
