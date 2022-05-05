import { useId } from 'hooks/useId';
import { renderHook } from '@testing-library/react-hooks';

test('useId', () => {
    const { result, rerender } = renderHook(() => useId());

    rerender();
    rerender();

    expect(result).toMatchInlineSnapshot(`
      {
        "all": [
          "useId-0",
          "useId-0",
          "useId-0",
        ],
        "current": "useId-0",
        "error": undefined,
      }
    `);
});

test('useId prefix', () => {
    const { result, rerender } = renderHook(() => useId('prefix'));

    rerender();
    rerender();

    expect(result).toMatchInlineSnapshot(`
      {
        "all": [
          "prefix-1",
          "prefix-1",
          "prefix-1",
        ],
        "current": "prefix-1",
        "error": undefined,
      }
    `);
});
