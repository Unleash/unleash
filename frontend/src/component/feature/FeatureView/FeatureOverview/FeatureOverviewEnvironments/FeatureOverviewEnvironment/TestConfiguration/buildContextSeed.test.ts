import { expect, test } from 'vitest';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { buildContextSeed } from './buildContextSeed.ts';

const strategyWithConstraints = (
    constraints: IFeatureStrategy['constraints'],
): IFeatureStrategy => ({
    id: '1',
    name: 'flexibleRollout',
    constraints,
    parameters: {},
});

test('returns an empty object when there are no strategies', () => {
    expect(buildContextSeed([])).toBe('{}');
    expect(buildContextSeed(undefined)).toBe('{}');
});

test('returns an empty object when strategies have no constraints', () => {
    const strategies = [strategyWithConstraints([])];

    expect(buildContextSeed(strategies)).toBe('{}');
});

test('seeds a standard context field at the top level', () => {
    const strategies = [
        strategyWithConstraints([
            { contextName: 'userId', operator: 'IN', values: ['1'] },
        ]),
    ];

    expect(JSON.parse(buildContextSeed(strategies))).toEqual({
        userId: '',
    });
});

test('seeds a custom context field under properties', () => {
    const strategies = [
        strategyWithConstraints([
            {
                contextName: 'releaseSegment',
                operator: 'IN',
                values: ['Pro'],
            },
        ]),
    ];

    expect(JSON.parse(buildContextSeed(strategies))).toEqual({
        properties: { releaseSegment: '' },
    });
});

test('dedupes the same context field referenced by multiple strategies', () => {
    const strategies = [
        strategyWithConstraints([
            { contextName: 'userId', operator: 'IN', values: ['1'] },
        ]),
        strategyWithConstraints([
            { contextName: 'userId', operator: 'IN', values: ['2'] },
        ]),
    ];

    expect(JSON.parse(buildContextSeed(strategies))).toEqual({
        userId: '',
    });
});

test('does not seed appName, even when a strategy constrains on it', () => {
    const strategies = [
        strategyWithConstraints([
            { contextName: 'appName', operator: 'IN', values: ['web'] },
        ]),
    ];

    expect(buildContextSeed(strategies)).toBe('{}');
});

test('mixes standard and custom fields across strategies', () => {
    const strategies = [
        strategyWithConstraints([
            { contextName: 'userId', operator: 'IN', values: ['1'] },
        ]),
        strategyWithConstraints([
            {
                contextName: 'releaseSegment',
                operator: 'IN',
                values: ['Enterprise'],
            },
        ]),
    ];

    expect(JSON.parse(buildContextSeed(strategies))).toEqual({
        userId: '',
        properties: { releaseSegment: '' },
    });
});
