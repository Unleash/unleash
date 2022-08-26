import {
    parseInputValue,
    formatInputValue,
} from 'component/admin/cors/CorsForm';

test('parseInputValue', () => {
    const fn = parseInputValue;
    expect(fn('')).toEqual([]);
    expect(fn('a')).toEqual(['a']);
    expect(fn('a\nb,,c,d,')).toEqual(['a', 'b', 'c', 'd']);
    expect(fn('http://localhost:8080')).toEqual(['http://localhost:8080']);
    expect(fn('https://example.com')).toEqual(['https://example.com']);
    expect(fn('https://example.com/')).toEqual(['https://example.com']);
    expect(fn('https://example.com/')).toEqual(['https://example.com']);
});

test('formatInputValue', () => {
    const fn = formatInputValue;
    expect(fn(undefined)).toEqual('');
    expect(fn([])).toEqual('');
    expect(fn(['a'])).toEqual('a');
    expect(fn(['a', 'b', 'c', 'd'])).toEqual('a\nb\nc\nd');
});
