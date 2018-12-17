'use strict';

const test = require('ava');
const { featureShema } = require('./feature-schema');
const joi = require('joi');

test('should require URL firendly name', t => {
    const toggle = {
        name: 'io`dasd',
        enabled: false,
        strategies: [{ name: 'default' }],
    };

    const { error } = joi.validate(toggle, featureShema);
    t.deepEqual(error.details[0].message, '"name" must be URL friendly');
});

test('should be valid toggle name', t => {
    const toggle = {
        name: 'app.name',
        enabled: false,
        strategies: [{ name: 'default' }],
    };

    const { value } = joi.validate(toggle, featureShema);
    t.deepEqual(value, toggle);
});
