import { validateParameterValue } from 'utils/validateParameterValue';

test('validateParameterValue string', () => {
    const fn = validateParameterValue;
    expect(fn({ type: 'string', required: false }, '')).toBeUndefined();
    expect(fn({ type: 'string', required: false }, 'a')).toBeUndefined();
    expect(fn({ type: 'string', required: true }, '')).not.toBeUndefined();
    expect(fn({ type: 'string', required: true }, 'a')).toBeUndefined();
});

test('validateParameterValue list', () => {
    const fn = validateParameterValue;
    expect(fn({ type: 'list', required: false }, '')).toBeUndefined();
    expect(fn({ type: 'list', required: false }, 'a,b')).toBeUndefined();
    expect(fn({ type: 'list', required: true }, '')).not.toBeUndefined();
    expect(fn({ type: 'list', required: true }, 'a,b')).toBeUndefined();
});

test('validateParameterValue number', () => {
    const fn = validateParameterValue;
    expect(fn({ type: 'number', required: false }, '')).toBeUndefined();
    expect(fn({ type: 'number', required: false }, 'a')).not.toBeUndefined();
    expect(fn({ type: 'number', required: false }, '1')).toBeUndefined();
    expect(fn({ type: 'number', required: true }, '')).not.toBeUndefined();
    expect(fn({ type: 'number', required: true }, 'a')).not.toBeUndefined();
    expect(fn({ type: 'number', required: true }, '1')).toBeUndefined();
});

test('validateParameterValue boolean', () => {
    const fn = validateParameterValue;
    expect(fn({ type: 'boolean', required: false }, '')).toBeUndefined();
    expect(fn({ type: 'boolean', required: false }, 'true')).toBeUndefined();
    expect(fn({ type: 'boolean', required: false }, 'false')).toBeUndefined();
    expect(fn({ type: 'boolean', required: false }, 'a')).not.toBeUndefined();
    expect(fn({ type: 'boolean', required: true }, '')).toBeUndefined();
    expect(fn({ type: 'boolean', required: true }, 'true')).toBeUndefined();
    expect(fn({ type: 'boolean', required: true }, 'false')).toBeUndefined();
    expect(fn({ type: 'boolean', required: true }, 'a')).not.toBeUndefined();
});
