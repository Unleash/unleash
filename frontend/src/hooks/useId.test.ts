import { useId } from 'hooks/useId';
import { renderHook } from '@testing-library/react';

test('useId', () => {
    const { result, rerender } = renderHook(() => useId());

    rerender();
    rerender();

    expect(result).toMatchInlineSnapshot(`
      {
        "current": "useId-0",
      }
    `);
});

test('useId prefix', () => {
    const { result, rerender } = renderHook(() => useId('prefix'));

    rerender();
    rerender();

    expect(result).toMatchInlineSnapshot(`
      {
        "current": "prefix-1",
      }
    `);
});
