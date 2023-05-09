import { anonymise, anonymiseKeys } from './anonymise';

const REGEX_MATCH = /^[a-f0-9]{9}@unleash\.run$/;

test('anonymise', () => {
    expect(anonymise('test')).toMatch(REGEX_MATCH);
});

test('anonymiseKeys', () => {
    expect(anonymiseKeys(null, [])).toBe(null);
    expect(anonymiseKeys(undefined, [])).toBe(undefined);
    expect(anonymiseKeys(true, [])).toBe(true);
    expect(anonymiseKeys(false, [])).toBe(false);
    expect(anonymiseKeys('test', [])).toBe('test');
    expect(anonymiseKeys(123, [])).toBe(123);
    expect(anonymiseKeys([1, 2, 3], [])).toStrictEqual([1, 2, 3]);
    expect(anonymiseKeys({ test: 'test' }, [])).toStrictEqual({ test: 'test' });

    expect(
        anonymiseKeys({ test: 'test', test2: 'test2' }, ['test']),
    ).toStrictEqual({
        test: expect.stringMatching(REGEX_MATCH),
        test2: 'test2',
    });

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
                },
            ],
        },
    ]);
});
