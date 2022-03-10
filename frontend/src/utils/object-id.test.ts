import { objectId } from 'utils/object-id';

test('objectId', () => {
    const a = {};
    const b = {};
    const c = {};
    expect(objectId(a)).toBeGreaterThan(0);
    expect(objectId(b)).toBeGreaterThan(0);
    expect(objectId(c)).toBeGreaterThan(0);
    expect(objectId(a)).toBe(objectId(a));
    expect(objectId(a)).not.toBe(objectId(b));
    expect(objectId(a)).not.toBe(objectId(c));
});
