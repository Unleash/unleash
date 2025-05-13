import { renderHook } from '@testing-library/react';
import { useRoleForm } from './useRoleForm.js';
import { test } from 'vitest';
import { act } from 'react';

describe('trim names and description', () => {
    test('name is trimmed before being set', () => {
        const { result } = renderHook(() => useRoleForm());

        act(() => {
            result.current.setName('  my role    ');
        });

        expect(result.current.name).toBe('my role');
    });

    test('description is not trimmed before being set', () => {
        const { result } = renderHook(() => useRoleForm());

        act(() => {
            result.current.setDescription('  my description    ');
        });

        expect(result.current.description).toBe('  my description    ');
    });

    test('name that is just whitespace triggers an error', () => {
        const { result } = renderHook(() => useRoleForm());

        act(() => {
            result.current.validateName('    ');
        });

        expect(result.current.errors).toMatchObject({
            name: 'Name is required.',
        });
    });

    test('description that is just whitespace triggers an error', () => {
        const { result } = renderHook(() => useRoleForm());

        act(() => {
            result.current.validateDescription('    ');
        });

        expect(result.current.errors).toMatchObject({
            description: 'Description is required.',
        });
    });
});
