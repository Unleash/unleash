import { formatBaseUri } from './format-base-uri';

test('formatBaseUri returns the correct path when the path is the right format', () => {
    const result = formatBaseUri('/hosted');
    expect(result === '/hosted').toBe(true);
});

test('formatBaseUri returns the correct path when the path lacking initial slash', () => {
    const result = formatBaseUri('hosted');
    expect(result === '/hosted').toBe(true);
});

test('formatBaseUri returns the correct path when the path has both initial and trailing slash', () => {
    const result = formatBaseUri('/hosted/');
    expect(result === '/hosted').toBe(true);
});

test('formatBaseUri returns the correct path when the path has only trailing slash', () => {
    const result = formatBaseUri('hosted/');
    expect(result === '/hosted').toBe(true);
});

test('formatBaseUri returns empty string when called without input', () => {
    const result = formatBaseUri(undefined);
    expect(result === '').toBe(true);
});

test('formatBaseUri handles levels of paths', () => {
    const result = formatBaseUri('hosted/multi/path');
    expect(result === '/hosted/multi/path').toBe(true);
});
