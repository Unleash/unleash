import { updateWeightEdit } from './util.js';

const variantTemplate = {
    id: '0',
    name: 'A',
    weight: 0,
    weightType: 'variable' as const,
    stickiness: 'default',
    isValid: true,
    new: false,
};

describe('updateWeightEdit', () => {
    it('can assign weight to one only variant', () => {
        const variants = [variantTemplate];
        expect(updateWeightEdit(variants, 100)).toMatchInlineSnapshot(`
          [
            {
              "id": "0",
              "isValid": true,
              "name": "A",
              "new": false,
              "stickiness": "default",
              "weight": 100,
              "weightType": "variable",
            },
          ]
        `);
    });

    it('can distribute weight between 2 variants evenly', () => {
        const variants = [
            variantTemplate,
            { ...variantTemplate, id: '2', name: 'B' },
        ];
        updateWeightEdit(variants, 100).forEach((variant) => {
            expect(variant).toHaveProperty('weight', 50);
        });
    });

    it('can distribute weight between 8 variants evenly', () => {
        const variants = Array.from({ length: 8 }, (_, i) => ({
            ...variantTemplate,
            id: `${i}`,
            name: `${i}`,
            weight: i,
        }));
        updateWeightEdit(variants, 1000).forEach((variant) => {
            expect(variant).toHaveProperty('weight', 125);
        });
    });

    it('can distribute weight between 8 variants evenly and assign the remainder to the last variant', () => {
        const variants = Array.from({ length: 8 }, (_, i) => ({
            ...variantTemplate,
            id: `${i}`,
            name: `${i}`,
            weight: i,
        }));
        const weights = updateWeightEdit(variants, 100).map(
            (variant) => variant.weight,
        );
        expect(weights).toEqual([13, 12, 13, 12, 13, 12, 13, 12]);
    });

    it('can adjust variable weight to get correct sum', () => {
        const variants = [
            { ...variantTemplate, weightType: 'fix' as const, weight: 333 },
            { ...variantTemplate, id: '2', name: 'B' },
        ];
        const weights = updateWeightEdit(variants, 1000).map(
            (variant) => variant.weight,
        );
        expect(weights).toEqual([333, 667]);
    });

    it('can deal with complex example', () => {
        const variants = [
            { ...variantTemplate, weightType: 'fix' as const, weight: 333 },
            { ...variantTemplate, id: '2', name: 'B' },
            { ...variantTemplate, id: '3', name: 'C' },
            { ...variantTemplate, id: '4', name: 'D' },
            { ...variantTemplate, id: '5', name: 'E' },
            {
                ...variantTemplate,
                id: '6',
                name: 'F',
                weightType: 'fix' as const,
                weight: 111,
            },
            { ...variantTemplate, id: '7', name: 'G' },
            { ...variantTemplate, id: '8', name: 'H' },
        ];
        const weights = updateWeightEdit(variants, 1000).map(
            (variant) => variant.weight,
        );
        expect(weights).toEqual([333, 93, 93, 93, 92, 111, 93, 92]);
    });

    it('can deal with 0-weight variable variant', () => {
        const variants = [
            { ...variantTemplate, weightType: 'fix' as const, weight: 500 },
            {
                ...variantTemplate,
                weightType: 'fix' as const,
                weight: 500,
                id: '2',
                name: 'B',
            },
            { ...variantTemplate, id: '3', name: 'C' },
        ];
        const weights = updateWeightEdit(variants, 1000).map(
            (variant) => variant.weight,
        );
        expect(weights).toEqual([500, 500, 0]);
    });

    describe('sum over 100% does not result in negative weight', () => {
        it('when 2 items exceed 100%', () => {
            const variants = [
                {
                    ...variantTemplate,
                    weightType: 'fix' as const,
                    weight: 600,
                    id: '1',
                    name: 'A',
                },
                {
                    ...variantTemplate,
                    weightType: 'fix' as const,
                    weight: 600,
                    id: '2',
                    name: 'B',
                },
                { ...variantTemplate, id: '3', name: 'C' },
            ];

            const weights = updateWeightEdit(variants, 1000).map(
                (variant) => variant.weight,
            );

            expect(weights).toEqual([600, 600, 0]);
        });

        it('when sum of multiple items exceed 100%', () => {
            const variants = [
                {
                    ...variantTemplate,
                    weightType: 'fix' as const,
                    weight: 400,
                    id: '1',
                    name: 'A',
                },
                {
                    ...variantTemplate,
                    weightType: 'fix' as const,
                    weight: 450,
                    id: '2',
                    name: 'B',
                },
                {
                    ...variantTemplate,
                    id: '3',
                    name: 'C',
                },
                { ...variantTemplate, id: '4', name: 'D' },
                {
                    ...variantTemplate,
                    id: '5',
                    name: 'E',
                    weightType: 'fix' as const,
                    weight: 350,
                },
            ];

            const weights = updateWeightEdit(variants, 1000).map(
                (variant) => variant.weight,
            );

            expect(weights).toEqual([400, 450, 0, 0, 350]);
        });
    });
});
