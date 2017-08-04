'use strict';

const { test } = require('ava');
const { makeQueryFilter } = require('./feature-filter');

test('should handle empty list', t => {
    const query = {};
    const queryFilter = makeQueryFilter(query);
    const input = [];

    const output = queryFilter(input);
    t.is(output.length, 0);
});

test('should not filter without query', t => {
    const query = {};
    const queryFilter = makeQueryFilter(query);
    const input = [
        {
            name: 'test1',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: true,
        },
        {
            name: 'test3',
            enabled: false,
        },
    ];

    const output = queryFilter(input);
    t.is(output.length, 3);
});

test('should filter enabled=false', t => {
    const query = {
        enabled: 'false',
    };
    const queryFilter = makeQueryFilter(query);
    const input = [
        {
            name: 'test1',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: true,
        },
        {
            name: 'test3',
            enabled: false,
        },
    ];

    const output = queryFilter(input);
    t.is(output.length, 1);
});

test('should filter based on name', t => {
    const query = {
        name: '^test[1,2]$',
    };
    const queryFilter = makeQueryFilter(query);
    const input = [
        {
            name: 'test1',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: true,
        },
        {
            name: 'test3',
            enabled: false,
        },
    ];

    const output = queryFilter(input);
    t.is(output.length, 2);
});

test('should filter based on name and enabled', t => {
    const query = {
        name: '^test[1,2]$',
        enabled: 'true',
    };
    const queryFilter = makeQueryFilter(query);
    const input = [
        {
            name: 'test1',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: false,
        },
        {
            name: 'test3',
            enabled: false,
        },
    ];

    const output = queryFilter(input);
    t.is(output.length, 1);
    t.is(output[0].name, 'test1');
});

test('should handle invalid regex', t => {
    const query = {
        name: '*.',
        enabled: 'true',
    };
    const queryFilter = makeQueryFilter(query);
    const input = [
        {
            name: 'test1',
            enabled: true,
        },
        {
            name: 'test2',
            enabled: false,
        },
        {
            name: 'test3',
            enabled: false,
        },
    ];

    const output = queryFilter(input);
    t.is(output.length, 0);
});
