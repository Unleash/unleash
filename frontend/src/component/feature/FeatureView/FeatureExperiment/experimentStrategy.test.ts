import { describe, expect, test } from 'vitest';
import { IN } from 'constants/operators';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';
import {
    type ExperimentTreatment,
    createExperimentStrategyPayload,
    createTreatmentKey,
    experimentIsValid,
    getExperimentPropertyNames,
    resolveExperimentConfig,
    resolvePreviewTreatment,
} from './experimentStrategy.ts';

const environment = (
    strategies: IFeatureEnvironment['strategies'],
): IFeatureEnvironment => ({
    name: 'development',
    type: 'development',
    enabled: true,
    strategies,
});

describe('experimentStrategy', () => {
    test('maps an empty environment to a default experiment', () => {
        const config = resolveExperimentConfig(environment([]));

        expect(config.configured).toBe(false);
        expect(config.treatments).toEqual([
            { name: 'Control', label: 'Control', properties: {} },
            { name: 'VariantB', label: 'VariantB', properties: {} },
        ]);
        expect(config.lanes).toMatchObject([
            {
                name: 'All traffic',
                constraints: [],
                weights: { Control: 50, VariantB: 50 },
            },
        ]);
    });

    test('maps flexible rollout strategies to swimlanes with shared treatments', () => {
        const config = resolveExperimentConfig(
            environment([
                {
                    id: 'lane-1',
                    name: 'flexibleRollout',
                    title: 'Hosted apps',
                    sortOrder: 1,
                    constraints: [
                        {
                            contextName: 'appName',
                            operator: IN,
                            values: ['hosted'],
                        },
                    ],
                    segments: [],
                    disabled: false,
                    parameters: {
                        rollout: '100',
                        stickiness: 'userId',
                        groupId: 'abtest',
                    },
                    variants: [
                        {
                            name: 'Control',
                            stickiness: 'userId',
                            weight: 334,
                            weightType: 'variable',
                            payload: {
                                type: 'json',
                                value: JSON.stringify({
                                    headline: 'control-headline',
                                    buttonColor: 'blue',
                                }),
                            },
                        },
                        {
                            name: 'VariantB',
                            stickiness: 'userId',
                            weight: 333,
                            weightType: 'variable',
                            payload: {
                                type: 'json',
                                value: JSON.stringify({
                                    headline: 'b-headline',
                                    buttonColor: 'orange',
                                }),
                            },
                        },
                        {
                            name: 'VariantC',
                            stickiness: 'userId',
                            weight: 333,
                            weightType: 'variable',
                            payload: {
                                type: 'json',
                                value: JSON.stringify({
                                    headline: 'c-headline',
                                    buttonColor: 'green',
                                }),
                            },
                        },
                    ],
                },
                {
                    id: 'lane-2',
                    name: 'flexibleRollout',
                    sortOrder: 0,
                    constraints: [],
                    segments: [],
                    disabled: false,
                    parameters: {
                        rollout: '100',
                        stickiness: 'userId',
                        groupId: 'abtest',
                    },
                    variants: [
                        {
                            name: 'Control',
                            stickiness: 'userId',
                            weight: 250,
                            weightType: 'variable',
                        },
                        {
                            name: 'VariantB',
                            stickiness: 'userId',
                            weight: 500,
                            weightType: 'variable',
                        },
                        {
                            name: 'VariantC',
                            stickiness: 'userId',
                            weight: 250,
                            weightType: 'variable',
                        },
                    ],
                },
            ]),
        );

        expect(config.configured).toBe(true);
        expect(config.treatments).toEqual([
            {
                name: 'Control',
                label: 'Control',
                properties: {
                    headline: 'control-headline',
                    buttonColor: 'blue',
                },
            },
            {
                name: 'VariantB',
                label: 'VariantB',
                properties: { headline: 'b-headline', buttonColor: 'orange' },
            },
            {
                name: 'VariantC',
                label: 'VariantC',
                properties: { headline: 'c-headline', buttonColor: 'green' },
            },
        ]);
        expect(config.lanes).toMatchObject([
            {
                id: 'lane-1',
                name: 'Hosted apps',
                constraints: [
                    {
                        contextName: 'appName',
                        operator: IN,
                        values: ['hosted'],
                    },
                ],
                weights: { Control: 33.4, VariantB: 33.3, VariantC: 33.3 },
            },
            {
                id: 'lane-2',
                constraints: [],
                weights: { Control: 25, VariantB: 50, VariantC: 25 },
            },
        ]);
    });

    test('creates one strategy payload per swimlane', () => {
        const treatments = [
            {
                name: 'Control',
                label: 'Control',
                properties: {
                    headline: 'control-headline',
                    buttonColor: 'blue',
                },
            },
            {
                name: 'VariantB',
                label: 'VariantB',
                properties: { headline: 'b-headline', buttonColor: 'orange' },
            },
        ];
        const payload = createExperimentStrategyPayload({
            featureId: 'abtest',
            treatments,
            sortOrder: 0,
            lane: {
                id: 'lane-1',
                name: 'Hosted apps',
                constraints: [
                    {
                        contextName: 'appName',
                        operator: IN,
                        values: ['hosted'],
                    },
                ],
                segments: [],
                disabled: false,
                stickiness: 'userId',
                weights: { Control: 25, VariantB: 75 },
            },
        });

        expect(payload).toMatchObject({
            name: 'flexibleRollout',
            title: 'Hosted apps',
            sortOrder: 0,
            constraints: [
                { contextName: 'appName', operator: IN, values: ['hosted'] },
            ],
            parameters: {
                rollout: '100',
                stickiness: 'userId',
                groupId: 'abtest',
            },
            variants: [
                {
                    name: 'Control',
                    weight: 250,
                    stickiness: 'userId',
                    weightType: 'variable',
                },
                {
                    name: 'VariantB',
                    weight: 750,
                    stickiness: 'userId',
                    weightType: 'fix',
                },
            ],
        });
        expect(payload.variants?.[0].payload).toEqual({
            type: 'json',
            value: JSON.stringify({
                headline: 'control-headline',
                buttonColor: 'blue',
            }),
        });
    });

    test('previews first matching swimlane and weighted treatment assignment', () => {
        const treatments = [
            { name: 'Control', label: 'Control', properties: {} },
            { name: 'VariantB', label: 'VariantB', properties: {} },
            { name: 'VariantC', label: 'VariantC', properties: {} },
        ];
        const lanes = [
            {
                name: 'Hosted apps',
                constraints: [
                    {
                        contextName: 'appName',
                        operator: IN,
                        values: ['hosted'],
                    },
                ],
                segments: [],
                disabled: false,
                stickiness: 'sessionId',
                weights: { Control: 33.4, VariantB: 33.3, VariantC: 33.3 },
            },
            {
                name: 'Fallback',
                constraints: [],
                segments: [],
                disabled: false,
                stickiness: 'sessionId',
                weights: { Control: 25, VariantB: 50, VariantC: 25 },
            },
        ];

        expect(
            resolvePreviewTreatment(
                treatments,
                lanes,
                { appName: 'hosted', sessionId: 'xagzxbasdffwer' },
                { groupId: 'abtest' },
            ).lane?.name,
        ).toBe('Hosted apps');
        expect(
            resolvePreviewTreatment(
                treatments,
                lanes,
                { appName: 'other', sessionId: 'xagzxbasdffwer' },
                { groupId: 'abtest' },
            ).lane?.name,
        ).toBe('Fallback');
    });

    test('validates variant keys, lane totals, and derives property names', () => {
        const treatments: ExperimentTreatment[] = [
            {
                name: 'Control',
                label: 'Control',
                properties: { headline: 'Buy now' },
            },
            {
                name: 'VariantB',
                label: 'VariantB',
                properties: { imageUrl: 'https://example.com' },
            },
        ];
        expect(createTreatmentKey('Homepage hero / Blue CTA')).toBe(
            'Homepage-hero-Blue-CTA',
        );
        expect(getExperimentPropertyNames(treatments)).toEqual([
            'headline',
            'imageUrl',
        ]);
        expect(
            experimentIsValid(treatments, [
                {
                    name: 'Fallback',
                    constraints: [],
                    segments: [],
                    disabled: false,
                    stickiness: 'userId',
                    weights: { Control: 50, VariantB: 50 },
                },
            ]),
        ).toBe(true);
        expect(
            experimentIsValid(treatments, [
                {
                    name: 'Fallback',
                    constraints: [],
                    segments: [],
                    disabled: false,
                    stickiness: 'userId',
                    weights: { Control: 40, VariantB: 50 },
                },
            ]),
        ).toBe(false);
    });
});
