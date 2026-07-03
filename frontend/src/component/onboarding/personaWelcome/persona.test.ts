import { expect, test } from 'vitest';
import { resolvePersona } from './persona.ts';

test.each([
    'Developer',
    'DevOps Engineer',
    'QA/Test Engineer',
    'Other',
])('resolves %s to the technical persona', (role) => {
    expect(resolvePersona(role)).toBe('technical');
});

test.each([
    'Product Manager',
    'Engineering Manager',
    'Executive',
    'Designer/UX',
])('resolves %s to the product persona', (role) => {
    expect(resolvePersona(role)).toBe('product');
});

test('falls back to the technical persona when the role is unset or unknown', () => {
    expect(resolvePersona(undefined)).toBe('technical');
    expect(resolvePersona(null)).toBe('technical');
    expect(resolvePersona('')).toBe('technical');
    expect(resolvePersona('Astronaut')).toBe('technical');
});
