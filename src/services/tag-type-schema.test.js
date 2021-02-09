'use strict';

const test = require('ava');
const { tagTypeSchema } = require('./tag-type-schema');

test('should require a URLFriendly name but allow empty description and icon', t => {
    const simpleTagType = {
        name: 'io with space',
    };

    const { error } = tagTypeSchema.validate(simpleTagType);
    t.deepEqual(error.details[0].message, '"name" must be URL friendly');
});

test('should require a stringy description and icon', t => {
    const tagType = {
        name: 'url-safe',
        description: 515,
        icon: 123,
    };

    const { error } = tagTypeSchema.validate(tagType);
    t.deepEqual(error.details[0].message, '"description" must be a string');
    t.deepEqual(error.details[1].message, '"icon" must be a string');
});

test('Should validate if all requirements are fulfilled', t => {
    const validTagType = {
        name: 'url-safe',
        description: 'some string',
        icon: '#',
    };
    const { error } = tagTypeSchema.validate(validTagType);
    t.is(error, undefined);
});
