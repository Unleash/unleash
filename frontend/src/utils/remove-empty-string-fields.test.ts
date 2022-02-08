import { removeEmptyStringFields } from './remove-empty-string-fields';

test('removeEmptyStringFields', () => {
    expect(removeEmptyStringFields({})).toEqual({});
    expect(removeEmptyStringFields({ a: undefined })).toEqual({ a: undefined });
    expect(removeEmptyStringFields({ a: 0 })).toEqual({ a: 0 });
    expect(removeEmptyStringFields({ a: 1 })).toEqual({ a: 1 });
    expect(removeEmptyStringFields({ a: '1' })).toEqual({ a: '1' });
    expect(removeEmptyStringFields({ a: '' })).toEqual({});
    expect(removeEmptyStringFields({ a: '', b: '2' })).toEqual({ b: '2' });
});
