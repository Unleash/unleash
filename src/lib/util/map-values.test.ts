import { mapValues } from './map-values';

test('mapValues', () => {
    expect(
        mapValues(
            {
                a: 1,
                b: 2,
                c: 3,
            },
            (x) => x + 1,
        ),
    ).toEqual({
        a: 2,
        b: 3,
        c: 4,
    });
});
