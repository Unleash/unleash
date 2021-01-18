'use strict';

const test = require('ava');
const { tagSchema } = require('./tag-schema');

test('should require url friendly type if defined', t => {
    const tag = {
        value: 'io`dasd',
        type: 'io`dasd',
    };

    const { error } = tagSchema.validate(tag);
    t.deepEqual(error.details[0].message, '"type" must be URL friendly');
});
