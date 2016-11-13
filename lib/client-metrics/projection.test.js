'use strict';

const { test } = require('ava');
const Projection = require('./projection');

test('should return set empty if missing', t => {
    const projection = new Projection();

    projection.substract('name-1', { yes: 1, no: 2 });

    t.deepEqual(projection.getProjection()['name-1'], { yes: 0, no: 0 });
});

test('should add and substract', t => {
    const projection = new Projection();

    t.truthy(projection.store);

    projection.add('name-1', { yes: 1, no: 2 });
    t.deepEqual(projection.getProjection()['name-1'], { yes: 1, no: 2 });

    projection.add('name-1', { yes: 1, no: 2 });
    t.deepEqual(projection.getProjection()['name-1'], { yes: 2, no: 4 });

    projection.substract('name-1', { yes: 1, no: 2 });
    t.deepEqual(projection.getProjection()['name-1'], { yes: 1, no: 2 });

    projection.substract('name-1', { yes: 1, no: 2 });
    t.deepEqual(projection.getProjection()['name-1'], { yes: 0, no: 0 });

    projection.substract('name-2', { yes: 23213, no: 23213 });
    projection.add('name-2', { yes: 3, no: 2 });
    t.deepEqual(projection.getProjection()['name-2'], { yes: 3, no: 2 });
});
