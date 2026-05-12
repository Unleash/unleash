import { describe, expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { TokenExplanation } from './TokenExplanation';

const props = {
    project: 'my-project',
    environment: 'production',
    secret: 'abc123secret',
};

describe('TokenExplanation', () => {
    test('renders all token parts', () => {
        render(<TokenExplanation {...props} />);

        expect(screen.getByText('my-project')).toBeInTheDocument();
        expect(screen.getByText('production')).toBeInTheDocument();
        expect(screen.getByText('abc123secret')).toBeInTheDocument();
    });

    test('renders wide layout when container is above threshold (800px mock)', () => {
        render(<TokenExplanation {...props} />);

        expect(
            screen.getByText(
                'The project this API key can retrieve feature flags from',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'The environment this API key can retrieve feature flag configuration from',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('The API key secret')).toBeInTheDocument();

        // In wide layout the token parts appear once (inside the token display),
        // descriptions appear once (in description boxes, without the token label).
        expect(screen.getAllByText('my-project')).toHaveLength(1);
        expect(screen.getAllByText('production')).toHaveLength(1);
        expect(screen.getAllByText('abc123secret')).toHaveLength(1);
    });

    test('renders narrow layout when container is below threshold', () => {
        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = class {
            callback: ResizeObserverCallback;
            constructor(callback: ResizeObserverCallback) {
                this.callback = callback;
            }
            observe(target: Element) {
                this.callback(
                    [
                        {
                            target,
                            contentRect: { width: 400, height: 400 },
                            borderBoxSize: [
                                { inlineSize: 400, blockSize: 400 },
                            ],
                            contentBoxSize: [
                                { inlineSize: 400, blockSize: 400 },
                            ],
                            devicePixelContentBoxSize: [],
                        },
                    ] as any,
                    this as any,
                );
            }
            unobserve() {}
            disconnect() {}
        };

        render(<TokenExplanation {...props} />);

        // In narrow layout, each description box shows both the token label and the description text.
        expect(screen.getAllByText('my-project')).toHaveLength(2);
        expect(screen.getAllByText('production')).toHaveLength(2);
        expect(screen.getAllByText('abc123secret')).toHaveLength(2);

        window.ResizeObserver = originalResizeObserver;
    });
});
