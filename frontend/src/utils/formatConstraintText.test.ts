import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { formatConstraintText } from 'utils/formatConstraintText';
import type { Operator } from 'constants/operators';
import type { ConstraintSchema } from 'openapi';
import type { ILocationSettings } from 'hooks/useLocationSettings';

const locationSettings: ILocationSettings = { locale: 'en-US' };

const baseConstraint = (
    overrides: Partial<ConstraintSchema> = {},
): ConstraintSchema => ({
    contextName: 'appName',
    operator: 'IN',
    ...overrides,
});

describe('formatConstraintText', () => {
    const operatorMappings: [Operator, string, string][] = [
        ['IN', 'appName is one of asdf', 'appName is not one of asdf'],
        [
            'STR_CONTAINS',
            'appName is a string that contains asdf',
            'appName is a string that does not contain asdf',
        ],
        [
            'STR_STARTS_WITH',
            'appName is a string that starts with asdf',
            'appName is a string that does not start with asdf',
        ],
        [
            'STR_ENDS_WITH',
            'appName is a string that ends with asdf',
            'appName is a string that does not end with asdf',
        ],
        ['NOT_IN', 'appName is not one of asdf', 'appName is one of asdf'],
        [
            'REGEX',
            'appName matches regex asdf',
            'appName does not match regex asdf',
        ],
        ['IN_CIDR', 'appName is an IP in asdf', 'appName is an IP not in asdf'],
        [
            'NUM_EQ',
            'appName is a number equal to asdf',
            'appName is a number not equal to asdf',
        ],
        [
            'NUM_GT',
            'appName is a number greater than asdf',
            'appName is a number not greater than asdf',
        ],
        [
            'NUM_GTE',
            'appName is a number greater than or equal to asdf',
            'appName is a number less than asdf',
        ],
        [
            'NUM_LT',
            'appName is a number less than asdf',
            'appName is a number not less than asdf',
        ],
        [
            'NUM_LTE',
            'appName is a number less than or equal to asdf',
            'appName is a number greater than asdf',
        ],
        [
            'SEMVER_EQ',
            'appName is a SemVer equal to asdf',
            'appName is a SemVer not equal to asdf',
        ],
        [
            'SEMVER_GT',
            'appName is a SemVer greater than asdf',
            'appName is a SemVer not greater than asdf',
        ],
        [
            'SEMVER_GTE',
            'appName is a SemVer greater than or equal to asdf',
            'appName is a SemVer less than asdf',
        ],
        [
            'SEMVER_LT',
            'appName is a SemVer less than asdf',
            'appName is a SemVer not less than asdf',
        ],
        [
            'SEMVER_LTE',
            'appName is a SemVer less than or equal to asdf',
            'appName is a SemVer greater than asdf',
        ],
    ];

    test.each(
        operatorMappings,
    )('renders %s as %s (%s when inverted)', (operator, expected, expectedInverted) => {
        const constraint = baseConstraint({ operator, value: 'asdf' });

        expect(formatConstraintText(constraint, locationSettings)).toBe(
            expected,
        );

        const invertedConstraint = baseConstraint({
            operator,
            value: 'asdf',
            inverted: true,
        });

        expect(formatConstraintText(invertedConstraint, locationSettings)).toBe(
            expectedInverted,
        );
    });

    test('joins multiple values with a comma', () => {
        const constraint = baseConstraint({
            operator: 'IN',
            values: ['user1', 'user2', 'user3'],
        });

        expect(formatConstraintText(constraint, locationSettings)).toBe(
            'appName is one of user1, user2, user3',
        );
    });

    test('still lists all values when there are exactly 10', () => {
        const constraint = baseConstraint({
            operator: 'IN',
            values: [
                'v1',
                'v2',
                'v3',
                'v4',
                'v5',
                'v6',
                'v7',
                'v8',
                'v9',
                'v10',
            ],
        });

        expect(formatConstraintText(constraint, locationSettings)).toBe(
            'appName is one of v1, v2, v3, v4, v5, v6, v7, v8, v9, v10',
        );
    });

    test('collapses to a count once there are more than 10 values', () => {
        const constraint = baseConstraint({
            operator: 'IN',
            values: [
                'v1',
                'v2',
                'v3',
                'v4',
                'v5',
                'v6',
                'v7',
                'v8',
                'v9',
                'v10',
                'v11',
            ],
        });

        expect(formatConstraintText(constraint, locationSettings)).toBe(
            'appName is one of (11 values)',
        );
    });

    test('counts the value field itself toward the 10-value threshold', () => {
        const constraint = baseConstraint({
            operator: 'IN',
            value: 'v1',
            values: [
                'v2',
                'v3',
                'v4',
                'v5',
                'v6',
                'v7',
                'v8',
                'v9',
                'v10',
                'v11',
            ],
        });

        expect(formatConstraintText(constraint, locationSettings)).toBe(
            'appName is one of (11 values)',
        );
    });

    describe('date formatting', () => {
        const originalTz = process.env.TZ;

        beforeAll(() => {
            process.env.TZ = 'UTC';
        });

        afterAll(() => {
            process.env.TZ = originalTz;
        });

        const value = '2026-03-19T23:59:59.999Z';

        const cases: [string, Operator, boolean, string][] = [
            [
                'currentTime',
                'DATE_AFTER',
                false,
                'currentTime is a date after 03/19/2026, 11:59:59 PM',
            ],
            [
                'signupDate',
                'DATE_BEFORE',
                false,
                'signupDate is a date before 03/19/2026, 11:59:59 PM',
            ],
            [
                'currentTime',
                'DATE_BEFORE',
                true,
                'currentTime is a date not before 03/19/2026, 11:59:59 PM',
            ],
            [
                'currentTime',
                'IN',
                false,
                'currentTime is one of 03/19/2026, 11:59:59 PM',
            ],
            [
                'signupDate',
                'STR_CONTAINS',
                false,
                'signupDate is a string that contains 2026-03-19T23:59:59.999Z',
            ],
        ];

        test.each(
            cases,
        )('formats %s / %s (inverted: %s) as "%s"', (contextName, operator, inverted, expected) => {
            const constraint = baseConstraint({
                contextName,
                operator,
                value,
                inverted,
            });

            expect(formatConstraintText(constraint, locationSettings)).toBe(
                expected,
            );
        });

        test('uses the given locale when formatting a currentTime value', () => {
            const constraint = baseConstraint({
                contextName: 'currentTime',
                operator: 'DATE_BEFORE',
                value,
            });

            expect(formatConstraintText(constraint, { locale: 'pl-PL' })).toBe(
                'currentTime is a date before 19.03.2026, 23:59:59',
            );
        });
    });
});
