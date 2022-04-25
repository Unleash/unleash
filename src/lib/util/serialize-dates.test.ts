import { serializeDates } from './serialize-dates';

test('serializeDates', () => {
    const obj = {
        a: 1,
        b: '2',
        c: new Date(),
        d: { e: new Date() },
    };

    expect(serializeDates({})).toEqual({});
    expect(serializeDates(obj).a).toEqual(1);
    expect(serializeDates(obj).b).toEqual('2');
    expect(typeof serializeDates(obj).c).toEqual('string');
    expect(typeof serializeDates(obj).d.e).toEqual('object');
});
