import { serializeDates } from './serialize-dates';

test('serializeDates primitives', () => {
    expect(serializeDates(undefined)).toEqual(undefined);
    expect(serializeDates(null)).toEqual(null);
    expect(serializeDates(1)).toEqual(1);
    expect(serializeDates('a')).toEqual('a');
});

test('serializeDates arrays', () => {
    const now = new Date();
    const iso = now.toISOString();

    expect(serializeDates([])).toEqual([]);
    expect(serializeDates([1])).toEqual([1]);
    expect(serializeDates(['2'])).toEqual(['2']);
    expect(serializeDates([{ a: 1 }])).toEqual([{ a: 1 }]);
    expect(serializeDates([{ a: now }])).toEqual([{ a: iso }]);
});

test('serializeDates object', () => {
    const now = new Date();
    const iso = now.toISOString();

    const obj = {
        a: 1,
        b: '2',
        c: now,
        d: { e: now },
        f: [{ g: now }],
    };

    expect(serializeDates({})).toEqual({});
    expect(serializeDates(obj).a).toEqual(1);
    expect(serializeDates(obj).b).toEqual('2');
    expect(serializeDates(obj).c).toEqual(iso);
    expect(serializeDates(obj).d.e).toEqual(iso);
    expect(serializeDates(obj).f[0].g).toEqual(iso);
});
