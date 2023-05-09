import { anonymise, anonymiseKeys } from './anonymise';

const REGEX_MATCH = /^[a-f0-9]{9}@unleash\.run$/;

test('anonymise', () => {
    expect(anonymise('test')).toMatch(REGEX_MATCH);
});

describe('anonymiseKeys', () => {
    test.each([
        null,
        undefined,
        true,
        false,
        'test',
        123,
        [1, 2, 3],
        { test: 'test' },
    ])(
        'A parameter without keys (non-object, non-array) should return the same value',
        (obj) => expect(anonymiseKeys(obj!, [])).toStrictEqual(obj),
    );

    test('An object should anonymise the specified keys', () => {
        expect(
            anonymiseKeys({ test: 'test', test2: 'test2' }, ['test']),
        ).toStrictEqual({
            test: expect.stringMatching(REGEX_MATCH),
            test2: 'test2',
        });
    });

    test('An array of objects should anonymise the specified keys', () => {
        expect(
            anonymiseKeys(
                [
                    { test: 'test', test2: 'test2' },
                    { test: 'test', test2: 'test2' },
                ],
                ['test'],
            ),
        ).toStrictEqual([
            { test: expect.stringMatching(REGEX_MATCH), test2: 'test2' },
            { test: expect.stringMatching(REGEX_MATCH), test2: 'test2' },
        ]);
    });

    test('A complex array/object should anonymise the specified keys, no matter the depth', () => {
        expect(
            anonymiseKeys(
                [
                    {
                        test1: [],
                        anon: 'secret',
                        other: 'other',
                        test2: {
                            test3: 'test3',
                            test4: [
                                {
                                    test5: {
                                        anon2: 'secret2',
                                    },
                                },
                            ],
                        },
                    },
                    {
                        test6: [
                            {
                                test7: [
                                    {
                                        test8: {
                                            anon: 'secret3',
                                            other2: 'other2',
                                        },
                                    },
                                ],
                                test9: {
                                    other3: 'other3',
                                    anon2: 'secret4',
                                    test10: {
                                        anon: 'secret5',
                                    },
                                },
                                other4: 'other4',
                            },
                        ],
                    },
                ],
                ['anon', 'anon2'],
            ),
        ).toStrictEqual([
            {
                test1: [],
                anon: expect.stringMatching(REGEX_MATCH),
                other: 'other',
                test2: {
                    test3: 'test3',
                    test4: [
                        {
                            test5: {
                                anon2: expect.stringMatching(REGEX_MATCH),
                            },
                        },
                    ],
                },
            },
            {
                test6: [
                    {
                        test7: [
                            {
                                test8: {
                                    anon: expect.stringMatching(REGEX_MATCH),
                                    other2: 'other2',
                                },
                            },
                        ],
                        test9: {
                            other3: 'other3',
                            anon2: expect.stringMatching(REGEX_MATCH),
                            test10: {
                                anon: expect.stringMatching(REGEX_MATCH),
                            },
                        },
                        other4: 'other4',
                    },
                ],
            },
        ]);
    });
});
