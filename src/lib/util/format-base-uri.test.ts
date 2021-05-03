import { formatBaseUri } from './format-base-uri';
import test from 'ava';

test('formatBaseUri returns the correct path when the path is the right format', t => {
    const result = formatBaseUri('/hosted');
    t.true(result === '/hosted');
});

test('formatBaseUri returns the correct path when the path lacking initial slash', t => {
    const result = formatBaseUri('hosted');
    t.true(result === '/hosted');
});

test('formatBaseUri returns the correct path when the path has both initial and trailing slash', t => {
    const result = formatBaseUri('/hosted/');
    t.true(result === '/hosted');
});

test('formatBaseUri returns the correct path when the path has only trailing slash', t => {
    const result = formatBaseUri('hosted/');
    t.true(result === '/hosted');
});

test('formatBaseUri returns empty string when called without input', t => {
    const result = formatBaseUri(undefined);
    t.true(result === '');
});

test('formatBaseUri handles levels of paths', t => {
    const result = formatBaseUri('hosted/multi/path');
    t.true(result === '/hosted/multi/path');
});
