import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { act, render } from '@testing-library/react';
import { useIsElementWiderThan } from './useIsElementWiderThan';

// setupTests.ts mocks ResizeObserver to fire synchronously with width: 800
// the first time a new element is observed.

let lastResult: ReturnType<typeof useIsElementWiderThan<HTMLDivElement>>;

const TestComponent = ({ threshold }: { threshold: number }) => {
    lastResult = useIsElementWiderThan<HTMLDivElement>(threshold);
    return <div ref={lastResult.ref} />;
};

describe('useIsElementWiderThan', () => {
    test('isWide is true when threshold is below mock width (800)', () => {
        render(<TestComponent threshold={700} />);
        expect(lastResult.isWide).toBe(true);
    });

    test('isWide is true when threshold exactly equals mock width (800)', () => {
        render(<TestComponent threshold={800} />);
        expect(lastResult.isWide).toBe(true);
    });

    test('isWide is false when threshold exceeds mock width (800)', () => {
        render(<TestComponent threshold={801} />);
        expect(lastResult.isWide).toBe(false);
    });

    describe('resize behavior', () => {
        let capturedCallback: ResizeObserverCallback | undefined;
        let capturedTarget: Element | undefined;
        let originalResizeObserver: typeof ResizeObserver;

        beforeEach(() => {
            capturedCallback = undefined;
            capturedTarget = undefined;
            originalResizeObserver = window.ResizeObserver;
            window.ResizeObserver = class {
                constructor(callback: ResizeObserverCallback) {
                    capturedCallback = callback;
                }
                observe(target: Element) {
                    capturedTarget = target;
                }
                unobserve() {}
                disconnect() {}
            } as unknown as typeof ResizeObserver;
        });

        afterEach(() => {
            window.ResizeObserver = originalResizeObserver;
        });

        const fire = (width: number) =>
            act(() => {
                capturedCallback!(
                    [
                        {
                            target: capturedTarget!,
                            contentRect: { width },
                            borderBoxSize: [
                                { inlineSize: width, blockSize: 0 },
                            ],
                            contentBoxSize: [
                                { inlineSize: width, blockSize: 0 },
                            ],
                            devicePixelContentBoxSize: [],
                        },
                    ] as any,
                    {} as any,
                );
            });

        test('starts narrow before any resize event fires', () => {
            render(<TestComponent threshold={700} />);
            expect(lastResult.isWide).toBe(false);
        });

        test('becomes wide when resized above threshold', () => {
            render(<TestComponent threshold={700} />);
            fire(800);
            expect(lastResult.isWide).toBe(true);
        });

        test('toggles between wide and narrow on successive resizes', () => {
            render(<TestComponent threshold={700} />);
            fire(800);
            expect(lastResult.isWide).toBe(true);
            fire(400);
            expect(lastResult.isWide).toBe(false);
            fire(700);
            expect(lastResult.isWide).toBe(true);
        });
    });
});
