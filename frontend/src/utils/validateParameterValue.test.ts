import { validateParameterValue } from 'utils/validateParameterValue';

const createStrategy = (type: string, required: boolean) => {
    return { type, required };
};

test('validateParameterValue string', () => {
    const fn = validateParameterValue;
    expect(fn(createStrategy('string', false), undefined)).toBeUndefined();
    expect(fn(createStrategy('string', false), '')).toBeUndefined();
    expect(fn(createStrategy('string', true), 'a')).toBeUndefined();
    expect(fn(createStrategy('string', true), undefined)).not.toBeUndefined();
    expect(fn(createStrategy('string', true), '')).not.toBeUndefined();
    expect(fn(createStrategy('string', true), 'a')).toBeUndefined();
});

test('validateParameterValue list', () => {
    const fn = validateParameterValue;
    expect(fn(createStrategy('list', false), undefined)).toBeUndefined();
    expect(fn(createStrategy('list', false), '')).toBeUndefined();
    expect(fn(createStrategy('list', false), 'a,b')).toBeUndefined();
    expect(fn(createStrategy('list', true), undefined)).not.toBeUndefined();
    expect(fn(createStrategy('list', true), '')).not.toBeUndefined();
    expect(fn(createStrategy('list', true), 'a,b')).toBeUndefined();
});

test('validateParameterValue number', () => {
    const fn = validateParameterValue;
    expect(fn(createStrategy('number', false), undefined)).toBeUndefined();
    expect(fn(createStrategy('number', false), '')).toBeUndefined();
    expect(fn(createStrategy('number', false), 'a')).not.toBeUndefined();
    expect(fn(createStrategy('number', false), '0')).toBeUndefined();
    expect(fn(createStrategy('number', false), '1')).toBeUndefined();
    expect(fn(createStrategy('number', true), undefined)).not.toBeUndefined();
    expect(fn(createStrategy('number', true), '')).not.toBeUndefined();
    expect(fn(createStrategy('number', true), 'a')).not.toBeUndefined();
    expect(fn(createStrategy('number', true), '0')).toBeUndefined();
    expect(fn(createStrategy('number', true), '1')).toBeUndefined();
});

test('validateParameterValue boolean', () => {
    const fn = validateParameterValue;
    expect(fn(createStrategy('boolean', false), undefined)).toBeUndefined();
    expect(fn(createStrategy('boolean', false), '')).toBeUndefined();
    expect(fn(createStrategy('boolean', false), 'true')).toBeUndefined();
    expect(fn(createStrategy('boolean', false), 'false')).toBeUndefined();
    expect(fn(createStrategy('boolean', false), 'a')).toBeUndefined();
    expect(fn(createStrategy('boolean', true), undefined)).toBeUndefined();
    expect(fn(createStrategy('boolean', true), '')).toBeUndefined();
    expect(fn(createStrategy('boolean', true), 'true')).toBeUndefined();
    expect(fn(createStrategy('boolean', true), 'false')).toBeUndefined();
    expect(fn(createStrategy('boolean', true), 'a')).toBeUndefined();
});

test('validateParameterValue percentage', () => {
    const fn = validateParameterValue;
    expect(fn(createStrategy('percentage', false), undefined)).toBeUndefined();
    expect(fn(createStrategy('percentage', false), '')).toBeUndefined();
    expect(fn(createStrategy('percentage', false), 'a')).toBeUndefined();
    expect(fn(createStrategy('percentage', false), '0')).toBeUndefined();
    expect(fn(createStrategy('percentage', false), '1')).toBeUndefined();
    expect(fn(createStrategy('percentage', true), undefined)).toBeUndefined();
    expect(fn(createStrategy('percentage', true), '')).toBeUndefined();
    expect(fn(createStrategy('percentage', true), 'a')).toBeUndefined();
    expect(fn(createStrategy('percentage', true), '0')).toBeUndefined();
    expect(fn(createStrategy('percentage', true), '1')).toBeUndefined();
});
