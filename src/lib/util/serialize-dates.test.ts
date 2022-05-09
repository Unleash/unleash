import { serializeDates } from './serialize-dates';

test('serializeDates', () => {
    const obj = {
        a: 1,
        b: '2',
        c: new Date(),
        d: { e: new Date() },
        f: [{ g: new Date() }],
    };

    const result = serializeDates(obj);

    expect(serializeDates({})).toEqual({});
    expect(result.a).toEqual(1);
    expect(result.b).toEqual('2');
    expect(typeof result.c).toEqual('string');
    expect(typeof result.d.e).toEqual('string');
    expect(typeof result.f[0].g).toEqual('string');
});
