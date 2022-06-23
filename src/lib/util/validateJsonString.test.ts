import { validateJsonString } from './validateJsonString';

test('should return true for valid json string', () => {
    const input = '{"test":1,"nested":[{"test1":{"testinner":true}}]}';
    expect(validateJsonString(input)).toBe(true);
});

test('should return false for invalid json string (missing starting {)', () => {
    // missing starting {
    const input = '"test":1,"nested":[{"test1":{"testinner":true}}]}';
    expect(validateJsonString(input)).toBe(false);
});

test('should return false for invalid json string (plain string)', () => {
    const input = 'not a json';
    expect(validateJsonString(input)).toBe(false);
});

test('should return false for invalid json string (null as a string)', () => {
    const input = 'null';
    expect(validateJsonString(input)).toBe(false);
});
